import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Users, BookOpen, Calendar, CheckSquare, LogOut,
  Bell, MessageSquare, Award, Check, X, Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ClassLevel {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRow {
  studentId: number;
  name: string;
  status: AttendanceStatus;
}

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

// ── Component ─────────────────────────────────────────────────────────────────

const TeacherAttendancePage: React.FC = () => {
  const { logout } = useAuth();

  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);

  // ── Fetch class levels on mount ─────────────────────────────────────────────
  useEffect(() => {
    setLoadingClasses(true);
    api
      .get<ClassLevel[]>('/academics/class-levels')
      .then((res) => {
        const levels = Array.isArray(res.data) ? res.data : [];
        setClassLevels(levels);
        if (levels.length > 0) {
          setSelectedClassId(String(levels[0].id));
        }
      })
      .catch(() => {
        setStatus({ type: 'error', text: 'Failed to load class levels. Please refresh.' });
      })
      .finally(() => setLoadingClasses(false));
  }, []);

  // ── Fetch students when class selection changes ──────────────────────────────
  useEffect(() => {
    if (!selectedClassId) {
      setAttendanceRows([]);
      return;
    }

    setLoadingStudents(true);
    setStatus(null);

    api
      .get<Student[]>('/students', { params: { classLevelId: selectedClassId } })
      .then((res) => {
        const students: Student[] = Array.isArray(res.data) ? res.data : [];
        setAttendanceRows(
          students.map((s) => ({
            studentId: s.id,
            name: `${s.firstName} ${s.lastName}`,
            status: 'present',
          })),
        );
      })
      .catch(() => {
        setStatus({ type: 'error', text: 'Failed to load students for this class.' });
        setAttendanceRows([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedClassId]);

  // ── Status change helper ─────────────────────────────────────────────────────
  const handleStatusChange = (studentId: number, newStatus: AttendanceStatus) => {
    setAttendanceRows((rows) =>
      rows.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r)),
    );
  };

  const markAllPresent = () => {
    setAttendanceRows((rows) => rows.map((r) => ({ ...r, status: 'present' })));
  };

  // ── Save attendance ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedClassId || attendanceRows.length === 0) return;

    setSaving(true);
    setStatus(null);

    try {
      await api.post('/attendance/bulk', {
        records: attendanceRows.map((row) => ({
          studentId: row.studentId,
          classLevelId: Number(selectedClassId),
          date,
          status: row.status,
        })),
      });
      setStatus({ type: 'success', text: 'Attendance saved successfully!' });
    } catch {
      setStatus({ type: 'error', text: 'Failed to save attendance. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-600">SaaSLink</h2>
          <p className="text-sm text-gray-500 mt-1">Teacher Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/teacher"
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            My Dashboard
          </Link>
          <Link
            to="/teacher/classes"
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <Users className="w-5 h-5 mr-3" />
            My Classes
          </Link>
          <Link
            to="/teacher/attendance"
            className="flex items-center px-4 py-3 text-indigo-600 bg-indigo-50 rounded-lg font-medium"
          >
            <CheckSquare className="w-5 h-5 mr-3" />
            Attendance
          </Link>
          <Link
            to="/teacher/grading"
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <Award className="w-5 h-5 mr-3" />
            Grading
          </Link>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <Calendar className="w-5 h-5 mr-3" />
            Schedule
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Messages
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Attendance</h1>
              <p className="text-gray-500 mt-1">Record and manage attendance for your classes.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Inline status message */}
          <div aria-live="polite" aria-atomic="true" className="mb-4">
            {status && (
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {status.text}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label
                    htmlFor="class-select"
                    className="block text-xs font-medium text-gray-500 mb-1"
                  >
                    Class
                  </label>
                  {loadingClasses ? (
                    <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg" />
                  ) : (
                    <select
                      id="class-select"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                    >
                      {classLevels.length === 0 && (
                        <option value="">No classes found</option>
                      )}
                      {classLevels.map((cl) => (
                        <option key={cl.id} value={String(cl.id)}>
                          {cl.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="attendance-date"
                    className="block text-xs font-medium text-gray-500 mb-1"
                  >
                    Date
                  </label>
                  <input
                    id="attendance-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={markAllPresent}
                  disabled={attendanceRows.length === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark All Present
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || loadingStudents || attendanceRows.length === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving…' : 'Save Attendance'}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                </div>
              ) : attendanceRows.length === 0 ? (
                <p className="text-center text-gray-400 py-20">
                  {selectedClassId
                    ? 'No students found for this class.'
                    : 'Select a class to begin.'}
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="px-6 py-4 font-medium">Student Name</th>
                      <th className="px-6 py-4 font-medium text-center">Present</th>
                      <th className="px-6 py-4 font-medium text-center">Absent</th>
                      <th className="px-6 py-4 font-medium text-center">Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendanceRows.map((row) => (
                      <tr key={row.studentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                              {row.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            {row.name}
                          </div>
                        </td>

                        {/* Present */}
                        <td className="px-6 py-4 text-center">
                          <label
                            htmlFor={`status-present-${row.studentId}`}
                            className="sr-only"
                          >
                            Mark {row.name} present
                          </label>
                          <button
                            id={`status-present-${row.studentId}`}
                            type="button"
                            aria-pressed={row.status === 'present'}
                            onClick={() => handleStatusChange(row.studentId, 'present')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors ${
                              row.status === 'present'
                                ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        </td>

                        {/* Absent */}
                        <td className="px-6 py-4 text-center">
                          <label
                            htmlFor={`status-absent-${row.studentId}`}
                            className="sr-only"
                          >
                            Mark {row.name} absent
                          </label>
                          <button
                            id={`status-absent-${row.studentId}`}
                            type="button"
                            aria-pressed={row.status === 'absent'}
                            onClick={() => handleStatusChange(row.studentId, 'absent')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors ${
                              row.status === 'absent'
                                ? 'bg-red-100 text-red-600 border-2 border-red-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>

                        {/* Late */}
                        <td className="px-6 py-4 text-center">
                          <label
                            htmlFor={`status-late-${row.studentId}`}
                            className="sr-only"
                          >
                            Mark {row.name} late
                          </label>
                          <button
                            id={`status-late-${row.studentId}`}
                            type="button"
                            aria-pressed={row.status === 'late'}
                            onClick={() => handleStatusChange(row.studentId, 'late')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-colors ${
                              row.status === 'late'
                                ? 'bg-amber-100 text-amber-600 border-2 border-amber-500'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherAttendancePage;
