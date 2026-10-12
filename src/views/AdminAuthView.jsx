import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { catalogService } from '../services/catalogService';
import { 
  generateTotpSecret, 
  buildOtpAuthUri, 
  generateQrCodeDataUrl, 
  verifyTOTP 
} from '../services/totpService';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  KeyRound, 
  QrCode, 
  Copy, 
  Check, 
  Smartphone,
  RefreshCw
} from 'lucide-react';
import appLogo from '../assets/icon.png';

export default function AdminAuthView({ onNavigateDashboard, onNavigateHome }) {
  // Steps: 'credentials' | 'mfa_verify' | 'mfa_setup'
  const [step, setStep] = useState('credentials');
  
  // Credentials form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // MFA form state
  const [mfaCode, setMfaCode] = useState('');
  const [adminSession, setAdminSession] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Auto-redirect if already authenticated and MFA verified
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const check = await catalogService.verifyAdminUser(user);
        const isMfaVerified = sessionStorage.getItem('firstplay_admin_mfa_verified') === 'true';
        if (check.isAuthorized && isMfaVerified) {
          onNavigateDashboard?.();
        }
      }
    });
    return () => unsubscribe();
  }, [onNavigateDashboard]);

  // Handle Step 1: Email & Password verification + Firestore Whitelist check
  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!auth) {
      setErrorMessage('Firebase Authentication is not initialized.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both an email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate credentials with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // 2. Cross-reference Firestore 'admins' whitelist
      const check = await catalogService.verifyAdminUser(user);
      if (!check.isAuthorized) {
        await signOut(auth);
        setErrorMessage(
          check.error || 'Access Denied: You are not an authorized administrator.'
        );
        return;
      }

      const adminData = check.adminData || {};

      // 3. Check if TOTP is already enrolled or needs first-time setup
      if (adminData.totp_secret) {
        // Enrolled: proceed to MFA Verification step
        setAdminSession({ user, adminData });
        setStep('mfa_verify');
        setMfaCode('');
      } else {
        // First-time setup: generate new secret and QR code
        const newSecret = generateTotpSecret(20);
        const uri = buildOtpAuthUri(user.email, newSecret, 'FirstPlay');
        const qrUrl = await generateQrCodeDataUrl(uri);

        setAdminSession({
          user,
          adminData,
          pendingSecret: newSecret,
          qrCodeUrl: qrUrl
        });
        setStep('mfa_setup');
        setMfaCode('');
      }
    } catch (err) {
      console.error('[Admin Auth] Error:', err);
      let userMsg = 'Authentication failed. Please verify your credentials.';
      const code = err.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        userMsg = 'Incorrect email or password.';
      } else if (code === 'auth/user-not-found') {
        userMsg = 'No administrator account found with this email.';
      } else if (code === 'auth/invalid-email') {
        userMsg = 'Please enter a valid email address.';
      } else if (err.message) {
        userMsg = err.message;
      }
      setErrorMessage(userMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2A: Verify 6-digit code for returning admin
  const handleSubmitMfaVerify = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = mfaCode.trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMessage('Please enter the full 6-digit code from your authenticator app.');
      return;
    }

    if (!adminSession?.adminData?.totp_secret) {
      setErrorMessage('TOTP secret missing. Please restart authentication.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyTOTP(cleanCode, adminSession.adminData.totp_secret);
      if (!isValid) {
        setErrorMessage('Invalid 6-digit code. Please check Google Authenticator / Authy and try again.');
        return;
      }

      // Mark session as MFA verified
      sessionStorage.setItem('firstplay_admin_mfa_verified', 'true');
      sessionStorage.setItem('firstplay_admin_email', adminSession.user.email);
      onNavigateDashboard?.();
    } catch (err) {
      console.error('[MFA Verification Error]:', err);
      setErrorMessage('Error verifying code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2B: Activate TOTP for first-time setup
  const handleSubmitMfaSetup = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = mfaCode.trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      setErrorMessage('Please enter the 6-digit verification code generated by your app.');
      return;
    }

    if (!adminSession?.pendingSecret) {
      setErrorMessage('Setup session expired. Please restart login.');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyTOTP(cleanCode, adminSession.pendingSecret);
      if (!isValid) {
        setErrorMessage('Code mismatch. Verify that your phone clock is accurate and re-enter the 6 digits.');
        return;
      }

      // Save the validated secret in Firestore
      await catalogService.saveAdminTotpSecret(
        adminSession.user,
        adminSession.pendingSecret,
        adminSession.adminData?.docId
      );

      // Mark session as MFA verified
      sessionStorage.setItem('firstplay_admin_mfa_verified', 'true');
      sessionStorage.setItem('firstplay_admin_email', adminSession.user.email);
      onNavigateDashboard?.();
    } catch (err) {
      console.error('[MFA Setup Error]:', err);
      setErrorMessage('Failed to save 2FA configuration in Firebase.');
    } finally {
      setLoading(false);
    }
  };

  // Copy secret key helper
  const handleCopySecret = () => {
    if (adminSession?.pendingSecret) {
      navigator.clipboard.writeText(adminSession.pendingSecret);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  // Cancel MFA and return to sign in
  const handleCancelMfa = async () => {
    sessionStorage.removeItem('firstplay_admin_mfa_verified');
    sessionStorage.removeItem('firstplay_admin_email');
    if (auth) {
      await signOut(auth);
    }
    setStep('credentials');
    setAdminSession(null);
    setMfaCode('');
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 bg-[#f5f5f7] text-[#1d1d1f] relative select-none overflow-y-auto overflow-x-hidden">
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Discovery button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-zinc-100 text-xs font-bold text-zinc-700 hover:text-zinc-900 border border-zinc-200/90 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to FirstPlay</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex p-3 rounded-2xl bg-white border border-zinc-200 shadow-md mb-1">
            <img 
              src={appLogo?.src || appLogo || '/icon.png'} 
              alt="FirstPlay" 
              className="w-11 h-11 rounded-xl object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield size={20} className="text-[#0071e3]" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              FirstPlay Admin Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xs mx-auto leading-relaxed">
            {step === 'credentials' && 'Sign in with your administrator credentials to access the moderation console.'}
            {step === 'mfa_verify' && 'Multi-factor authentication required. Enter your 6-digit rotating security code.'}
            {step === 'mfa_setup' && 'Link your authenticator app to enable mandatory two-factor protection.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* =========================================================================
              STEP 1: CREDENTIALS (Email & Password)
              ========================================================================= */}
          {step === 'credentials' && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@firstplay.ng"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Two-Factor Auth</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =========================================================================
              STEP 2A: MFA VERIFY (Returning admin with TOTP secret)
              ========================================================================= */}
          {step === 'mfa_verify' && (
            <form onSubmit={handleSubmitMfaVerify} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center gap-3">
                <Smartphone size={22} className="text-[#0071e3] shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-900">Authenticator App Verification</p>
                  <p className="text-zinc-600 text-[11px] truncate mt-0.5">
                    Account: <strong className="text-zinc-900">{adminSession?.user?.email}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800 text-center">
                  Enter 6-Digit Rotating Security Code
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full py-3 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-300 text-center font-mono text-2xl font-black tracking-[0.35em] text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 text-center">
                  Open Google Authenticator, Microsoft Authenticator, or Authy on your phone.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Validating code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Dashboard</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelMfa}
                  className="w-full py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition text-center cursor-pointer"
                >
                  Cancel and switch account
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 2B: MFA SETUP (First-time setup: QR Code & Secret)
              ========================================================================= */}
          {step === 'mfa_setup' && (
            <form onSubmit={handleSubmitMfaSetup} className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <QrCode size={16} className="text-[#0071e3]" />
                  <span>1. Scan with your Authenticator App</span>
                </div>

                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                  {adminSession?.qrCodeUrl ? (
                    <img 
                      src={adminSession.qrCodeUrl} 
                      alt="Google Authenticator QR Code"
                      className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm border border-zinc-200"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 rounded-xl">
                      <RefreshCw className="animate-spin text-zinc-400" />
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-500 text-center max-w-xs">
                    Scan using <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>.
                  </p>
                </div>

                {/* Manual Key Fallback */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-zinc-600">
                    <span>Or enter setup key manually:</span>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="flex items-center gap-1 font-bold text-[#0071e3] hover:underline cursor-pointer"
                    >
                      {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 font-mono text-center text-xs font-bold text-zinc-800 tracking-wider select-all">
                    {adminSession?.pendingSecret}
                  </div>
                </div>
              </div>

              {/* Step 2 in Setup: Enter Code */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <KeyRound size={16} className="text-[#0071e3]" />
                  <span>2. Enter the 6-Digit Code to Activate</span>
                </div>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-50 border-2 border-zinc-300 text-center font-mono text-2xl font-black tracking-[0.35em] text-zinc-900 outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating 2FA...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} className="stroke-[3]" />
                      <span>Activate 2FA & Continue</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelMfa}
                  className="w-full py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition text-center cursor-pointer"
                >
                  Cancel setup
                </button>
              </div>
            </form>
          )}

          {/* Quick Note */}
          <div className="pt-2 border-t border-zinc-100 text-center text-[11px] text-zinc-500 font-medium">
            <span>Powered by Firebase Auth & RFC 6238 Standard MFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
