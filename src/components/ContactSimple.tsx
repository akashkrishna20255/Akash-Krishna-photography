import { useState } from 'react';
import { Mail, Copy, Check, Send, CheckCircle2, MapPin, ArrowUpRight, Edit2 } from 'lucide-react';
import { SiteContent } from '../types/gallery';

interface ContactSimpleProps {
  contactContent: SiteContent['contact'];
  isAdmin: boolean;
  onOpenAdmin: (tab: 'content') => void;
}

export const ContactSimple = ({ contactContent, isAdmin, onOpenAdmin }: ContactSimpleProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Brand Identity');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const contactEmail = contactContent.email || 'akashkrishna67@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 700);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-black text-white border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Direct Inquiries */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-widest text-zinc-500 font-mono">
                  {contactContent.badge || 'INITIATE PROJECT'}
                </div>
                {isAdmin && (
                  <button
                    onClick={() => onOpenAdmin('content')}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Contact</span>
                  </button>
                )}
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 uppercase">
                {contactContent.headline}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-light mb-8 leading-relaxed">
                {contactContent.subtext}
              </p>

              {/* Direct Email Card */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-6 shadow-xl">
                <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                  Direct Inquiries & Commissions
                </span>
                <div className="flex items-center justify-between gap-4">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-base sm:text-lg font-mono font-semibold text-white hover:text-amber-400 transition-colors truncate"
                  >
                    {contactEmail}
                  </a>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-zinc-800"
                    title="Copy email address"
                    aria-label="Copy direct email address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Editable Availability Status & Location */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{contactContent.availabilityText}</span>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    { name: 'Behance', url: '#' },
                    { name: 'Vimeo', url: '#' },
                    { name: 'Instagram', url: '#' },
                    { name: 'LinkedIn', url: '#' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.url}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl">
              {isSent ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase">Message Transmitted</h3>
                  <p className="text-sm text-zinc-400 mb-6 font-light max-w-sm mx-auto">
                    Thank you! Your project details have been sent to Akash Krishna. You will receive a response within 24–48 hours.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Johnathan Davis"
                        required
                        className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@studio.com"
                        required
                        className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Primary Service Required
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white transition-colors"
                    >
                      <option value="Brand Identity">Brand Systems & Identity Design</option>
                      <option value="Film & Video Editing">Narrative / Commercial Film Editing</option>
                      <option value="Editorial Design">Editorial Print & Monograph Design</option>
                      <option value="Motion & 3D Spatial">3D Motion Direction & Typography</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Project Scope & Details *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline your timeline, deliverables, brand context, and references..."
                      required
                      className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white transition-colors placeholder:text-zinc-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Submit Project Inquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
