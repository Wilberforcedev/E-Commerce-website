import { Product, Coupon, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AcousticPro ANC Wireless Headphones',
    tagline: 'Pure audiophile sound with 45-hour playback',
    description: 'Immerse yourself in studio-grade acoustics. Powered by 40mm titanium diaphragm drivers, hybrid active noise cancellation, and plush memory-foam earcups designed for all-day comfort.',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.8,
    reviewCount: 142,
    category: 'Audio',
    stock: 24,
    badge: 'BESTSELLER',
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Hybrid ANC with Transparency Ambient Mode',
      'Up to 45 Hours Battery Life with USB-C Quick Charge',
      'Multipoint Bluetooth 5.3 Connection',
      'Custom EQ mobile companion app'
    ],
    specs: {
      'Driver Size': '40mm Titanium',
      'Frequency Response': '20Hz - 40,000Hz',
      'Weight': '255g',
      'Connectivity': 'Bluetooth 5.3 & 3.5mm Aux'
    }
  },
  {
    id: 'prod-2',
    name: 'Horizon Series Mechanical Keyboard',
    tagline: 'Gasket-mounted hot-swap RGB mechanical keyboard',
    description: 'Engineered for seamless productivity and gaming. Featuring pre-lubed linear switches, premium double-shot PBT keycaps, and customizable RGB backlight presets encased in CNC aluminum.',
    price: 129.50,
    originalPrice: 159.00,
    rating: 4.9,
    reviewCount: 98,
    category: 'Electronics',
    stock: 15,
    badge: 'HOT',
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Hot-swappable 3/5 pin switches',
      'Gasket mount architecture for cushioned typing',
      'Tri-mode connectivity: 2.4Ghz, BT 5.0, USB-C',
      'South-facing RGB per-key illumination'
    ],
    specs: {
      'Layout': '75% Compact (82 Keys)',
      'Switch Type': 'Pre-lubed Matcha Linear',
      'Case Material': 'Anodized CNC Aluminum',
      'Battery': '4000mAh Lithium Ion'
    }
  },
  {
    id: 'prod-3',
    name: 'Minimalist Chrono Sapphire Watch',
    tagline: 'Surgical stainless steel with sapphire crystal',
    description: 'Timeless elegance meets modern precision. Swiss quartz movement encased in 316L brushed stainless steel, paired with an interchangeable genuine Italian top-grain leather strap.',
    price: 175.00,
    originalPrice: 220.00,
    rating: 4.7,
    reviewCount: 64,
    category: 'Fashion',
    stock: 18,
    badge: 'SALE',
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Scratch-resistant anti-reflective Sapphire Crystal',
      '5 ATM / 50M Water Resistance',
      'Swiss Ronda Quartz Movement',
      'Interchangeable quick-release strap'
    ],
    specs: {
      'Case Diameter': '40mm',
      'Case Thickness': '7.8mm',
      'Strap Width': '20mm Genuine Leather',
      'Water Resistance': '50 Meters'
    }
  },
  {
    id: 'prod-4',
    name: 'UltraWide Curved 34" Creator Monitor',
    tagline: '144Hz WQHD IPS display with 98% DCI-P3 color',
    description: 'Elevate your workspace. Stunning 3440x1440 resolution with 1900R curvature provides immersive panoramic viewing for creatives, video editors, and power multitaskers.',
    price: 549.99,
    originalPrice: 629.99,
    rating: 4.9,
    reviewCount: 83,
    category: 'Electronics',
    stock: 9,
    badge: 'BESTSELLER',
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '34" 21:9 WQHD 3440 x 1440 Panoramic Screen',
      'Factory Calibrated Delta E < 2',
      'USB-C 90W Power Delivery Hub with KVM switch',
      'HDR400 certification'
    ],
    specs: {
      'Resolution': '3440 x 1440 px',
      'Refresh Rate': '144Hz with FreeSync',
      'Brightness': '400 nits',
      'Ports': '2x HDMI 2.1, 1x DP 1.4, USB-C 90W'
    }
  },
  {
    id: 'prod-5',
    name: 'Urban Transit Waterproof Commuter Backpack',
    tagline: 'Weatherproof ballistic nylon with padded laptop sleeve',
    description: 'Crafted for daily commuters and global travelers. Ergonomic airflow back panel, dedicated 16-inch TSA-approved laptop compartment, and hidden RFID-blocking passport sleeve.',
    price: 89.00,
    originalPrice: 110.00,
    rating: 4.6,
    reviewCount: 112,
    category: 'Fashion',
    stock: 35,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '1000D Cordura weatherproof ballistic fabric',
      'Dedicated suspended 16" laptop cradle',
      'Luggage pass-through strap for rolling suitcases',
      'YKK AquaGuard weather-sealed zippers'
    ],
    specs: {
      'Capacity': '26 Liters',
      'Dimensions': '48 x 30 x 16 cm',
      'Weight': '920g',
      'Material': 'Recycled 1000D Cordura'
    }
  },
  {
    id: 'prod-6',
    name: 'Nordic Ceramic Drip Coffee Carafe Set',
    tagline: 'Handmade matte stoneware with double-wall mesh filter',
    description: 'Transform your morning brewing ritual. High-fired matte stoneware carafe keeps brewed coffee piping hot without altering delicate notes. Includes ultra-fine stainless steel mesh filter.',
    price: 46.00,
    originalPrice: 58.00,
    rating: 4.8,
    reviewCount: 77,
    category: 'Home',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Handcrafted artisan ceramic stoneware',
      'Paperless reusable laser-cut micro mesh filter',
      'Heat-resistant silicone wrap collar',
      'Dishwasher and microwave safe'
    ],
    specs: {
      'Capacity': '800ml (3-4 Cups)',
      'Material': 'Food-safe Lead-Free Ceramic',
      'Filter': '304 Stainless Steel'
    }
  },
  {
    id: 'prod-7',
    name: 'SonicPulse Smart Fitness & Health Tracker',
    tagline: 'Continuous ECG, SpO2, sleep scoring, and 7-day battery',
    description: 'Take charge of your wellness goals. Vibrant AMOLED touch display tracking 120+ sport modes, heart rhythm variations, oxygen saturation, and sleep cycles with precision.',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.5,
    reviewCount: 156,
    category: 'Fitness',
    stock: 40,
    badge: 'SALE',
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '1.47" Curved HD AMOLED Always-On Screen',
      'All-day continuous Heart Rate and SpO2 Monitoring',
      '50m Water Resistance (Swim Proof)',
      'Syncs with Apple Health & Google Fit'
    ],
    specs: {
      'Battery Life': 'Up to 10 Days typical use',
      'Waterproof': '5 ATM',
      'Weight': '29g with strap',
      'Compatibility': 'iOS 12+ and Android 8+'
    }
  },
  {
    id: 'prod-8',
    name: 'AromaZen Ultrasonic Essential Oil Diffuser',
    tagline: 'Whisper-quiet ceramic aromatherapy with warm ambient glow',
    description: 'Infuse your home with calming botanicals. Handcrafted porcelain cover with ultrasonic micro-mist technology that naturally purifies and hydrates your interior air.',
    price: 38.50,
    originalPrice: 48.00,
    rating: 4.7,
    reviewCount: 92,
    category: 'Home',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Handcrafted natural ceramic stone shell',
      'Two mist modes: continuous 4hr or intermittent 8hr',
      'Auto shut-off when water reservoir depletes',
      'Warm LED mood light setting'
    ],
    specs: {
      'Water Tank': '160ml',
      'Noise Level': '< 20dB Whisper Quiet',
      'Coverage Area': 'Up to 300 sq ft'
    }
  },
  {
    id: 'prod-9',
    name: 'StudioOne Professional USB-C Microphone',
    tagline: 'Broadcast condenser capsule for podcasts and streaming',
    description: 'Crystal clear vocals right out of the box. Zero-latency headphone monitoring, physical gain dial, tap-to-mute with RGB indicator, and internal pop filter.',
    price: 119.00,
    originalPrice: 149.00,
    rating: 4.8,
    reviewCount: 54,
    category: 'Audio',
    stock: 14,
    badge: 'NEW',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '24-bit/96kHz high-resolution studio recording',
      'Cardioid pickup pattern minimizes room noise',
      'Zero-latency 3.5mm direct headphone monitor',
      'Heavy-duty weighted desk stand with shock mount'
    ],
    specs: {
      'Sample Rate': '96 kHz / 24-bit',
      'Polar Pattern': 'Cardioid',
      'Connection': 'USB-C to USB-A/C',
      'Cable Length': '2.0m'
    }
  },
  {
    id: 'prod-10',
    name: 'Apex Grip Pro Eco Yoga Mat',
    tagline: 'Natural tree rubber with wet-grip polyurethane surface',
    description: 'Maximum stability through every pose. Non-slip alignment laser guides, 5mm dense cushioning for joint support, made from non-toxic biodegradable natural tree rubber.',
    price: 64.00,
    originalPrice: 78.00,
    rating: 4.9,
    reviewCount: 135,
    category: 'Fitness',
    stock: 28,
    badge: 'BESTSELLER',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Superior grip even during sweaty hot yoga sessions',
      'Laser-etched body alignment lines',
      'Eco-friendly sustainable natural rubber',
      'Includes complimentary carrying harness'
    ],
    specs: {
      'Dimensions': '185cm x 68cm',
      'Thickness': '5mm high density',
      'Weight': '2.5kg'
    }
  },
  {
    id: 'prod-11',
    name: 'Lumina MagSafe Wireless Charging Stand',
    tagline: '3-in-1 Fast Charging Station for iPhone, Watch & AirPods',
    description: 'Clean up desk cord clutter. Strong magnetic alignment powers your phone at up to 15W while simultaneous dedicated charging pads handle your smartwatch and wireless earbuds.',
    price: 52.00,
    originalPrice: 65.00,
    rating: 4.6,
    reviewCount: 88,
    category: 'Electronics',
    stock: 32,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      'Official Qi-certified fast magnetic charging',
      'Simultaneous 3-device charging footprint',
      'Adjustable viewing angle for FaceTime or StandBy mode',
      'Overheating & foreign object protection built-in'
    ],
    specs: {
      'Input': 'USB-C 30W Adapter included',
      'Output': '15W Phone + 5W Watch + 5W Buds',
      'Base': 'Weighted Zinc Alloy'
    }
  },
  {
    id: 'prod-12',
    name: 'Veloce Polarized Sport Sunglasses',
    tagline: 'Ultralight TR90 frame with UV400 hydrophobic lenses',
    description: 'Built for cycling, running, and driving. Shatterproof polycarbonate lenses eliminate glare, enhance contrast, and stay securely anchored through vigorous movement.',
    price: 49.00,
    originalPrice: 69.00,
    rating: 4.7,
    reviewCount: 47,
    category: 'Fashion',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    features: [
      '100% UV400 protection against UVA/UVB rays',
      'Featherlight Swiss TR90 thermoplastic frame (26g)',
      'Hydrophilic rubber nosepads that grip tighter as you sweat',
      'Hard shell case & microfiber cleaning pouch included'
    ],
    specs: {
      'Lens': 'Polarized HD Polycarbonate',
      'Frame': 'TR90 Swiss Material',
      'Weight': '26g'
    }
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    description: '10% off your entire first order'
  },
  {
    code: 'SAVE25',
    discountAmount: 25,
    minSpend: 150,
    description: '$25 off orders above $150'
  },
  {
    code: 'FREESHIP',
    freeShipping: true,
    description: 'Free expedited delivery on all orders'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8812',
    orderNumber: 'NM-2026-8812',
    date: '2026-09-21T14:32:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[5],
        quantity: 2
      }
    ],
    subtotal: 291.99,
    discount: 29.20,
    shipping: 0,
    tax: 18.40,
    total: 281.19,
    status: 'Shipped',
    shippingAddress: {
      fullName: 'Wilberforce Dev',
      email: 'wilberofficial2001@gmail.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States'
    },
    paymentMethod: 'Credit Card (ending in 4242)',
    estimatedDelivery: 'Sep 25, 2026',
    trackingNumber: 'TRK-984120491',
    carrier: 'FedEx Express'
  },
  {
    id: 'ord-8813',
    orderNumber: 'NM-2026-8813',
    date: '2026-09-22T10:15:00Z',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1
      }
    ],
    subtotal: 129.50,
    discount: 0,
    shipping: 9.99,
    tax: 10.36,
    total: 149.85,
    status: 'Processing',
    shippingAddress: {
      fullName: 'Wilberforce Dev',
      email: 'wilberofficial2001@gmail.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      postalCode: '97477',
      country: 'United States'
    },
    paymentMethod: 'PayPal Express',
    estimatedDelivery: 'Sep 27, 2026',
    trackingNumber: 'TRK-Pending',
    carrier: 'DHL Standard'
  }
];

export const CATEGORIES = [
  'All',
  'Audio',
  'Electronics',
  'Fashion',
  'Home',
  'Fitness'
];
