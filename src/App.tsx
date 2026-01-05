import React, { useState, useEffect, useRef } from 'react';

// Popular services for quick selection
const POPULAR_SERVICES = {
  GYM: ['Planet Fitness', 'LA Fitness', '24 Hour Fitness', 'Anytime Fitness', 'Crunch Fitness'],
  STREAMING: ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Apple TV+', 'Spotify', 'YouTube Premium'],
  SAAS: ['Adobe Creative Cloud', 'Microsoft 365', 'Dropbox', 'Salesforce', 'Slack', 'Zoom'],
  SUBSCRIPTION_BOX: ['HelloFresh', 'Blue Apron', 'Birchbox', 'FabFitFun', 'Dollar Shave Club'],
  INSURANCE: ['Geico', 'State Farm', 'Progressive', 'Allstate', 'USAA'],
  PHONE: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Comcast Xfinity'],
  MAGAZINE: ['The New Yorker', 'Time', 'National Geographic', 'Wired', 'The Economist'],
  MEMBERSHIP: ['Amazon Prime', 'Costco', 'AAA', 'Sam\'s Club', 'BJ\'s Wholesale']
};

// Template categories
const CATEGORIES = {
  GYM: 'Gym Membership',
  STREAMING: 'Streaming Service',
  SAAS: 'SaaS/Software',
  SUBSCRIPTION_BOX: 'Subscription Box',
  INSURANCE: 'Insurance',
  PHONE: 'Phone/Internet',
  MAGAZINE: 'Magazine/Newsletter',
  MEMBERSHIP: 'General Membership'
};

const TEMPLATES = {
  GYM: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Service Department

RE: Membership Cancellation Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Team,

I am writing to formally request the cancellation of my gym membership, effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Membership Details:
- Member Name: ${data.fullName}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Membership Type: ' + data.subscriptionPlan : ''}

${data.cancellationReason ? `Reason for Cancellation:\n${data.cancellationReason}\n` : ''}Per the terms of my membership agreement, I am providing this written notice of cancellation. Please cease all billing associated with this membership immediately and provide written confirmation of this cancellation to the email address listed above.

I request that you confirm:
1. The effective date of cancellation
2. That no further charges will be applied to my account
3. Any final payment amount due, if applicable

Please process this request promptly and send confirmation to ${data.email}.

Thank you for your attention to this matter.

Sincerely,

${data.fullName}`,

  STREAMING: (data) => `${data.fullName}
${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Subscription Management Team

RE: Subscription Cancellation${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Support,

I am writing to request the immediate cancellation of my ${data.serviceName} subscription.

Account Information:
- Account Holder: ${data.fullName}
- Email: ${data.email}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Plan Type: ' + data.subscriptionPlan : ''}
- Requested Cancellation Date: ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.cancellationReason ? `I have decided to cancel because: ${data.cancellationReason}\n` : ''}Please confirm that:
- My subscription will be cancelled effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- No further charges will be applied to my payment method
- I will retain access through the end of my current billing period (if applicable)

Please send confirmation of this cancellation to ${data.email}.

Thank you for your service.

Best regards,

${data.fullName}`,

  SAAS: (data) => `${data.fullName}
${data.email}
${data.address ? data.address + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Billing Department

RE: Service Cancellation Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Team,

I am writing to formally request the cancellation of my ${data.serviceName} subscription/service, effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Account Details:
- Account Name: ${data.fullName}
- Email: ${data.email}${data.accountNumber ? '\n- Account/Customer ID: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Current Plan: ' + data.subscriptionPlan : ''}

${data.cancellationReason ? `Cancellation Reason:\n${data.cancellationReason}\n` : ''}Please process this cancellation and ensure:
1. All recurring billing is stopped immediately
2. Data export is available (if applicable under your terms)
3. Written confirmation is sent to ${data.email}
4. Final invoice is provided if there are any outstanding charges

I understand that I am responsible for any charges incurred up to the cancellation date.

Please confirm receipt of this cancellation request and provide the effective termination date.

Thank you for your prompt attention to this matter.

Sincerely,

${data.fullName}`,

  SUBSCRIPTION_BOX: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Care Team

RE: Subscription Cancellation${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to cancel my subscription box service, effective immediately.

Subscriber Information:
- Name: ${data.fullName}${data.address ? '\n- Shipping Address: ' + data.address : ''}
- Email: ${data.email}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Subscription Type: ' + data.subscriptionPlan : ''}

${data.cancellationReason ? `I have decided to cancel for the following reason:\n${data.cancellationReason}\n` : ''}Please confirm:
- My subscription is cancelled effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- No further boxes will be shipped
- No additional charges will be processed
- Any prepaid but unshipped boxes will be refunded (if applicable)

Please send written confirmation to ${data.email}.

Thank you for your service.

Sincerely,

${data.fullName}`,

  INSURANCE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Policy Services Department

RE: Policy Cancellation Request${data.accountNumber ? ' - Policy #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to formally request the cancellation of my insurance policy, effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Policy Information:
- Policyholder: ${data.fullName}${data.accountNumber ? '\n- Policy Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Policy Type: ' + data.subscriptionPlan : ''}${data.address ? '\n- Address: ' + data.address : ''}

${data.cancellationReason ? `Reason for Cancellation:\n${data.cancellationReason}\n` : ''}I request written confirmation of this cancellation including:
1. Effective cancellation date
2. Any refund due for unused premium
3. Confirmation that coverage will cease as of the cancellation date
4. Final statement of account

Please send all correspondence to:
Email: ${data.email}${data.phone ? '\nPhone: ' + data.phone : ''}

Thank you for processing this request promptly.

Sincerely,

${data.fullName}`,

  PHONE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Service Department

RE: Service Disconnection Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to request the disconnection of my service, effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Account Information:
- Account Holder: ${data.fullName}${data.address ? '\n- Service Address: ' + data.address : ''}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.phone ? '\n- Phone Number: ' + data.phone : ''}${data.subscriptionPlan ? '\n- Service Type: ' + data.subscriptionPlan : ''}

${data.cancellationReason ? `Reason for Disconnection:\n${data.cancellationReason}\n` : ''}Please ensure:
1. Service is disconnected on ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
2. All recurring charges are stopped
3. Final bill is sent to ${data.email}
4. Any applicable early termination fees are clearly itemized
5. Equipment return instructions are provided (if applicable)

Please confirm this request and provide details about the final billing and any equipment that needs to be returned.

Contact me at ${data.email}${data.phone ? ' or ' + data.phone : ''} with any questions.

Sincerely,

${data.fullName}`,

  MAGAZINE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Subscription Services

RE: Subscription Cancellation${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to cancel my subscription, effective immediately.

Subscriber Details:
- Name: ${data.fullName}${data.address ? '\n- Address: ' + data.address : ''}
- Email: ${data.email}${data.accountNumber ? '\n- Account/Subscription Number: ' + data.accountNumber : ''}

${data.cancellationReason ? `Cancellation Reason: ${data.cancellationReason}\n` : ''}Please confirm:
- My subscription is cancelled
- No further issues will be sent
- No additional charges will be processed
- Any refund for unused portion of subscription (if applicable)

Please send confirmation to ${data.email}.

Thank you.

Sincerely,

${data.fullName}`,

  MEMBERSHIP: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Membership Services

RE: Membership Cancellation${data.accountNumber ? ' - Member #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to formally cancel my membership, effective ${new Date(data.effectiveDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

Member Information:
- Name: ${data.fullName}${data.accountNumber ? '\n- Member Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Membership Level: ' + data.subscriptionPlan : ''}
- Email: ${data.email}

${data.cancellationReason ? `Reason for Cancellation:\n${data.cancellationReason}\n` : ''}Please process this cancellation and confirm:
1. Effective date of cancellation
2. Cessation of all recurring charges
3. Any final amount due or refund owed
4. Return of membership materials (if applicable)

Please send written confirmation to ${data.email}.

Thank you for your attention to this matter.

Sincerely,

${data.fullName}`
};

const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <i className="fas fa-question-circle text-xs"></i>
      </button>
      {show && (
        <div className="absolute left-0 top-6 z-50 w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", required = false, multiline = false, tooltip, maxLength, showCount = false }) => {
  const baseClasses = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 text-sm placeholder:text-slate-400 shadow-sm";
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 px-0.5 uppercase tracking-wide flex items-center">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {multiline ? (
        <>
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            maxLength={maxLength}
            className={baseClasses}
          />
          {showCount && maxLength && (
            <div className="text-[10px] text-slate-400 text-right">
              {value.length} / {maxLength}
            </div>
          )}
        </>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

const App = () => {
  const [category, setCategory] = useState('GYM');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [subDetails, setSubDetails] = useState({
    serviceName: '',
    accountNumber: '',
    subscriptionPlan: '',
    cancellationReason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPreview, setShowPreview] = useState('');
  
  const textareaRef = useRef(null);
  const letterOutputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('swiftcancel_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserDetails(data.userDetails || userDetails);
        setSubDetails(data.subDetails || subDetails);
        setCategory(data.category || 'GYM');
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);
  
useEffect(() => {
  function postHeight() {
    const height = document.body.scrollHeight;
    window.parent.postMessage(
      { type: "objectHeight", height },
      "*"
    );
  }

  postHeight();
  window.addEventListener("load", postHeight);
  window.addEventListener("resize", postHeight);

  const observer = new ResizeObserver(postHeight);
  observer.observe(document.body);

  return () => {
    window.removeEventListener("load", postHeight);
    window.removeEventListener("resize", postHeight);
    observer.disconnect();
  };
}, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('swiftcancel_draft', JSON.stringify({
        userDetails,
        subDetails,
        category
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [userDetails, subDetails, category]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [generatedLetter]);

  useEffect(() => {
    if (userDetails.fullName && userDetails.email && subDetails.serviceName) {
      const templateFn = TEMPLATES[category];
      const preview = templateFn({
        ...userDetails,
        ...subDetails
      });
      setShowPreview(preview.substring(0, 300) + '...');
    } else {
      setShowPreview('');
    }
  }, [category, userDetails.fullName, userDetails.email, subDetails.serviceName]);

  const handleUserChange = (e) => {
    setUserDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubChange = (e) => {
    setSubDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!userDetails.fullName || !userDetails.email || !subDetails.serviceName || !subDetails.effectiveDate) {
      return;
    }

    const templateFn = TEMPLATES[category];
    const letter = templateFn({
      ...userDetails,
      ...subDetails
    });
    setGeneratedLetter(letter);
    
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        letterOutputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
              body { font-family: 'Courier New', monospace; line-height: 1.6; padding: 1in; white-space: pre-wrap; font-size: 11pt; }
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

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cancellation Letter</title>
            <style>
              body { font-family: 'Courier New', monospace; line-height: 1.6; padding: 1in; white-space: pre-wrap; font-size: 11pt; }
            </style>
          </head>
          <body>${generatedLetter}</body>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-white lg:bg-slate-50 flex flex-col lg:flex-row antialiased">
      <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-shrink-0">
        <div className="p-5 sm:p-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-layer-group text-blue-500/50"></i> Select Category
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`text-[10px] py-2.5 px-2 rounded-lg border text-center transition-all font-semibold ${
                      category === key 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              {showPreview && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-2">Preview</div>
                  <div className="text-[10px] text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                    {showPreview}
                  </div>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i className="fas fa-briefcase text-blue-500/50"></i> Service Details
              </h2>
              
              {POPULAR_SERVICES[category] && (
                <div className="mb-3">
                  <label className="text-[10px] text-slate-500 font-semibold mb-2 block">Popular Services</label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SERVICES[category].map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setSubDetails(prev => ({ ...prev, serviceName: service }))}
                        className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded border border-blue-200 transition-colors font-medium"
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <InputGroup 
                  label="Service Name" 
                  name="serviceName" 
                  value={subDetails.serviceName} 
                  onChange={handleSubChange} 
                  placeholder="e.g. Planet Fitness, Netflix" 
                  required
                  tooltip="The company or service you want to cancel"
                />
                <InputGroup 
                  label="Cancellation Date" 
                  name="effectiveDate" 
                  type="date"
                  value={subDetails.effectiveDate} 
                  onChange={handleSubChange} 
                  required
                  tooltip="When you want the cancellation to take effect"
                />
              </div>
            </section>

            <section>
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fas fa-user-circle text-blue-500/50"></i> Your Information
              </h2>
              <div className="space-y-4">
                <InputGroup 
                  label="Full Name" 
                  name="fullName" 
                  value={userDetails.fullName} 
                  onChange={handleUserChange} 
                  placeholder="John Doe" 
                  required
                  tooltip="Your full legal name as it appears on the account"
                />
                <InputGroup 
                  label="Email" 
                  name="email" 
                  type="email"
                  value={userDetails.email} 
                  onChange={handleUserChange} 
                  placeholder="john@example.com" 
                  required
                  tooltip="Email where you'll receive confirmation"
                />
              </div>
            </section>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              type="button"
              className="w-full py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
              {showAdvanced ? 'Hide' : 'Show'} Optional Fields
            </button>

            {showAdvanced && (
              <section className="space-y-4 pb-4 border-b border-slate-200">
                <InputGroup 
                  label="Phone" 
                  name="phone" 
                  value={userDetails.phone} 
                  onChange={handleUserChange} 
                  placeholder="(555) 123-4567"
                  tooltip="Optional: Your contact phone number"
                />
                <InputGroup 
                  label="Mailing Address" 
                  name="address" 
                  value={userDetails.address} 
                  onChange={handleUserChange} 
                  placeholder="123 Street, City, State ZIP" 
                  multiline
                  tooltip="Optional: Your billing or mailing address"
                />
                <InputGroup 
                  label="Account Number" 
                  name="accountNumber" 
                  value={subDetails.accountNumber} 
                  onChange={handleSubChange} 
                  placeholder="Optional"
                  tooltip="Your account or member ID if you have one"
                />
                <InputGroup 
                  label="Plan/Type" 
                  name="subscriptionPlan" 
                  value={subDetails.subscriptionPlan} 
                  onChange={handleSubChange} 
                  placeholder="e.g. Premium, Basic"
                  tooltip="Your subscription tier or plan type"
                />
                <InputGroup 
                  label="Reason (Optional)" 
                  name="cancellationReason" 
                  value={subDetails.cancellationReason} 
                  onChange={handleSubChange} 
                  placeholder="Brief explanation..." 
                  multiline
                  maxLength={200}
                  showCount={true}
                  tooltip="Optional: Brief reason for cancellation (keep it concise)"
                />
              </section>
            )}

            <button
              onClick={handleSubmit}
              type="button"
              className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95"
            >
              <i className="fas fa-file-alt"></i>
              <span>Generate Letter</span>
            </button>
          </div>
        </div>
      </aside>

      <main 
        ref={letterOutputRef}
        className="flex-1 bg-slate-50 lg:bg-slate-100 p-4 sm:p-6 lg:p-10 xl:p-14 flex flex-col items-center"
      >
        <div className="w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview & Edit</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={downloadPDF}
                disabled={!generatedLetter}
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all text-xs font-bold"
              >
                <i className="fas fa-file-pdf"></i>
                <span>PDF</span>
              </button>
              <button
                onClick={printLetter}
                disabled={!generatedLetter}
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all text-xs font-bold"
              >
                <i className="fas fa-print"></i>
                <span>Print</span>
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!generatedLetter}
                type="button"
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg border font-bold text-xs transition-all shadow-sm ${
                  copySuccess 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30'
                }`}
              >
                <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[400px]">
            {!generatedLetter ? (
              <div className="flex flex-col items-center justify-center text-center p-12 lg:p-20 opacity-40">
                <i className="fas fa-file-invoice text-5xl text-slate-200 mb-4"></i>
                <h3 className="text-slate-600 font-bold">Your letter will appear here</h3>
                <p className="text-slate-400 text-sm mt-2">Fill out the required fields and click Generate Letter</p>
              </div>
            ) : (
              <div className="p-8 sm:p-10 lg:p-16">
                <textarea
                  ref={textareaRef}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full resize-none border-none outline-none text-base sm:text-lg text-slate-800 leading-relaxed bg-transparent focus:ring-0 overflow-hidden font-mono"
                  style={{ fontFamily: "'Courier New', monospace" }}
                  spellCheck={false}
                />
                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  <span>Template Generated</span>
                  <span>Review before sending</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs font-semibold text-blue-900 mb-1">What works best:</div>
            <div className="text-[11px] text-blue-800 leading-relaxed">
              Email cancellation works well for many SaaS and business tools. Some subscriptions (like app store purchases, streaming services, or financial products) require cancellation directly inside your account and won't accept email requests.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
