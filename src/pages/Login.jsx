import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bus, Eye, EyeOff, LogIn, ShieldCheck, Loader2, Sparkles,
  Navigation, Clock, Activity, CheckCircle2, Sun, Moon,
  UserPlus, Mail, Phone, Hash, User, ChevronRight, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Quick Demo Role Buttons ─────────────────────────────────────
const demoRoles = [
  { key: 'super_admin',     label: 'Super Admin',    email: 'admin@nstu.edu.bd',     roleName: 'System Controller', color: 'from-amber-500 to-amber-700' },
  { key: 'transport_admin', label: 'Transport Admin', email: 'transport@nstu.edu.bd', roleName: 'Fleet Manager',     color: 'from-blue-600 to-indigo-700' },
  { key: 'driver',          label: 'Bus Driver',      email: 'driver@nstu.edu.bd',    roleName: 'Route Operator',   color: 'from-emerald-600 to-teal-700' },
  { key: 'student',         label: 'Student Rider',   email: 'student@nstu.edu.bd',   roleName: 'Pass Holder',      color: 'from-purple-600 to-pink-700' },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electrical & Electronic Engineering',
  'Civil Engineering',
  'Business Administration',
  'Pharmacy',
  'Fisheries & Marine Science',
  'Transport Department',
  'Administration',
  'Other',
];

// ─── Login Form ───────────────────────────────────────────────────
function LoginForm({ onSwitchToSignup }) {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);

  // Detect what type the user is typing
  const identifierType = (() => {
    const v = identifier.trim();
    if (!v) return 'any';
    if (v.includes('@')) return 'email';
    if (/^\+?[\d\s\-()]{7,}$/.test(v)) return 'phone';
    return 'studentId';
  })();

  const identifierHint = {
    any:       'Gmail, Phone Number, or Student ID',
    email:     'Gmail / Email Address',
    phone:     'Phone Number',
    studentId: 'Student ID',
  }[identifierType];

  const handleLogin = async (e) => {
    e?.preventDefault();
    const result = await login(identifier, password);
    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Invalid credentials');
    }
  };

  const quickLogin = async (roleKey) => {
    const roleObj = demoRoles.find(r => r.key === roleKey);
    const result  = await login(null, null, roleKey);
    if (result.success) {
      toast.success(`Logged in as ${roleObj?.label || roleKey}`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
          Welcome Back <Sparkles size={18} className="text-amber-400" />
        </h2>
        <p className="text-xs text-[#94a3b8] mt-1 font-medium">
          Sign in with your Gmail, phone number, or Student ID
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Multi-identifier Input */}
        <div>
          <label className="form-label flex items-center gap-2">
            {identifierType === 'email'     && <Mail    size={12} className="text-amber-400" />}
            {identifierType === 'phone'     && <Phone   size={12} className="text-amber-400" />}
            {identifierType === 'studentId' && <Hash    size={12} className="text-amber-400" />}
            {identifierType === 'any'       && <User    size={12} className="text-amber-400" />}
            {identifierHint}
          </label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="form-input"
            placeholder="name@gmail.com  /  01XXXXXXXXX  /  CSE-2020-001"
            required
            autoComplete="username"
          />
          {/* Identifier type chip */}
          {identifierType !== 'any' && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                Detected: {identifierHint}
              </span>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Password</label>
            <button type="button" className="text-xs text-amber-400 hover:text-amber-300 font-bold">
              Forgot?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input pr-10"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-amber w-full py-3.5 text-sm font-extrabold shadow-lg rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {loading ? 'Signing In...' : 'Sign In to Portal'}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-[#64748b]">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-amber-400 font-extrabold hover:text-amber-300 transition-colors inline-flex items-center gap-1"
        >
          Create Account <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Demo Access Roles */}
      <div className="pt-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Quick Demo Role</span>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {demoRoles.map(role => (
            <button
              key={role.key}
              onClick={() => quickLogin(role.key)}
              disabled={loading}
              className={`p-3 rounded-xl bg-gradient-to-br ${role.color} bg-opacity-15 border border-white/10 text-left transition-all hover:scale-[1.03] hover:shadow-lg group relative overflow-hidden`}
            >
              <div className="text-xs font-bold text-white group-hover:text-amber-300">{role.label}</div>
              <div className="text-[10px] text-white/70 mt-0.5">{role.roleName}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sign Up Form ─────────────────────────────────────────────────
function SignupForm({ onSwitchToLogin }) {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [step,  setStep]  = useState(1); // step 1: info, step 2: password
  const [form,  setForm]  = useState({
    name: '', email: '', phone: '', studentId: '',
    role: 'student', department: 'Computer Science & Engineering',
    password: '', confirmPassword: '',
  });
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter your full name'); return; }
    if (!form.email && !form.phone && !form.studentId) {
      toast.error('Enter at least one: Gmail, Phone, or Student ID'); return;
    }
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }

    const result = await signup({
      name:       form.name,
      email:      form.email || null,
      phone:      form.phone || null,
      studentId:  form.studentId || null,
      password:   form.password,
      role:       form.role,
      department: form.department,
    });

    if (result.success) {
      toast.success('Account created! Welcome to NSTU Portal 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
          Create Account <UserPlus size={18} className="text-amber-400" />
        </h2>
        <p className="text-xs text-[#94a3b8] mt-1 font-medium">
          {step === 1 ? 'Step 1 of 2 — Your identity info' : 'Step 2 of 2 — Set your password'}
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-[#1e293b] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Step 1 — Identity */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <User size={11} className="text-amber-400" /> Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              className="form-input"
              placeholder="Your Full Name"
              required
            />
          </div>

          {/* Gmail */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Mail size={11} className="text-amber-400" /> Gmail / Email
              <span className="text-[#64748b] normal-case font-normal">(optional if phone set)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className="form-input"
              placeholder="name@gmail.com or name@nstu.edu.bd"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Phone size={11} className="text-amber-400" /> Phone Number
              <span className="text-[#64748b] normal-case font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              className="form-input"
              placeholder="+880 1XXXXXXXXX"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Hash size={11} className="text-amber-400" /> Student ID
              <span className="text-[#64748b] normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.studentId}
              onChange={set('studentId')}
              className="form-input"
              placeholder="e.g. CSE-2022-045"
            />
          </div>

          {/* Role + Department in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Role</label>
              <select value={form.role} onChange={set('role')} className="form-input">
                <option value="student">Student</option>
                <option value="driver">Driver</option>
                <option value="transport_admin">Transport Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select value={form.department} onChange={set('department')} className="form-input">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-amber w-full py-3.5 text-sm font-extrabold shadow-lg rounded-xl flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={18} />
          </button>
        </form>
      )}

      {/* Step 2 — Password */}
      {step === 2 && (
        <form onSubmit={handleSignup} className="space-y-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors mb-1"
          >
            <ArrowLeft size={13} /> Back to info
          </button>

          {/* Summary chip */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="text-xs font-bold text-white">{form.name}</div>
            {form.email    && <div className="text-[11px] text-[#94a3b8] flex items-center gap-1"><Mail  size={10} />{form.email}</div>}
            {form.phone    && <div className="text-[11px] text-[#94a3b8] flex items-center gap-1"><Phone size={10} />{form.phone}</div>}
            {form.studentId && <div className="text-[11px] text-[#94a3b8] flex items-center gap-1"><Hash  size={10} />{form.studentId}</div>}
          </div>

          {/* New Password */}
          <div>
            <label className="form-label">Create Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                className="form-input pr-10"
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength indicator */}
            {form.password && (
              <div className="mt-2 flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    form.password.length >= i * 3
                      ? i <= 1 ? 'bg-red-500' : i === 2 ? 'bg-amber-500' : i === 3 ? 'bg-blue-500' : 'bg-emerald-500'
                      : 'bg-[#1e293b]'
                  }`} />
                ))}
                <span className="text-[10px] text-[#64748b] ml-1">
                  {form.password.length < 4 ? 'Weak' : form.password.length < 8 ? 'Fair' : form.password.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className={`form-input pr-10 ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-500/60' : ''
                }`}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-[11px] text-red-400 mt-1.5 font-semibold">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-amber w-full py-3.5 text-sm font-extrabold shadow-lg rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? 'Creating Account...' : 'Create Account & Sign In'}
          </button>
        </form>
      )}

      {/* Back to login */}
      <div className="text-center text-sm text-[#64748b]">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-amber-400 font-extrabold hover:text-amber-300 transition-colors inline-flex items-center gap-1"
        >
          Sign In <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mode, setMode] = useState(
    location.pathname === '/signup' ? 'signup' : 'login'
  );

  // Sync tab if URL changes
  useEffect(() => {
    setMode(location.pathname === '/signup' ? 'signup' : 'login');
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#060a14] flex text-white relative overflow-hidden font-['Inter']">
      {/* Dynamic Background Image Overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('/nstu_bus_station_dark.png')" }} />

      {/* Background Glow Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px]" />
      </div>

      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-14 relative z-10 border-r border-[#1e293b]/70 bg-[#0a1020]/75 backdrop-blur-xl">
        <div className="space-y-8">
          {/* Top Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <Bus size={26} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white tracking-tight font-['Outfit'] flex items-center gap-2">
                NSTU BUS MANAGEMENT <Sparkles size={16} className="text-amber-400 animate-pulse" />
              </div>
              <div className="text-xs text-amber-400/90 uppercase tracking-widest font-bold">Noakhali Science &amp; Technology University</div>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Activity size={13} className="animate-pulse" /> Smart Telemetry System 3.0
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight font-['Outfit']">
              Next-Gen Campus<br />
              <span className="gradient-text-amber">Fleet Transportation</span>
            </h1>
          </div>

          {/* Bus Showcase Image */}
          <div className="rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl relative group">
            <img
              src="/nstu_bus_hero_dark.png"
              alt="NSTU Express Bus"
              className="w-full h-60 object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1020] via-transparent to-transparent opacity-85" />
            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-white font-['Outfit']">Official NSTU Express Fleet</div>
                <div className="text-xs text-amber-400 font-semibold">নোয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-xs font-black shadow-lg">
                LIVE <Sparkles size={12} />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {[
              { label: 'Operating Fleet',  value: '5 Express Buses', icon: Bus,           color: 'text-amber-400' },
              { label: 'Active Riders',    value: '269+ Students',   icon: ShieldCheck,   color: 'text-blue-400'  },
              { label: 'Coverage Routes',  value: '4 Main Lines',    icon: Navigation,    color: 'text-emerald-400' },
              { label: 'System Uptime',    value: '99.9% Reliable',  icon: CheckCircle2,  color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label} className="p-3.5 rounded-2xl bg-[#0d162a]/80 border border-amber-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-sm font-extrabold text-white font-['Outfit']">{stat.value}</span>
                </div>
                <div className="text-[11px] text-[#94a3b8] font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[#64748b] flex items-center justify-between pt-4 border-t border-[#1e293b]">
          <span>© 2026 NSTU Transport Department</span>
          <span className="flex items-center gap-1 text-amber-400/90 font-medium"><Clock size={12} /> GPS Sync Active</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-md ${
              isDark
                ? 'bg-[#0d162a]/90 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                : 'bg-white/90 border-amber-300 text-amber-700 hover:bg-amber-100'
            }`}
            title={isDark ? 'Switch to White Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-amber-600" />}
          </button>
        </div>

        <div className="w-full max-w-md fade-in space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
              <Bus size={28} className="text-slate-950" />
            </div>
            <div className="text-2xl font-black text-white font-['Outfit']">NSTU Bus Management</div>
            <div className="text-xs text-amber-400 font-semibold">University Transport Portal</div>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#0b1224]/60 border border-amber-500/20 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              <UserPlus size={15} /> Sign Up
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-[#0b1224]/85 backdrop-blur-2xl border border-amber-500/30 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {mode === 'login'
              ? <LoginForm  onSwitchToSignup={() => setMode('signup')} />
              : <SignupForm onSwitchToLogin={()  => setMode('login')}  />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
