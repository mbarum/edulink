import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClassLevel {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  classLevelId: string;
  sectionId: string;
  status: string;
  dateOfBirth?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentalConsentVerified?: boolean;
  classLevel?: { name: string };
  section?: { name: string };
}

type StudentFormData = Omit<Student, 'id' | 'classLevel' | 'section'>;

const EMPTY_FORM: StudentFormData = {
  firstName: '',
  lastName: '',
  registrationNumber: '',
  dateOfBirth: '',
  classLevelId: '',
  sectionId: '',
  status: 'Active',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentalConsentVerified: false,
};

const STATUS_OPTIONS = ['All', 'Active', 'Graduated', 'Transferred', 'Suspended'];

// ---------------------------------------------------------------------------
// Focus-trap hook
// ---------------------------------------------------------------------------

function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return ref;
}

// ---------------------------------------------------------------------------
// Student Form Modal
// ---------------------------------------------------------------------------

interface StudentModalProps {
  mode: 'add' | 'edit';
  student?: Student | null;
  classLevels: ClassLevel[];
  sections: Section[];
  onClose: () => void;
  onSaved: () => void;
  onMessage: (msg: { type: 'success' | 'error'; text: string }) => void;
}

const StudentModal: React.FC<StudentModalProps> = ({
  mode,
  student,
  classLevels,
  sections,
  onClose,
  onSaved,
  onMessage,
}) => {
  const [form, setForm] = useState<StudentFormData>(
    mode === 'edit' && student
      ? {
          firstName: student.firstName,
          lastName: student.lastName,
          registrationNumber: student.registrationNumber ?? '',
          dateOfBirth: student.dateOfBirth ?? '',
          classLevelId: student.classLevelId ?? '',
          sectionId: student.sectionId ?? '',
          status: student.status ?? 'Active',
          parentName: student.parentName ?? '',
          parentEmail: student.parentEmail ?? '',
          parentPhone: student.parentPhone ?? '',
          parentalConsentVerified: student.parentalConsentVerified ?? false,
        }
      : { ...EMPTY_FORM }
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  const trapRef = useFocusTrap(true);
  const titleId = 'student-modal-title';

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentFormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name as keyof StudentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (mode === 'add') {
        await api.post('/students', form);
        onMessage({ type: 'success', text: 'Student added successfully.' });
      } else {
        await api.patch(`/students/${student!.id}`, form);
        onMessage({ type: 'success', text: 'Student updated successfully.' });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      onMessage({
        type: 'error',
        text: err.response?.data?.message ?? 'Failed to save student. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const inputClass = (field: keyof StudentFormData) =>
    `mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl">
          <h2
            id={titleId}
            className="text-xl font-bold text-gray-800 flex items-center gap-2"
          >
            <Users className="w-5 h-5 text-indigo-500" />
            {mode === 'add' ? 'Add New Student' : 'Edit Student'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Reg + DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                value={form.registrationNumber}
                onChange={handleChange}
                className={inputClass('registrationNumber')}
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={inputClass('dateOfBirth')}
              />
            </div>
          </div>

          {/* Class + Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="classLevelId" className="block text-sm font-medium text-gray-700">
                Class Level
              </label>
              <select
                id="classLevelId"
                name="classLevelId"
                value={form.classLevelId}
                onChange={handleChange}
                className={inputClass('classLevelId')}
              >
                <option value="">— Select class —</option>
                {classLevels.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700">
                Section
              </label>
              <select
                id="sectionId"
                name="sectionId"
                value={form.sectionId}
                onChange={handleChange}
                className={inputClass('sectionId')}
              >
                <option value="">— Select section —</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass('status')}
            >
              {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Parent info */}
          <fieldset className="border border-gray-200 rounded-xl p-4">
            <legend className="text-sm font-semibold text-gray-600 px-2">Parent / Guardian Contact</legend>
            <div className="mt-3 space-y-4">
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">
                  Parent Name
                </label>
                <input
                  id="parentName"
                  name="parentName"
                  type="text"
                  value={form.parentName}
                  onChange={handleChange}
                  className={inputClass('parentName')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">
                    Parent Email
                  </label>
                  <input
                    id="parentEmail"
                    name="parentEmail"
                    type="email"
                    value={form.parentEmail}
                    onChange={handleChange}
                    className={inputClass('parentEmail')}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">
                    Parent Phone
                  </label>
                  <input
                    id="parentPhone"
                    name="parentPhone"
                    type="tel"
                    value={form.parentPhone}
                    onChange={handleChange}
                    className={inputClass('parentPhone')}
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="parentalConsentVerified"
                  name="parentalConsentVerified"
                  type="checkbox"
                  checked={form.parentalConsentVerified}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="parentalConsentVerified" className="text-sm text-gray-700">
                  Parental Consent Verified
                </label>
              </div>
            </div>
          </fieldset>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow hover:shadow-indigo-400/40 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Saving…
                </>
              ) : mode === 'add' ? (
                <>
                  <Plus className="w-4 h-4" />
                  Add Student
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Graduated: 'bg-blue-100 text-blue-700',
    Transferred: 'bg-amber-100 text-amber-700',
    Suspended: 'bg-red-100 text-red-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        map[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const StudentsManagementPage: React.FC = () => {
  // ---- student list state ----
  const [students, setStudents] = useState<Student[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // ---- lookup data ----
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // ---- search / filter ----
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ---- modals ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // ---- delete confirm ----
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ---- global status message ----
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- bulk upload state ----
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchStudents = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await api.get('/students');
      setStudents(res.data?.data ?? res.data ?? []);
    } catch (err: any) {
      setListError(err.response?.data?.message ?? 'Failed to load students.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [clRes, secRes] = await Promise.all([
        api.get('/academics/class-levels'),
        api.get('/academics/sections'),
      ]);
      setClassLevels(clRes.data?.data ?? clRes.data ?? []);
      setSections(secRes.data?.data ?? secRes.data ?? []);
    } catch {
      // non-critical – selects will simply be empty
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchLookups();
  }, [fetchStudents, fetchLookups]);

  // Auto-dismiss top-level messages
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/students/${id}`);
      setMessage({ type: 'success', text: 'Student deleted successfully.' });
      setDeletingId(null);
      fetchStudents();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message ?? 'Failed to delete student.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Bulk upload
  // ---------------------------------------------------------------------------

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
      setUploadMessage(null);
      setUploadResult(null);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }
    setUploadLoading(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append('file', uploadFile);
    try {
      const response = await api.post('/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult(response.data);
      if (response.data.failed === 0 && response.data.success > 0) {
        setUploadMessage({
          type: 'success',
          text: `Successfully imported ${response.data.success} students!`,
        });
      } else if (response.data.success > 0) {
        setUploadMessage({
          type: 'success',
          text: `Imported ${response.data.success} students, but ${response.data.failed} failed.`,
        });
      } else {
        setUploadMessage({ type: 'error', text: 'Failed to import students. See errors below.' });
      }
      fetchStudents();
    } catch (err: any) {
      setUploadMessage({
        type: 'error',
        text:
          err.response?.data?.message ??
          'Failed to upload file. Please ensure it is a valid CSV or Excel file.',
      });
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered list (client-side)
  // ---------------------------------------------------------------------------

  const filtered = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      (s.registrationNumber ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Students Management
        </h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {/* Global status message */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label="Dismiss message"
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Student Table Section                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Table header + search bar */}
        <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            All Students
            <span className="ml-1 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="student-search"
                type="search"
                placeholder="Search by name or reg #…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search students"
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
              />
            </div>
            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {listLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center justify-center py-16 text-red-500 gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{listError}</p>
              <button
                type="button"
                onClick={fetchStudents}
                className="mt-1 text-xs underline text-indigo-600 hover:text-indigo-800"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Users className="w-10 h-10 opacity-30" />
              <p className="text-sm">No students found.</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3">Reg #</th>
                  <th scope="col" className="px-5 py-3">First Name</th>
                  <th scope="col" className="px-5 py-3">Last Name</th>
                  <th scope="col" className="px-5 py-3">Class</th>
                  <th scope="col" className="px-5 py-3">Section</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-gray-500 text-xs">
                      {student.registrationNumber || '—'}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{student.firstName}</td>
                    <td className="px-5 py-3 text-gray-700">{student.lastName}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {student.classLevel?.name || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {student.section?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {deletingId === student.id ? (
                        /* Inline delete confirmation */
                        <div className="inline-flex items-center gap-2">
                          <span className="text-xs text-gray-600">Delete?</span>
                          <button
                            type="button"
                            aria-label={`Confirm delete student ${student.firstName} ${student.lastName}`}
                            onClick={() => handleDelete(student.id)}
                            disabled={deleteLoading}
                            className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
                          >
                            {deleteLoading ? '…' : 'Yes, delete'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            aria-label={`Edit ${student.firstName} ${student.lastName}`}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(student.id)}
                            aria-label={`Delete ${student.firstName} ${student.lastName}`}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bulk Upload Section (preserved)                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
          <Upload className="text-indigo-500" />
          Bulk Upload Students
        </h2>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <AlertCircle className="text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">CSV / Excel Requirements:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Required columns: <strong>FirstName</strong>, <strong>LastName</strong>
              </li>
              <li>
                Optional columns: <strong>RegistrationNumber</strong>, <strong>Class</strong>{' '}
                (e.g. Form 1), <strong>Section</strong> (e.g. A),{' '}
                <strong>AcademicYear</strong> (e.g. 2023/2024)
              </li>
              <li>Ensure class names match exactly what is in your Class Management settings.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleBulkUpload} className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors duration-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-indigo-400" />
                <p className="mb-2 text-sm text-gray-500 font-medium">
                  <span className="text-indigo-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">CSV, XLS, or XLSX (MAX. 5MB)</p>
                {uploadFile && (
                  <p className="mt-4 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-semibold truncate max-w-xs">
                    {uploadFile.name}
                  </p>
                )}
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {uploadMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`p-4 rounded-xl flex items-start gap-3 ${
                uploadMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <CheckCircle className="shrink-0" />
              ) : (
                <AlertCircle className="shrink-0" />
              )}
              <span className="font-medium">{uploadMessage.text}</span>
            </div>
          )}

          {uploadResult && uploadResult.errors?.length > 0 && (
            <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Import Errors:</h3>
              <ul className="text-sm text-red-700 space-y-1 list-disc pl-5 max-h-40 overflow-y-auto">
                {uploadResult.errors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!uploadFile || uploadLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 ${
                !uploadFile || uploadLoading
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02]'
              }`}
            >
              {uploadLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  Uploading…
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  Import Students
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modals                                                              */}
      {/* ------------------------------------------------------------------ */}
      {showAddModal && (
        <StudentModal
          mode="add"
          classLevels={classLevels}
          sections={sections}
          onClose={() => setShowAddModal(false)}
          onSaved={fetchStudents}
          onMessage={setMessage}
        />
      )}

      {editingStudent && (
        <StudentModal
          mode="edit"
          student={editingStudent}
          classLevels={classLevels}
          sections={sections}
          onClose={() => setEditingStudent(null)}
          onSaved={fetchStudents}
          onMessage={setMessage}
        />
      )}
    </div>
  );
};

export default StudentsManagementPage;
