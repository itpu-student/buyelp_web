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
    images: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=80",
      "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=800&q=80",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
    ],
    weeklyHours: {
      mon: "08:00 – 23:00",
      tue: "08:00 – 23:00",
      wed: "08:00 – 23:00",
      thu: "08:00 – 23:00",
      fri: "08:00 – 23:00",
      sat: "09:00 – 00:00",
      sun: "09:00 – 22:00",
    },
    isOpen: true,
    featured: true,
    reviews: [
      {
        id: "r1",
        author: "Aziz T.",
        rating: 5,
        text: "Hands down the best plov I've ever had in all of Tashkent. The rice is perfectly cooked — each grain separate and fragrant with cumin and barberry. The lamb was fall-off-the-bone tender. Sat in the garden under the grape vines and it felt like stepping back in time. The staff were warm and unhurried, which I really appreciated. Already planning my next visit!",
        date: "2025-03-10",
        media: [
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
        ],
      },
      {
        id: "r2",
        author: "Malika R.",
        rating: 4,
        text: "Love the garden setting — it's genuinely one of the most charming outdoor dining spaces in the city. The shashlik skewers were smoky and juicy, and the non bread straight from the tandir was phenomenal. Only reason I'm giving 4 stars instead of 5 is that it gets quite crowded on Friday evenings and the wait for a table was nearly 30 minutes. Definitely come early or book ahead on weekends.",
        date: "2025-02-28",
        media: [
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
          "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80",
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
          "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&q=80",
        ],
      },
      {
        id: "r3",
        author: "Jasur K.",
        rating: 5,
        text: "Authentic flavors that take you straight to your grandmother's kitchen. The lagman soup was rich and hearty, with hand-pulled noodles and a broth that tasted like it had been simmering for hours. Great service — our waiter checked in without being intrusive and made excellent recommendations. The samsa pastries as a starter were crisp and perfectly spiced. Will definitely be returning with family.",
        date: "2025-01-15",
        media: [
          "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80",
          "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&q=80",
        ],
      },
      {
        id: "r1a",
        author: "Lola B.",
        rating: 5,
        text: "We celebrated my husband's birthday here and the team went above and beyond. They set up a corner of the garden with a little surprise cake and brought out fresh fruit without us asking. The manti dumplings were enormous and filled generously with spiced minced meat. Honestly the whole evening felt special. The fairy lights strung through the garden at night create a magical atmosphere. Cannot recommend highly enough.",
        date: "2025-03-22",
        media: [
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
          "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
        ],
      },
      {
        id: "r1b",
        author: "Timur N.",
        rating: 4,
        text: "Really solid traditional Uzbek food in a beautiful setting. I ordered the dimlama (vegetable and meat stew) which was warming and full of flavour. Portion sizes are very generous — I couldn't finish my plate. The only minor issue was that the tea took a while to arrive and was lukewarm by the time it came. Everything else was excellent though, including the freshly squeezed apricot juice. Would come back.",
        date: "2025-03-01",
        media: [
          "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80",
        ],
      },
      {
        id: "r1c",
        author: "Sarvar O.",
        rating: 3,
        text: "The food itself is genuinely tasty and the ambience is lovely, but I had a frustrating experience with the billing — we were charged for a dish we didn't order and it took a while to get it corrected. When it was sorted out the manager was apologetic. I'd probably give it another shot because the plov really is exceptional, but it dampened the experience a bit. Hopefully just a one-off.",
        date: "2025-02-10",
        media: [],
      },
      {
        id: "r1d",
        author: "Yulduz M.",
        rating: 5,
        text: "Came here on a friend's recommendation and I completely understand the hype now. The garden is absolutely stunning in spring — flowers everywhere and the sound of a small fountain in the background. We ordered the full spread: plov, shashlik, samsa, lagman, and chak-chak for dessert. Everything was excellent. The staff were friendly and patient with our large group of 10. Prices are reasonable for the quality. This is my new favourite place in Tashkent.",
        date: "2025-04-02",
        media: [
          "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80",
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
          "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
        ],
      },
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
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
      "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
      "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
    ],
    weeklyHours: {
      mon: "11:00 – 24:00",
      tue: "11:00 – 24:00",
      wed: "11:00 – 24:00",
      thu: "11:00 – 24:00",
      fri: "11:00 – 01:00",
      sat: "12:00 – 02:00",
      sun: "12:00 – 23:00",
    },
    isOpen: true,
    featured: true,
    reviews: [
      {
        id: "r4",
        author: "Dilnoza A.",
        rating: 5,
        text: "Karavan is in a league of its own when it comes to ambience. Walking in feels like entering a caravanserai from the Silk Road era — the arched ceilings, intricate tilework, and hanging lanterns are breathtaking. But the food matches the setting: the samsa were golden and flaky with a juicy minced lamb filling, and the shurpa broth was deeply flavoured with vegetables and fragrant herbs. Service was attentive and polished. A real gem.",
        date: "2025-03-05",
        media: [
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
        ],
      },
      {
        id: "r5",
        author: "Bobur M.",
        rating: 4,
        text: "Yes, it's pricey by Tashkent standards, but for a special occasion it's absolutely worth it. Took my wife here for our anniversary and the staff organised a beautiful table by the courtyard fountain. The kebab platter for two was outstanding — tender, smoky, and perfectly seasoned. The wine list is also surprisingly good with some decent Georgian options. Would have given 5 stars but the dessert menu felt a bit thin.",
        date: "2025-02-14",
        media: [
          "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&q=80",
        ],
      },
      {
        id: "r5a",
        author: "Kamola Y.",
        rating: 5,
        text: "I've been to a lot of upscale restaurants in Central Asia and Karavan sits right at the top. The bread basket alone — different types of non, breadsticks, and lavash — was enough to make me happy. Then the tandoor-baked quail arrived and I was completely won over. The spice blend is subtle and complex. The interior design is jaw-dropping for photos too. If you only eat at one restaurant in Tashkent, make it this one.",
        date: "2025-03-18",
        media: [
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80",
          "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&q=80",
        ],
      },
      {
        id: "r5b",
        author: "Ravshan D.",
        rating: 3,
        text: "Great setting and decent food but service let it down on our visit. We waited almost 25 minutes to have our order taken on a Thursday evening when the restaurant wasn't even full. The plov was good but not exceptional for the price. The architectural interior is genuinely stunning though, so I can see why people love it. Maybe we caught them on an off night — might give it another try.",
        date: "2025-01-25",
        media: [],
      },
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
    images: [
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80",
      "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80",
    ],
    weeklyHours: {
      mon: "08:00 – 20:00",
      tue: "08:00 – 20:00",
      wed: "08:00 – 20:00",
      thu: "08:00 – 20:00",
      fri: "08:00 – 20:00",
      sat: "09:00 – 18:00",
      sun: "Closed",
    },
    isOpen: true,
    featured: false,
    reviews: [
      {
        id: "r6",
        author: "Sherzod B.",
        rating: 5,
        text: "Brought my Chevrolet Malibu in for a transmission rebuild that two other garages had quoted at astronomical prices. AutoPro diagnosed it accurately in under an hour and fixed it the same day at nearly half the price. The mechanic walked me through exactly what was wrong, showed me the worn parts, and explained each step of the repair. Transparent, professional, and fast. Genuinely one of the best auto service experiences I've had.",
        date: "2025-03-01",
        media: [
          "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80",
        ],
      },
      {
        id: "r7",
        author: "Nodir V.",
        rating: 4,
        text: "Solid and thorough service. They did a full inspection, oil change, and brake pad replacement on my Nexia 3. The technicians clearly know what they're doing and didn't try to upsell me on unnecessary parts, which I really appreciated. The wait was about 2.5 hours but they have a comfortable waiting area with Wi-Fi and tea, so it wasn't bad. Pricing felt fair. Would use them again for regular maintenance.",
        date: "2025-01-20",
        media: [
          "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=80",
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
        ],
      },
      {
        id: "r7a",
        author: "Ulmas T.",
        rating: 5,
        text: "My engine light came on the evening before a long road trip to Samarkand and I was panicking. AutoPro opened at 8am and they plugged in their diagnostic tool straight away. Turned out to be a faulty oxygen sensor — they had the part in stock and it was replaced within 90 minutes. The road trip went perfectly. These guys literally saved my plans. Staff were calm, efficient, and the price was more than fair. Five stars without hesitation.",
        date: "2025-02-18",
        media: [
          "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80",
        ],
      },
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
    images: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80",
      "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800&q=80",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&q=80",
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
      "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80",
    ],
    weeklyHours: {
      mon: "08:00 – 22:00",
      tue: "08:00 – 22:00",
      wed: "08:00 – 22:00",
      thu: "08:00 – 22:00",
      fri: "08:00 – 22:00",
      sat: "09:00 – 18:00",
      sun: "Closed",
    },
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
    lat: 41.3880,
    lon: 69.3200,
    images: [
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80",
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&q=80",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
      "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800&q=80",
    ],
    weeklyHours: {
      mon: "09:00 – 18:00",
      tue: "09:00 – 18:00",
      wed: "09:00 – 18:00",
      thu: "09:00 – 18:00",
      fri: "09:00 – 18:00",
      sat: "09:00 – 20:00",
      sun: "09:00 – 20:00",
    },
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
    lat: 41.3385,
    lon: 69.3470,
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      "https://images.unsplash.com/photo-1574673133241-7ef84a224735?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80",
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80",
    ],
    weeklyHours: {
      mon: "06:00 – 23:00",
      tue: "06:00 – 23:00",
      wed: "06:00 – 23:00",
      thu: "06:00 – 23:00",
      fri: "06:00 – 23:00",
      sat: "08:00 – 21:00",
      sun: "08:00 – 21:00",
    },
    isOpen: true,
    featured: false,
    reviews: [
      { id: "r12", author: "Timur R.", rating: 4, text: "Great equipment and the pool is very clean.", date: "2025-03-08" },
    ],
  },
/*
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
    lat: 41.3720,
    lon: 69.1530,
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80",
    ],
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
    lat: 41.3480,
    lon: 69.2100,
    images: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&q=80",
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80",
    ],
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
    lat: 41.3650,
    lon: 69.3880,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    ],
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
    lat: 41.3120,
    lon: 69.2580,
    images: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
      "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    ],
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
    lat: 41.2250,
    lon: 69.2750,
    images: [
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80",
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80",
    ],
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
    lat: 41.2400,
    lon: 69.3720,
    images: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    ],
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
    lat: 41.2650,
    lon: 69.1850,
    images: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800&q=80",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
      "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800&q=80",
    ],
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
    images: [
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80",
    ],
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
*/
]

/** Keys in `weeklyHours` objects; order Mon → Sun (matches `en-US` short weekday, lowercased). */
export const WEEKLY_HOURS_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]

export function weeklyHoursDayKey(date = new Date()) {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase()
}

/**
 * Today's hours from `place.hours` or `place.weeklyHours` for the current weekday.
 * Returns null if nothing usable is available.
 */
export function resolveTodayHours(place) {
  if (!place) return null
  const legacy = typeof place.hours === "string" ? place.hours.trim() : ""
  if (legacy) return legacy
  const wh = place.weeklyHours
  if (wh && typeof wh === "object") {
    const key = weeklyHoursDayKey()
    const v = wh[key]
    if (v != null && String(v).trim()) return String(v).trim()
  }
  return null
}

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
