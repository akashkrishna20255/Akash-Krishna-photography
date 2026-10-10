import { useState, useEffect } from 'react';
import { GalleryPhoto, CategoryType, SiteContent, ServiceItem, SocialLink } from '../types/gallery';
import { compressImageFile } from '../utils/imageCompressor';
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
  User,
  Layers,
  ExternalLink
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminEmail: string;
  photos: GalleryPhoto[];
  siteContent: SiteContent;
  categories?: string[];
  allCategoryLabel?: string;
  onUpdateCategories?: (newCategories: string[], newAllLabel: string, renames: { from: string; to: string }[]) => void;
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
  onUpdateGallery?: (gallery: Partial<SiteContent['gallery']>) => void;
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
  categories = ['Visual Design', 'Film & Motion', 'Photography', 'Editorial'],
  allCategoryLabel = 'All',
  onUpdateCategories,
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
  onUpdateGallery,
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
  const [contentSubTab, setContentSubTab] = useState<'hero' | 'gallery' | 'about' | 'services' | 'contact' | 'socials'>('gallery');

  // Login inputs - NO HINTS OR DEFAULT DISPLAY
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
  const [showOwnerInboxPreview, setShowOwnerInboxPreview] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Up to 10 Showcase Photo slots state for Add Work
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>(categories[0] || 'Visual Design');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newPhotoSlots, setNewPhotoSlots] = useState<string[]>(['', '', '', '', '', '', '', '', '', '']);
  const [newYear, setNewYear] = useState('2026');
  const [newDescription, setNewDescription] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);
  const [addPhotoError, setAddPhotoError] = useState('');

  // Editable Categories state in Content tab
  const [adminCategories, setAdminCategories] = useState<string[]>([...categories]);
  const [adminAllLabel, setAdminAllLabel] = useState(allCategoryLabel || 'All');
  const [newAdminCatInput, setNewAdminCatInput] = useState('');
  const [catSavedMsg, setCatSavedMsg] = useState('');
  const [catErrorMsg, setCatErrorMsg] = useState('');

  // Editable Form States for Site Content
  const [heroForm, setHeroForm] = useState({ ...siteContent.hero });
  const [galleryForm, setGalleryForm] = useState({
    badge: siteContent.gallery?.badge || 'PORTFOLIO GALLERY',
    title: siteContent.gallery?.title || 'Work Showcase',
    subtitle: siteContent.gallery?.subtitle || 'High-resolution project highlights. Click any project to view all 10 showcase photographs and case details.'
  });
  const [aboutForm, setAboutForm] = useState({ ...siteContent.about });
  const [contactForm, setContactForm] = useState({
    ...siteContent.contact,
    directTitle: siteContent.contact.directTitle || 'Direct Inquiries & Collaboration'
  });
  const [layoutForm, setLayoutForm] = useState({ ...siteContent.layout });
  const [contentSavedMsg, setContentSavedMsg] = useState('');

  // New Service inputs
  const [newSrvNum, setNewSrvNum] = useState(`0${siteContent.services.length + 1}`);
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // New Social Link inputs
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Sync state if siteContent or categories change
  useEffect(() => {
    setHeroForm({ ...siteContent.hero });
    if (siteContent.gallery) {
      setGalleryForm({ ...siteContent.gallery });
    }
    setAboutForm({ ...siteContent.about });
    setContactForm({
      ...siteContent.contact,
      directTitle: siteContent.contact.directTitle || 'Direct Inquiries & Collaboration'
    });
    setLayoutForm({ ...siteContent.layout });
  }, [siteContent]);

  useEffect(() => {
    setAdminCategories([...categories]);
    setAdminAllLabel(allCategoryLabel || 'All');
    if (!categories.includes(newCategory) && categories.length > 0) {
      setNewCategory(categories[0]);
    }
  }, [categories, allCategoryLabel]);

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
    setShowOwnerInboxPreview(false);

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

  // Up to 10 Photos Batch Upload for Add Work
  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).slice(0, 10);
    const updated = [...newPhotoSlots];
    let targetIdx = 0;

    for (let i = 0; i < fileList.length && targetIdx < 10; i++) {
      try {
        const compressed = await compressImageFile(fileList[i], 1600, 0.82);
        updated[targetIdx] = compressed;
        targetIdx++;
      } catch (err) {
        console.error('Failed to compress batch file', err);
      }
    }
    setNewPhotoSlots(updated);
    e.target.value = '';
  };

  // Single Slot File Upload for Add Work with compression
  const handleSlotFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1600, 0.82);
      setNewPhotoSlots((prev) => {
        const updated = [...prev];
        updated[index] = compressed;
        return updated;
      });
    } catch (err) {
      console.error('Failed to compress slot file', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleSlotUrlChange = (index: number, url: string) => {
    setNewPhotoSlots((prev) => {
      const updated = [...prev];
      updated[index] = url;
      return updated;
    });
  };

  const handleClearSlot = (index: number) => {
    setNewPhotoSlots((prev) => {
      const updated = [...prev];
      updated[index] = '';
      return updated;
    });
  };

  // Handle Fullscreen Background Image Upload
  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1920, 0.82);
      const updated = { ...heroForm, fullscreenBgUrl: compressed };
      setHeroForm(updated);
      onUpdateHero(updated);
    } catch (err) {
      console.error('Failed to compress background file', err);
    } finally {
      e.target.value = '';
    }
  };

  // Handle Portrait Image Upload for About Section
  const handlePortraitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1200, 0.85);
      setAboutForm((prev) => ({ ...prev, portraitUrl: compressed }));
    } catch (err) {
      console.error('Failed to compress portrait file', err);
    } finally {
      e.target.value = '';
    }
  };

  // Handle Add Photo with up to 10 showcase slots
  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddPhotoError('');

    if (!newTitle.trim()) {
      setAddPhotoError('Please provide a project title.');
      return;
    }

    // Filter valid slots
    const validImages = newPhotoSlots.filter((u) => u.trim().length > 0);
    if (validImages.length === 0) {
      setAddPhotoError('Please provide at least 1 image for the project (Photo 1 - Main Cover).');
      return;
    }

    const coverImage = validImages[0];
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : newCategory;

    if (!finalCategory) {
      setAddPhotoError('Please specify a category for the project.');
      return;
    }

    // If custom category, add to categories list automatically
    if (isCustomCategory && customCategoryInput.trim() && onUpdateCategories) {
      if (!categories.includes(customCategoryInput.trim())) {
        onUpdateCategories([...categories, customCategoryInput.trim()], allCategoryLabel || 'All', []);
      }
    }

    onAddPhoto({
      title: newTitle.trim(),
      category: finalCategory,
      imageUrl: coverImage,
      images: validImages,
      year: newYear.trim() || '2026',
      description: newDescription.trim()
    });

    setAddSuccess(true);
    setNewTitle('');
    setNewPhotoSlots(['', '', '', '', '', '', '', '', '', '']);
    setNewDescription('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');

    setTimeout(() => setAddSuccess(false), 3000);
  };

  // Category Manager Handlers in Content Tab
  const handleAddAdminCategory = () => {
    const trimmed = newAdminCatInput.trim();
    if (!trimmed) return;
    if (adminCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCatErrorMsg(`Category "${trimmed}" already exists.`);
      return;
    }
    setAdminCategories((prev) => [...prev, trimmed]);
    setNewAdminCatInput('');
    setCatErrorMsg('');
  };

  const handleDeleteAdminCategory = (idx: number) => {
    if (adminCategories.length <= 1) {
      setCatErrorMsg('You must have at least 1 category.');
      return;
    }
    setAdminCategories((prev) => prev.filter((_, i) => i !== idx));
    setCatErrorMsg('');
  };

  const handleSaveAdminCategories = (e: React.FormEvent) => {
    e.preventDefault();
    setCatErrorMsg('');
    const cleaned = adminCategories.map((c) => c.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setCatErrorMsg('Please have at least 1 valid category.');
      return;
    }
    const unique = new Set(cleaned.map((c) => c.toLowerCase()));
    if (unique.size !== cleaned.length) {
      setCatErrorMsg('Category names must be unique.');
      return;
    }

    const renames: { from: string; to: string }[] = [];
    categories.forEach((orig, idx) => {
      if (cleaned[idx] && cleaned[idx] !== orig) {
        renames.push({ from: orig, to: cleaned[idx] });
      }
    });

    if (onUpdateCategories) {
      onUpdateCategories(cleaned, adminAllLabel.trim() || 'All', renames);
    }

    setCatSavedMsg('Category tabs updated and synced successfully!');
    setTimeout(() => setCatSavedMsg(''), 3000);
  };

  // Save Hero Edits
  const handleSaveHero = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHero(heroForm);
    setContentSavedMsg('Hero section & top background settings saved!');
    setTimeout(() => setContentSavedMsg(''), 3000);
  };

  // Save Gallery Text Edits
  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateGallery) {
      onUpdateGallery(galleryForm);
    }
    setContentSavedMsg('Gallery title & description saved!');
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
  const uploadedAddCount = newPhotoSlots.filter((u) => u.trim().length > 0).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl text-zinc-100 my-auto animate-in fade-in zoom-in-95"
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
            {/* VIEW 1: LOGIN (NO HINTS, SECURE INPUT) */}
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
                    Enter your security key to access gallery uploads, project management, and text editing.
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
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

            {/* VIEW 2: REQUEST RESET CODE VIA EMAIL */}
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
                    Enter your Google AI Studio registered email address to verify identity and receive an authorization code.
                  </p>
                </div>

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                    }`}
                  >
                    <span>{resetStatus.text}</span>
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                      Owner Email Address
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
                      * Must match your verified Google AI Studio account email.
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
                      className="text-xs text-zinc-400 hover:text-white font-mono cursor-pointer"
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
                    A 6-digit authorization code has been dispatched to: <span className="text-white font-mono font-semibold">{adminEmail}</span>
                  </p>
                </div>

                {resetStatus && (
                  <div
                    className={`mb-4 p-3.5 rounded-lg text-xs ${
                      resetStatus.type === 'error'
                        ? 'bg-red-950/70 border border-red-800 text-red-200'
                        : 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                    }`}
                  >
                    {resetStatus.text}
                  </div>
                )}

                {/* Email dispatch actions */}
                <div className="mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Need to check email?</span>
                  <a
                    href={`mailto:${adminEmail}?subject=Akash%20Krishna%20Portfolio%20Reset%20Code&body=Your%206-digit%20reset%20code%20is:%20${dispatchedCode || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Mail App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Secure Owner Inspection Box (for testing without external SMTP server) */}
                {dispatchedCode && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setShowOwnerInboxPreview(!showOwnerInboxPreview)}
                      className="w-full py-2 px-3 text-[11px] font-mono text-zinc-400 hover:text-amber-400 border border-zinc-800 rounded bg-zinc-950 flex items-center justify-between cursor-pointer"
                    >
                      <span>Owner Inbox Simulation ({adminEmail})</span>
                      <span>{showOwnerInboxPreview ? 'Hide ▲' : 'View Code ▼'}</span>
                    </button>
                    {showOwnerInboxPreview && (
                      <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-b mt-0.5 text-xs font-mono">
                        <div className="text-zinc-400 mb-1">
                          From: <strong>Security Bot &lt;security@akash.portfolio&gt;</strong>
                        </div>
                        <div className="text-zinc-300">
                          Verification Code:{' '}
                          <span className="text-amber-400 font-bold text-sm tracking-widest">{dispatchedCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setResetCode(dispatchedCode)}
                          className="mt-2 text-[11px] text-white underline hover:text-amber-300 cursor-pointer"
                        >
                          Auto-fill Code
                        </button>
                      </div>
                    )}
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
                      className="text-xs text-zinc-400 hover:text-white font-mono cursor-pointer"
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
                <span>Add Work (Up to 10 Photos)</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`py-3 px-3.5 border-b-2 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'border-white text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <span>Projects ({photos.length})</span>
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
                <span>Text & Social Links</span>
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
              {/* TAB 1: ADD PHOTO (UP TO 10 PHOTO UPLOAD SYSTEM) */}
              {activeTab === 'add' && (
                <div>
                  <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1 uppercase flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>Upload Project with Up to 10 Showcase Photos</span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Upload up to 10 high-resolution photos to showcase your project in full depth ({uploadedAddCount}/10 configured).
                      </p>
                    </div>

                    {/* Batch Upload Up to 10 Files */}
                    <label className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs font-mono cursor-pointer flex items-center gap-1.5 transition-colors shrink-0 shadow-lg">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Batch Upload Up to 10 Photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleBatchFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {addSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Project published successfully to the live showcase gallery!</span>
                    </div>
                  )}

                  {addPhotoError && (
                    <div className="mb-4 p-3.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{addPhotoError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddPhotoSubmit} className="space-y-5">
                    {/* Up to 10-Photo Showcase Slots */}
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <div className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center justify-between">
                        <span>Up to 10 Photo Showcase Slots</span>
                        <span className="text-zinc-500 text-[11px] lowercase">Photo 1 serves as the primary cover</span>
                      </div>

                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {newPhotoSlots.map((slotUrl, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              idx === 0 ? 'bg-zinc-950 border-amber-500/40' : 'bg-zinc-950 border-zinc-800'
                            }`}
                          >
                            {/* Slot Thumbnail */}
                            <div className="w-14 h-14 rounded bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                              {slotUrl ? (
                                <>
                                  <img
                                    key={slotUrl.slice(0, 32)}
                                    src={slotUrl}
                                    alt={`Slot ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute bottom-0 right-0 bg-black/80 text-[9px] font-mono px-1 rounded-tl text-amber-400">
                                    #{idx + 1}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[10px] font-mono text-zinc-600">
                                  #{idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Slot Inputs */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-mono text-white font-semibold">
                                  Photo {idx + 1} {idx === 0 ? '(Main Cover Image *)' : '(Showcase Detail)'}
                                </span>
                                {slotUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearSlot(idx)}
                                    className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={slotUrl}
                                  onChange={(e) => handleSlotUrlChange(idx, e.target.value)}
                                  placeholder={idx === 0 ? 'Image URL or pick file from device *' : 'Image URL or pick file'}
                                  required={idx === 0}
                                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-white font-mono"
                                />

                                <label className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-xs font-mono cursor-pointer flex items-center gap-1 shrink-0 transition-colors">
                                  <Upload className="w-3 h-3" />
                                  <span>Choose File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleSlotFileUpload(idx, e)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                        Project Title <span className="text-white">*</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-mono uppercase text-zinc-400">
                            Category
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomCategory(!isCustomCategory)}
                            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
                          >
                            {isCustomCategory ? 'Choose from list' : '+ Custom Category'}
                          </button>
                        </div>

                        {!isCustomCategory ? (
                          <select
                            value={newCategory}
                            onChange={(e) => {
                              if (e.target.value === '__NEW__') {
                                setIsCustomCategory(true);
                              } else {
                                setNewCategory(e.target.value);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white cursor-pointer"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                            <option value="__NEW__">+ Add Custom Category...</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customCategoryInput}
                              onChange={(e) => setCustomCategoryInput(e.target.value)}
                              placeholder="e.g. 3D Spatial Design"
                              required
                              className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-900 border border-amber-500/50 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCategory(false);
                                setCustomCategoryInput('');
                              }}
                              className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs rounded font-mono cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
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
                        placeholder="Brief artistic description of the project..."
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publish Project to Gallery</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE GALLERY */}
              {activeTab === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-base font-bold text-white uppercase">Project Showcase</h3>
                      <p className="text-xs text-zinc-400">Modify titles, up to 10 showcase photos, or delete items from the live gallery.</p>
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
                              {item.category} · {item.year} · {item.images ? `${item.images.length} Photos` : '1 Photo'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onEditPhoto(item)}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 cursor-pointer"
                            title="Edit Project & Up to 10 Photos"
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
                            title="Delete Project"
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
                      { id: 'gallery', label: 'Gallery Texts', icon: Layers },
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
                          Add, edit, or remove your direct social media links. Visitors click these buttons to open your profiles directly.
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
                            className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div className="flex-grow min-w-0">
                              <span className="text-xs font-bold text-white block">
                                {link.name}
                              </span>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-amber-400 hover:underline font-mono truncate flex items-center gap-1"
                              >
                                <span>{link.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const newName = prompt('Edit Platform Name:', link.name);
                                  if (newName === null) return;
                                  const newUrl = prompt('Edit Profile URL:', link.url);
                                  if (newUrl === null) return;
                                  onUpdateSocialLink(link.id, {
                                    name: newName.trim() || link.name,
                                    url: newUrl.trim() || link.url
                                  });
                                  setContentSavedMsg(`Updated link for ${link.name}`);
                                  setTimeout(() => setContentSavedMsg(''), 3000);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono rounded cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteSocialLink(link.id)}
                                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-300 text-xs font-mono rounded cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Preset Buttons */}
                      <div className="p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl space-y-2">
                        <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                          Quick Presets (Click to autofill)
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {PRESET_PLATFORMS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => {
                                setNewSocialName(preset.name);
                                setNewSocialUrl(preset.defaultUrl);
                              }}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 rounded font-mono cursor-pointer"
                            >
                              + {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add New Social Form */}
                      <form onSubmit={handleAddSocialSubmit} className="space-y-4 pt-2">
                        <h5 className="text-xs font-mono uppercase text-white font-bold">
                          Add New Social Profile Link
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                              Platform Name *
                            </label>
                            <input
                              type="text"
                              value={newSocialName}
                              onChange={(e) => setNewSocialName(e.target.value)}
                              placeholder="e.g. Behance or Instagram"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                              Direct Profile URL *
                            </label>
                            <input
                              type="text"
                              value={newSocialUrl}
                              onChange={(e) => setNewSocialUrl(e.target.value)}
                              placeholder="https://instagram.com/yourhandle"
                              required
                              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded uppercase font-mono cursor-pointer"
                        >
                          + Add Social Link
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SUBTAB 2: CONTACT & AVAILABILITY */}
                  {contentSubTab === 'contact' && (
                    <form onSubmit={handleSaveContact} className="space-y-4 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase mb-1">
                          Contact & Global Availability Texts
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Edit direct contact headline, email address, and global availability status.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Badge Text
                          </label>
                          <input
                            type="text"
                            value={contactForm.badge}
                            onChange={(e) => setContactForm({ ...contactForm, badge: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Direct Inquiry Card Title
                        </label>
                        <input
                          type="text"
                          value={contactForm.directTitle}
                          onChange={(e) => setContactForm({ ...contactForm, directTitle: e.target.value })}
                          placeholder="e.g. Direct Inquiries & Collaboration"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Availability Globally (Location & Working Mode)
                        </label>
                        <input
                          type="text"
                          value={contactForm.availabilityText}
                          onChange={(e) => setContactForm({ ...contactForm, availabilityText: e.target.value })}
                          placeholder="e.g. Available Globally (Remote & On-Site)"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Section Headline
                        </label>
                        <input
                          type="text"
                          value={contactForm.headline}
                          onChange={(e) => setContactForm({ ...contactForm, headline: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Subtext / Call to Action Description
                        </label>
                        <textarea
                          rows={2}
                          value={contactForm.subtext}
                          onChange={(e) => setContactForm({ ...contactForm, subtext: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded uppercase font-mono cursor-pointer"
                      >
                        Save Contact & Availability
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 3: GALLERY TEXTS */}
                  {contentSubTab === 'gallery' && (
                    <form onSubmit={handleSaveGallery} className="space-y-4 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase mb-1">
                          Gallery Section Headings
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Customize the gallery header title, badge, and description.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Gallery Badge Text
                        </label>
                        <input
                          type="text"
                          value={galleryForm.badge}
                          onChange={(e) => setGalleryForm({ ...galleryForm, badge: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Gallery Main Title
                        </label>
                        <input
                          type="text"
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                          placeholder="e.g. Work Showcase"
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Gallery Subtitle
                        </label>
                        <textarea
                          rows={2}
                          value={galleryForm.subtitle}
                          onChange={(e) => setGalleryForm({ ...galleryForm, subtitle: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded uppercase font-mono cursor-pointer"
                      >
                        Save Gallery Texts
                      </button>

                      {/* PORTFOLIO CATEGORIES & FILTER TABS TEXT EDITOR */}
                      <div className="pt-6 border-t border-zinc-800 space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase mb-1 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-amber-400" />
                            <span>Portfolio Category Filter Tabs (Text Edit & Manage)</span>
                          </h4>
                          <p className="text-xs text-zinc-400">
                            Edit category tab texts, rename categories, or add new categories. Renaming automatically preserves existing projects.
                          </p>
                        </div>

                        {catErrorMsg && (
                          <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs">
                            {catErrorMsg}
                          </div>
                        )}

                        {catSavedMsg && (
                          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{catSavedMsg}</span>
                          </div>
                        )}

                        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
                          <div>
                            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                              All Projects Tab Label
                            </label>
                            <input
                              type="text"
                              value={adminAllLabel}
                              onChange={(e) => setAdminAllLabel(e.target.value)}
                              placeholder="All"
                              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded text-white font-mono"
                            />
                          </div>

                          <div className="space-y-2 pt-2">
                            <label className="block text-xs font-mono uppercase text-zinc-400">
                              Active Categories ({adminCategories.length})
                            </label>
                            {adminCategories.map((cat, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800/80 rounded-lg"
                              >
                                <span className="w-6 text-center text-xs font-mono text-zinc-500 font-bold shrink-0">
                                  #{idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={cat}
                                  onChange={(e) => {
                                    const updated = [...adminCategories];
                                    updated[idx] = e.target.value;
                                    setAdminCategories(updated);
                                  }}
                                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white focus:outline-none focus:border-amber-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAdminCategory(idx)}
                                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded cursor-pointer shrink-0"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              value={newAdminCatInput}
                              onChange={(e) => setNewAdminCatInput(e.target.value)}
                              placeholder="New category name..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddAdminCategory();
                                }
                              }}
                              className="flex-1 px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded text-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddAdminCategory}
                              disabled={!newAdminCatInput.trim()}
                              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded text-xs font-mono cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>

                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={handleSaveAdminCategories}
                              className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded uppercase font-mono cursor-pointer flex items-center gap-2 shadow"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Category Tabs</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* SUBTAB 4: HERO TEXTS */}
                  {contentSubTab === 'hero' && (
                    <form onSubmit={handleSaveHero} className="space-y-4 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase mb-1">
                          Hero Section Headings & Bio
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Edit main title, accent text, biography, and top background display.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Primary Headline
                          </label>
                          <input
                            type="text"
                            value={heroForm.headline}
                            onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Headline Accent (Grey line)
                          </label>
                          <input
                            type="text"
                            value={heroForm.headlineAccent}
                            onChange={(e) => setHeroForm({ ...heroForm, headlineAccent: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Short Hero Bio
                        </label>
                        <textarea
                          rows={3}
                          value={heroForm.bio}
                          onChange={(e) => setHeroForm({ ...heroForm, bio: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      {/* Top Fullscreen Background Toggle & Upload */}
                      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-white block">
                              Top Full-Screen Background Image
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Display cinematic full-screen image behind the hero section
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={heroForm.showFullscreenBg}
                            onChange={(e) => setHeroForm({ ...heroForm, showFullscreenBg: e.target.checked })}
                            className="w-4 h-4 accent-white cursor-pointer"
                          />
                        </div>

                        {heroForm.showFullscreenBg && (
                          <div className="pt-2 space-y-3 border-t border-zinc-800">
                            <div>
                              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                                Background Image Link or File Upload
                              </label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={heroForm.fullscreenBgUrl}
                                  onChange={(e) => setHeroForm({ ...heroForm, fullscreenBgUrl: e.target.value })}
                                  placeholder="Paste image URL..."
                                  className="flex-grow px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded text-white font-mono"
                                />
                                <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-200 cursor-pointer flex items-center gap-1.5 shrink-0">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Choose File</span>
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
                                <span>Dark Overlay Darkness</span>
                                <span className="text-white font-bold">{heroForm.bgOverlayOpacity || 75}%</span>
                              </div>
                              <input
                                type="range"
                                min="30"
                                max="95"
                                value={heroForm.bgOverlayOpacity || 75}
                                onChange={(e) => setHeroForm({ ...heroForm, bgOverlayOpacity: Number(e.target.value) })}
                                className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded uppercase font-mono cursor-pointer"
                      >
                        Save Hero Settings
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 5: BIOGRAPHY & PROFILE */}
                  {contentSubTab === 'about' && (
                    <form onSubmit={handleSaveAbout} className="space-y-4 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase mb-1">
                          About Me & Biography
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Edit your biography, studio portrait photo, experience stats, and skills.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            Badge
                          </label>
                          <input
                            type="text"
                            value={aboutForm.badge}
                            onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                            About Section Title
                          </label>
                          <input
                            type="text"
                            value={aboutForm.title}
                            onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                            className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Studio Portrait Image
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={aboutForm.portraitUrl}
                            onChange={(e) => setAboutForm({ ...aboutForm, portraitUrl: e.target.value })}
                            placeholder="Portrait image URL..."
                            className="flex-grow px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white font-mono"
                          />
                          <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-200 cursor-pointer flex items-center gap-1.5 shrink-0">
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
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Biography Paragraph 1
                        </label>
                        <textarea
                          rows={3}
                          value={aboutForm.bio1}
                          onChange={(e) => setAboutForm({ ...aboutForm, bio1: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                          Biography Paragraph 2
                        </label>
                        <textarea
                          rows={3}
                          value={aboutForm.bio2}
                          onChange={(e) => setAboutForm({ ...aboutForm, bio2: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                        />
                      </div>

                      {/* Experience Stats */}
                      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                        <span className="text-xs font-mono uppercase text-white font-bold block">
                          Experience Key Metrics
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <input
                              type="text"
                              value={aboutForm.stat1Value}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat1Value: e.target.value })}
                              placeholder="08+"
                              className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white text-center font-bold"
                            />
                            <input
                              type="text"
                              value={aboutForm.stat1Label}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat1Label: e.target.value })}
                              placeholder="Years Experience"
                              className="w-full px-2 py-1 text-[11px] bg-transparent text-zinc-400 text-center mt-1 border-none"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={aboutForm.stat2Value}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat2Value: e.target.value })}
                              placeholder="50+"
                              className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white text-center font-bold"
                            />
                            <input
                              type="text"
                              value={aboutForm.stat2Label}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat2Label: e.target.value })}
                              placeholder="Projects Delivered"
                              className="w-full px-2 py-1 text-[11px] bg-transparent text-zinc-400 text-center mt-1 border-none"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={aboutForm.stat3Value}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat3Value: e.target.value })}
                              placeholder="100%"
                              className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white text-center font-bold"
                            />
                            <input
                              type="text"
                              value={aboutForm.stat3Label}
                              onChange={(e) => setAboutForm({ ...aboutForm, stat3Label: e.target.value })}
                              placeholder="Client Satisfaction"
                              className="w-full px-2 py-1 text-[11px] bg-transparent text-zinc-400 text-center mt-1 border-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded uppercase font-mono cursor-pointer"
                      >
                        Save Biography Details
                      </button>
                    </form>
                  )}

                  {/* SUBTAB 6: SERVICES & CAPABILITIES */}
                  {contentSubTab === 'services' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase mb-1">
                          Areas of Expertise / Services List
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Add, edit, or remove numbered capability rows shown on the homepage.
                        </p>
                      </div>

                      <div className="divide-y divide-zinc-800">
                        {siteContent.services.map((srv) => (
                          <div key={srv.id} className="py-3 flex items-start justify-between gap-4">
                            <div>
                              <span className="text-xs font-mono text-zinc-500 mr-2">{srv.number} /</span>
                              <strong className="text-sm text-white">{srv.title}</strong>
                              <p className="text-xs text-zinc-400 mt-1">{srv.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => onDeleteService(srv.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer shrink-0"
                              title="Delete capability"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Service Item Form */}
                      <form onSubmit={handleAddServiceSubmit} className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                        <span className="text-xs font-mono uppercase text-white font-bold block">
                          Add New Service Item
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Number</label>
                            <input
                              type="text"
                              value={newSrvNum}
                              onChange={(e) => setNewSrvNum(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white font-mono"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[11px] text-zinc-400 mb-1">Title</label>
                            <input
                              type="text"
                              value={newSrvTitle}
                              onChange={(e) => setNewSrvTitle(e.target.value)}
                              placeholder="e.g. 3D Architectural Visualization"
                              className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={newSrvDesc}
                            onChange={(e) => setNewSrvDesc(e.target.value)}
                            placeholder="Detailed description of deliverables..."
                            className="w-full px-2 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded uppercase font-mono cursor-pointer"
                        >
                          + Add Service Capability
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LAYOUT & VISIBILITY */}
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1 uppercase">
                      Layout & Section Display Settings
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Toggle section visibility, gallery grid styling, and background effects.
                    </p>
                  </div>

                  {/* Top Fullscreen Background Controls */}
                  <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-white block">
                          Top Full-Screen Background Image
                        </span>
                        <span className="text-xs text-zinc-400">
                          Display full-screen visual artwork behind the top hero section
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={heroForm.showFullscreenBg}
                        onChange={(e) => {
                          const updated = { ...heroForm, showFullscreenBg: e.target.checked };
                          setHeroForm(updated);
                          onUpdateHero(updated);
                        }}
                        className="w-4 h-4 accent-white cursor-pointer"
                      />
                    </div>

                    {heroForm.showFullscreenBg && (
                      <div className="pt-3 space-y-3 border-t border-zinc-800">
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

                  {/* Section Visibility Toggles */}
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
