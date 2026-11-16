import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Zap,
  Shield,
  Star,
  Globe,
  ArrowRight,
  AlertTriangle,
  LogOut,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStripe } from '../services/stripe';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

interface DynamicPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingModel: 'flat_fee' | 'per_student';
  interval: 'month' | 'term' | 'year';
  currency: string;
  maxStudents?: number | null;
  trialDays: number;
  stripePriceId?: string | null;
  features: string[];
  isActive: boolean;
}

const FALLBACK_PLANS: DynamicPlan[] = [
  {
    id: 'plan_starter',
    name: 'Basic School Plan',
    description: 'Foundational registers, student records, and fee tracking.',
    price: 1000,
    billingModel: 'flat_fee',
    interval: 'month',
    currency: 'KES',
    maxStudents: 150,
    trialDays: 14,
    features: ['Student Records & Profiles', 'Fee Management & Invoicing', 'Basic Accounting & Expenses', 'Daily Attendance Tracking'],
    isActive: true,
  },
  {
    id: 'plan_standard',
    name: 'Standard Term Plan',
    description: 'Termly package for growing primary & secondary institutions.',
    price: 5500,
    billingModel: 'flat_fee',
    interval: 'term',
    currency: 'KES',
    maxStudents: 500,
    trialDays: 0,
    features: ['All Basic Features', 'LMS & Learning Modules', 'Parent Portal & Results Access', 'SMS & WhatsApp Notifications', 'Examination Marks & GPA'],
    isActive: true,
  },
  {
    id: 'plan_per_student',
    name: 'Per-Student Term Plan',
    description: 'Dynamic enrollment billing. Pay strictly for enrolled students.',
    price: 150,
    billingModel: 'per_student',
    interval: 'term',
    currency: 'KES',
    maxStudents: null,
    trialDays: 0,
    features: ['All Standard Features', 'Pay Only For Active Students', 'Flexible Termly Billing', 'Automated Student Count Reconciliation', 'Staff Payroll & HR'],
    isActive: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Premium',
    description: 'Enterprise suite with unlimited capacity and SLA support.',
    price: 15000,
    billingModel: 'flat_fee',
    interval: 'term',
    currency: 'KES',
    maxStudents: null,
    trialDays: 0,
    features: ['All Modules Unlocked', 'Unlimited Students & Staff', 'Multi-Campus Administration', 'Advanced EMIS Analytics', '24/7 Dedicated Account Manager'],
    isActive: true,
  },
];

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<DynamicPlan[]>(FALLBACK_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<DynamicPlan | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<'all' | 'month' | 'term' | 'year'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // M-Pesa Checkout State
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useLanguage();
  const isLocked = new URLSearchParams(location.search).get('locked') === 'true';

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    fetchLivePlans();
  }, []);

  const fetchLivePlans = async () => {
    try {
      const { data } = await api.get('/subscriptions/plans');
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
      }
    } catch {
      // Use fallback plans if endpoint is not reached
    } finally {
      setLoadingPlans(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (selectedInterval === 'all') return true;
    return p.interval === selectedInterval;
  });

  const handleStripeSubscribe = async (plan: DynamicPlan) => {
    const priceId = plan.stripePriceId || 'price_default';
    try {
      const { data } = await api.post('/subscriptions/create-checkout-session', { priceId });
      const stripe = await getStripe();
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setCheckoutMessage({ type: 'error', text: 'Online card checkout unavailable. Please use M-Pesa or Bank Transfer.' });
    }
  };

  const handleInitiateMpesa = (plan: DynamicPlan) => {
    setSelectedPlan(plan);
    setIsMpesaModalOpen(true);
    setCheckoutMessage(null);
  };

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !mpesaPhone) return;

    setMpesaLoading(true);
    setCheckoutMessage(null);

    try {
      await api.post('/mpesa/stk-push', {
        phone: mpesaPhone,
        amount: Number(selectedPlan.price),
        plan: selectedPlan.name.toLowerCase(),
        billingCycle: selectedPlan.interval,
      });
      setCheckoutMessage({
        type: 'success',
        text: 'M-Pesa STK push prompt dispatched to your phone! Enter your PIN on your mobile device to complete.',
      });
      setMpesaPhone('');
    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      setCheckoutMessage({
        type: 'error',
        text: 'Failed to initiate M-Pesa push. Please check your phone number (e.g. 2547XXXXXXXX).',
      });
    } finally {
      setMpesaLoading(false);
    }
  };

  const handleBankTransfer = async (plan: DynamicPlan) => {
    const reference = `BT-${Date.now()}`;
    try {
      await api.post('/payments/bank-transfer', {
        amount: Number(plan.price),
        reference,
        plan: plan.name.toLowerCase(),
        billingCycle: plan.interval,
      });
      setCheckoutMessage({
        type: 'success',
        text: `Bank transfer invoice generated (Ref: ${reference}). Official bank details sent to your registered school email.`,
      });
    } catch {
      setCheckoutMessage({
        type: 'error',
        text: 'Failed to record bank transfer request. Please contact accounts@saaslink.tech.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-green text-brand-white font-sans selection:bg-brand-sand selection:text-brand-dark">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-green/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-sand rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-brand-dark font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-white">SaaSLink</span>
          </Link>
          <div className="flex items-center space-x-4">
            <LanguageSelector variant="dark" />
            <Link to="/" className="text-sm font-bold text-brand-white/80 hover:text-brand-sand transition-colors">
              {t('nav.backToHome', 'Back to Home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8">
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start space-x-4 max-w-3xl mx-auto justify-between"
          >
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-red-400 font-bold text-lg mb-1">Account Locked - Payment Required</h3>
                <p className="text-brand-white/80 text-sm">
                  Your subscription has expired or is inactive. Please select a package and complete payment to restore institutional access.
                </p>
              </div>
            </div>
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-brand-sand text-[11px] font-bold uppercase tracking-[0.3em] mb-4 block">
              {t('nav.pricing', 'Flexible Institutional Packages')}
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Empowering Every School with Transparent Pricing
            </h1>
            <p className="text-base md:text-lg text-brand-white/70 leading-relaxed">
              Choose between <strong>Flat Fee Packages</strong> or <strong>Per-Student Metered Billing</strong>, billed monthly, termly, or annually with zero hidden charges.
            </p>
          </motion.div>

          {/* Billing Interval Filter */}
          <div className="mt-10 inline-flex p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setSelectedInterval('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedInterval === 'all'
                  ? 'bg-brand-sand text-brand-dark shadow-md'
                  : 'text-brand-white/70 hover:text-brand-white'
              }`}
            >
              All Packages
            </button>
            <button
              onClick={() => setSelectedInterval('term')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedInterval === 'term'
                  ? 'bg-brand-sand text-brand-dark shadow-md'
                  : 'text-brand-white/70 hover:text-brand-white'
              }`}
            >
              Per School Term (3 Terms/Year)
            </button>
            <button
              onClick={() => setSelectedInterval('month')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedInterval === 'month'
                  ? 'bg-brand-sand text-brand-dark shadow-md'
                  : 'text-brand-white/70 hover:text-brand-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('year')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedInterval === 'year'
                  ? 'bg-brand-sand text-brand-dark shadow-md'
                  : 'text-brand-white/70 hover:text-brand-white'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        <div aria-live="polite" aria-atomic="true" className="max-w-3xl mx-auto mb-8">
          {checkoutMessage && (
            <div
              className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between ${
                checkoutMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-200 border border-red-500/30'
              }`}
            >
              <span>{checkoutMessage.text}</span>
              <button onClick={() => setCheckoutMessage(null)} className="text-white/60 hover:text-white">
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {filteredPlans.map((plan) => {
            const isPerStudent = plan.billingModel === 'per_student';
            return (
              <motion.div
                key={plan.id || plan.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6 }}
                className={`relative rounded-[28px] p-7 bg-white/5 border transition-all flex flex-col justify-between ${
                  isPerStudent
                    ? 'border-brand-sand/60 shadow-xl shadow-brand-sand/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPerStudent
                          ? 'bg-brand-sand text-brand-dark'
                          : 'bg-white/10 text-brand-sand'
                      }`}
                    >
                      {isPerStudent ? 'Per Student' : 'Flat Fee'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-white/60">
                      {plan.interval === 'term' ? 'Per Term' : plan.interval === 'month' ? 'Monthly' : 'Annual'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <p className="text-xs text-brand-white/60 line-clamp-2 mb-6">
                    {plan.description || 'Comprehensive institutional management package.'}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xs text-brand-sand font-bold">{plan.currency || 'KES'}</span>
                      <span className="text-4xl font-black tracking-tight">
                        {Number(plan.price).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-brand-white/50 text-[11px] font-bold uppercase tracking-wider block mt-1">
                      {isPerStudent ? `/ student / ${plan.interval}` : `/ school / ${plan.interval}`}
                    </span>
                    <div className="mt-2 text-[11px] text-brand-white/40">
                      {plan.maxStudents && plan.maxStudents > 0
                        ? `Up to ${plan.maxStudents} Students`
                        : `Unlimited Students`}
                      {plan.trialDays > 0 && ` &bull; ${plan.trialDays} Days Free Trial`}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {Array.isArray(plan.features) &&
                      plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-brand-white/70">
                          <CheckCircle className="h-4 w-4 text-brand-sand mr-2.5 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      navigate(`/register?plan=${encodeURIComponent(plan.name.toLowerCase())}`);
                    } else {
                      setSelectedPlan(plan);
                    }
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all active:scale-95 ${
                    isPerStudent
                      ? 'bg-brand-sand text-brand-dark hover:bg-brand-sand/90 shadow-lg shadow-brand-sand/20'
                      : 'bg-white/10 text-brand-white hover:bg-white/20'
                  }`}
                >
                  {isLoggedIn ? `Subscribe to ${plan.name}` : `Get Started`}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment Selection Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md flex items-center justify-center z-[100] p-6"
          >
            <motion.div
              initial={{ y: 30, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.95 }}
              className="bg-brand-green border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 id="payment-modal-title" className="text-2xl font-bold">
                    Secure Institutional Checkout
                  </h2>
                  <p className="text-xs text-brand-white/60 mt-1">
                    {selectedPlan.name} &bull; KES {Number(selectedPlan.price).toLocaleString()} (
                    {selectedPlan.billingModel === 'per_student' ? 'Per Student' : 'Flat Fee'}) / {selectedPlan.interval}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  aria-label="Close checkout"
                  className="p-2 text-brand-white/40 hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleInitiateMpesa(selectedPlan)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3 text-brand-sand" />
                    <span className="font-bold text-xs uppercase tracking-wider">M-Pesa Mobile Money</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-sand" />
                </button>

                <button
                  onClick={() => handleStripeSubscribe(selectedPlan)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-3 text-brand-sand" />
                    <span className="font-bold text-xs uppercase tracking-wider">Credit / Debit Card</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-sand" />
                </button>

                <button
                  onClick={() => handleBankTransfer(selectedPlan)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center">
                    <Banknote className="h-5 w-5 mr-3 text-brand-sand" />
                    <span className="font-bold text-xs uppercase tracking-wider">Direct Bank Invoice</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-sand" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* M-PESA POPUP MODAL (NO ALERT/PROMPT) */}
      <AnimatePresence>
        {isMpesaModalOpen && selectedPlan && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mpesa-title"
            className="fixed inset-0 bg-brand-dark/90 backdrop-blur-md flex items-center justify-center z-[110] p-6"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="bg-brand-green border border-brand-sand/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-white"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-brand-sand" />
                  <h3 id="mpesa-title" className="text-xl font-bold">
                    M-Pesa Express Checkout
                  </h3>
                </div>
                <button
                  onClick={() => setIsMpesaModalOpen(false)}
                  aria-label="Close M-Pesa modal"
                  className="p-1 text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMpesaSubmit} className="space-y-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs">
                  <p className="text-white/60">Selected Package:</p>
                  <p className="font-bold text-brand-sand mt-0.5">{selectedPlan.name}</p>
                  <p className="text-white/80 font-mono mt-1">Amount: KES {Number(selectedPlan.price).toLocaleString()}</p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="mpesa-phone" className="text-xs font-bold uppercase tracking-wider text-white/80">
                    M-Pesa Phone Number
                  </label>
                  <input
                    id="mpesa-phone"
                    type="tel"
                    required
                    placeholder="e.g. 254712345678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-brand-sand focus:outline-none"
                  />
                  <p className="text-[10px] text-white/50">Enter phone in format 2547XXXXXXXX</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMpesaModalOpen(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/10 text-xs font-bold uppercase tracking-wider hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mpesaLoading}
                    className="w-2/3 py-2.5 rounded-xl bg-brand-sand text-brand-dark text-xs font-bold uppercase tracking-wider hover:bg-brand-sand/90 disabled:opacity-50"
                  >
                    {mpesaLoading ? 'Sending...' : 'Prompt Phone'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 bg-brand-green border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-brand-white/50 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-brand-white">SaaSLink EMIS</span>
            <span>&bull;</span>
            <span>Enterprise Multi-Tenant Educational Infrastructure</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-brand-sand">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-brand-sand">Terms of Service</Link>
            <Link to="/contact" className="hover:text-brand-sand">Contact Sales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
