import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Users, BookOpen, Calendar, CheckSquare, LogOut,
  Bell, MessageSquare, Award, Save,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface Examination {
  id: number;
  name: string;
  classLevelId?: number | null;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface GradeRow {
  studentId: number;
  name: string;
  marks: string;
  remarks: string;
}

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

// ── Component ─────────────────────────────────────────────────────────────────

const TeacherGradingPage: React.FC = () => {
  const { logout } = useAuth();

  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);

  // ── Fetch examinations on mount ─────────────────────────────────────────────
  useEffect(() => {
    setLoadingExams(true);
    api
      .get<Examination[]>('/examinations')
      .then((res) => {
        const exams = Array.isArray(res.data) ? res.data : [];
        setExaminations(exams);
        if (exams.length > 0) {
          setSelectedExamId(String(exams[0].id));
        }
      })
      .catch(() => {
        setStatus({ type: 'error', text: 'Failed to load examinations. Please refresh.' });
      })
      .finally(() => setLoadingExams(false));
  }, []);

  // ── Fetch students when exam selection changes ───────────────────────────────
  useEffect(() => {
    if (!selectedExamId) {
      setGradeRows([]);
      return;
    }

    const selectedExam = examinations.find((e) => String(e.id) === selectedExamId);
    setLoadingStudents(true);
    setStatus(null);

    const params: Record<string, string> = {};
    if (selectedExam?.classLevelId != null) {
      params.classLevelId = String(selectedExam.classLevelId);
    }

    api
      .get<Student[]>('/students', { params })
      .then((res) => {
        const students: Student[] = Array.isArray(res.data) ? res.data : [];
        setGradeRows(
          students.map((s) => ({
            studentId: s.id,
            name: `${s.firstName} ${s.lastName}`,
            marks: '',
            remarks: '',
          })),
        );
      })
      .catch(() => {
        setStatus({ type: 'error', text: 'Failed to load students for this examination.' });
        setGradeRows([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedExamId, examinations]);

  // ── Field helpers ────────────────────────────────────────────────────────────
  const handleMarksChange = (studentId: number, value: string) => {
    setGradeRows((rows) =>
      rows.map((r) => (r.studentId === studentId ? { ...r, marks: value } : r)),
    );
  };

  const handleRemarksChange = (studentId: number, value: string) => {
    setGradeRows((rows) =>
      rows.map((r) => (r.studentId === studentId ? { ...r, remarks: value } : r)),
    );
  };

  // ── Save grades ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedExamId || gradeRows.length === 0) return;

    setSaving(true);
    setStatus(null);

    try {
      await Promise.all(
        gradeRows.map((row) =>
          api.post('/report-cards', {
            studentId: row.studentId,
            examinationId: Number(selectedExamId),
            marks: row.marks === '' ? null : Number(row.marks),
            remarks: row.remarks,
          }),
        ),
      );
      setStatus({ type: 'success', text: 'Grades saved successfully!' });
    } catch {
      setStatus({ type: 'error', text: 'Failed to save grades. Please try again.' });
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
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
          >
            <CheckSquare className="w-5 h-5 mr-3" />
            Attendance
          </Link>
          <Link
            to="/teacher/grading"
            className="flex items-center px-4 py-3 text-indigo-600 bg-indigo-50 rounded-lg font-medium"
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
              <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
              <p className="text-gray-500 mt-1">Enter and manage student grades and assessments.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Inline status message — aria-live for screen readers */}
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
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label
                    htmlFor="exam-select"
                    className="block text-xs font-medium text-gray-500 mb-1"
                  >
                    Examination
                  </label>
                  {loadingExams ? (
                    <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg" />
                  ) : (
                    <select
                      id="exam-select"
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                    >
                      {examinations.length === 0 && (
                        <option value="">No examinations found</option>
                      )}
                      {examinations.map((exam) => (
                        <option key={exam.id} value={String(exam.id)}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving || loadingStudents || gradeRows.length === 0}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving…' : 'Save Grades'}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                </div>
              ) : gradeRows.length === 0 ? (
                <p className="text-center text-gray-400 py-20">
                  {selectedExamId
                    ? 'No students found for this examination.'
                    : 'Select an examination to begin.'}
                </p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="px-6 py-4 font-medium">Student Name</th>
                      <th className="px-6 py-4 font-medium w-36">Score (%)</th>
                      <th className="px-6 py-4 font-medium">Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gradeRows.map((row) => {
                      const marksNum = Number(row.marks);
                      const marksInputId = `marks-${row.studentId}`;
                      const remarksInputId = `remarks-${row.studentId}`;

                      return (
                        <tr
                          key={row.studentId}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3 shrink-0">
                                {row.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </div>
                              <label htmlFor={marksInputId} className="sr-only">
                                Score for {row.name}
                              </label>
                              {row.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              id={marksInputId}
                              type="number"
                              min="0"
                              max="100"
                              value={row.marks}
                              onChange={(e) => handleMarksChange(row.studentId, e.target.value)}
                              placeholder="0–100"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                row.marks === ''
                                  ? 'border-gray-200 text-gray-900'
                                  : marksNum < 50
                                  ? 'border-red-300 text-red-700 bg-red-50'
                                  : marksNum >= 90
                                  ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                  : 'border-gray-200 text-gray-900'
                              }`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <label htmlFor={remarksInputId} className="sr-only">
                              Remarks for {row.name}
                            </label>
                            <input
                              id={remarksInputId}
                              type="text"
                              value={row.remarks}
                              onChange={(e) =>
                                handleRemarksChange(row.studentId, e.target.value)
                              }
                              placeholder="Add feedback…"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                            />
                          </td>
                        </tr>
                      );
                    })}
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

export default TeacherGradingPage;
