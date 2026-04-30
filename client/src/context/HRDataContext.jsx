
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import * as api from '../api/hrmApi';

const HRDataContext = createContext(null);

const mapEmployeeFromApi = (employee, departments = []) => {
  const normalizedDepartmentId = Number(employee.department_id ?? employee.departmentId ?? 0)
  const dept = departments.find((d) => Number(d.id) === normalizedDepartmentId)
  return {
    ...employee,
    employeeId: employee.employee_id ?? employee.employeeId ?? employee.id ?? null,
    firstName: employee.first_name ?? employee.firstName ?? '',
    lastName: employee.last_name ?? employee.lastName ?? '',
    hireDate: employee.hire_date ?? employee.hireDate ?? null,
    joinDate: employee.hire_date ?? employee.hireDate ?? employee.joinDate ?? null,
    departmentId: employee.department_id ?? employee.departmentId ?? null,
    department: dept?.name || employee.department || '',
    isActive: employee.is_active ?? employee.isActive ?? true,
    dateOfBirth: employee.date_of_birth ?? employee.dateOfBirth ?? null,
    emergencyContactName: employee.emergency_contact_name ?? employee.emergencyContactName ?? '',
    emergencyContactRelationship: employee.emergency_contact_relationship ?? employee.emergencyContactRelationship ?? '',
    emergencyContactPhone: employee.emergency_contact_phone ?? employee.emergencyContactPhone ?? '',
    bankName: employee.bank_name ?? employee.bankName ?? '',
    bankBranchName: employee.bank_branch_name ?? employee.bankBranchName ?? '',
    bankAccountName: employee.bank_account_name ?? employee.bankAccountName ?? '',
    bankAccountNumber: employee.bank_account_number ?? employee.bankAccountNumber ?? '',
    bankSwiftCode: employee.bank_swift_code ?? employee.bankSwiftCode ?? '',
    skills: typeof employee.skills === 'string' && employee.skills
      ? employee.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(employee.skills) ? employee.skills : []
  };
};

const mapDepartmentFromApi = (department) => ({
  ...department,
  headOfDepartment: department.head_of_department ?? department.headOfDepartment ?? '',
  employeeCount: Number(department.employee_count ?? department.employeeCount ?? 0),
  budget: Number(department.budget ?? 0),
  location: department.location ?? ''
});

const toApiDepartmentPayload = (department) => ({
  ...department,
  head_of_department: department.head_of_department ?? department.headOfDepartment ?? null,
  employee_count: Number(department.employee_count ?? department.employeeCount ?? 0),
  budget: Number(department.budget ?? 0),
  location: department.location ?? null
});


export const HRDataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  // Add payrollRecords if you have payroll API endpoints
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getDepartments(),
      api.getEmployees(),
      api.getAttendances(),
    ])
      .then(([dep, emp, att]) => {
        const mappedDepts = dep.map(mapDepartmentFromApi);
        setDepartments(mappedDepts);
        setEmployees(emp.map((e) => mapEmployeeFromApi(e, mappedDepts)));
        setAttendanceRecords(att);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load HR data');
        setLoading(false);
      });
  }, []);

  // CRUD operations
  const addEmployee = useCallback(async (employee) => {
    const res = await api.createEmployee(employee);
    const mapped = mapEmployeeFromApi(res, departments);
    setEmployees((prev) => [mapped, ...prev]);
    return mapped;
  }, [departments]);

  const updateEmployee = useCallback(async (id, updates) => {
    const res = await api.updateEmployee(id, updates);
    const mapped = mapEmployeeFromApi(res, departments);
    setEmployees((prev) => prev.map((item) => (item.id === id ? mapped : item)));
    return mapped;
  }, [departments]);

  const deleteEmployee = useCallback(async (id) => {
    await api.deleteEmployee(id);
    setEmployees((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addDepartment = useCallback(async (department) => {
    const res = await api.createDepartment(toApiDepartmentPayload(department));
    const mapped = mapDepartmentFromApi(res);
    setDepartments((prev) => [mapped, ...prev]);
    return mapped;
  }, []);

  const updateDepartment = useCallback(async (id, updates) => {
    const res = await api.updateDepartment(id, toApiDepartmentPayload(updates));
    const mapped = mapDepartmentFromApi(res);
    setDepartments((prev) => prev.map((item) => (item.id === id ? mapped : item)));
    return mapped;
  }, []);

  const deleteDepartment = useCallback(async (id) => {
    await api.deleteDepartment(id);
    setDepartments((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Attendance CRUD (add as needed)
  const markAttendance = useCallback(async (entry) => {
    const res = await api.createAttendance(entry);
    setAttendanceRecords((prev) => [res, ...prev]);
    return res;
  }, []);

  const value = useMemo(
    () => ({
      employees,
      departments,
      attendanceRecords,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      markAttendance,
      loading,
      error,
    }),
    [employees, departments, attendanceRecords, addEmployee, updateEmployee, deleteEmployee, addDepartment, updateDepartment, deleteDepartment, markAttendance, loading, error]
  );

  if (loading) return <div>Loading HR data...</div>;
  if (error) return <div>{error}</div>;
  return <HRDataContext.Provider value={value}>{children}</HRDataContext.Provider>;
}

export const useHRData = () => {
  const context = useContext(HRDataContext)
  if (!context) {
    throw new Error('useHRData must be used within HRDataProvider')
  }
  return context
}
