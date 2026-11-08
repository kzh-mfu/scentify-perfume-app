import { ScentFamily, CartItem, OrderDetails } from '../types';

export const SCENT_FAMILIES: ScentFamily[] = [
  {
    id: 'citrus',
    number: '01',
    name: 'Citrus',
    subtitle: 'Bright · sparkling',
    description: 'Bright, fresh notes that uplift and energize. A luminous beginning to your story.',
    notes: ['BERGAMOT', 'LEMON', 'GRAPEFRUIT', 'ORANGE'],
    image: '/assets/botanicals/citrus.png',
    ingredients: [
      { id: 'bergamot', name: 'Bergamot', description: 'Elegant citrus with a soft floral edge', familyId: 'citrus', familyName: 'Citrus', isPopular: true },
      { id: 'lemon', name: 'Lemon', description: 'Crisp, clean and luminous', familyId: 'citrus', familyName: 'Citrus' },
      { id: 'grapefruit', name: 'Grapefruit', description: 'Zesty with a gentle bitter finish', familyId: 'citrus', familyName: 'Citrus' },
      { id: 'orange', name: 'Orange', description: 'Sweet sun-drenched Mediterranean citrus', familyId: 'citrus', familyName: 'Citrus' },
    ]
  },
  {
    id: 'floral',
    number: '02',
    name: 'Floral',
    subtitle: 'Soft · expressive',
    description: 'Elegant blooms that add depth and emotion. Timeless, expressive, endlessly personal.',
    notes: ['ROSE', 'JASMINE', 'YLANG YLANG', 'LAVENDER'],
    image: '/assets/botanicals/floral.png',
    ingredients: [
      { id: 'rose', name: 'Rose', description: 'Velvety petals with romantic warmth', familyId: 'floral', familyName: 'Floral' },
      { id: 'jasmine', name: 'Jasmine', description: 'Rich white florals with a warm finish', familyId: 'floral', familyName: 'Floral', isPopular: true },
      { id: 'ylang-ylang', name: 'Ylang Ylang', description: 'Creamy and sunlit floral notes', familyId: 'floral', familyName: 'Floral' },
      { id: 'lavender', name: 'Lavender', description: 'French high-altitude herbaceous blossoms', familyId: 'floral', familyName: 'Floral' },
    ]
  },
  {
    id: 'woody',
    number: '03',
    name: 'Woody',
    subtitle: 'Warm · grounded',
    description: 'Warm, grounding notes that linger. A lasting impression that feels like you.',
    notes: ['SANDALWOOD', 'CEDARWOOD', 'VETIVER', 'OUD'],
    image: '/assets/botanicals/woody.png',
    ingredients: [
      { id: 'sandalwood', name: 'Sandalwood', description: 'Smooth, creamy and quietly warm', familyId: 'woody', familyName: 'Woody', isPopular: true },
      { id: 'cedarwood', name: 'Cedarwood', description: 'Dry, clean, grounding wood', familyId: 'woody', familyName: 'Woody' },
      { id: 'vetiver', name: 'Vetiver', description: 'Earthy roots with a smoky edge', familyId: 'woody', familyName: 'Woody' },
      { id: 'oud', name: 'Oud', description: 'Rare resinous agarwood with deep sophistication', familyId: 'woody', familyName: 'Woody' },
    ]
  },
  {
    id: 'fruity',
    number: '04',
    name: 'Fruity',
    subtitle: 'Juicy · luminous',
    description: 'Vibrant fruit nectar with delicate sweetness, evoking sunlit orchards and rare harvests.',
    notes: ['PEACH', 'RASPBERRY', 'MANGO', 'BLACKCURRANT'],
    image: '/assets/botanicals/fruity.png',
    ingredients: [
      { id: 'peach', name: 'Peach', description: 'Velvety sweet nectar with soft floral nuances', familyId: 'fruity', familyName: 'Fruity' },
      { id: 'raspberry', name: 'Raspberry', description: 'Tart ruby brightness with playful depth', familyId: 'fruity', familyName: 'Fruity' },
      { id: 'mango', name: 'Mango', description: 'Lush tropical sweetness with green facets', familyId: 'fruity', familyName: 'Fruity' },
      { id: 'blackcurrant', name: 'Blackcurrant', description: 'Deep cassis berries with crisp acidity', familyId: 'fruity', familyName: 'Fruity' },
    ]
  },
  {
    id: 'sweet',
    number: '05',
    name: 'Sweet',
    subtitle: 'Softly indulgent',
    description: 'Warm gourmand harmonies that wrap around the skin like cashmere silk.',
    notes: ['VANILLA', 'AMBER', 'TONKA BEAN', 'MUSK'],
    image: '/assets/botanicals/sweet.png',
    ingredients: [
      { id: 'vanilla', name: 'Vanilla', description: 'Madagascar planifolia orchid pods with rich warmth', familyId: 'sweet', familyName: 'Sweet' },
      { id: 'amber', name: 'Amber', description: 'Golden resinous warmth with powdery honeyed glow', familyId: 'sweet', familyName: 'Sweet' },
      { id: 'tonka-bean', name: 'Tonka Bean', description: 'Almond, coumarin and toasted praline facets', familyId: 'sweet', familyName: 'Sweet' },
      { id: 'musk', name: 'Musk', description: 'Clean sensual second-skin warmth and staying power', familyId: 'sweet', familyName: 'Sweet' },
    ]
  },
  {
    id: 'fresh',
    number: '06',
    name: 'Fresh',
    subtitle: 'Clean · awakening',
    description: 'Crisp mountain air, dew drops on wild herbs, and crystalline ocean breezes.',
    notes: ['MINT', 'GREEN TEA', 'EUCALYPTUS', 'AQUATIC ACCORD'],
    image: '/assets/botanicals/fresh.png',
    ingredients: [
      { id: 'mint', name: 'Mint', description: 'Crushed spearmint leaves with frosty cooling breeze', familyId: 'fresh', familyName: 'Fresh' },
      { id: 'green-tea', name: 'Green Tea', description: 'Steeped sencha leaves with zen botanical calm', familyId: 'fresh', familyName: 'Fresh' },
      { id: 'eucalyptus', name: 'Eucalyptus', description: 'Aromatic therapeutic freshness with silver leaves', familyId: 'fresh', familyName: 'Fresh' },
      { id: 'aquatic-accord', name: 'Aquatic Accord', description: 'Pure mineral sea spray and rain on coastal stone', familyId: 'fresh', familyName: 'Fresh' },
    ]
  }
];

export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'item-custom-1',
    title: 'Custom Blend',
    subtitle: 'Bergamot · Jasmine · Oud · 50 ml',
    description: 'Personal bespoke fragrance handcrafted in our Chiang Rai studio',
    price: 1680,
    quantity: 1,
    image: '/assets/botanicals/woody.png',
    details: {
      notes: ['Bergamot', 'Jasmine', 'Oud'],
      size: '50 ml'
    }
  },
  {
    id: 'item-sig-1',
    title: 'Signature Bottle',
    subtitle: 'Oud · 30 ml',
    description: 'A warm finishing note for your personal collection',
    price: 522,
    quantity: 2,
    image: '/assets/botanicals/woody.png',
    details: {
      notes: ['Oud'],
      size: '30 ml'
    }
  }
];

export const INITIAL_ORDER: OrderDetails = {
  orderId: 'LM-2026-0042',
  customerName: '',
  address: '123 Riverside Road, Muang District',
  city: 'Chiang Rai',
  province: 'Chiang Rai',
  postalCode: '57000',
  country: 'Thailand',
  phone: '+66 91 234 5678',
  items: [...INITIAL_CART_ITEMS],
  subtotal: 2202,
  shipping: 0,
  tax: 0,
  discount: 0,
  total: 2202,
  status: 'awaiting_confirmation',
  perfumerNote: '“The final blend has been balanced to keep the Bergamot bright, the Jasmine soft, and the Oud warm without overpowering the floral heart.”'
};

export const CATALOG_PERFUMES = [
  {
    id: 'sig-bergamot-aurore',
    name: "L'Aurore Citrus",
    subtitle: 'Calabrian Bergamot · Crisp Lemon · White Amber',
    family: 'Citrus',
    topNotes: ['Bergamot', 'Lemon', 'Grapefruit'],
    heartNotes: ['Green Tea', 'Orange Blossom'],
    baseNotes: ['White Amber', 'Cedarwood'],
    price: 1850,
    size: '50 ml',
    description: 'An effervescent morning mist through Italian citrus groves. Crisp, crystalline, and delicately grounded by amber warmth.',
    image: '/assets/botanicals/citrus.png',
    mood: 'Luminous · Uplifting · Awakening'
  },
  {
    id: 'sig-jasmine-nocturne',
    name: 'Jasmine Nocturne',
    subtitle: 'Sambac Jasmine · Moroccan Rose · Sandalwood',
    family: 'Floral',
    topNotes: ['Bergamot', 'Mandarin'],
    heartNotes: ['Jasmine', 'Rose', 'Ylang Ylang'],
    baseNotes: ['Sandalwood', 'Musk'],
    price: 2100,
    size: '50 ml',
    description: 'Harvested at dusk when Sambac blooms release their deepest intoxicating nectar. Velvety, poetic, and intimately radiant.',
    image: '/assets/botanicals/floral.png',
    mood: 'Romantic · Expressive · Velvet'
  },
  {
    id: 'sig-oud-santal',
    name: 'Oud Santal Éthéré',
    subtitle: 'Aged Agarwood · Mysore Sandalwood · Smoky Vetiver',
    family: 'Woody',
    topNotes: ['Pink Pepper', 'Grapefruit'],
    heartNotes: ['Cedarwood', 'Cardamom'],
    baseNotes: ['Oud', 'Sandalwood', 'Vetiver'],
    price: 2450,
    size: '50 ml',
    description: 'Rare wild agarwood intertwined with smooth creamy sandalwood and root vetiver. A quiet, contemplative aura of profound elegance.',
    image: '/assets/botanicals/woody.png',
    mood: 'Grounded · Aristocratic · Warm'
  },
  {
    id: 'sig-verger-dore',
    name: 'Verger Doré',
    subtitle: 'Ripe White Peach · Ruby Raspberry · Vanilla Pod',
    family: 'Fruity',
    topNotes: ['Peach', 'Blackcurrant'],
    heartNotes: ['Raspberry', 'Mango', 'Magnolia'],
    baseNotes: ['Vanilla', 'Tonka Bean'],
    price: 1750,
    size: '50 ml',
    description: 'Sun-drenched orchard fruit picked at the height of summer. Juicy nectar rounded by velvety vanilla softness.',
    image: '/assets/botanicals/fruity.png',
    mood: 'Vibrant · Juicy · Playful'
  },
  {
    id: 'sig-ambre-cachemire',
    name: 'Ambre Cachemire',
    subtitle: 'Madagascar Vanilla · Warm Amber · Tonka Bean',
    family: 'Sweet',
    topNotes: ['Orange Zest', 'Bergamot'],
    heartNotes: ['Tonka Bean', 'Heliotrope'],
    baseNotes: ['Amber', 'Vanilla', 'Musk'],
    price: 1980,
    size: '50 ml',
    description: 'Enveloping like pure cashmere silk beside a crackling hearth. Honeyed golden resins blended with Madagascar planifolia orchid.',
    image: '/assets/botanicals/sweet.png',
    mood: 'Comforting · Sensual · Golden'
  },
  {
    id: 'sig-brume-marine',
    name: 'Brume Marine & Sencha',
    subtitle: 'Japanese Green Tea · Wild Mint · Mineral Sea Spray',
    family: 'Fresh',
    topNotes: ['Mint', 'Eucalyptus', 'Lemon'],
    heartNotes: ['Green Tea', 'Lotus Flower'],
    baseNotes: ['Aquatic Accord', 'Driftwood', 'White Musk'],
    price: 1800,
    size: '50 ml',
    description: 'A breath of crisp ocean air rushing across cliffside cedar and wild herbs after mountain rain. Pure, awakening clarity.',
    image: '/assets/botanicals/fresh.png',
    mood: 'Clean · Crisp · Awakening'
  }
];