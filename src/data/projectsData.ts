import { Project, Award, Client } from '../types/portfolio';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'aetheri-parfums',
    title: 'Aetheri Parfums: Tactile Minimalism',
    client: 'Aetheri Haute Parfumerie (Paris)',
    year: '2025',
    category: 'identity',
    categoryLabel: 'Visual Identity & Packaging',
    summary: 'A sensorial brand identity system spanning bespoke blind-debossed typography, stone-cast unboxing vessels, and a global retail spatial aesthetic.',
    image: '/src/assets/images/project_brand_identity_1791613631959.jpg',
    featured: true,
    aspectRatio: 'landscape',
    role: 'Lead Visual Designer & Creative Director',
    tools: ['Figma', 'Illustrator', 'Cinema 4D', 'Custom Typography'],
    deliverables: [
      'Monolithic Wordmark & Ligature System',
      'Tactile Sustainable Packaging Suite',
      'Editorial Lookbook (120 pages)',
      'Retail Spatial Brand Guidelines'
    ],
    challenge: 'Aetheri required a visual voice that captured raw mineral stillness and luxury restraint without succumbing to interchangeable pharmaceutical-minimalist tropes.',
    solution: 'We engineered an asymmetric typographic ligature set paired with tactile unbleached cotton paperstocks and stone-inspired vessel proportions, yielding a +140% surge in global boutique wholesale orders.',
    quote: {
      text: 'Elena crafted an identity so quiet and arresting that clients instinctively pause before touching the vessel.',
      author: 'Camille Reynaud',
      role: 'Creative Director, Aetheri Paris'
    },
    metrics: '+140% Boutique Inquiries in 6 Months'
  },
  {
    id: 'nocturne-cinema',
    title: 'Nocturne in G Minor: Art-House Short & Film Edit',
    client: 'A24 / Independent Cinema Showcase',
    year: '2024',
    category: 'film',
    categoryLabel: 'Film Editing & Color Grading',
    summary: 'Principal picture editing and 35mm photochemical color timing for a 19-minute psychological period drama premiering at Locarno Film Festival.',
    image: '/src/assets/images/project_cinema_reel_1791613644291.jpg',
    featured: true,
    aspectRatio: 'landscape',
    role: 'Principal Film Editor & Colorist',
    tools: ['DaVinci Resolve Studio', 'Premiere Pro', 'Kodak 2383 Emulation'],
    deliverables: [
      '19-Minute Master Picture Edit (2.39:1 Anamorphic)',
      'Custom Film Stock Print LUT Curve',
      'Festival Theatrical Trailer & Sound Pacing',
      'Key Visual Poster Art Direction'
    ],
    challenge: 'Pacing a dialogue-sparse narrative requiring millimeter-precise tension cuts and seamless transitions between candlelight interiors and shadowy architecture.',
    solution: 'Utilized rhythmic micro-pauses and breath-synced match cuts coupled with an authentic deep-shadow Kodak print emulation that received critical acclaim for atmospheric retention.',
    quote: {
      text: 'Her sense of temporal suspense transformed our raw footage into an intoxicating cinematic trance.',
      author: 'Julian Thorne',
      role: 'Director, Nocturne'
    },
    metrics: 'Locarno Official Selection · 850k+ Festival Stream Views'
  },
  {
    id: 'form-absence-monograph',
    title: 'Form & Absence: Brutalist Architecture Monograph',
    client: 'Stripe Press & Zurich Arts Foundation',
    year: '2024',
    category: 'editorial',
    categoryLabel: 'Editorial Design & Book Publication',
    summary: 'A 320-page hardcover monograph cataloging mid-century monolithic concrete architecture through rigorous Swiss grid systems and dual-tone silkscreen printing.',
    image: '/src/assets/images/project_editorial_book_1791613658263.jpg',
    featured: false,
    aspectRatio: 'square',
    role: 'Editorial Art Director & Typographer',
    tools: ['InDesign', 'Glyphs 3', 'Custom Grid System', 'Pantone Duotone'],
    deliverables: [
      '320-Page Hardcover Monograph Layout',
      'Custom Display Grotesque Numerals',
      'Silver Silkscreen Slipcase & Ribbon Marker',
      'Exhibition Companion Broadsheet'
    ],
    challenge: 'Structuring 400 archival architectural photographs alongside dense theoretical essays without sacrificing poetic white space and structural clarity.',
    solution: 'Created an 8-column mathematical grid with variable margin anchors that lets concrete imagery breathe against sculpted asymmetric typographic blocks.',
    quote: {
      text: 'One of the most impeccably paced architectural publications printed this decade.',
      author: 'Stefan Brand',
      role: 'Senior Editor, Zurich Arts Press'
    },
    metrics: 'Winner, Tokyo TDC Annual Book Distinction'
  },
  {
    id: 'kinetic-continuum-spatial',
    title: 'Kinetic Continuum: 3D Spatial Motion Typography',
    client: 'Centre Pompidou / Digital Arts Pavilion',
    year: '2025',
    category: 'motion',
    categoryLabel: 'Kinetic Motion & Art Direction',
    summary: 'An architectural 360-degree ribbon installation combining procedural 3D fluid typography, responsive sound design, and reflective chrome materials.',
    image: '/src/assets/images/project_motion_graphics_1791613667936.jpg',
    featured: true,
    aspectRatio: 'square',
    role: 'Motion Director & 3D Spatial Designer',
    tools: ['Cinema 4D', 'After Effects', 'Redshift', 'Octane'],
    deliverables: [
      '12-Minute Generative Looping Projection Map',
      'Dynamic Typographic Physics Simulation',
      'Spatial Sound Synchronization Protocol',
      'Interactive Exhibition Touchpoint Kiosk'
    ],
    challenge: 'Rendering typography that curls across three-dimensional physical spirals while maintaining instant legibility and cinematic light refraction.',
    solution: 'Engineered custom spline velocity curves where letterforms illuminate and fold seamlessly into continuous chrome ribbons as visitors navigate the hall.',
    quote: {
      text: 'An unforgettable fusion of physical architecture and typographic choreography.',
      author: 'Helena Vasseur',
      role: 'Chief Curator, Digital Arts Pavilion'
    },
    metrics: 'Over 220,000 Museum Visitors in 3 Months'
  },
  {
    id: 'polestar-kinetic-identity',
    title: 'Polestar: Pure Electric Velocity Campaign',
    client: 'Polestar Automotive & AKQA',
    year: '2023',
    category: 'film',
    categoryLabel: 'Commercial Video Editing & Sound Design',
    summary: 'A fast-paced 60-second broadcast commercial and social campaign celebrating electric torque and acoustic silence.',
    image: '/src/assets/images/project_cinema_reel_1791613644291.jpg',
    featured: false,
    aspectRatio: 'landscape',
    role: 'Lead Commercial Editor',
    tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects'],
    deliverables: [
      '60s Global TVC Broadcast Master',
      '30s & 15s High-Retention Social Cuts',
      'Kinetic Title Motion Sequences',
      'High-Dynamic-Range Deliverables'
    ],
    challenge: 'Communicating silent electric acceleration through visceral visual tempo rather than standard engine audio roar.',
    solution: 'Cut picture to subsonic bass oscillations and rapid-fire macro reflections of industrial chassis lines, driving higher brand recall than all previous EV benchmark spots.',
    quote: {
      text: 'The edit captures the pure electric sensation—taut, hypnotic, and ruthlessly modern.',
      author: 'Marcus Lindholm',
      role: 'Global Creative Director, Polestar'
    },
    metrics: '4.2M Organic Social Impressions · Clio Automotive Silver'
  },
  {
    id: 'vogue-scandinavia-solitude',
    title: 'Vogue Scandinavia: Solitude Editorial Series',
    client: 'Vogue Scandinavia / Condé Nast',
    year: '2024',
    category: 'editorial',
    categoryLabel: 'Art Direction & Editorial Layout',
    summary: 'A 24-page high-fashion feature exploring desolate Nordic winter landscapes, bespoke serif typesetting, and restrained color palette.',
    image: '/src/assets/images/project_brand_identity_1791613631959.jpg',
    featured: false,
    aspectRatio: 'portrait',
    role: 'Guest Art Director & Layout Designer',
    tools: ['InDesign', 'Photoshop', 'Capture One'],
    deliverables: [
      '24-Page Print Magazine Feature Spread',
      'Digital Interactive Edition Interactive Scroller',
      'Curated Photography Direction & Sequencing',
      'Bespoke Editorial Drop-Cap Glyphs'
    ],
    challenge: 'Balancing oversized haute couture silhouettes against vast snowscapes while keeping the typographic rhythm serene.',
    solution: 'Composed extreme scale contrast between delicate high-contrast serifs and sweeping 2-page photography spreads.',
    quote: {
      text: 'One of our most celebrated cover stories—masterfully paced from the first spread to the closing colophon.',
      author: 'Martina Ekström',
      role: 'Executive Editor, Vogue Scandinavia'
    },
    metrics: 'Sold Out Physical Print Run Across 14 Countries'
  }
];

export const AWARDS_DATA: Award[] = [
  {
    year: '2025',
    award: 'Yellow Pencil · Motion Typography in Space',
    project: 'Kinetic Continuum Installation',
    organization: 'D&AD Global Awards'
  },
  {
    year: '2024',
    award: 'Cannes Lions Bronze · Film Craft & Editing',
    project: 'Nocturne in G Minor',
    organization: 'Cannes Lions International Festival'
  },
  {
    year: '2024',
    award: 'Annual Book Design Distinction',
    project: 'Form & Absence Monograph',
    organization: 'Tokyo Type Directors Club (TDC)'
  },
  {
    year: '2023',
    award: 'Gold Cube · Luxury Brand Identity System',
    project: 'Aetheri Haute Parfumerie',
    organization: 'Art Directors Club (ADC New York)'
  },
  {
    year: '2023',
    award: 'Silver · Automotive Commercial Film Craft',
    project: 'Polestar Pure Velocity',
    organization: 'Clio Awards'
  }
];

export const CLIENTS_DATA: Client[] = [
  { name: 'A24 Films', industry: 'Film & Entertainment', location: 'New York' },
  { name: 'Aetheri Parfums', industry: 'Luxury Goods', location: 'Paris' },
  { name: 'Polestar', industry: 'Automotive Mobility', location: 'Gothenburg' },
  { name: 'Stripe Press', industry: 'Publishing', location: 'San Francisco' },
  { name: 'Vogue Scandinavia', industry: 'Editorial Fashion', location: 'Stockholm' },
  { name: 'Centre Pompidou', industry: 'Museum & Arts', location: 'Paris' },
  { name: 'Acne Studios', industry: 'Fashion House', location: 'Stockholm' },
  { name: 'Monocle', industry: 'Global Affairs & Design', location: 'London' }
];

export const TOOL_STACK = [
  {
    discipline: 'Visual & System Design',
    description: 'Disciplined grid construction, scalable design languages, and bespoke typographic crafts.',
    tools: ['Figma', 'Adobe Illustrator', 'InDesign', 'Glyphs 3', 'Physical Paper Mockups']
  },
  {
    discipline: 'Film Editing & Color Timing',
    description: 'Precision frame cutting, narrative tempo, match action, and analog 35mm photochemical color timing.',
    tools: ['DaVinci Resolve Studio', 'Adobe Premiere Pro', 'Avid Media Composer', 'Kodak 2383 / 250D Print LUTs']
  },
  {
    discipline: 'Motion & Spatial 3D',
    description: 'Kinetic typography, procedural simulation, camera projection mapping, and architectural video.',
    tools: ['Maxon Cinema 4D', 'Adobe After Effects', 'Redshift & Octane Render', 'Blender']
  }
];
