export const places = [
  {
    id: "1",
    name: { en: "Choyxona №1", uz: "Choyxona №1" },
    category: "restaurants",
    address: { en: "15 Amir Temur Ave, Tashkent", uz: "Toshkent, Amir Temur shoh. 15" },
    phone: "+998 71 123 4567",
    description: {
      en: "A legendary Uzbek tea house serving traditional plov, shashlik, and lagman in a beautiful garden setting.",
      uz: "An'anaviy palov, shashlik va lag'mon taklif etadigan mashhur choyxona.",
    },
    rating: 4.7,
    reviewCount: 312,
    lat: 41.31017,
    lon: 69.27994,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
    hours: "08:00 – 23:00",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r1", author: "Aziz T.", rating: 5, text: "Best plov in all of Tashkent! Incredible atmosphere.", date: "2025-03-10" },
      { id: "r2", author: "Malika R.", rating: 4, text: "Love the garden setting. A bit crowded on weekends.", date: "2025-02-28" },
      { id: "r3", author: "Jasur K.", rating: 5, text: "Authentic flavors, great service. Will definitely return.", date: "2025-01-15" },
    ],
  },
  {
    id: "2",
    name: { en: "Karavan Restaurant", uz: "Karavan Restoran" },
    category: "restaurants",
    address: { en: "3 Mustaqillik Sq, Tashkent", uz: "Toshkent, Mustaqillik maydoni 3" },
    phone: "+998 71 234 5678",
    description: {
      en: "Upscale Uzbek cuisine with stunning architecture inspired by the Silk Road.",
      uz: "Ipak yo'lidan ilhom olgan me'morchilik bilan zamonaviy o'zbek oshxonasi.",
    },
    rating: 4.5,
    reviewCount: 198,
    lat: 41.29861,
    lon: 69.27972,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    hours: "11:00 – 24:00",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r4", author: "Dilnoza A.", rating: 5, text: "Gorgeous interior, the samsa and shurpa were outstanding!", date: "2025-03-05" },
      { id: "r5", author: "Bobur M.", rating: 4, text: "Pricey but worth it for special occasions.", date: "2025-02-14" },
    ],
  },
  {
    id: "3",
    name: { en: "AutoPro Service Center", uz: "AutoPro Xizmat Markazi" },
    category: "auto",
    address: { en: "22 Yunusabad District, Tashkent", uz: "Toshkent, Yunusobod, 22" },
    phone: "+998 93 345 6789",
    description: {
      en: "Professional auto repair and maintenance for all car brands. Fast diagnostics, honest pricing.",
      uz: "Barcha rusumli avtomobillarga professional ta'mirlash va texnik xizmat.",
    },
    rating: 4.4,
    reviewCount: 87,
    lat: 41.35510,
    lon: 69.33800,
    image: "https://images.unsplash.com/photo-1570611640714-22ee9b18d671?w=800&q=80",
    hours: "08:00 – 20:00",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r6", author: "Sherzod B.", rating: 5, text: "Fixed my transmission in one day. Fair price!", date: "2025-03-01" },
      { id: "r7", author: "Nodir V.", rating: 4, text: "Good service, a bit of a wait but they did a thorough job.", date: "2025-01-20" },
    ],
  },
  {
    id: "4",
    name: { en: "Medline Clinic", uz: "Medline Klinikasi" },
    category: "health",
    address: { en: "7 Chilanzar District, Tashkent", uz: "Toshkent, Chilonzor, 7" },
    phone: "+998 71 456 7890",
    description: {
      en: "Full-service private clinic with cardiology, dentistry, and general medicine departments.",
      uz: "Kardiologiya, stomatologiya va umumiy tibbiyot bo'limlari mavjud xususiy klinika.",
    },
    rating: 4.6,
    reviewCount: 143,
    lat: 41.28961,
    lon: 69.19350,
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    hours: "08:00 – 22:00",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r8", author: "Feruza O.", rating: 5, text: "Modern equipment and very professional doctors.", date: "2025-02-22" },
      { id: "r9", author: "Hamid N.", rating: 4, text: "Clean and organized. Wait times could be shorter.", date: "2025-01-10" },
    ],
  },
  {
    id: "5",
    name: { en: "Chimgan Adventure Park", uz: "Chimgan Sarguzasht Parki" },
    category: "activities",
    address: { en: "Chimgan Village, Tashkent Region", uz: "Toshkent viloyati, Chimgan qishlog'i" },
    phone: "+998 90 567 8901",
    description: {
      en: "Thrilling outdoor activities including zip-lining, rock climbing, and quad biking in the Tian Shan mountains.",
      uz: "Tyan Shan tog'larida ziplining, alpinizm va kvadrotsiklda sayohat.",
    },
    rating: 4.8,
    reviewCount: 256,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    hours: "09:00 – 18:00",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r10", author: "Sanjar A.", rating: 5, text: "Absolutely breathtaking views. The zip line is a must!", date: "2025-02-28" },
      { id: "r11", author: "Zulfiya K.", rating: 5, text: "Perfect day trip from Tashkent. Highly recommended!", date: "2025-02-15" },
    ],
  },
  {
    id: "6",
    name: { en: "Champions Fitness Club", uz: "Champions Fitness Klubu" },
    category: "sports",
    address: { en: "14 Mirzo Ulugbek St, Tashkent", uz: "Toshkent, Mirzo Ulug'bek ko'chasi, 14" },
    phone: "+998 71 678 9012",
    description: {
      en: "State-of-the-art gym with Olympic pool, tennis courts, and personal training services.",
      uz: "Olimpiya havzi, tennis kortlari va shaxsiy murabbiylik xizmatlari mavjud zamonaviy sport zali.",
    },
    rating: 4.3,
    reviewCount: 118,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    hours: "06:00 – 23:00",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r12", author: "Timur R.", rating: 4, text: "Great equipment and the pool is very clean.", date: "2025-03-08" },
    ],
  },
  {
    id: "7",
    name: { en: "Beldersay Nature Reserve", uz: "Beldersay Tabiat Qo'riqxonasi" },
    category: "tabiat",
    address: { en: "Beldersay, Tashkent Region", uz: "Toshkent viloyati, Beldersay" },
    phone: "+998 90 789 0123",
    description: {
      en: "Stunning alpine meadows and ski resort in winter. Perfect for hiking and picnics in summer.",
      uz: "Qishda ski-kurort, yozda piyoda sayohat va piknik uchun ajoyib alp o'tloqlari.",
    },
    rating: 4.9,
    reviewCount: 389,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    hours: "Always open",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r13", author: "Barno L.", rating: 5, text: "The most beautiful place near Tashkent. Pure air!", date: "2025-02-01" },
      { id: "r14", author: "Eldor P.", rating: 5, text: "Incredible skiing in winter. Facilities are well maintained.", date: "2025-01-28" },
    ],
  },
  {
    id: "8",
    name: { en: "SamarkandAuto Detailing", uz: "SamarkandAuto Detal" },
    category: "auto",
    address: { en: "45 Registan Area, Samarkand", uz: "Samarqand, Registon, 45" },
    phone: "+998 93 890 1234",
    description: {
      en: "Premium car washing, polishing, and interior detailing services in Samarkand.",
      uz: "Samarqanddagi premium avtomobil yuvish, parlatish va ichki tozalash xizmatlari.",
    },
    rating: 4.2,
    reviewCount: 64,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    hours: "09:00 – 20:00",
    isOpen: false,
    featured: false,
    reviews: [
      { id: "r15", author: "Oybek A.", rating: 4, text: "Car looked brand new. Good price.", date: "2025-03-02" },
    ],
  },
  {
    id: "9",
    name: { en: "Green Valley Resort", uz: "Yashil Vodiy Kurortu" },
    category: "tabiat",
    address: { en: "Parkent District, Tashkent Region", uz: "Toshkent viloyati, Parkent tumani" },
    phone: "+998 71 901 2345",
    description: {
      en: "Eco-resort among walnut forests with bungalows, fishing, and guided nature walks.",
      uz: "Yong'oqzorlar orasidagi eko-kurort: bungalolar, baliq ovi va tabiat sayohatlari.",
    },
    rating: 4.6,
    reviewCount: 201,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    hours: "24/7",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r16", author: "Nilufar S.", rating: 5, text: "Perfect weekend escape. Very peaceful and clean.", date: "2025-02-10" },
      { id: "r17", author: "Kamol T.", rating: 4, text: "The bungalows are cozy. Great fishing spots!", date: "2024-12-20" },
    ],
  },
  {
    id: "10",
    name: { en: "Vita Health Center", uz: "Vita Sog'liq Markazi" },
    category: "health",
    address: { en: "88 Navoi St, Tashkent", uz: "Toshkent, Navoiy ko'chasi, 88" },
    phone: "+998 71 012 3456",
    description: {
      en: "Holistic wellness center offering physiotherapy, massage, and nutritional counseling.",
      uz: "Fiziотерапия, massaj va ovqatlanish bo'yicha maslahat taklif etuvchi kompleks sog'liqni saqlash markazi.",
    },
    rating: 4.4,
    reviewCount: 92,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    hours: "09:00 – 21:00",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r18", author: "Gulnora B.", rating: 5, text: "The physiotherapy really helped my back pain.", date: "2025-03-09" },
    ],
  },
  {
    id: "11",
    name: { en: "AquaSport Club", uz: "AquaSport Klubu" },
    category: "sports",
    address: { en: "12 Sergeli District, Tashkent", uz: "Toshkent, Sergeli tumani, 12" },
    phone: "+998 90 123 4567",
    description: {
      en: "Olympic swimming pool with swimming lessons for all ages, water polo, and diving classes.",
      uz: "Barcha yoshlar uchun suzish darslari, suv polo va sho'ng'in darslari bilan olimpiya havzi.",
    },
    rating: 4.1,
    reviewCount: 77,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    hours: "07:00 – 22:00",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r19", author: "Ravshan U.", rating: 4, text: "Clean pool, excellent instructors for kids.", date: "2025-03-11" },
    ],
  },
  {
    id: "12",
    name: { en: "Plov Center Samarkand", uz: "Samarqand Palov Markazi" },
    category: "restaurants",
    address: { en: "1 Registan Sq, Samarkand", uz: "Samarqand, Registon maydoni, 1" },
    phone: "+998 66 234 5678",
    description: {
      en: "Famous for its authentic Samarkand-style plov cooked in a giant kazan every morning.",
      uz: "Har ertalab katta qozonda pishirilgan haqiqiy samarqand palov bilan mashhur.",
    },
    rating: 4.8,
    reviewCount: 445,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    hours: "07:00 – 14:00",
    isOpen: false,
    featured: true,
    reviews: [
      { id: "r20", author: "Murod K.", rating: 5, text: "The best plov I've ever had. Worth the drive to Samarkand!", date: "2025-02-25" },
      { id: "r21", author: "Sitora A.", rating: 5, text: "Authentic taste, generous portions. Come early!", date: "2025-01-30" },
    ],
  },
  {
    id: "13",
    name: { en: "TrekUz Adventures", uz: "TrekUz Sarguzashtlari" },
    category: "activities",
    address: { en: "Nurata Mountain Area, Navoi Region", uz: "Navoiy viloyati, Nurota tog' massiyi" },
    phone: "+998 91 345 6789",
    description: {
      en: "Guided multi-day treks through the Nurata mountains with yurt camp stays.",
      uz: "Yurt lagerlarida tunar bilan Nurota tog'lari orqali ko'p kunlik sayohatlar.",
    },
    rating: 4.7,
    reviewCount: 133,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    hours: "By appointment",
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r22", author: "Alex W.", rating: 5, text: "Life-changing experience. The guides were amazing!", date: "2025-02-18" },
    ],
  },
  {
    id: "14",
    name: { en: "U-Cafe", uz: "U-Cafe" },
    category: "restaurants",
    address: { en: "IT Park Uzbekistan, Mirzo Ulugbek District, Tashkent", uz: "Toshkent, Mirzo Ulug'bek tumani, IT Park O'zbekiston" },
    phone: "+998 71 200 0014",
    description: {
      en: "A cozy modern café inside IT Park Uzbekistan — the perfect spot for developers, designers, and tech enthusiasts. Great coffee, fresh pastries, and a productive atmosphere.",
      uz: "IT Park O'zbekiston ichidagi zamonaviy va qulay kafe — dasturchilar, dizaynerlar va texnologiya ishqibozlari uchun ideal joy. Ajoyib qahva, yangi pishiriqlar va samarali muhit.",
    },
    rating: 4.6,
    reviewCount: 74,
    lat: 41.34107,
    lon: 69.33744,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    hours: "08:00 – 22:00",
    isOpen: true,
    featured: true,
    reviews: [
      { id: "r23", author: "Sardor M.", rating: 5, text: "Best latte in the IT Park area. Love the minimalist vibe!", date: "2025-03-20" },
      { id: "r24", author: "Kamola N.", rating: 4, text: "Great place to work from. Fast Wi-Fi and friendly staff.", date: "2025-03-14" },
      { id: "r25", author: "Bobur T.", rating: 5, text: "Freshly baked croissants every morning. Will definitely be back.", date: "2025-02-28" },
    ],
  },
]

export function getPlaceById(id) {
  return places.find((p) => p.id === id) || null
}

export function getPlacesByCategory(category) {
  if (!category || category === "all") return places
  return places.filter((p) => p.category === category)
}

export function getFeaturedPlaces() {
  return places.filter((p) => p.featured)
}

export function getTopRated(limit = 5) {
  return [...places].sort((a, b) => b.rating - a.rating).slice(0, limit)
}

export function searchPlaces(query, category) {
  let result = category && category !== "all" ? places.filter((p) => p.category === category) : [...places]
  if (query) {
    const q = query.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.uz.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q)
    )
  }
  return result
}
