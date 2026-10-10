import { useState } from 'react';
import { Mail, Send, CheckCircle2, Copy, Check, MapPin, ArrowUpRight } from 'lucide-react';

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Visual Identity System',
    timeline: '3–6 Months',
    budget: '$30k – $60k',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  const directEmail = 'elena@vance.studio';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please complete all required fields (Name, Email, and Project Overview).');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      projectType: 'Visual Identity System',
      timeline: '3–6 Months',
      budget: '$30k – $60k',
      message: ''
    });
    setIsSubmitted(false);
    setErrorMessage('');
  };

  return (
    <section id="contact" className="py-20 lg:py-28 border-b border-zinc-800/80 bg-[#0b0c10]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
            Inquiries & Collaborations
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white font-sans [text-wrap:balance]">
            03. Let's compose something enduring.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-3 leading-relaxed font-light">
            Whether preparing a high-production brand overhaul, an art-house film edit, or an architectural monograph publication, share your brief below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Studio Information */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            {/* Direct Email Card */}
            <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                DIRECT STUDIO CORRESPONDENCE
              </span>
              <div className="flex items-center justify-between gap-4">
                <a
                  href={`mailto:${directEmail}`}
                  className="text-lg sm:text-xl font-bold text-white hover:text-amber-400 transition-colors font-mono tracking-tight"
                >
                  {directEmail}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                  aria-label="Copy direct email address"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Response turnaround within 24–48 business hours.
              </p>
            </div>

            {/* Studio Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>NEW YORK</span>
                </div>
                <p className="text-sm font-semibold text-white">SoHo Atelier</p>
                <p className="text-xs text-zinc-400 mt-1">Crosby St · New York, NY 10012</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>BERLIN</span>
                </div>
                <p className="text-sm font-semibold text-white">Mitte Edit Suite</p>
                <p className="text-xs text-zinc-400 mt-1">Linienstraße · 10115 Berlin</p>
              </div>
            </div>

            {/* Social & Industry Profiles */}
            <div className="pt-6 border-t border-zinc-800/80">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-3">
                CHANNELS & PLATFORMS
              </span>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Behance', url: '#' },
                  { name: 'Vimeo (Showreels)', url: '#' },
                  { name: 'Read.cv', url: '#' },
                  { name: 'Instagram', url: '#' },
                  { name: 'Are.na', url: '#' }
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center gap-1"
                  >
                    <span>{item.name}</span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-xl bg-zinc-900/70 border border-zinc-800 shadow-xl">
              {isSubmitted ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    Inquiry Received
                  </h3>
                  <p className="text-zinc-300 text-sm max-w-md leading-relaxed mb-6 font-light">
                    Thank you, <strong className="text-white font-medium">{formData.name}</strong>. Your project brief has been logged directly in Elena's commission review queue. You will receive an initial response at <span className="text-amber-400 font-mono">{formData.email}</span> shortly.
                  </p>

                  <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-left w-full max-w-md text-xs font-mono text-zinc-400 space-y-1 mb-6">
                    <div>PROJECT TYPE: <span className="text-zinc-200">{formData.projectType}</span></div>
                    <div>TIMELINE: <span className="text-zinc-200">{formData.timeline}</span></div>
                    <div>BUDGET RANGE: <span className="text-zinc-200">{formData.budget}</span></div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 text-xs font-semibold text-black bg-zinc-100 hover:bg-amber-400 rounded transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMessage && (
                    <div className="p-3.5 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                        Your Name / Studio <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Maya Lin"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                        Email Address <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. maya@institution.org"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                      Primary Discipline / Scope
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                    >
                      <option value="Visual Identity System">Visual Identity & Spatial System</option>
                      <option value="Film & Video Editing">Narrative Film / Commercial Video Editing</option>
                      <option value="Editorial & Monograph">Editorial Monograph & Book Design</option>
                      <option value="Spatial & 3D Motion">3D Kinetic Typography & Motion Direction</option>
                      <option value="Comprehensive Campaign">Comprehensive Brand & Moving Image Campaign</option>
                    </select>
                  </div>

                  {/* Timeline & Budget Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                        Target Timeline
                      </label>
                      <select
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="1–2 Months (Expedited)">1–2 Months (Expedited)</option>
                        <option value="3–6 Months">3–6 Months (Standard)</option>
                        <option value="6+ Months (Long-form)">6+ Months (Long-form / Retainer)</option>
                        <option value="Flexible Schedule">Flexible / Discovery Phase</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                        Estimated Budget Tier
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="$15k – $30k">$15,000 – $30,000</option>
                        <option value="$30k – $60k">$30,000 – $60,000</option>
                        <option value="$60k – $120k">$60,000 – $120,000</option>
                        <option value="$120k+">$120,000+ (Master Campaign)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                      Project Brief & Narrative Vision <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Outline your project scope, core story, key deliverables, and any relevant links or references..."
                      required
                      className="w-full px-4 py-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-zinc-100 text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-lg bg-zinc-100 hover:bg-amber-400 text-black text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-zinc-500 text-center font-mono">
                    All submitted materials and unreleased scripts are treated with strict confidentiality.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
