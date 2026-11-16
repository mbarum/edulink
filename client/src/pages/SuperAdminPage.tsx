import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Wallet,
  Bell,
  GraduationCap,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  Calendar,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import LanguageSelector from '../components/LanguageSelector';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BillingModel = 'flat_fee' | 'per_student';
export type BillingInterval = 'month' | 'term' | 'year';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingModel: BillingModel;
  interval: BillingInterval;
  currency: string;
  maxStudents?: number | null;
  trialDays: number;
  stripePriceId?: string | null;
  features: string[];
  isActive: boolean;
}

const AVAILABLE_FEATURE_OPTIONS = [
  'Student Records & Profiles',
  'Fee Management & Invoicing',
  'Basic Accounting & Expenses',
  'Daily Attendance Tracking',
  'LMS & Learning Modules',
  'Parent Portal & Results Access',
  'SMS & WhatsApp Notifications',
  'Examination Marks & Term GPA',
  'Class Timetabling & Scheduling',
  'Staff Payroll & Human Resources',
  'Library & Resource Management',
  'Advanced Analytics & EMIS Reporting',
  'Multi-Campus / Branch Administration',
  'Priority 24/7 SLA Support',
];

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-2xl flex items-center space-x-4 border border-gray-700 shadow-sm"
    whileHover={{ y: -4, scale: 1.01 }}
  >
    <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-400`}>{icon}</div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white mt-1">{value}</p>
    </div>
  </motion.div>
);

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const SuperAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    billingModel: BillingModel;
    interval: BillingInterval;
    currency: string;
    maxStudents: number | '';
    trialDays: number;
    features: string[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    price: 150,
    billingModel: 'per_student',
    interval: 'term',
    currency: 'KES',
    maxStudents: '',
    trialDays: 0,
    features: [
      'Student Records & Profiles',
      'Daily Attendance Tracking',
      'Examination Marks & Term GPA',
    ],
    isActive: true,
  });

  useEffect(() => {
    fetchAnalytics();
    fetchPlans();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/super-admin/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const { data } = await api.get('/super-admin/plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setStatusMessage({ type: 'error', text: 'Failed to load subscription packages.' });
    } finally {
      setPlansLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 150,
      billingModel: 'per_student',
      interval: 'term',
      currency: 'KES',
      maxStudents: '',
      trialDays: 0,
      features: [
        'Student Records & Profiles',
        'Daily Attendance Tracking',
        'Examination Marks & Term GPA',
      ],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: Number(plan.price),
      billingModel: plan.billingModel || 'flat_fee',
      interval: plan.interval || 'month',
      currency: plan.currency || 'KES',
      maxStudents: plan.maxStudents ?? '',
      trialDays: plan.trialDays || 0,
      features: Array.isArray(plan.features) ? plan.features : [],
      isActive: plan.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature)
          : [...prev.features, feature],
      };
    });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);
    setStatusMessage(null);

    const payload = {
      ...formData,
      price: Number(formData.price),
      maxStudents: formData.maxStudents === '' ? null : Number(formData.maxStudents),
      trialDays: Number(formData.trialDays),
    };

    try {
      if (editingPlan) {
        await api.patch(`/super-admin/plans/${editingPlan.id}`, payload);
        setStatusMessage({ type: 'success', text: `Package "${formData.name}" updated successfully!` });
      } else {
        await api.post('/super-admin/plans', payload);
        setStatusMessage({ type: 'success', text: `New package "${formData.name}" created successfully!` });
      }
      setIsModalOpen(false);
      fetchPlans();
      fetchAnalytics();
    } catch (err: any) {
      console.error('Failed to save plan:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save subscription package. Please check details.',
      });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleTogglePlanActive = async (plan: SubscriptionPlan) => {
    try {
      await api.patch(`/super-admin/plans/${plan.id}`, { isActive: !plan.isActive });
      setStatusMessage({
        type: 'success',
        text: `Package "${plan.name}" billing ${!plan.isActive ? 'activated' : 'deactivated'}.`,
      });
      fetchPlans();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to toggle package status.' });
    }
  };

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (!window.confirm(`Are you sure you want to delete package "${plan.name}"?`)) return;
    try {
      await api.delete(`/super-admin/plans/${plan.id}`);
      setStatusMessage({ type: 'success', text: `Package "${plan.name}" deleted.` });
      fetchPlans();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to delete package.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Super Administrator Portal</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">Mission Control</h1>
            <p className="text-gray-400 text-sm mt-1">Multi-tenant institutional governance and subscription engine.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelector variant="dark" />
            <Link
              to="/super-admin/tenants"
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-semibold transition-colors border border-gray-700"
            >
              Manage Tenants
            </Link>
            <Link
              to="/super-admin/financials"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-colors"
            >
              Financial Command
            </Link>
          </div>
        </header>

        {/* Live Status Feedback */}
        <div aria-live="polite" aria-atomic="true" className="mb-6">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                aria-label="Dismiss notification"
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 border-b border-gray-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            System Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'packages'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Packages & Billing Control</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/30 text-blue-200">
              {plans.length}
            </span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && analytics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <StatCard icon={<Building size={22} />} label="Total Schools" value={analytics.totalTenants} color="blue" />
              <StatCard icon={<Building size={22} />} label="Active Subs" value={analytics.activeSubscriptions} color="green" />
              <StatCard icon={<GraduationCap size={22} />} label="Total Students" value={analytics.totalStudents} color="purple" />
              <StatCard icon={<Users size={22} />} label="Avg Attendance" value={`${analytics.averageAttendance}%`} color="indigo" />
              <StatCard icon={<Wallet size={22} />} label="Revenue (KES)" value={analytics.totalRevenue.toLocaleString()} color="emerald" />
              <StatCard icon={<Bell size={22} />} label="Pending Approvals" value={analytics.pendingApprovals} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-6">Revenue Over Time</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueOverTime}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `KES ${val}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#10b981' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tenants by Plan */}
              <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-lg font-bold mb-6">Schools by Package</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.tenantsByPlan}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.tenantsByPlan.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold">Recent Inflows & Approvals</h3>
                <Link to="/super-admin/financials" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                  View All Receipts <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">School</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Method</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {analytics.recentPayments.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-750 transition-colors">
                        <td className="p-4 font-medium">{payment.tenantName}</td>
                        <td className="p-4 font-mono font-semibold">KES {payment.amount.toLocaleString()}</td>
                        <td className="p-4 capitalize">{payment.method}</td>
                        <td className="p-4 text-gray-400">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'Approved'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {analytics.recentPayments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No recent transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: PACKAGES & BILLING CONTROL */}
        {activeTab === 'packages' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <CreditCard className="w-6 h-6 mr-2.5 text-blue-400" />
                  Subscription Packages & Metered Billing
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Full control: create packages billed <strong>flat-fee</strong> or <strong>per-student</strong>, across <strong>monthly</strong>, <strong>per-term</strong>, or <strong>annual</strong> cycles.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center shadow-lg shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Package
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-semibold">Total Packages</span>
                <p className="text-2xl font-bold mt-1 text-white">{plans.length}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-semibold">Active Packages</span>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {plans.filter((p) => p.isActive).length}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-semibold">Per-Student Plans</span>
                <p className="text-2xl font-bold mt-1 text-purple-400">
                  {plans.filter((p) => p.billingModel === 'per_student').length}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-semibold">Flat-Fee Plans</span>
                <p className="text-2xl font-bold mt-1 text-blue-400">
                  {plans.filter((p) => p.billingModel === 'flat_fee').length}
                </p>
              </div>
            </div>

            {plansLoading ? (
              <div className="text-center py-12 text-gray-400">Loading subscription plans...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-gray-800 rounded-2xl border transition-all flex flex-col justify-between p-6 ${
                      plan.isActive
                        ? 'border-gray-700 hover:border-blue-500/50'
                        : 'border-red-900/30 opacity-70 bg-gray-850'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-x-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              plan.billingModel === 'per_student'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {plan.billingModel === 'per_student' ? 'Per Student' : 'Flat Fee'}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-700 text-gray-300">
                            {plan.interval === 'term' ? 'Per Term' : plan.interval === 'month' ? 'Per Month' : 'Annual'}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            plan.isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {plan.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>

                      {/* Package Name & Price */}
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-4">
                        {plan.description || 'Institutional subscription package.'}
                      </p>

                      <div className="mb-6 p-4 rounded-xl bg-gray-900/60 border border-gray-700/50">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-xs text-gray-400 font-bold">{plan.currency || 'KES'}</span>
                          <span className="text-3xl font-black text-white">
                            {Number(plan.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {plan.billingModel === 'per_student'
                              ? `/ student / ${plan.interval}`
                              : `/ ${plan.interval}`}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-gray-400 flex items-center justify-between">
                          <span>
                            Limit: {plan.maxStudents && plan.maxStudents > 0 ? `${plan.maxStudents} Students` : 'Unlimited'}
                          </span>
                          {plan.trialDays > 0 && <span>{plan.trialDays} Days Trial</span>}
                        </div>
                      </div>

                      {/* Feature List */}
                      <div className="space-y-2 mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Features Included:</p>
                        {Array.isArray(plan.features) && plan.features.length > 0 ? (
                          plan.features.slice(0, 5).map((f, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-300">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic">Standard institutional features.</p>
                        )}
                        {Array.isArray(plan.features) && plan.features.length > 5 && (
                          <p className="text-[11px] text-blue-400 font-medium">
                            +{plan.features.length - 5} more features
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-gray-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePlanActive(plan)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center ${
                          plan.isActive
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                            : 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {plan.isActive ? 'Disable Billing' : 'Enable Billing'}
                      </button>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          aria-label={`Edit ${plan.name}`}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          aria-label={`Delete ${plan.name}`}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: CREATE / EDIT PACKAGE */}
        <AnimatePresence>
          {isModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="plan-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-white"
              >
                <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
                  <div>
                    <h3 id="plan-modal-title" className="text-2xl font-bold">
                      {editingPlan ? 'Edit Subscription Package' : 'Create New Package'}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Configure package pricing, billing model, term/monthly intervals, and features.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close modal"
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-6">
                  {/* Name & Currency */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label htmlFor="plan-name" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Package Name
                      </label>
                      <input
                        id="plan-name"
                        type="text"
                        required
                        placeholder="e.g., Per-Student Term Package"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="plan-currency" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Currency
                      </label>
                      <select
                        id="plan-currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="KES">KES (Kenyan Shilling)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="UGX">UGX (Ugandan Shilling)</option>
                        <option value="TZS">TZS (Tanzanian Shilling)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label htmlFor="plan-desc" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Description
                    </label>
                    <textarea
                      id="plan-desc"
                      rows={2}
                      placeholder="Brief summary of who this plan is tailored for..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Billing Model (Per Student vs Flat Fee) */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                      Billing Model
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.billingModel === 'per_student'
                            ? 'bg-purple-500/10 border-purple-500 text-purple-200'
                            : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="billingModel"
                          value="per_student"
                          checked={formData.billingModel === 'per_student'}
                          onChange={() => setFormData({ ...formData, billingModel: 'per_student' })}
                          className="mt-1 mr-3 text-purple-600"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">Per Student (Metered)</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Charges scale according to active student enrollment count.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                          formData.billingModel === 'flat_fee'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-200'
                            : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="billingModel"
                          value="flat_fee"
                          checked={formData.billingModel === 'flat_fee'}
                          onChange={() => setFormData({ ...formData, billingModel: 'flat_fee' })}
                          className="mt-1 mr-3 text-blue-600"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">Flat Fee (Fixed)</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Predictable fixed price for the institution regardless of count.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Billing Interval & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="plan-interval" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Billing Interval / Period
                      </label>
                      <select
                        id="plan-interval"
                        value={formData.interval}
                        onChange={(e) => setFormData({ ...formData, interval: e.target.value as BillingInterval })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="month">Per Month (Monthly)</option>
                        <option value="term">Per Term (School Term — 3 to 4 Months)</option>
                        <option value="year">Per Year (Annual)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="plan-price" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        {formData.billingModel === 'per_student'
                          ? `Rate Per Student (${formData.currency})`
                          : `Flat Price (${formData.currency})`}
                      </label>
                      <input
                        id="plan-price"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Student Limit & Trial Days */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="plan-students" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Max Student Capacity (Leave blank for Unlimited)
                      </label>
                      <input
                        id="plan-students"
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        value={formData.maxStudents}
                        onChange={(e) =>
                          setFormData({ ...formData, maxStudents: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="plan-trial" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Free Trial Period (Days)
                      </label>
                      <input
                        id="plan-trial"
                        type="number"
                        min="0"
                        value={formData.trialDays}
                        onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Features Selection */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                      Included Modules & Features
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-gray-900 border border-gray-700">
                      {AVAILABLE_FEATURE_OPTIONS.map((feature, i) => {
                        const checked = formData.features.includes(feature);
                        return (
                          <label
                            key={i}
                            className={`flex items-center space-x-2 text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                              checked ? 'bg-blue-600/20 text-blue-200' : 'text-gray-400 hover:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleFeature(feature)}
                              className="rounded border-gray-600 text-blue-600 focus:ring-0"
                            />
                            <span>{feature}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900 border border-gray-700">
                    <div>
                      <p className="text-sm font-bold text-white">Enable Billing Immediately</p>
                      <p className="text-xs text-gray-400">
                        Make this package available for institutional onboarding and subscription billing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className="text-gray-400 hover:text-white"
                    >
                      {formData.isActive ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingPlan}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                    >
                      {savingPlan ? 'Saving...' : editingPlan ? 'Update Package' : 'Create Package'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminPage;
