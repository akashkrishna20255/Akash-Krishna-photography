import { SiteContent } from '../types/gallery';

export const DEFAULT_SITE_CONTENT: SiteContent = {
  categories: ['Visual Design', 'Film & Motion', 'Photography', 'Editorial'],
  allCategoryLabel: 'All',
  hero: {
    name: 'AKASH KRISHNA',
    tagline: 'Visual Designer & Film Editor',
    headline: 'Visual Designer',
    headlineAccent: '& Film Editor.',
    bio: 'Hello, I am Akash Krishna. I craft minimalist brand identities, tactile editorial publications, and cinematic video edits with an obsession for light, structure, and emotional pacing.',
    showFullscreenBg: false,
    fullscreenBgUrl: '/src/assets/images/project_cinema_reel_1791613644291.jpg',
    bgOverlayOpacity: 75,
    heroLayout: 'minimal'
  },
  gallery: {
    badge: 'PORTFOLIO GALLERY',
    title: 'Work Showcase',
    subtitle: 'High-resolution project highlights. Click any project to view all 5 showcase photographs and case details.'
  },
  about: {
    badge: 'BIOGRAPHY',
    title: 'About the Studio',
    bio1: 'I am a multidisciplinary visual designer and film editor creating brand systems, high-retention moving image sequences, and editorial publications for culture-forward brands and artists.',
    bio2: 'My methodology is rooted in structural restraint: stripping away ornamentation so the core narrative speaks with authority. Whether color grading a cinema short or structuring a 200-page book, I strive for clarity, tension, and craftsmanship.',
    portraitUrl: '/src/assets/images/hero_designer_portrait_1791613619703.jpg',
    stat1Value: '08+',
    stat1Label: 'Years Experience',
    stat2Value: '50+',
    stat2Label: 'Projects Delivered',
    stat3Value: '100%',
    stat3Label: 'Client Satisfaction',
    skillBrand: 'Figma, Illustrator, Glyphs',
    skillPost: 'Premiere Pro, DaVinci Resolve',
    skillMotion: 'After Effects, Cinema 4D'
  },
  services: [
    {
      id: 'srv-1',
      number: '01',
      title: 'Brand Systems & Visual Identity',
      description: 'Creating comprehensive visual design languages, custom wordmarks, grid structures, packaging systems, and digital brand guidelines.'
    },
    {
      id: 'srv-2',
      number: '02',
      title: 'Film & Commercial Video Editing',
      description: 'Picture cutting, narrative pacing, rhythmic sound synchronization, match cuts, and professional 35mm photochemical color timing.'
    },
    {
      id: 'srv-3',
      number: '03',
      title: 'Editorial Design & Print Monographs',
      description: 'Designing art publications, exhibition catalogs, and lookbooks with mathematical Swiss typography and tactile paper stocks.'
    },
    {
      id: 'srv-4',
      number: '04',
      title: 'Motion Direction & 3D Spatial',
      description: 'Kinetic title sequences, fluid 3D simulations, broadcast graphics, and architectural video installations.'
    }
  ],
  contact: {
    badge: 'INITIATE PROJECT',
    headline: "Let's Work Together.",
    subtext: 'Have a brand identity to establish, a film edit that needs precise tempo, or an editorial publication? Share your scope below.',
    email: 'akashkrishna67@gmail.com',
    availabilityText: 'Available Globally (Remote & On-Site)',
    directTitle: 'Direct Inquiries & Collaboration',
    socialLinks: [
      { id: 'soc-1', name: 'Behance', url: 'https://behance.net' },
      { id: 'soc-2', name: 'Vimeo', url: 'https://vimeo.com' },
      { id: 'soc-3', name: 'Instagram', url: 'https://instagram.com' },
      { id: 'soc-4', name: 'LinkedIn', url: 'https://linkedin.com' }
    ]
  },
  layout: {
    galleryDefaultView: 'grid3',
    showServices: true,
    showAbout: true
  }
};
