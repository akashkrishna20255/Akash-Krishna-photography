import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType, SiteContent, ServiceItem, SocialLink } from '../types/gallery';
import {
  X,
  Lock,
  Key,
  Mail,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Upload,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Type,
  Layout,
  Image as ImageIcon,
  Sliders,
  Check,
  Globe,
  ArrowUpRight,
  Share2,
  User
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminEmail: string;
  photos: GalleryPhoto[];
  siteContent: SiteContent;
  failedAttempts: number;
  lockoutUntil: number;
  initialTab?: 'add' | 'manage' | 'content' | 'layout' | 'settings';
  onLogin: (key: string) => Promise<{ success: boolean; message: string; remainingAttempts?: number; lockedMinutes?: number }>;
  onLogout: () => void;
  onSendResetCode: (email: string) => { success: boolean; message: string; code?: string };
  onVerifyAndReset: (code: string, newKey: string) => Promise<{ success: boolean; message: string }>;
  onAddPhoto: (photo: Omit<GalleryPhoto, 'id'>) => void;
  onDeletePhoto: (id: string) => void;
  onEditPhoto: (photo: GalleryPhoto) => void;
  onResetToDefault: () => void;
  onUpdateHero: (hero: Partial<SiteContent['hero']>) => void;
  onUpdateAbout: (about: Partial<SiteContent['about']>) => void;
  onUpdateContact: (contact: Partial<SiteContent['contact']>) => void;
  onUpdateLayout: (layout: Partial<SiteContent['layout']>) => void;
  onAddService: (service: Omit<ServiceItem, 'id'>) => void;
  onUpdateService: (id: string, updated: Partial<ServiceItem>) => void;
  onDeleteService: (id: string) => void;
  onAddSocialLink: (social: Omit<SocialLink, 'id'>) => void;
  onUpdateSocialLink: (id: string, updated: Partial<SocialLink>) => void;
  onDeleteSocialLink: (id: string) => void;
  onResetSiteContent: () => void;
}

const CATEGORIES: CategoryType[] = [
  'Visual Design',
  'Film & Motion',
  'Photography',
  'Editorial'
];

const PRESET_PLATFORMS = [
  { name: 'Instagram', defaultUrl: 'https://instagram.com/' },
  { name: 'Behance', defaultUrl: 'https://behance.net/' },
  { name: 'Vimeo', defaultUrl: 'https://vimeo.com/' },
  { name: 'LinkedIn', defaultUrl: 'https://linkedin.com/in/' },
  { name: 'YouTube', defaultUrl: 'https://youtube.com/@' },
  { name: 'X / Twitter', defaultUrl: 'https://x.com/' },
  { name: 'Dribbble', defaultUrl: 'https://dribbble.com/' },
  { name: 'ArtStation', defaultUrl: 'https://artstation.com/' }
];

export const AdminModal = ({
  isOpen,
  onClose,
  isAdmin,
  adminEmail,
  photos,
  siteContent,
  failedAttempts,
  lockoutUntil,
  initialTab = 'add',
  onLogin,
  onLogout,
  onSendResetCode,
  onVerifyAndReset,
  onAddPhoto,
  onDeletePhoto,
  onEditPhoto,
  onResetToDefault,
  onUpdateHero,
  onUpdateAbout,
  onUpdateContact,
  onUpdateLayout,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddSocialLink,
  onUpdateSocialLink,
  onDeleteSocialLink,
  onResetSiteContent
}: AdminModalProps) => {
  if (!isOpen) return null;

  // View state: 'login' | 'request-reset' | 'enter-new-key'
  const [authView, setAuthView] = useState<'login' | 'request-reset' | 'enter-new-key'>('login');
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'content' | 'layout' | 'settings'>(initialTab);
  const [contentSubTab, setContentSubTab] = useState<'hero' | 'about' | 'services' | 'contact' | 'socials'>('contact');

  // Login inputs
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Lockout countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setSecondsRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Reset inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Add photo inputs
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Visual Design');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  // Editable Form States for Site Content
  const [heroForm, setHeroForm] = useState({ ...siteContent.hero });
  const [aboutForm, setAboutForm] = useState({ ...siteContent.about });
  const [contactForm, setContactForm] = useState({ ...siteContent.contact });
  const [layoutForm, setLayoutForm] = useState({ ...siteContent.layout });
  const [contentSavedMsg, setContentSavedMsg] = useState('');

  // New Service inputs
  const [newSrvNum, setNewSrvNum] = useState('05');
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // New Social Link inputs
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Sync state if siteContent changes
  useEffect(() => {
    setHeroForm({ ...siteContent.hero });
    setAboutForm({ ...siteContent.about });
    setContactForm({ ...siteContent.contact });
    setLayoutForm({ ...siteContent.layout });
  }, [siteContent]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);

    try {
      const res = await onLogin(inputKey);
      if (res.success) {
        setInputKey('');
      } else {
        setLoginError(res.message);
      }
    } catch (err) {
      setLoginError('Authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Request Code via Email
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    const result = onSendResetCode(resetEmail);
    if (result.success && result.code) {
      setDispatchedCode(result.code);
      setAuthView('enter-new-key');
      setResetStatus({ type: 'success', text: result.message });
    } else {
      setResetStatus({ type: 'error', text: result.message });
    }
  };

  // Handle Verify Code & Set New Admin Key
  const handleFinishReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);

    if (newKey !== confirmKey) {
      setResetStatus({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newKey.length < 4) {
      setResetStatus({ type: 'error', text: 'Admin key must be at least 4 characters.' });
      return;
    }

    setIsResetting(true);
    try {
      const result = await onVerifyAndReset(resetCode, newKey);
      if (result.success) {
        setResetStatus({ type: 'success', text: result.message });
        setAuthView('login');
        setDispatchedCode(null);
        setNewKey('');
        setConfirmKey('');
        setResetCode('');
      } else {
        setResetStatus({ type: 'error', text: result.message });
      }
    } catch (err) {
      setResetStatus({ type: 'error', text: 'Failed to reset key.' });
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Image File Upload for New Photo
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setNewImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Fullscreen Background Image Upload
  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setHeroForm((prev) => ({ ...prev, fullscreenBgUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Portrait Image Upload for About Section
  const handlePortraitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setAboutForm((prev) => ({ ...prev, portraitUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Photo
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) return;

    onAddPhoto({
      title: newTitle.trim(),
      category: newCategory,
      imageUrl: newImageUrl.trim(),
      year: newYear.trim() || '2026',
      description: newDescription.trim()
    });

    setAddSuccess(true);
    setNewTitle('');
    setNewImageUrl('');
    setNewDescription('');

    setTimeout(() => setAddSuccess(false), 3000);
  };

  // Save Hero Edits
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHero(heroForm);
    setContentSavedMsg('Hero section & top background settings saved!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  // Save About Edits
  const handleSaveAbout = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAbout(aboutForm);
    setContentSavedMsg('Biography & profile details saved!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  // Save Contact Edits
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContact(contactForm);
    setContentSavedMsg('Contact & global availability details saved!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  // Add Social Link
  const handleAddSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialName.trim() || !newSocialUrl.trim()) return;

    let formattedUrl = newSocialUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onAddSocialLink({
      name: newSocialName.trim(),
      url: formattedUrl
    });

    setNewSocialName('');
    setNewSocialUrl('');
    setContentSavedMsg('Social media link added successfully!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  // Add Service Item
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle.trim() || !newSrvDesc.trim()) return;

    onAddService({
      number: newSrvNum.trim(),
      title: newSrvTitle.trim(),
      description: newSrvDesc.trim()
    });

    setNewSrvTitle('');
    setNewSrvDesc('');
    setNewSrvNum(`0${siteContent.services.length + 2}`);
    setContentSavedMsg('New service capability added!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  const isLockedOut = secondsRemaining > 0;
  const currentSocialLinks = siteContent.contact.socialLinks || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 my-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-white">
              {isAdmin ? 'Akash Krishna — Admin Control Suite' : 'Secure Admin Portal'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Admin Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT LOGGED IN VIEW */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8">
            {/* VIEW 1: LOGIN */}
            {authView === 'login' && (
              <div>
                <div className="text-center max-w-md mx-auto mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Admin Security Access
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter your security key to access gallery uploads, direct social link management, and text editing.
                  </p>
                </div>

                {isLockedOut && (
                  <div className="mb-5 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-3">
                    <Clock className="w-5 h-5 shrink-0 text-red-400 animate-spin" />
                    <div>
                      <strong className="block text-white font-semibold">Security Lockout Active</strong>
                      <span>Maximum attempts exceeded. Please wait {secondsRemaining}s.</span>
                    </div>
                  </div>
                )}

                {loginError && !isLockedOut && (
                  <div className="mb-4 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Admin Security Code
                    </label>
                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={inputKey}
                        disabled={isLockedOut || isAuthenticating}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder="Enter admin code"
                        required
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono pr-10 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLockedOut || isAuthenticating}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? 'Verifying...' : 'Unlock Admin Panel'}
                  </button>

                  <div className="pt-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthView('request-reset');
                        setLoginError('');
                      }}
                      className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-4 cursor-pointer font-mono"
                    >
                      Forgot Admin Code? Reset via Registered Email
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 2: REQUEST RESET CODE */}
            {authView === 'request-reset' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Reset Admin Code
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Enter the Google AI Studio email associated with this site to verify identity.
                  </p>
                </div>

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-green-950/70 border border-green-800 text-green-200'
                    }`}
                  >
                    <span>{resetStatus.text}</span>
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Registered Owner Email
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. akashkrishna67@gmail.com"
                      required
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                    <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                      * Must match your Google AI Studio account email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Dispatch Secure Reset Code
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white font-mono"
                    >
                      ← Return to Login
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 3: ENTER CODE & SET NEW ADMIN KEY */}
            {authView === 'enter-new-key' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                    Verify Code & Update Key
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Verification code dispatched to: <span className="text-white font-mono font-semibold">{adminEmail}</span>
                  </p>
                </div>

                {dispatchedCode && (
                  <div className="mb-4 p-3.5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-zinc-400">Dispatched Code: </span>
                      <strong className="text-white text-sm tracking-widest">{dispatchedCode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetCode(dispatchedCode)}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black text-[11px] font-semibold rounded cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                )}

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-green-950/70 border border-green-800 text-green-200'
                    }`}
                  >
                    {resetStatus.text}
                  </div>
                )}

                <form onSubmit={handleFinishReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono tracking-widest text-center text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      New Admin Code / Key
                    </label>
                    <input
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter new admin code"
                      required
                      minLength={4}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Confirm New Admin Code
                    </label>
                    <input
                      type="password"
                      value={confirmKey}
                      onChange={(e) => setConfirmKey(e.target.value)}
                      placeholder="Re-enter new admin code"
                      required
                      minLength={4}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isResetting ? 'Encrypting & Updating Key...' : 'Confirm & Update Admin Key'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-400 hover:text-white font-mono"
                    >
                      Cancel & Return to Login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* LOGGED IN ADMIN SUITE */
          <div>
            {/* Top Navigation Bar with Tabs */}
            <div className="flex border-b border-zinc-800 bg-zinc-950 px-6 gap-2 text-xs font-mono overflow-x-auto">
              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'add'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Work</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Gallery ({photos.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('content')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'content'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text & Socials</span>
              </button>

              <button
                onClick={() => setActiveTab('layout')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'layout'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Layout & Background</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>

              <button
                onClick={onLogout}
                className="ml-auto py-3 px-3 text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>

            {/* Notification Bar */}
            {contentSavedMsg && (
              <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 text-xs px-6 py-2.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{contentSavedMsg}</span>
              </div>
            )}

            {/* TAB CONTENT CONTAINER */}
            <div className="p-6 max-h-[72vh] overflow-y-auto">
              {/* TAB 1: ADD PHOTO */}
              {activeTab === 'add' && (
                <div>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-white mb-1 uppercase">
                      Upload New Work to Gallery
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Select an image file from your computer or paste an image link.
                    </p>
                  </div>

                  {addSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Photo published successfully to the live gallery!</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Image File or URL <span className="text-white">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {newImageUrl && (
                          <div className="w-24 h-24 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                            <img
                              src={newImageUrl}
                              alt="Upload preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-grow space-y-2 w-full">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Paste image URL (or upload from device below)"
                            required
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white font-mono"
                          />

                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Select from Computer</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileUpload}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              (Instant preview)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Photo / Project Title <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Minimalist Identity System"
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Year
                        </label>
                        <input
                          type="text"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          placeholder="2026"
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Caption / Description
                      </label>
                      <textarea
                        rows={2}
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Brief artistic description..."
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Photo to Gallery</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE GALLERY */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">Gallery Archive</h3>
                      <p className="text-xs text-zinc-400">Modify titles or delete items from the live gallery.</p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm('Reset gallery to default curated works?')) {
                          onResetToDefault();
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Default Set</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800/80">
                    {photos.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs text-zinc-500 font-mono">
                              {item.category} · {item.year}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onEditPhoto(item)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                            title="Edit Photo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.title}" from gallery?`)) {
                                onDeletePhoto(item.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 cursor-pointer"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FULL TEXT & SOCIAL LINKS EDITOR */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Sub-tab selection */}
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-zinc-800">
                    {[
                      { id: 'socials', label: 'Social Media Links & URLs', icon: Share2 },
                      { id: 'contact', label: 'Contact & Availability', icon: Mail },
                      { id: 'hero', label: 'Hero Texts', icon: Type },
                      { id: 'about', label: 'Biography & Profile', icon: User },
                      { id: 'services', label: 'Services & Capabilities', icon: Layout }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setContentSubTab(st.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                          contentSubTab === st.id
                            ? 'bg-white text-black font-semibold'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <st.icon className="w-3.5 h-3.5" />
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* SUBTAB 1: SOCIAL MEDIA LINKS & DIRECT URLS */}
                  {contentSubTab === 'socials' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-1">
                          <Share2 className="w-4 h-4 text-amber-400" />
                          <span>Direct Social Media Profiles</span>
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Add, edit, or remove your social media links. Visitors can click these buttons to open your profiles directly.
                        </p>
                      </div>

                      {/* Current Social Links Table / Editor */}
                      <div className="space-y-3">
                        <div className="text-xs font-mono uppercase text-zinc-400">
                          Active Social Profiles ({currentSocialLinks.length})
                        </div>

                        {currentSocialLinks.map((link) => (
                          <div
                            key={link.id}
                            className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between"
                          >
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                                  Platform
                                </label>
                                <input
                                  type="text"
                                  value={link.name}
                                  onChange={(e) => onUpdateSocialLink(link.id, { name: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-mono"
                                  placeholder="e.g. Instagram"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                                  Direct Link URL
                                </label>
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) => onUpdateSocialLink(link.id, { url: e.target.value })}
                                  className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded text-zinc-300 font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                              {link.url && link.url !== '#' && (
                                <a
                                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1"
                                  title="Test link directly"
                                >
                                  <span>Test</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}

                              <button
                                onClick={() => onDeleteSocialLink(link.id)}
                                className="p-1.5 rounded bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 cursor-pointer"
                                title="Remove link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {currentSocialLinks.length === 0 && (
                          <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500 font-mono">
                            No social media profiles added yet. Add one below!
                          </div>
                        )}
                      </div>

                      {/* Add New Social Link Form */}
                      <form
                        onSubmit={handleAddSocialSubmit}
                        className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-mono uppercase text-white font-semibold">
                            + Add New Social Media Link
                          </h5>
                          <span className="text-[11px] font-mono text-zinc-500">Quick Presets:</span>
                        </div>

                        {/* Quick Presets for Instant 1-Click Fill */}
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_PLATFORMS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setNewSocialName(preset.name);
                                setNewSocialUrl(preset.defaultUrl);
                              }}
                              className="px-2.5 py-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                            >
                              + {preset.name}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                              Platform Name *
                            </label>
                            <input
                              type="text"
                              value={newSocialName}
                              onChange={(e) => setNewSocialName(e.target.value)}
                              placeholder="e.g. Instagram"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                              Direct Profile URL *
                            </label>
                            <input
                              type="text"
                              value={newSocialUrl}
                              onChange={(e) => setNewSocialUrl(e.target.value)}
                              placeholder="https://instagram.com/yourhandle"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Profile Link</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUBTAB 2: CONTACT & AVAILABILITY */}
                  {contentSubTab === 'contact' && (
                    <form onSubmit={handleSaveContact} className="space-y-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Contact Headline
                        </label>
                        <input
                          type="text"
                          value={contactForm.headline}
                          onChange={(e) => setContactForm({ ...contactForm, headline: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Contact Subtext
                        </label>
                        <textarea
                          rows={2}
                          value={contactForm.subtext}
                          onChange={(e) => setContactForm({ ...contactForm, subtext: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white leading-relaxed"
                        />
                      </div>

                      {/* EDIT OPTION FOR AVAILABILITY GLOBALLY */}
                      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                        <label className="block text-xs font-mono uppercase text-amber-400">
                          Global Availability Text (Editable)
                        </label>
                        <input
                          type="text"
                          value={contactForm.availabilityText}
                          onChange={(e) => setContactForm({ ...contactForm, availabilityText: e.target.value })}
                          placeholder="e.g. Available Globally (Remote & On-Site) or Based in New York"
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                        />
                        <p className="text-[11px] text-zinc-400">
                          Appears in the Contact section directly next to the map pin icon.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Direct Contact Email
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          required
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Contact & Availability</span>
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 3: HERO TEXTS */}
                  {contentSubTab === 'hero' && (
                    <form onSubmit={handleSaveHero} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                            Main Headline Line 1
                          </label>
                          <input
                            type="text"
                            value={heroForm.headline}
                            onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                            Headline Accent Line 2
                          </label>
                          <input
                            type="text"
                            value={heroForm.headlineAccent}
                            onChange={(e) => setHeroForm({ ...heroForm, headlineAccent: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Hero Introduction / Bio Text
                        </label>
                        <textarea
                          rows={3}
                          value={heroForm.bio}
                          onChange={(e) => setHeroForm({ ...heroForm, bio: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white leading-relaxed"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Hero Content</span>
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 4: BIOGRAPHY & PROFILE */}
                  {contentSubTab === 'about' && (
                    <form onSubmit={handleSaveAbout} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                            Section Badge Label
                          </label>
                          <input
                            type="text"
                            value={aboutForm.badge}
                            onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                            About Section Heading
                          </label>
                          <input
                            type="text"
                            value={aboutForm.title}
                            onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Portrait / Profile Image (URL or Upload)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={aboutForm.portraitUrl}
                            onChange={(e) => setAboutForm({ ...aboutForm, portraitUrl: e.target.value })}
                            className="flex-grow px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono"
                          />
                          <label className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-zinc-300 cursor-pointer flex items-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePortraitFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Biography Paragraph 1
                        </label>
                        <textarea
                          rows={3}
                          value={aboutForm.bio1}
                          onChange={(e) => setAboutForm({ ...aboutForm, bio1: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                          Biography Paragraph 2
                        </label>
                        <textarea
                          rows={3}
                          value={aboutForm.bio2}
                          onChange={(e) => setAboutForm({ ...aboutForm, bio2: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white leading-relaxed"
                        />
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Stat 1</label>
                          <input
                            type="text"
                            value={aboutForm.stat1Value}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat1Value: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                          <input
                            type="text"
                            value={aboutForm.stat1Label}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat1Label: e.target.value })}
                            className="w-full px-3 py-1.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 mt-1"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Stat 2</label>
                          <input
                            type="text"
                            value={aboutForm.stat2Value}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat2Value: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                          <input
                            type="text"
                            value={aboutForm.stat2Label}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat2Label: e.target.value })}
                            className="w-full px-3 py-1.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 mt-1"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-zinc-400 mb-1">Stat 3</label>
                          <input
                            type="text"
                            value={aboutForm.stat3Value}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat3Value: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                          <input
                            type="text"
                            value={aboutForm.stat3Label}
                            onChange={(e) => setAboutForm({ ...aboutForm, stat3Label: e.target.value })}
                            className="w-full px-3 py-1.5 text-[11px] bg-zinc-900 border border-zinc-800 rounded text-zinc-400 mt-1"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Biography Details</span>
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 5: SERVICES & CAPABILITIES */}
                  {contentSubTab === 'services' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-mono uppercase text-zinc-400 mb-3">
                          Existing Capabilities ({siteContent.services.length})
                        </h4>
                        <div className="space-y-3">
                          {siteContent.services.map((srv) => (
                            <div
                              key={srv.id}
                              className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-4"
                            >
                              <div>
                                <span className="font-mono text-xs text-amber-400 mr-2">{srv.number} /</span>
                                <strong className="text-sm text-white">{srv.title}</strong>
                                <p className="text-xs text-zinc-400 mt-1">{srv.description}</p>
                              </div>

                              <button
                                onClick={() => onDeleteService(srv.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 shrink-0 cursor-pointer"
                                title="Remove capability"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleAddServiceSubmit} className="pt-4 border-t border-zinc-800 space-y-3">
                        <h4 className="text-xs font-mono uppercase text-zinc-400">
                          + Add New Service Capability
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <input
                              type="text"
                              value={newSrvNum}
                              onChange={(e) => setNewSrvNum(e.target.value)}
                              placeholder="05"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white font-mono"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={newSrvTitle}
                              onChange={(e) => setNewSrvTitle(e.target.value)}
                              placeholder="Capability Title"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            rows={2}
                            value={newSrvDesc}
                            onChange={(e) => setNewSrvDesc(e.target.value)}
                            placeholder="Description..."
                            required
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold rounded text-xs uppercase cursor-pointer"
                        >
                          + Add Service
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LAYOUT & FULLSCREEN BACKGROUND IMAGE */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-amber-400" />
                          <span>Top Full-Screen Background Image Option</span>
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          Enable an immersive cinematic full-screen hero image backdrop with dark overlay.
                        </p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroForm.showFullscreenBg}
                          onChange={(e) => {
                            const updated = { ...heroForm, showFullscreenBg: e.target.checked };
                            setHeroForm(updated);
                            onUpdateHero(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                      </label>
                    </div>

                    {heroForm.showFullscreenBg && (
                      <div className="pt-3 border-t border-zinc-800/80 space-y-3 animate-in fade-in">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                            Background Image URL or Upload File
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={heroForm.fullscreenBgUrl}
                              onChange={(e) => {
                                const updated = { ...heroForm, fullscreenBgUrl: e.target.value };
                                setHeroForm(updated);
                                onUpdateHero(updated);
                              }}
                              placeholder="Paste background image link..."
                              className="flex-grow px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded text-white font-mono"
                            />
                            <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-200 cursor-pointer flex items-center gap-1.5 shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleBgFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
                            <span>Overlay Darkness</span>
                            <span className="text-white font-bold">{heroForm.bgOverlayOpacity || 75}%</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="95"
                            value={heroForm.bgOverlayOpacity || 75}
                            onChange={(e) => {
                              const updated = { ...heroForm, bgOverlayOpacity: Number(e.target.value) };
                              setHeroForm(updated);
                              onUpdateHero(updated);
                            }}
                            className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>Section Visibility</span>
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Show "Areas of Expertise / Services" Section
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Display numbered capabilities strip on the homepage
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={layoutForm.showServices}
                          onChange={(e) => {
                            const updated = { ...layoutForm, showServices: e.target.checked };
                            setLayoutForm(updated);
                            onUpdateLayout(updated);
                          }}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Show "About the Studio" Section
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Display portrait frame, biography and toolkit
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={layoutForm.showAbout}
                          onChange={(e) => {
                            const updated = { ...layoutForm, showAbout: e.target.checked };
                            setLayoutForm(updated);
                            onUpdateLayout(updated);
                          }}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs text-zinc-500">
                    <span>Revert all text and layout changes to original template</span>
                    <button
                      onClick={() => {
                        if (confirm('Revert all texts and layout options to initial defaults?')) {
                          onResetSiteContent();
                          setContentSavedMsg('Site content reverted to initial defaults.');
                        }
                      }}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Reset All Texts
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: SECURITY & RECOVERY */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 uppercase">
                      Security & Recovery Settings
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Configured with SHA-256 cryptographic hashing and brute-force protection.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Registered Owner Email
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-white font-semibold">{adminEmail}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[10px] font-mono">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      All password recovery codes are dispatched exclusively to this address.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <span className="text-xs font-mono uppercase text-zinc-400 block">
                      Cryptographic Protection
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>SHA-256 Salted Hash · No plain text stored</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Brute-force protection: 5 attempts max, 5-minute cooldown</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
