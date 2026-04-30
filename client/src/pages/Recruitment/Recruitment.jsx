
import { useMemo, useState, useEffect } from 'react';
import {
  BriefcaseIcon,
  UserPlusIcon,
  FunnelIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../../context/NotificationContext';
import * as api from '../../api/hrmApi';

const Recruitment = () => {
  const { showSuccess, showInfo, showWarning } = useNotification();
  const [roles, setRoles] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeStage, setActiveStage] = useState('all');
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getJobPostings(),
      api.getJobApplications(),
      api.getDepartments()
    ])
      .then(([jobPostings, jobApplications, departments]) => {
        const departmentMap = new Map(departments.map((dep) => [dep.id, dep.name]))
        const roleMap = new Map(jobPostings.map((job) => [job.id, job.title]))

        setRoles(jobPostings.map(j => ({
          id: j.id,
          role: j.title,
          department: departmentMap.get(j.department_id) || `Department #${j.department_id}`,
          status: j.is_active ? 'Open' : 'Closed',
          applicants: jobApplications.filter(a => a.job_posting_id === j.id).length
        })));
        setApplicants(jobApplications.map(a => ({
          id: a.id,
          name: a.applicant_name,
          email: a.applicant_email,
          phone: a.applicant_phone || 'N/A',
          role: roleMap.get(a.job_posting_id) || `Role #${a.job_posting_id}`,
          department: departmentMap.get(jobPostings.find((job) => job.id === a.job_posting_id)?.department_id) || 'N/A',
          stage: a.status,
          experience: 'Not specified',
          education: 'Not specified',
          skills: [],
          profile: 'Candidate profile details were not provided in the application payload.',
          linkedinProfileUrl: a.linkedin_profile_url || '',
          resumeUrl: a.resume_url || '',
          cvFileName: a.cv_file_name || '',
          job_posting_id: a.job_posting_id
        })));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load recruitment data.');
        setLoading(false);
      });
  }, []);
  const [searchTerm, setSearchTerm] = useState('')
  const [subject, setSubject] = useState('Update on your application')
  const [message, setMessage] = useState(
    'Thank you for applying. We reviewed your profile and will share the next update shortly.'
  )
  const [activeApplicantId, setActiveApplicantId] = useState(null)

  const totalApplicants = useMemo(
    () => roles.reduce((sum, item) => sum + item.applicants, 0),
    [roles]
  )

  const offerCount = useMemo(
    () => roles.filter((item) => item.status === 'Offer').length,
    [roles]
  )

  // Filter applicants by department, stage, and search term
  const filteredApplicants = useMemo(() => {
    let filtered = applicants
    if (activeDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === activeDepartment)
    }
    if (activeStage !== 'all') {
      filtered = filtered.filter(item => item.stage === activeStage)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [activeStage, activeDepartment, searchTerm, applicants])

  const selectedApplicants = useMemo(
    () => applicants.filter((item) => selectedIds.includes(item.id)),
    [applicants, selectedIds]
  )

  const activeApplicant = useMemo(
    () => applicants.find((item) => item.id === activeApplicantId) || null,
    [applicants, activeApplicantId]
  )

  const allVisibleSelected =
    filteredApplicants.length > 0 && filteredApplicants.every((item) => selectedIds.includes(item.id))

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredApplicants.some((item) => item.id === id)))
      return
    }

    setSelectedIds((prev) => {
      const next = new Set(prev)
      filteredApplicants.forEach((item) => next.add(item.id))
      return Array.from(next)
    })
  }

  const toggleApplicantSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const applyTemplate = (type) => {
    if (type === 'shortlist') {
      setSubject('You are shortlisted for the next round')
      setMessage(
        'Congratulations. Your profile has been shortlisted and our team will connect to schedule the next round.'
      )
      return
    }

    setSubject('Update on your job application')
    setMessage(
      'Thank you for your interest. After review, we are not moving forward with your application at this time.'
    )
  }

  const launchMailClient = (emails, currentSubject, currentMessage) => {
    const bcc = encodeURIComponent(emails.join(','))
    const encodedSubject = encodeURIComponent(currentSubject)
    const encodedBody = encodeURIComponent(currentMessage)
    window.location.href = `mailto:?bcc=${bcc}&subject=${encodedSubject}&body=${encodedBody}`
  }

  const handleBulkSend = (mode) => {
    if (!selectedApplicants.length) {
      showWarning('No Applicants Selected', 'Select at least one applicant before sending a message.')
      return
    }

    if (!subject.trim() || !message.trim()) {
      showInfo('Message Required', 'Enter both subject and message before sending.')
      return
    }

    const emails = selectedApplicants.map((item) => item.email)
    launchMailClient(emails, subject.trim(), message.trim())

    if (mode === 'rejection') {
      setApplicants((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, stage: 'rejected' } : item))
      )
      showSuccess('Rejection Draft Opened', `Prepared rejection email for ${emails.length} applicants.`)
      return
    }

    setApplicants((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, stage: 'contacted' } : item))
    )
    showSuccess('Bulk Reply Draft Opened', `Prepared common reply for ${emails.length} applicants.`)
  }

  if (loading) return <div>Loading recruitment data...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-6 text-gray-900">Recruitment</h1>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Track open positions, applicant volume, and hiring pipeline health.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecruitmentCard title="Open Roles" value={roles.length} icon={BriefcaseIcon} tone="blue" />
        <RecruitmentCard title="Total Applicants" value={totalApplicants} icon={UserPlusIcon} tone="emerald" />
        <RecruitmentCard title="Offers in Progress" value={offerCount} icon={FunnelIcon} tone="amber" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Open Position Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Applicants</th>
                <th className="px-6 py-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {roles.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 font-medium text-gray-900">{item.role}</td>
                  <td className="px-6 py-3">{item.department}</td>
                  <td className="px-6 py-3">{item.applicants}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Search bar */}
          <div className="w-full lg:max-w-xs">
            <label htmlFor="applicant-search" className="mb-2 block text-sm font-medium text-gray-700">
              Search Applicants
            </label>
            <input
              id="applicant-search"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Department filter */}
          <div className="w-full lg:max-w-xs">
            <label htmlFor="department-filter" className="mb-2 block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department-filter"
              value={activeDepartment}
              onChange={e => setActiveDepartment(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(applicants.map(a => a.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status filter (Applicant Stage) */}
          <div className="w-full lg:max-w-xs">
            <label htmlFor="stage-filter" className="mb-2 block text-sm font-medium text-gray-700">
              Applicant Stage
            </label>
            <select
              id="stage-filter"
              value={activeStage}
              onChange={(event) => setActiveStage(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Selected applicants: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                    aria-label="Select all visible applicants"
                  />
                </th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">CV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
              {filteredApplicants.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleApplicantSelection(item.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                      aria-label={`Select ${item.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.phone}</p>
                  </td>
                  <td className="px-4 py-3">{item.role}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {item.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setActiveApplicantId(item.id)}
                      className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <DocumentTextIcon className="mr-1.5 h-4 w-4" />
                      View CV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Bulk Messaging</h2>
            <p className="mt-1 text-sm text-gray-500">
              Send one common reply or rejection message to selected applicants in one action.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyTemplate('shortlist')}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Use Shortlist Template
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('rejection')}
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              Use Rejection Template
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="mail-subject" className="mb-2 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              id="mail-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="mail-body" className="mb-2 block text-sm font-medium text-gray-700">
              Common Message
            </label>
            <textarea
              id="mail-body"
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleBulkSend('reply')}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <EnvelopeIcon className="mr-2 h-4 w-4" />
            Send Common Reply
          </button>
          <button
            type="button"
            onClick={() => handleBulkSend('rejection')}
            className="inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            <EnvelopeIcon className="mr-2 h-4 w-4" />
            Send Rejection in Bulk
          </button>
        </div>
      </div>

      {activeApplicant && (
        <CVPreviewModal applicant={activeApplicant} onClose={() => setActiveApplicantId(null)} />
      )}
    </div>
  )
}

const RecruitmentCard = ({ title, value, icon: Icon, tone }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-md p-2 ${toneClass[tone] || toneClass.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

const CVPreviewModal = ({ applicant, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-lg border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">CV Preview</h3>
            <p className="text-sm text-gray-500">{applicant.name} - {applicant.role}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close CV preview"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-gray-700">
            <DetailItem label="Email" value={applicant.email} />
            <DetailItem label="Phone" value={applicant.phone} />
            <DetailItem label="Department" value={applicant.department} />
            <DetailItem label="LinkedIn" value={applicant.linkedinProfileUrl || 'Not provided'} />
            <DetailItem label="CV URL" value={applicant.resumeUrl || 'Not provided'} />
            <DetailItem label="CV File" value={applicant.cvFileName || 'Not provided'} />
            <DetailItem label="Experience" value={applicant.experience} />
            <DetailItem label="Education" value={applicant.education} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Skills</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {applicant.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile Summary</p>
            <p className="mt-2 leading-6">{applicant.profile}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const DetailItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  )
}

export default Recruitment
