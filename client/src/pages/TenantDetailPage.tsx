import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building,
  CreditCard,
  Users,
  Settings,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingModel: 'flat_fee' | 'per_student';
  interval: 'month' | 'term' | 'year';
  currency: string;
}

const TenantDetailPage: React.FC = () => {
  const { id } = useParams();
  const [tenant, setTenant] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Billing Modal
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingForm, setBillingForm] = useState({
    plan: '',
    billingModel: 'flat_fee',
    billingInterval: 'month',
    customRate: '',
    subscriptionStatus: 'active',
  });

  useEffect(() => {
    fetchTenant();
    fetchPlans();
  }, [id]);

  const fetchTenant = async () => {
    try {
      const { data } = await api.get(`/super-admin/tenants/${id}`);
      setTenant(data);
      setBillingForm({
        plan: data.plan || 'basic',
        billingModel: data.billingModel || 'flat_fee',
        billingInterval: data.billingInterval || 'month',
        customRate: data.customRate ? String(data.customRate) : '',
        subscriptionStatus: data.subscriptionStatus || 'active',
      });
    } catch (error) {
      console.error('Failed to fetch tenant details:', error);
      setStatusMessage({ type: 'error', text: 'Failed to load school details.' });
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/super-admin/plans');
      setAvailablePlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load available plans:', error);
    }
  };

  const handleToggleTenantStatus = async () => {
    if (!tenant) return;
    const newStatus = tenant.subscriptionStatus === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this institution?`)) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      await api.patch(`/super-admin/tenants/${id}/status`, { status: newStatus });
      setStatusMessage({
        type: 'success',
        text: `Institution status updated to ${newStatus.toUpperCase()}.`,
      });
      await fetchTenant();
    } catch (error) {
      console.error('Failed to update tenant status:', error);
      setStatusMessage({ type: 'error', text: 'Failed to update institution status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBilling(true);
    setStatusMessage(null);

    const payload = {
      plan: billingForm.plan,
      billingModel: billingForm.billingModel,
      billingInterval: billingForm.billingInterval,
      customRate: billingForm.customRate !== '' ? Number(billingForm.customRate) : null,
      subscriptionStatus: billingForm.subscriptionStatus,
    };

    try {
      await api.patch(`/super-admin/tenants/${id}/subscription`, payload);
      setStatusMessage({ type: 'success', text: 'Subscription package and billing controls updated successfully!' });
      setIsBillingModalOpen(false);
      await fetchTenant();
    } catch (error: any) {
      console.error('Failed to update subscription:', error);
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update subscription controls.',
      });
    } finally {
      setSavingBilling(false);
    }
  };

  // Calculations
  const studentCount = tenant?.studentCount || 0;
  const currentModel = tenant?.billingModel || 'flat_fee';
  const currentInterval = tenant?.billingInterval || 'month';
  const customRate = tenant?.customRate ? Number(tenant.customRate) : null;

  // Find matching plan default price if no custom rate
  const matchedPlan = availablePlans.find(
    (p) => p.name.toLowerCase() === (tenant?.plan || '').toLowerCase() || p.id === tenant?.planId,
  );
  const baseRate = customRate !== null ? customRate : matchedPlan ? Number(matchedPlan.price) : 0;
  const projectedInvoice =
    currentModel === 'per_student' ? studentCount * baseRate : baseRate;

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/super-admin/tenants"
            className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to School Management
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black text-white">{tenant.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  tenant.subscriptionStatus === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {tenant.subscriptionStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Domain: <span className="font-mono text-gray-300">{tenant.domain}</span> &bull; Tenant ID:{' '}
              <span className="font-mono text-gray-500 text-xs">{tenant.id}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsBillingModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center shadow-lg shadow-blue-600/30 transition-all"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize Billing & Plan
            </button>
          </div>
        </header>

        {/* Live Feedback */}
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
              <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white">
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Grid Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Institutional Subscription Card */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-400" />
                  Subscription & Billing Controls
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Active package terms, metered rate structure, and billing period.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentModel === 'per_student'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {currentModel === 'per_student' ? 'Per Student (Metered)' : 'Flat Fee (Fixed)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Plan</span>
                <p className="text-lg font-bold text-white capitalize mt-1">{tenant.plan || 'Standard'}</p>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Interval</span>
                <p className="text-lg font-bold text-white capitalize mt-1">
                  {currentInterval === 'term' ? 'Per Term' : currentInterval === 'month' ? 'Per Month' : 'Annual'}
                </p>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700/50">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rate Applied</span>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  KES {baseRate.toLocaleString()}
                  <span className="text-xs text-gray-400 font-sans ml-1">
                    {currentModel === 'per_student' ? `/ student` : ``}
                  </span>
                </p>
                {customRate !== null && (
                  <span className="text-[10px] text-yellow-400 font-semibold block mt-0.5">
                    (Custom Rate Override)
                  </span>
                )}
              </div>
            </div>

            {/* Calculated Invoice Breakdown */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Projected Billing Total
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentModel === 'per_student'
                    ? `${studentCount} enrolled students × KES ${baseRate.toLocaleString()} / student / ${currentInterval}`
                    : `Fixed institutional flat fee per ${currentInterval}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white font-mono">
                  KES {projectedInvoice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 block">/ {currentInterval}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-400" />
                Enrollment Context
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400">Active Students</span>
                  <span className="text-lg font-bold text-white">{studentCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400">Subscription Status</span>
                  <span
                    className={`text-xs font-bold uppercase ${
                      tenant.subscriptionStatus === 'active' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {tenant.subscriptionStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-xs text-gray-400">Stripe Customer ID</span>
                  <span className="text-xs font-mono text-gray-300">{tenant.stripeCustomerId || 'None (Direct/M-Pesa)'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-700 mt-6">
              <button
                onClick={handleToggleTenantStatus}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  tenant.subscriptionStatus === 'active'
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                } disabled:opacity-50`}
              >
                {loading
                  ? 'Processing...'
                  : tenant.subscriptionStatus === 'active'
                  ? 'Deactivate Institution'
                  : 'Activate Institution'}
              </button>
            </div>
          </div>
        </div>

        {/* MODAL: CUSTOMIZE SCHOOL SUBSCRIPTION & BILLING */}
        <AnimatePresence>
          {isBillingModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="billing-modal-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-xl w-full shadow-2xl text-white"
              >
                <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
                  <div>
                    <h3 id="billing-modal-title" className="text-xl font-bold">
                      Customize Institution Billing
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Configure package, billing model (per-student or flat), and billing cycle.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBillingModalOpen(false)}
                    aria-label="Close modal"
                    className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveBilling} className="space-y-5">
                  {/* Package Selection */}
                  <div className="space-y-1">
                    <label htmlFor="school-plan" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Subscription Package
                    </label>
                    <select
                      id="school-plan"
                      value={billingForm.plan}
                      onChange={(e) => {
                        const selected = availablePlans.find((p) => p.name.toLowerCase() === e.target.value.toLowerCase());
                        setBillingForm({
                          ...billingForm,
                          plan: e.target.value,
                          billingModel: selected ? selected.billingModel : billingForm.billingModel,
                          billingInterval: selected ? selected.interval : billingForm.billingInterval,
                        });
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="basic">Basic School Plan</option>
                      <option value="standard">Standard Term Plan</option>
                      <option value="per_student">Per-Student Term Plan</option>
                      <option value="premium">Enterprise Premium</option>
                      {availablePlans.map((p) => (
                        <option key={p.id} value={p.name.toLowerCase()}>
                          {p.name} ({p.billingModel === 'per_student' ? 'Per Student' : 'Flat Fee'} &bull; KES {p.price}/{p.interval})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Billing Model */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
                      Billing Model
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center p-3 rounded-xl border cursor-pointer text-xs font-bold ${
                          billingForm.billingModel === 'per_student'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                            : 'bg-gray-900 border-gray-700 text-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tenantBillingModel"
                          value="per_student"
                          checked={billingForm.billingModel === 'per_student'}
                          onChange={() => setBillingForm({ ...billingForm, billingModel: 'per_student' })}
                          className="mr-2"
                        />
                        Per Student (Metered)
                      </label>

                      <label
                        className={`flex items-center p-3 rounded-xl border cursor-pointer text-xs font-bold ${
                          billingForm.billingModel === 'flat_fee'
                            ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                            : 'bg-gray-900 border-gray-700 text-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tenantBillingModel"
                          value="flat_fee"
                          checked={billingForm.billingModel === 'flat_fee'}
                          onChange={() => setBillingForm({ ...billingForm, billingModel: 'flat_fee' })}
                          className="mr-2"
                        />
                        Flat Fee (Fixed)
                      </label>
                    </div>
                  </div>

                  {/* Billing Interval */}
                  <div className="space-y-1">
                    <label htmlFor="school-interval" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Billing Cycle / Frequency
                    </label>
                    <select
                      id="school-interval"
                      value={billingForm.billingInterval}
                      onChange={(e) => setBillingForm({ ...billingForm, billingInterval: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="month">Monthly (Billed Every Month)</option>
                      <option value="term">Termly (Billed Every School Term — 3 Terms/Year)</option>
                      <option value="year">Annually (Billed Once Per Year)</option>
                    </select>
                  </div>

                  {/* Custom Negotiated Rate */}
                  <div className="space-y-1">
                    <label htmlFor="school-rate" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Custom Rate Override (KES)
                    </label>
                    <input
                      id="school-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Leave blank to use default package price"
                      value={billingForm.customRate}
                      onChange={(e) => setBillingForm({ ...billingForm, customRate: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-blue-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400">
                      {billingForm.billingModel === 'per_student'
                        ? 'Overrides default rate charged per enrolled student.'
                        : 'Overrides default flat amount charged per billing interval.'}
                    </p>
                  </div>

                  {/* Subscription Status */}
                  <div className="space-y-1">
                    <label htmlFor="school-status" className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      Subscription Status
                    </label>
                    <select
                      id="school-status"
                      value={billingForm.subscriptionStatus}
                      onChange={(e) => setBillingForm({ ...billingForm, subscriptionStatus: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="active">Active (Access Granted)</option>
                      <option value="inactive">Inactive (Suspended)</option>
                      <option value="past_due">Past Due (Payment Pending)</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => setIsBillingModalOpen(false)}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingBilling}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                    >
                      {savingBilling ? 'Saving...' : 'Apply Billing Changes'}
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

export default TenantDetailPage;
