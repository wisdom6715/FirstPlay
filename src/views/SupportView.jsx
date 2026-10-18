'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ChevronDown, 
  Search, 
  HelpCircle, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck, 
  Clock, 
  Mail, 
  Check, 
  Copy,
  MessageSquare,
  Sparkles,
  User,
  Globe,
  FileText
} from 'lucide-react';
import { COUNTRIES, DEFAULT_COUNTRY } from '../utils/countries';
import Footer from '../components/Footer';

const ISSUE_CATEGORIES = [
  'Withdrawal Issue',
  'Payment or Transaction Issue',
  'Account Access',
  'Account Verification',
  'Spam or Suspicious Activity',
  'Complaint',
  'Report a Bug',
  'Other'
];

export default function SupportView({
  onNavigateTab,
  onOpenPrivacyPolicy,
  onOpenTerms
}) {
  // Step State: 1 = Contact Info, 2 = Issue Details, 3 = Confirmation / Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden spam bot trap

  // UI & Validation State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null); // stores { ticketId, message, timestamp }
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Searchable Country Dropdown State
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = useRef(null);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = countrySearchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearchQuery]);

  // Selected country object
  const currentCountryObj = useMemo(() => {
    return COUNTRIES.find(c => c.name === selectedCountry) || COUNTRIES[0];
  }, [selectedCountry]);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation: Step 1 (Contact Info)
  const validateStep1 = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!selectedCountry.trim()) {
      newErrors.country = 'Please select your country.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation: Step 2 (Issue & Message)
  const validateStep2 = () => {
    const newErrors = {};

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!message.trim()) {
      newErrors.message = 'Please describe your issue.';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please provide at least 10 characters describing your issue.';
    } else if (message.trim().length > 2500) {
      newErrors.message = 'Message must be 2,500 characters or fewer.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Proceed from Step 1 to Step 2
  const handleProceedToStep2 = (e) => {
    e.preventDefault();
    setServerError('');
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go back from Step 2 to Step 1
  const handleBackToStep1 = () => {
    setServerError('');
    setErrors({});
    setCurrentStep(1);
  };

  // Final Submission Handler on Step 2
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          country: selectedCountry.trim(),
          category,
          email: email.trim(),
          message: message.trim(),
          website_hp: honeypot
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request. Please try again.');
      }

      // Transition to Step 3 (Success & Confirmation)
      setSubmissionSuccess({
        ticketId: data.ticketId || `FP-${Date.now().toString(36).toUpperCase()}`,
        message: data.message || 'Your request has been submitted successfully. Our team will review your message and get back to you within 24 hours.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('[SupportView] Submission Error:', err);
      setServerError(err.message || 'Unable to submit your request at this time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = () => {
    if (submissionSuccess?.ticketId) {
      navigator.clipboard.writeText(submissionSuccess.ticketId);
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2000);
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setSelectedCountry(DEFAULT_COUNTRY);
    setCategory('');
    setEmail('');
    setMessage('');
    setErrors({});
    setServerError('');
    setSubmissionSuccess(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#fafbfc] text-[#0a2540] relative select-text min-h-screen">
      
      {/* =========================================================================
          STRIPE-INSPIRED BACKGROUND CANVAS
          Ambient blurred mesh ribbons in the background for a modern light canvas
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        {/* Soft Violet/Blue Ribbon */}
        <div 
          className="absolute -top-32 right-1/4 w-[650px] h-[550px] rounded-full opacity-35 blur-[120px] transition-all"
          style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #fbcfe8 100%)' }}
        />
        {/* Warm Amber/Coral Ribbon */}
        <div 
          className="absolute top-1/3 -right-20 w-[500px] h-[600px] rounded-full opacity-25 blur-[130px]"
          style={{ background: 'linear-gradient(180deg, #fed7aa 0%, #fef08a 50%, #fbcfe8 100%)' }}
        />
        {/* Crisp grid pattern lines */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#0a2540 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="relative z-10 w-full border-b border-[#e3e8ee]/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigateTab?.('discover')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#4f566b] hover:text-[#0a2540] transition py-1 px-2.5 rounded-lg hover:bg-[#f6f9fc] cursor-pointer"
        >
          <ArrowLeft size={14} className="stroke-[2.5]" />
          <span>Back to Games</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#4f566b]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Support Desk Online</span>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTAINER: CENTERED FLOATING CARD WIZARD
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[580px] mx-auto space-y-6">

          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-[#e3e8ee] shadow-[0_20px_60px_-15px_rgba(50,50,93,0.08),0_10px_30px_-10px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
            
            {/* =====================================================================
                STRIPE-STYLE MULTI-STEP HEADER TABS
                Shows 3 distinct stages: Contact info -> Issue details -> Confirmation
                ===================================================================== */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#f3f4f6]">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-left">
                
                {/* Step 1 Tab Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {currentStep > 1 ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-[#635bff] text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                    )}
                    <span className={currentStep === 1 ? 'text-[#0a2540]' : currentStep > 1 ? 'text-emerald-700' : 'text-[#8898aa]'}>
                      Contact Info
                    </span>
                  </div>
                  <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                    currentStep === 1 ? 'bg-[#635bff]' : currentStep > 1 ? 'bg-emerald-500' : 'bg-[#e3e8ee]'
                  }`} />
                </div>

                {/* Step 2 Tab Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {currentStep > 2 ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                        <Check size={10} className="stroke-[3]" />
                      </span>
                    ) : (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        currentStep === 2 ? 'bg-[#635bff] text-white' : 'bg-[#f0f4ff] text-[#8898aa]'
                      }`}>
                        2
                      </span>
                    )}
                    <span className={currentStep === 2 ? 'text-[#0a2540]' : currentStep > 2 ? 'text-emerald-700' : 'text-[#8898aa]'}>
                      Your Issue
                    </span>
                  </div>
                  <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                    currentStep === 2 ? 'bg-[#635bff]' : currentStep > 2 ? 'bg-emerald-500' : 'bg-[#e3e8ee]'
                  }`} />
                </div>

                {/* Step 3 Tab Indicator */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-[#f0f4ff] text-[#8898aa]'
                    }`}>
                      3
                    </span>
                    <span className={currentStep === 3 ? 'text-emerald-700' : 'text-[#8898aa]'}>
                      Resolution
                    </span>
                  </div>
                  <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                    currentStep === 3 ? 'bg-emerald-500' : 'bg-[#e3e8ee]'
                  }`} />
                </div>

              </div>
            </div>

            {/* Card Content Area */}
            <div className="p-6 sm:p-10">

              {/* =============================================================
                  CARD 1: CONTACT INFORMATION (STEP 1)
                  Collects Full Name, Country, and Email Address
                  ============================================================= */}
              {currentStep === 1 && (
                <form onSubmit={handleProceedToStep2} noValidate className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1.5 text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0a2540] tracking-tight">
                      Let's get you to the right place
                    </h1>
                    <p className="text-xs sm:text-sm text-[#4f566b] leading-relaxed">
                      We just need a few quick contact details before reviewing your inquiry.
                    </p>
                  </div>

                  {/* Honeypot hidden input for spam bots */}
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex="-1"
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />

                  {/* Field A: Full Name */}
                  <div className="space-y-1.5 text-left">
                    <label 
                      htmlFor="fullName" 
                      className="block text-xs font-bold text-[#3c4257]"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
                      }}
                      placeholder="Enter your full name."
                      autoFocus
                      className={`w-full h-11 px-3.5 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] placeholder-[#8898aa] transition-all outline-none ${
                        errors.fullName 
                          ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                          : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Field B: Country (Searchable Selector) */}
                  <div className="space-y-1.5 text-left relative" ref={countryDropdownRef}>
                    <label 
                      className="block text-xs font-bold text-[#3c4257]"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(prev => !prev)}
                      className={`w-full h-11 px-3.5 rounded-xl bg-white border text-left text-xs sm:text-sm text-[#0a2540] transition-all outline-none flex items-center justify-between cursor-pointer ${
                        errors.country 
                          ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                          : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-base">{currentCountryObj.flag}</span>
                        <span className="font-medium text-[#0a2540]">{currentCountryObj.name}</span>
                      </span>
                      <ChevronDown size={16} className={`text-[#8898aa] transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Searchable Dropdown Menu */}
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-2xl border border-[#e3e8ee] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <div className="p-2.5 border-b border-[#f3f4f6] relative">
                          <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8898aa]" />
                          <input
                            type="text"
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            placeholder="Search countries..."
                            autoFocus
                            className="w-full h-9 pl-8 pr-3 text-xs bg-[#f8fafc] border border-[#e3e8ee] rounded-lg outline-none focus:border-[#635bff] text-[#0a2540]"
                          />
                        </div>

                        <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
                          {filteredCountries.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#8898aa]">
                              No matching country found.
                            </div>
                          ) : (
                            filteredCountries.map(c => {
                              const isSelected = c.name === selectedCountry;
                              return (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCountry(c.name);
                                    setIsCountryDropdownOpen(false);
                                    setCountrySearchQuery('');
                                    if (errors.country) setErrors(prev => ({ ...prev, country: null }));
                                  }}
                                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between text-left transition cursor-pointer ${
                                    isSelected 
                                      ? 'bg-[#f0f4ff] text-[#635bff]' 
                                      : 'text-[#3c4257] hover:bg-[#f8fafc] hover:text-[#0a2540]'
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <span className="text-base">{c.flag}</span>
                                    <span>{c.name}</span>
                                  </span>
                                  {isSelected && <Check size={14} className="text-[#635bff]" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {errors.country && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.country}</span>
                      </p>
                    )}
                  </div>

                  {/* Field D: Email Address */}
                  <div className="space-y-1.5 text-left">
                    <label 
                      htmlFor="email" 
                      className="block text-xs font-bold text-[#3c4257]"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      placeholder="Enter your email address."
                      className={`w-full h-11 px-3.5 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] placeholder-[#8898aa] transition-all outline-none ${
                        errors.email 
                          ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                          : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                      }`}
                    />
                    <p className="text-[11px] text-[#8898aa]">
                      All response updates will be delivered directly to this contact email.
                    </p>
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Step 1 Action: Continue Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#635bff] hover:bg-[#0a2540] active:scale-[0.99] text-white text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(99,91,255,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  {/* Trust Footer */}
                  <div className="pt-2 border-t border-[#f3f4f6] flex items-center justify-between text-[11px] text-[#8898aa]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Encrypted SSL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#635bff]" />
                      <span>24-Hour Review SLA</span>
                    </div>
                  </div>
                </form>
              )}

              {/* =============================================================
                  CARD 2: ISSUE & COMPLAINT DETAILS (STEP 2)
                  Collects Issue Category and Message
                  ============================================================= */}
              {currentStep === 2 && (
                <form onSubmit={handleSubmit} noValidate className="space-y-6 animate-in fade-in duration-200">
                  <div className="space-y-1.5 text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0a2540] tracking-tight">
                      What can we help you with?
                    </h1>
                    <p className="text-xs sm:text-sm text-[#4f566b] leading-relaxed">
                      Select the category that best describes your inquiry and provide full details.
                    </p>
                  </div>

                  {/* Server Error Alert */}
                  {serverError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in duration-150 text-left">
                      <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold">Unable to Submit Request</div>
                        <p className="leading-relaxed">{serverError}</p>
                      </div>
                    </div>
                  )}

                  {/* Field C: Issue Category */}
                  <div className="space-y-1.5 text-left">
                    <label 
                      htmlFor="category" 
                      className="block text-xs font-bold text-[#3c4257]"
                    >
                      Issue Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                        }}
                        disabled={isSubmitting}
                        autoFocus
                        className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] appearance-none transition-all outline-none cursor-pointer ${
                          !category ? 'text-[#8898aa]' : 'text-[#0a2540]'
                        } ${
                          errors.category 
                            ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                            : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                        }`}
                      >
                        <option value="" disabled>Select the category that matches your issue...</option>
                        {ISSUE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="text-[#0a2540] py-1">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8898aa] pointer-events-none" />
                    </div>
                    {errors.category && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.category}</span>
                      </p>
                    )}
                  </div>

                  {/* Field E: Message */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label 
                        htmlFor="message" 
                        className="block text-xs font-bold text-[#3c4257]"
                      >
                        How can we help? <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] font-medium text-[#8898aa]">
                        {message.length} / 2,500
                      </span>
                    </div>
                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors(prev => ({ ...prev, message: null }));
                      }}
                      placeholder="Tell us what happened and provide any details that will help us resolve your issue."
                      disabled={isSubmitting}
                      className={`w-full p-3.5 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] placeholder-[#8898aa] transition-all outline-none resize-y min-h-[130px] ${
                        errors.message 
                          ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                          : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Step 2 Actions: Back Button and Submit Request Button */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      disabled={isSubmitting}
                      className="px-5 h-12 rounded-xl bg-white hover:bg-[#f6f9fc] border border-[#e3e8ee] text-[#4f566b] hover:text-[#0a2540] text-sm font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 rounded-xl bg-[#635bff] hover:bg-[#0a2540] active:scale-[0.99] text-white text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(99,91,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Step 2 Contact Preview Chip */}
                  <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e3e8ee] flex items-center justify-between text-xs text-[#8898aa]">
                    <div className="truncate text-left">
                      Submitting as <strong className="text-[#0a2540]">{fullName}</strong> ({email})
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToStep1}
                      className="text-[#635bff] font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </form>
              )}

              {/* =============================================================
                  CARD 3: SUCCESSFUL SUBMISSION / FEEDBACK CONFIRMATION (STEP 3)
                  ============================================================= */}
              {currentStep === 3 && submissionSuccess && (
                <div className="text-center py-6 sm:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0a2540] tracking-tight">
                      Thank you for your feedback!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4f566b] max-w-md mx-auto leading-relaxed">
                      {submissionSuccess.message}
                    </p>
                  </div>

                  {/* Reference Ticket Box */}
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e3e8ee] max-w-md mx-auto space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8898aa]">
                        Ticket Reference ID
                      </span>
                      <span className="text-[10px] text-[#8898aa] font-medium">
                        {submissionSuccess.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-[#e3e8ee]">
                      <code className="text-sm font-mono font-bold text-[#0a2540]">
                        {submissionSuccess.ticketId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyTicket}
                        title="Copy Reference ID"
                        className="p-1.5 rounded-lg text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f6f9fc] border border-transparent hover:border-[#e3e8ee] transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      >
                        {copiedTicket ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-600 text-[11px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#f3f4f6] grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#8898aa] block">Issue Category</span>
                        <span className="font-bold text-[#0a2540]">{category}</span>
                      </div>
                      <div>
                        <span className="text-[#8898aa] block">Updates Sent To</span>
                        <span className="font-bold text-[#635bff] truncate block">{email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('discover')}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0a2540] hover:bg-[#1a385c] active:scale-[0.99] text-white text-xs font-bold transition cursor-pointer shadow-sm"
                    >
                      Return to Games
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-[#f6f9fc] border border-[#e3e8ee] text-xs font-bold text-[#4f566b] hover:text-[#0a2540] transition cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Quick FAQ / Help Notes beneath card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#e3e8ee] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#0a2540]">
                <HelpCircle size={14} className="text-[#635bff]" />
                <span>Withdrawal &amp; Prize Payouts</span>
              </div>
              <p className="text-[11px] text-[#4f566b] leading-relaxed">
                Tournament prize distributions are credited within 24 hours of match conclusion. Include your registered mobile number if inquiring about telecoms data vouchers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-xs border border-[#e3e8ee] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#0a2540]">
                <MessageSquare size={14} className="text-[#635bff]" />
                <span>Need Direct Contact?</span>
              </div>
              <p className="text-[11px] text-[#4f566b] leading-relaxed">
                You can also email our resolution desk directly at <a href="mailto:support@firstplay.fun" className="text-[#635bff] font-semibold hover:underline">support@firstplay.fun</a>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Website Footer */}
      <Footer 
        onNavigateDiscover={() => onNavigateTab?.('discover')}
        onNavigateCategory={() => onNavigateTab?.('category')}
        onNavigateSection={() => onNavigateTab?.('discover')}
        onNavigateTab={onNavigateTab}
        onOpenPrivacyPolicy={onOpenPrivacyPolicy}
        onOpenTerms={onOpenTerms}
      />

    </div>
  );
}
