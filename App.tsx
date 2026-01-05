
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateCancellationLetter, suggestCancellationReason } from './services/geminiService';
import { Tone, UserDetails, SubscriptionDetails, LetterData } from './types';
import InputGroup from './components/InputGroup';

const App: React.FC = () => {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [subDetails, setSubDetails] = useState<SubscriptionDetails>({
    serviceName: '',
    accountNumber: '',
    subscriptionPlan: '',
    cancellationReason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [tone, setTone] = useState<Tone>(Tone.FORMAL);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const letterOutputRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      // Trigger height message for parent frame
      if (window.parent) {
        window.parent.postMessage({ type: "objectHeight", height: document.body.scrollHeight }, "*");
      }
    }
  }, [generatedLetter]);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSubDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchSuggestions = useCallback(async () => {
    if (subDetails.serviceName.length > 2) {
      const sugs = await suggestCancellationReason(subDetails.serviceName);
      setSuggestions(sugs);
    }
  }, [subDetails.serviceName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (subDetails.serviceName) fetchSuggestions();
    }, 1000);
    return () => clearTimeout(timer);
  }, [subDetails.serviceName, fetchSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    try {
      const letter = await generateCancellationLetter({
        user: userDetails,
        subscription: subDetails,
        tone
      });
      setGeneratedLetter(letter);
      
      // Smooth scroll to results on mobile
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          letterOutputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      setError("Unable to process request. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const printLetter = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cancellation Letter</title>
            <style>
              body { font-family: 'EB Garamond', serif; line-height: 1.5; padding: 1in; white-space: pre-wrap; font-size: 12pt; }
            </style>
          </head>
          <body>${generatedLetter}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-white lg:bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Sidebar Form - In iframe, we want natural flow, so we don't fix height unless desktop */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0">
        <div className="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-user-circle text-blue-500/50"></i> Personal Info
              </h2>
              <div className="space-y-4">
                <InputGroup 
                  label="Full Name" 
                  name="fullName" 
                  value={userDetails.fullName} 
                  onChange={handleUserChange} 
                  placeholder="John Doe" 
                  required 
                />
                <InputGroup 
                  label="Email" 
                  name="email" 
                  type="email"
                  value={userDetails.email} 
                  onChange={handleUserChange} 
                  placeholder="john@example.com" 
                />
                <InputGroup 
                  label="Mailing Address" 
                  name="address" 
                  value={userDetails.address} 
                  onChange={handleUserChange} 
                  placeholder="123 Street, City, State" 
                  multiline
                />
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-briefcase text-blue-500/50"></i> Subscription
              </h2>
              <div className="space-y-4">
                <InputGroup 
                  label="Service Name" 
                  name="serviceName" 
                  value={subDetails.serviceName} 
                  onChange={handleSubChange} 
                  placeholder="e.g. Netflix" 
                  required 
                />
                <div className="grid grid-cols-2 gap-3">
                  <InputGroup 
                    label="Account #" 
                    name="accountNumber" 
                    value={subDetails.accountNumber} 
                    onChange={handleSubChange} 
                    placeholder="Optional" 
                  />
                  <InputGroup 
                    label="Plan" 
                    name="subscriptionPlan" 
                    value={subDetails.subscriptionPlan} 
                    onChange={handleSubChange} 
                    placeholder="e.g. Pro" 
                  />
                </div>
                <InputGroup 
                  label="Reason" 
                  name="cancellationReason" 
                  value={subDetails.cancellationReason} 
                  onChange={handleSubChange} 
                  placeholder="Brief explanation..." 
                  multiline
                />
                
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suggestions.map((sug, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setSubDetails(prev => ({ ...prev, cancellationReason: sug }))}
                        className="text-[10px] bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 px-2 py-1 rounded border border-slate-100 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-pen-fancy text-blue-500/50"></i> Tone
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Tone).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-[11px] py-2 px-1 rounded-lg border text-center transition-all font-semibold ${
                      tone === t 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                isGenerating 
                  ? 'bg-slate-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating Letter...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-wand-magic-sparkles"></i>
                  <span>Generate Letter</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}
        </div>
      </aside>

      {/* Main Preview Area - Using natural flow for iframes */}
      <main 
        ref={letterOutputRef}
        className="flex-1 bg-slate-50 lg:bg-slate-100 p-4 sm:p-6 lg:p-10 xl:p-14 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview & Edit</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={printLetter}
                disabled={!generatedLetter}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all text-xs font-bold"
              >
                <i className="fas fa-print"></i>
                <span>Print</span>
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!generatedLetter}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg border font-bold text-xs transition-all shadow-sm ${
                  copySuccess 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30'
                }`}
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
            {!generatedLetter ? (
              <div className="flex flex-col items-center justify-center text-center p-12 lg:p-20 opacity-40">
                <i className="fas fa-file-invoice text-5xl text-slate-200 mb-4"></i>
                <h3 className="text-slate-600 font-bold">Your letter will appear here</h3>
                <p className="text-slate-400 text-sm mt-2">Complete the form to generate your notice.</p>
              </div>
            ) : (
              <div className="p-8 sm:p-10 lg:p-16">
                <textarea
                  ref={textareaRef}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full resize-none border-none outline-none font-serif-alt text-lg sm:text-xl text-slate-800 leading-relaxed bg-transparent focus:ring-0 overflow-hidden"
                  spellCheck={false}
                />
                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  <span>AI Generated Notice</span>
                  <span>Review and finalize details</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pb-12">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
              <i className="fas fa-shield-alt text-blue-500/60 text-sm"></i>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Client Side Only</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
              <i className="fas fa-check-double text-blue-500/60 text-sm"></i>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Formal Standards</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
              <i className="fas fa-magic text-blue-500/60 text-sm"></i>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">AI Powered Drafts</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
