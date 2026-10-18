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
  ShieldCheck, 
  Clock, 
  Mail, 
  Check, 
  Copy,
  MessageSquare,
  Sparkles
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
  // Form State
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden spam bot trap

  // UI & Validation State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null); // stores { ticketId, message }
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!selectedCountry.trim()) {
      newErrors.country = 'Please select your country.';
    }

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
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

  // Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
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

      // Success
      setSubmissionSuccess({
        ticketId: data.ticketId || 'FP-SUPPORT',
        message: data.message || 'Your request has been submitted successfully. Our team will review your message and get back to you within 24 hours.'
      });

      // Scroll to top of card smoothly
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
        {/* Warm Amber/Coral Flare */}
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
          MAIN CONTAINER: CENTERED FLOATING CARD
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[620px] mx-auto space-y-6">

          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-[#e3e8ee] shadow-[0_20px_60px_-15px_rgba(50,50,93,0.08),0_10px_30px_-10px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
            
            {/* Top Indicator Strip (Stripe-inspired multi-step progress bar) */}
            <div className="px-6 sm:px-8 pt-6 pb-2 border-b border-[#f3f4f6] flex items-center justify-between text-[11px] font-semibold text-[#8898aa]">
              <div className="flex items-center gap-1.5 text-[#635bff]">
                <span className="w-4 h-4 rounded-full bg-[#635bff]/10 text-[#635bff] flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>Contact details</span>
              </div>
              <span className="h-0.5 w-6 bg-[#e3e8ee] rounded-full hidden sm:block" />
              <div className="flex items-center gap-1.5 text-[#635bff]">
                <span className="w-4 h-4 rounded-full bg-[#635bff]/10 text-[#635bff] flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>Issue Category</span>
              </div>
              <span className="h-0.5 w-6 bg-[#e3e8ee] rounded-full hidden sm:block" />
              <div className="flex items-center gap-1.5 text-[#635bff]">
                <span className="w-4 h-4 rounded-full bg-[#635bff]/10 text-[#635bff] flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span>Resolution</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-10">

              {submissionSuccess ? (
                /* =============================================================
                   SUCCESS STATE
                   ============================================================= */
                <div className="text-center py-6 sm:py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-[#0a2540] tracking-tight">
                      Request Submitted Successfully
                    </h2>
                    <p className="text-sm text-[#4f566b] max-w-md mx-auto leading-relaxed">
                      {submissionSuccess.message}
                    </p>
                  </div>

                  {/* Reference Ticket Box */}
                  <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e3e8ee] max-w-sm mx-auto space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8898aa] block">
                      Ticket Reference ID
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-sm font-mono font-bold text-[#0a2540] bg-white px-3 py-1.5 rounded-xl border border-[#e3e8ee]">
                        {submissionSuccess.ticketId}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyTicket}
                        title="Copy Reference ID"
                        className="p-2 rounded-xl text-[#4f566b] hover:text-[#0a2540] hover:bg-white border border-transparent hover:border-[#e3e8ee] transition cursor-pointer"
                      >
                        {copiedTicket ? (
                          <Check size={16} className="text-emerald-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#8898aa]">
                      Keep this reference for any follow-up communications.
                    </p>
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

              ) : (

                /* =============================================================
                   FORM VIEW
                   ============================================================= */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  
                  {/* Form Header */}
                  <div className="space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0a2540] tracking-tight">
                      FirstPlay Support &amp; Help Center
                    </h1>
                    <p className="text-xs sm:text-sm text-[#4f566b] leading-relaxed">
                      Need help with a withdrawal, tournament, or your account? Describe your issue below and our team will get back to you promptly.
                    </p>
                  </div>

                  {/* Server Error Alert */}
                  {serverError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in duration-150">
                      <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold">Unable to Submit Request</div>
                        <p className="leading-relaxed">{serverError}</p>
                      </div>
                    </div>
                  )}

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

                  {/* =========================================================
                      FIELD A: FULL NAME
                      ========================================================= */}
                  <div className="space-y-1.5">
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
                      disabled={isSubmitting}
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

                  {/* =========================================================
                      FIELD B: COUNTRY (SEARCHABLE DROPDOWN)
                      ========================================================= */}
                  <div className="space-y-1.5 relative" ref={countryDropdownRef}>
                    <label 
                      className="block text-xs font-bold text-[#3c4257]"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(prev => !prev)}
                      disabled={isSubmitting}
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
                        {/* Search Input */}
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

                        {/* Country Options List */}
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

                  {/* =========================================================
                      FIELD C: ISSUE CATEGORY
                      ========================================================= */}
                  <div className="space-y-1.5">
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
                        className={`w-full h-11 px-3.5 pr-10 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] appearance-none transition-all outline-none cursor-pointer ${
                          !category ? 'text-[#8898aa]' : 'text-[#0a2540]'
                        } ${
                          errors.category 
                            ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                            : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                        }`}
                      >
                        <option value="" disabled>Select the category that best matches your issue...</option>
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

                  {/* =========================================================
                      FIELD D: EMAIL ADDRESS
                      ========================================================= */}
                  <div className="space-y-1.5">
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
                      disabled={isSubmitting}
                      className={`w-full h-11 px-3.5 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] placeholder-[#8898aa] transition-all outline-none ${
                        errors.email 
                          ? 'border-red-400 focus:ring-3 focus:ring-red-100' 
                          : 'border-[#e3e8ee] focus:border-[#635bff] focus:ring-3 focus:ring-[#635bff]/10'
                      }`}
                    />
                    <p className="text-[11px] text-[#8898aa]">
                      We will send all status updates and replies regarding your request to this address.
                    </p>
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* =========================================================
                      FIELD E: MESSAGE
                      ========================================================= */}
                  <div className="space-y-1.5">
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
                      className={`w-full p-3.5 rounded-xl bg-white border text-xs sm:text-sm text-[#0a2540] placeholder-[#8898aa] transition-all outline-none resize-y min-h-[120px] ${
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

                  {/* =========================================================
                      SUBMISSION BUTTON
                      ========================================================= */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-[#635bff] hover:bg-[#0a2540] active:scale-[0.99] text-white text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(99,91,255,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

                  {/* Trust Footer inside card */}
                  <div className="pt-2 border-t border-[#f3f4f6] flex items-center justify-between text-[11px] text-[#8898aa]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Encrypted SSL Submission</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#635bff]" />
                      <span>24-Hour Review SLA</span>
                    </div>
                  </div>

                </form>
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
