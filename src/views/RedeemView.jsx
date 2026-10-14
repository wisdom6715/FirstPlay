import React, { useState, useEffect } from 'react';
import { rewardService } from '../services/rewardService';
import { 
  Gift, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  Building2, 
  Clock, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

const NETWORKS = [
  { id: 'MTN', name: 'MTN', color: '#facc15', textColor: '#000000' },
  { id: 'AIRTEL', name: 'Airtel', color: '#ef4444', textColor: '#ffffff' },
  { id: 'GLO', name: 'Glo', color: '#22c55e', textColor: '#ffffff' },
  { id: '9MOBILE', name: '9mobile', color: '#10b981', textColor: '#ffffff' }
];

export default function RedeemView({ initialCode = '', onNavigateHome, onNavigateWheel }) {
  // Wizard Steps: 'code_entry' -> 'whatsapp_prompt' -> 'fulfillment' -> 'confirmation' -> 'receipt'
  const [step, setStep] = useState('code_entry');
  
  // Code entry state
  const [code, setCode] = useState(() => (initialCode || '').trim().toUpperCase());
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [validatedReward, setValidatedReward] = useState(null);

  // Optional WhatsApp collection
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);

  // Gift fulfillment form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');

  // Tournament fulfillment form
  const [banksList, setBanksList] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [resolveError, setResolveError] = useState(null);

  // Fulfillment execution state
  const [isSubmittingFulfillment, setIsSubmittingFulfillment] = useState(false);
  const [fulfillmentError, setFulfillmentError] = useState(null);
  const [fulfillmentReceipt, setFulfillmentReceipt] = useState(null);

  // Auto-validate if initialCode is provided in URL query (?code=XYZ)
  useEffect(() => {
    if (initialCode && initialCode.trim()) {
      handleValidateCode(initialCode.trim().toUpperCase());
    }
  }, [initialCode]);

  // Load banks when tournament prize is detected
  useEffect(() => {
    if (validatedReward?.category === 'tournament') {
      async function loadBanks() {
        const banks = await rewardService.getNigerianBanks();
        setBanksList(banks);
        if (banks.length > 0 && !selectedBankCode) {
          setSelectedBankCode(banks[0].code);
          setSelectedBankName(banks[0].name);
        }
      }
      loadBanks();
    }
  }, [validatedReward]);

  // Resolve account name when account number is 10 digits
  useEffect(() => {
    if (validatedReward?.category !== 'tournament') return;

    const cleanAcc = accountNumber.replace(/\D/g, '');
    if (cleanAcc.length === 10 && selectedBankCode) {
      async function resolve() {
        setIsResolvingAccount(true);
        setResolveError(null);
        setResolvedAccountName('');
        try {
          const res = await rewardService.resolveAccount(cleanAcc, selectedBankCode);
          if (res?.success && res.accountName) {
            setResolvedAccountName(res.accountName);
          } else {
            setResolveError(res?.error || 'Could not verify account name. Please check bank and account number.');
          }
        } catch (err) {
          setResolveError('Failed to verify account.');
        } finally {
          setIsResolvingAccount(false);
        }
      }
      resolve();
    } else {
      setResolvedAccountName('');
      setResolveError(null);
    }
  }, [accountNumber, selectedBankCode, validatedReward]);

  // Step 1 -> 2: Validate Single Redemption Code
  const handleValidateCode = async (codeToValidate) => {
    const target = (codeToValidate || code).trim().toUpperCase();
    if (!target) {
      setValidationError('Please enter your unique redemption code.');
      return;
    }

    setValidationError(null);
    setIsValidating(true);

    try {
      const res = await rewardService.validateCode(target);

      if (!res.valid) {
        setValidationError(res.error || 'Invalid or expired redemption code.');
        setIsValidating(false);
        return;
      }

      setValidatedReward(res);
      // Automatically prompt optional WhatsApp step
      setShowWhatsappModal(true);
    } catch (err) {
      console.error('[RedeemView] Validation error:', err);
      setValidationError('Network error while validating code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // WhatsApp Prompt: Skip or Submit
  const handleProceedFromWhatsApp = (skipped = false) => {
    setShowWhatsappModal(false);
    setStep('fulfillment');
  };

  // Step 4: Execute Fulfillment
  const handleExecuteFulfillment = async () => {
    if (!validatedReward) return;
    setFulfillmentError(null);
    setIsSubmittingFulfillment(true);

    try {
      const payload = {
        redemptionId: validatedReward.redemptionId,
        code: validatedReward.code,
        userId: validatedReward.userId || 'web_player',
        whatsappNumber: whatsappNumber.trim() || null,
        // Gift specific
        phone: phoneNumber.trim(),
        network: selectedNetwork,
        // Tournament specific
        bankCode: selectedBankCode,
        bankName: selectedBankName,
        accountNumber: accountNumber.trim(),
        accountName: resolvedAccountName
      };

      const res = await rewardService.fulfillReward(payload);

      if (!res.success) {
        setFulfillmentError(res.error || 'Fulfillment request failed. Please verify your details.');
        setIsSubmittingFulfillment(false);
        return;
      }

      setFulfillmentReceipt(res.receipt || {
        reference: res.reference || 'REF-' + Date.now(),
        timestamp: new Date().toISOString(),
        category: validatedReward.category,
        rewardTitle: validatedReward.category === 'tournament'
          ? `₦${(validatedReward.amount || 0).toLocaleString()} NGN`
          : `${validatedReward.quantity} ${validatedReward.unit || 'MB'}`
      });

      setStep('receipt');
    } catch (err) {
      console.error('[RedeemView] Fulfillment error:', err);
      setFulfillmentError('Network connection issue. Please check your internet and retry.');
    } finally {
      setIsSubmittingFulfillment(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-8 select-none flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">

        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck size={14} />
            <span>Secure Reward Fulfillment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Redeem Reward
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium">
            Enter your 8-character code to receive instant mobile data, airtime, or cash prizes
          </p>
        </div>

        {/* =========================================================================
            STEP 1: SINGLE-FIELD CODE ENTRY
            ========================================================================= */}
        {step === 'code_entry' && (
          <div className="bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-zinc-900 dark:text-white">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Redemption Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={16}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setValidationError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleValidateCode();
                  }}
                  placeholder="e.g. A7K9P2XM"
                  className="w-full h-14 px-4 bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/15 focus:border-[#0071e3] focus:bg-white dark:focus:bg-black/60 rounded-2xl text-lg sm:text-xl font-mono font-black text-zinc-900 dark:text-white tracking-widest placeholder:text-zinc-400 outline-none transition-all text-center uppercase shadow-xs"
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Codes expire 24 hours from issuance. Enter the code from your spin or tournament award.
              </p>
            </div>

            {validationError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleValidateCode()}
              disabled={isValidating || !code.trim()}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                isValidating || !code.trim()
                  ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-white/5'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.99] shadow-blue-500/20'
              }`}
            >
              {isValidating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Validating Code...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Quick Wheel Navigation Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onNavigateWheel}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold"
              >
                <span>Don't have a code yet? Spin the Rewards Wheel</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: OPTIONAL WHATSAPP PROMPT MODAL
            ========================================================================= */}
        {showWhatsappModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-text">
            <div className="w-full max-w-md bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative text-zinc-900 dark:text-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xs">
                <MessageSquare size={24} />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                  Stay Updated on VIP Rewards
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xs mx-auto">
                  Receive instant alerts for weekly cash tournaments, flash reward wheels, and FirstPlay community drops.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                  WhatsApp Phone Number (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full h-11 px-3.5 bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 focus:border-emerald-500 focus:bg-white rounded-xl text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleProceedFromWhatsApp(false)}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
                >
                  <span>Continue to Fulfillment</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleProceedFromWhatsApp(true)}
                  className="w-full h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer border border-zinc-200 dark:border-transparent"
                >
                  Skip this step
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: FULFILLMENT FORM (Automatically branched based on Category)
            ========================================================================= */}
        {step === 'fulfillment' && validatedReward && (
          <div className="bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-zinc-900 dark:text-white">
            
            {/* Validated Reward Banner */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 flex items-center justify-center text-[#0071e3] dark:text-[#0a84ff] shrink-0">
                  {validatedReward.category === 'tournament' ? <Trophy size={22} /> : <Gift size={22} />}
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#0071e3] dark:text-[#0a84ff] uppercase tracking-wider block">
                    {validatedReward.category === 'tournament' ? 'TOURNAMENT CASH PRIZE' : 'GIFT REWARD'}
                  </span>
                  <h3 className="text-base sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {validatedReward.category === 'tournament'
                      ? `₦${(validatedReward.amount || 0).toLocaleString()} ${validatedReward.currency || 'NGN'}`
                      : `${validatedReward.quantity} ${validatedReward.unit || 'MB'} ${validatedReward.giftName || 'Reward'}`}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-white/10 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-white/10 block shadow-2xs">
                  {validatedReward.code}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-bold">Valid Code</span>
              </div>
            </div>

            {/* BRANCH A: MOBILE DATA / AIRTIME FULFILLMENT */}
            {validatedReward.category !== 'tournament' && (
              <div className="space-y-5">
                {/* Network Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Select Network Provider
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {NETWORKS.map((net) => {
                      const isSelected = selectedNetwork === net.id;
                      return (
                        <button
                          key={net.id}
                          type="button"
                          onClick={() => setSelectedNetwork(net.id)}
                          className={`h-11 rounded-xl text-xs font-black flex items-center justify-center border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0071e3] text-white border-[#0071e3] shadow-md shadow-blue-500/25'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-white/10'
                          }`}
                        >
                          {net.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Recipient Mobile Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full h-12 px-4 bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/15 focus:border-[#0071e3] focus:bg-white dark:focus:bg-black/60 rounded-xl text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition-all font-mono shadow-xs"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    The {validatedReward.quantity} {validatedReward.unit || 'MB'} data bundle will be credited instantly to this line.
                  </p>
                </div>
              </div>
            )}

            {/* BRANCH B: TOURNAMENT CASH PRIZE (BANK TRANSFER) */}
            {validatedReward.category === 'tournament' && (
              <div className="space-y-5">
                {/* Bank Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    Select Bank
                  </label>
                  <select
                    value={selectedBankCode}
                    onChange={(e) => {
                      setSelectedBankCode(e.target.value);
                      const b = banksList.find((item) => item.code === e.target.value);
                      if (b) setSelectedBankName(b.name);
                    }}
                    className="w-full h-12 px-4 bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/15 focus:border-[#0071e3] focus:bg-white rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none transition-all cursor-pointer shadow-xs"
                  >
                    {banksList.map((b) => (
                      <option key={b.code} value={b.code} className="bg-white text-zinc-900 dark:bg-[#16161b] dark:text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    10-Digit NUBAN Account Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 0123456789"
                      className="w-full h-12 px-4 bg-zinc-50 dark:bg-black/40 border-2 border-zinc-200 dark:border-white/15 focus:border-[#0071e3] focus:bg-white rounded-xl text-base font-mono font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none transition-all shadow-xs"
                    />
                    {isResolvingAccount && (
                      <div className="absolute right-3.5 top-3.5">
                        <RefreshCw size={16} className="animate-spin text-[#0071e3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Automated Verified Account Name Display */}
                {resolvedAccountName && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
                        Verified Account Name
                      </span>
                      <span className="font-black text-zinc-900 dark:text-white text-sm">
                        {resolvedAccountName}
                      </span>
                    </div>
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                )}

                {resolveError && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{resolveError}</span>
                  </div>
                )}
              </div>
            )}

            {fulfillmentError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{fulfillmentError}</span>
              </div>
            )}

            {/* Confirm & Submit Button */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleExecuteFulfillment}
                disabled={
                  isSubmittingFulfillment ||
                  (validatedReward.category !== 'tournament' && phoneNumber.trim().length < 10) ||
                  (validatedReward.category === 'tournament' && (!resolvedAccountName || accountNumber.length < 10))
                }
                className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                  isSubmittingFulfillment ||
                  (validatedReward.category !== 'tournament' && phoneNumber.trim().length < 10) ||
                  (validatedReward.category === 'tournament' && (!resolvedAccountName || accountNumber.length < 10))
                    ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed border border-zinc-200 dark:border-white/5'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.99] shadow-blue-500/20'
                }`}
              >
                {isSubmittingFulfillment ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Processing Fulfillment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Redeem Reward</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('code_entry');
                  setValidatedReward(null);
                }}
                className="w-full h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition cursor-pointer border border-zinc-200 dark:border-transparent flex items-center justify-center"
              >
                Cancel and use different code
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 6: CONFIRMATION RECEIPT VIEW
            ========================================================================= */}
        {step === 'receipt' && (
          <div className="bg-white dark:bg-[#16161b] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-center text-zinc-900 dark:text-white animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                REWARD FULFILLED SUCCESSFULLY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight pt-1">
                Congratulations!
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
                Your reward has been processed and dispatched.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Reward Awarded</span>
                <span className="font-black text-zinc-900 dark:text-white">
                  {fulfillmentReceipt?.rewardTitle || 'Mobile Data'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Transaction Reference</span>
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-300">
                  {fulfillmentReceipt?.reference || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/5 pb-2">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Timestamp</span>
                <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                  {new Date(fulfillmentReceipt?.timestamp || Date.now()).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-500/30">
                  Completed
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full h-12 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center"
              >
                Back to Game Catalog
              </button>

              <button
                type="button"
                onClick={onNavigateWheel}
                className="w-full h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition cursor-pointer border border-zinc-200 dark:border-transparent flex items-center justify-center"
              >
                Go to Rewards Wheel
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
