
import { useEffect, useMemo, useState } from 'react';
import DashboardBottomSection from '../../components/dashboard/DashboardBottomSection';
import DashboardChartsGrid from '../../components/dashboard/DashboardChartsGrid';
import DashboardStatsGrid from '../../components/dashboard/DashboardStatsGrid';
import { getDashboardStats } from '../../api/hrmApi';
import { getDepartmentColor } from '../../data/dashboardData';
import { useHRData } from '../../context/HRDataContext';

const MONTH_WINDOW = 12;

const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  if (import.meta.env.DEV) {
    return 'ws://server:8000/ws/events';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/events`;
};

const getMonthKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const buildMonthlySeries = () => {
  const today = new Date();
  const months = [];

  for (let offset = MONTH_WINDOW - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const monthKey = getMonthKey(date);
    months.push({
      monthKey,
      month: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      hires: 0,
      exits: 0,
    });
  }

  return months;
};

const buildHiresExitsData = (employees, activityEvents) => {
  const buckets = buildMonthlySeries();
  const bucketByKey = new Map(buckets.map((entry) => [entry.monthKey, entry]));
  const activeEmployeeIds = new Set(
    employees
      .map((employee) => employee.employeeId ?? employee.employee_id ?? employee.id)
      .filter((value) => value !== null && value !== undefined)
      .map(String)
  );

  employees.forEach((employee) => {
    const monthKey = getMonthKey(employee.hireDate || employee.joinDate || employee.hire_date);
    const bucket = monthKey ? bucketByKey.get(monthKey) : null;
    if (bucket) {
      bucket.hires += 1;
    }
  });

  activityEvents.forEach((event) => {
    const monthKey = getMonthKey(event.timestamp);
    const bucket = monthKey ? bucketByKey.get(monthKey) : null;
    if (!bucket) {
      return;
    }

    const eventEmployeeId = event.employeeId ?? event.employee_id ?? null;
    const employeeKey = eventEmployeeId === null || eventEmployeeId === undefined ? null : String(eventEmployeeId);

    if (event.type === 'hire' && employeeKey && !activeEmployeeIds.has(employeeKey)) {
      bucket.hires += 1;
    }

    if (event.type === 'exit' && employeeKey && activeEmployeeIds.has(employeeKey)) {
      bucket.exits += 1;
    }
  });

  return buckets.map(({ monthKey, ...entry }) => entry);
};

const buildRecentHires = (employees) => employees
  .map((employee) => {
    const joinDate = employee.joinDate || employee.hireDate || employee.hire_date || null;
    const firstName = employee.firstName || employee.first_name || '';
    const lastName = employee.lastName || employee.last_name || '';

    return {
      name: `${firstName} ${lastName}`.trim(),
      department: employee.department || employee.department_name || 'Unassigned',
      avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() || '?',
      joinDate,
      sortDate: joinDate ? new Date(joinDate).getTime() : 0,
    };
  })
  .filter((person) => person.name)
  .sort((left, right) => right.sortDate - left.sortDate)
  .slice(0, 5)
  .map(({ sortDate, ...person }) => person);


const Dashboard = () => {
  const { employees } = useHRData();
  const [stats, setStats] = useState(null);
  const [activityEvents, setActivityEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dashboardStats = Array.isArray(stats?.dashboardStats) ? stats.dashboardStats : [];
  const departmentData = Array.isArray(stats?.departmentData) ? stats.departmentData : [];
  const allDepartmentData = Array.isArray(stats?.allDepartmentData) ? stats.allDepartmentData : [];
  const attendanceData = Array.isArray(stats?.attendanceData) ? stats.attendanceData : [];
  const hiresExitsData = useMemo(
    () => buildHiresExitsData(Array.isArray(employees) ? employees : [], activityEvents),
    [employees, activityEvents]
  );
  const recentHires = useMemo(
    () => buildRecentHires(Array.isArray(employees) ? employees : []),
    [employees]
  );

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  // WebSocket for real-time updates (reconnects with backoff)
  useEffect(() => {
    let ws = null
    let reconnectTimer = 1000
    let reconnectTimeoutId = null
    let shouldReconnect = true

    const connect = () => {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
        reconnectTimeoutId = null
      }

      const url = getWebSocketUrl()
      ws = new WebSocket(url)

      ws.onopen = () => {
        reconnectTimer = 1000
      }

      ws.onmessage = async (e) => {
        try {
          const event = JSON.parse(e.data)
          if (event?.type === 'hire' || event?.type === 'exit') {
            setActivityEvents((prev) => [
              ...prev,
              {
                type: event.type,
                employeeId: event.employee_id ?? event.employeeId ?? null,
                timestamp: event.timestamp,
              },
            ])

            const refreshed = await getDashboardStats()
            setStats(refreshed)
          }
        } catch (err) {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        ws = null
        if (!shouldReconnect) {
          return
        }
        reconnectTimeoutId = setTimeout(() => connect(), reconnectTimer)
        reconnectTimer = Math.min(reconnectTimer * 1.5, 30000)
      }

      ws.onerror = () => {
        try { ws.close() } catch (e) {}
      }
    }

    connect()
    return () => {
      shouldReconnect = false
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId)
      }
      try {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close()
        } else if (ws && ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
      } catch (e) {}
    }
  }, [])

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Dashboard</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Overview of your HR metrics and recent activities
        </p>
      </div>
      <DashboardStatsGrid stats={dashboardStats} />
      <DashboardChartsGrid
        hiresExitsData={hiresExitsData}
        departmentData={departmentData}
        allDepartmentData={allDepartmentData}
        getDepartmentColor={getDepartmentColor}
      />
      <DashboardBottomSection attendanceData={attendanceData} recentHires={recentHires} />
    </div>
  );
};

export default Dashboard