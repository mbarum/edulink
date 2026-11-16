import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Users, BookOpen, Calendar, CheckSquare, LogOut,
  Bell, MessageSquare, Award, ChevronRight, Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ClassLevel {
  id: number;
  name: string;
  description?: string;
  studentCount?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────

const TeacherClassesPage: React.FC = () => {
  const { logout } = useAuth();

  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch class levels ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get<ClassLevel[]>('/academics/class-levels')
      .then((res) => {
        setClasses(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setError('Failed to load classes. Please try refreshing the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

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
            className="flex items-center px-4 py-3 text-indigo-600 bg-indigo-50 rounded-lg font-medium"
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
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <p className="text-gray-500 mt-1">Manage your assigned classes and student rosters.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <label htmlFor="class-search" className="sr-only">
                  Search classes
                </label>
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="class-search"
                  type="text"
                  placeholder="Search classes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Error state */}
          {error && (
            <div
              aria-live="polite"
              className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium"
            >
              {error}
            </div>
          )}

          {/* Empty state */}
          {!error && filteredClasses.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              {searchQuery
                ? `No classes matched "${searchQuery}".`
                : 'No class levels found. Contact your administrator.'}
            </div>
          )}

          {/* Class cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => {
              const count = cls.studentCount ?? 0;
              const avatarCount = Math.min(count, 4);

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                        {cls.description && (
                          <p className="text-indigo-600 font-medium text-sm mt-0.5">
                            {cls.description}
                          </p>
                        )}
                      </div>
                      {count > 0 && (
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {count} Student{count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      {count > 0 ? (
                        <>
                          {Array.from({ length: avatarCount }).map((_, i) => (
                            <div
                              key={i}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500"
                            >
                              S{i + 1}
                            </div>
                          ))}
                          {count > 4 && (
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                              +{count - 4}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No students yet</span>
                      )}
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                      View Roster <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherClassesPage;
