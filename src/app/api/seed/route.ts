import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // Check if data already exists — skip re-seeding unless forced
    const existingCount = await db.product.count();
    if (existingCount > 0 && !force) {
      return NextResponse.json({ success: true, message: "Database already seeded", counts: { products: existingCount } });
    }

    // --- Clear existing data (respecting FK constraints) ---
    await db.review.deleteMany();
    await db.enrollment.deleteMany();
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.cartItem.deleteMany();
    await db.chapter.deleteMany();
    await db.product.deleteMany();
    await db.coupon.deleteMany();
    await db.user.deleteMany();
    await db.category.deleteMany();

    // --- Seed Categories ---
    const categories = await Promise.all([
      // Art & Craft Categories
      db.category.create({
        data: {
          name: "Painting & Drawing",
          slug: "painting-drawing",
          color: "#E85D04",
          icon: "Palette",
          description: "Explore watercolors, oils, acrylics, sketching, and more traditional painting & drawing techniques.",
        },
      }),
      db.category.create({
        data: {
          name: "Digital Art",
          slug: "digital-art",
          color: "#7B2CBF",
          icon: "Monitor",
          description: "Master digital illustration, UI/UX design, and creative tools like Procreate and Figma.",
        },
      }),
      db.category.create({
        data: {
          name: "Traditional Art",
          slug: "traditional-art",
          color: "#D00000",
          icon: "Brush",
          description: "Discover India's rich heritage of traditional art forms including Madhubani, Warli, and more.",
        },
      }),
      db.category.create({
        data: {
          name: "Calligraphy",
          slug: "calligraphy",
          color: "#1B4332",
          icon: "PenTool",
          description: "Learn beautiful lettering styles from modern calligraphy to traditional scripts.",
        },
      }),
      db.category.create({
        data: {
          name: "Photography",
          slug: "photography",
          color: "#0077B6",
          icon: "Camera",
          description: "Capture stunning photos with courses covering composition, lighting, editing, and storytelling.",
        },
      }),
      db.category.create({
        data: {
          name: "Crafts & Sculpture",
          slug: "crafts-sculpture",
          color: "#BC6C25",
          icon: "Hammer",
          description: "Get hands-on with pottery, ceramic art, sculpture, and various craft techniques.",
        },
      }),
      // Digital Skills & Business Categories
      db.category.create({
        data: {
          name: "Trading & Stock Market",
          slug: "trading-stock-market",
          color: "#059669",
          icon: "TrendingUp",
          description: "Master stock trading, options, forex, and technical analysis to build wealth in the financial markets.",
        },
      }),
      db.category.create({
        data: {
          name: "Make Money Online",
          slug: "make-money-online",
          color: "#D97706",
          icon: "Banknote",
          description: "Learn proven strategies to earn money online through freelancing, YouTube, affiliate marketing, and more.",
        },
      }),
      db.category.create({
        data: {
          name: "Digital Marketing",
          slug: "digital-marketing",
          color: "#7C3AED",
          icon: "Megaphone",
          description: "Become a digital marketing expert with courses on SEO, social media, content marketing, and growth strategies.",
        },
      }),
      db.category.create({
        data: {
          name: "Tools & Software",
          slug: "tools-software",
          color: "#0891B2",
          icon: "Wrench",
          description: "Master essential productivity and creative tools like Canva, Excel, Notion, and more to boost your career.",
        },
      }),
    ]);

    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // --- Seed User ---
    const demoUser = await db.user.upsert({
      where: { email: "demo@kalakriti.com" },
      update: {},
      create: { email: "demo@kalakriti.com", name: "Demo User" },
    });

    // --- Seed Products ---
    const productsData = [
      // ===== ART & CRAFT COURSES =====
      {
        title: "Watercolor Mastery: From Basics to Brilliance",
        slug: "watercolor-mastery",
        description: "A comprehensive watercolor course that takes you from complete beginner to confident artist. Learn color theory, brush techniques, wet-on-wet, wet-on-dry, and create stunning landscapes, portraits, and still life paintings.",
        price: 1499, originalPrice: 2999, thumbnail: "/courses/watercolor.png",
        level: "Beginner", duration: "8h 30m", lessons: 24, students: 1247,
        rating: 4.8, ratingCount: 342, instructor: "Priya Sharma",
        featured: true, bestSeller: true, categoryId: catMap["painting-drawing"],
        chapters: [
          { title: "Introduction & Getting Started", order: 1, lessons: [
            { title: "Welcome to Watercolor Mastery", duration: "10 min", order: 1 },
            { title: "Understanding Your Materials", duration: "20 min", order: 2 },
            { title: "Setting Up Your Workspace", duration: "15 min", order: 3 },
          ]},
          { title: "Color Theory & Mixing", order: 2, lessons: [
            { title: "The Color Wheel Explained", duration: "18 min", order: 1 },
            { title: "Mixing Warm & Cool Tones", duration: "22 min", order: 2 },
            { title: "Creating Skin Tones", duration: "25 min", order: 3 },
            { title: "Color Harmony in Paintings", duration: "20 min", order: 4 },
          ]},
          { title: "Fundamental Techniques", order: 3, lessons: [
            { title: "Wet-on-Wet Technique", duration: "25 min", order: 1 },
            { title: "Wet-on-Dry Technique", duration: "22 min", order: 2 },
            { title: "Gradient Washes", duration: "18 min", order: 3 },
            { title: "Lifting & Erasing", duration: "15 min", order: 4 },
          ]},
          { title: "Painting Subjects", order: 4, lessons: [
            { title: "Painting Skies & Clouds", duration: "30 min", order: 1 },
            { title: "Water Reflections", duration: "28 min", order: 2 },
            { title: "Trees & Foliage", duration: "25 min", order: 3 },
            { title: "Simple Landscapes", duration: "35 min", order: 4 },
          ]},
          { title: "Advanced Projects", order: 5, lessons: [
            { title: "Botanical Illustration", duration: "30 min", order: 1 },
            { title: "Portrait in Watercolor", duration: "35 min", order: 2 },
            { title: "Urban Sketching", duration: "25 min", order: 3 },
            { title: "Final Project: Complete Painting", duration: "40 min", order: 4 },
          ]},
        ],
      },
      {
        title: "Digital Illustration for Modern Artists",
        slug: "digital-illustration-modern-artists",
        description: "Learn digital illustration from scratch using industry-standard tools. Cover character design, environment art, and commercial illustration with step-by-step projects.",
        price: 1999, originalPrice: 3999, thumbnail: "/courses/digital-art.png",
        level: "Intermediate", duration: "12h 15m", lessons: 32, students: 892,
        rating: 4.9, ratingCount: 267, instructor: "Arjun Mehta",
        featured: true, bestSeller: false, categoryId: catMap["digital-art"],
        chapters: [
          { title: "Getting Started with Digital Art", order: 1, lessons: [
            { title: "Course Overview & Tools", duration: "12 min", order: 1 },
            { title: "Setting Up Your Digital Workspace", duration: "20 min", order: 2 },
            { title: "Brush Basics & Custom Brushes", duration: "25 min", order: 3 },
          ]},
          { title: "Foundations of Digital Drawing", order: 2, lessons: [
            { title: "Sketching Digitally", duration: "22 min", order: 1 },
            { title: "Line Art Mastery", duration: "28 min", order: 2 },
            { title: "Understanding Layers", duration: "18 min", order: 3 },
            { title: "Working with Selections", duration: "20 min", order: 4 },
          ]},
          { title: "Color & Lighting", order: 3, lessons: [
            { title: "Digital Color Theory", duration: "25 min", order: 1 },
            { title: "Lighting & Shading Techniques", duration: "30 min", order: 2 },
            { title: "Creating Mood with Color", duration: "22 min", order: 3 },
            { title: "Texture & Material Rendering", duration: "28 min", order: 4 },
          ]},
          { title: "Character Design", order: 4, lessons: [
            { title: "Character Proportions", duration: "25 min", order: 1 },
            { title: "Designing Expressions", duration: "22 min", order: 2 },
            { title: "Creating a Character Sheet", duration: "35 min", order: 3 },
            { title: "Posing & Action", duration: "28 min", order: 4 },
          ]},
          { title: "Commercial & Portfolio Projects", order: 5, lessons: [
            { title: "Book Cover Illustration", duration: "35 min", order: 1 },
            { title: "Social Media Art", duration: "20 min", order: 2 },
            { title: "Building Your Portfolio", duration: "18 min", order: 3 },
            { title: "Final Project: Full Illustration", duration: "40 min", order: 4 },
          ]},
        ],
      },
      {
        title: "Madhubani Art: Preserving Ancient Traditions",
        slug: "madhubani-art-preserving-ancient-traditions",
        description: "Dive into the rich world of Madhubani painting, a traditional Indian folk art from Bihar. Learn authentic patterns, motifs, and techniques passed down through generations.",
        price: 999, originalPrice: 1999, thumbnail: "/courses/madhubani.png",
        level: "Beginner", duration: "6h 45m", lessons: 18, students: 654,
        rating: 4.7, ratingCount: 198, instructor: "Kavita Devi",
        featured: false, bestSeller: false, categoryId: catMap["traditional-art"],
        chapters: [
          { title: "Introduction to Madhubani Art", order: 1, lessons: [
            { title: "History & Cultural Significance", duration: "15 min", order: 1 },
            { title: "Traditional Tools & Materials", duration: "20 min", order: 2 },
          ]},
          { title: "Basic Motifs & Patterns", order: 2, lessons: [
            { title: "Lotus Motif", duration: "25 min", order: 1 },
            { title: "Fish & Aquatic Life", duration: "22 min", order: 2 },
            { title: "Sun & Moon Patterns", duration: "20 min", order: 3 },
            { title: "Border Designs", duration: "18 min", order: 4 },
          ]},
          { title: "Human Figures & Deities", order: 3, lessons: [
            { title: "Drawing Human Figures", duration: "28 min", order: 1 },
            { title: "Lord Krishna Motifs", duration: "30 min", order: 2 },
            { title: "Goddess Durga Imagery", duration: "32 min", order: 3 },
          ]},
          { title: "Complete Projects", order: 4, lessons: [
            { title: "Wall Art Project", duration: "35 min", order: 1 },
            { title: "Fabric Madhubani Painting", duration: "30 min", order: 2 },
            { title: "Final Composition: Village Scene", duration: "40 min", order: 3 },
          ]},
        ],
      },
      {
        title: "Modern Calligraphy & Hand Lettering",
        slug: "modern-calligraphy-hand-lettering",
        description: "Master the art of beautiful writing with modern calligraphy techniques. Learn brush pen calligraphy, pointed pen techniques, and creative hand lettering for projects and professional work.",
        price: 1299, originalPrice: 2499, thumbnail: "/courses/calligraphy.png",
        level: "Beginner", duration: "7h 20m", lessons: 20, students: 1089,
        rating: 4.8, ratingCount: 312, instructor: "Rahul Kapoor",
        featured: true, bestSeller: true, categoryId: catMap["calligraphy"],
        chapters: [
          { title: "Getting Started with Calligraphy", order: 1, lessons: [
            { title: "Introduction to Modern Calligraphy", duration: "12 min", order: 1 },
            { title: "Choosing Your Tools", duration: "18 min", order: 2 },
            { title: "Basic Strokes & Grip", duration: "22 min", order: 3 },
          ]},
          { title: "Mastering the Alphabet", order: 2, lessons: [
            { title: "Lowercase Letters A-M", duration: "28 min", order: 1 },
            { title: "Lowercase Letters N-Z", duration: "25 min", order: 2 },
            { title: "Uppercase Letters A-M", duration: "30 min", order: 3 },
            { title: "Uppercase Letters N-Z", duration: "28 min", order: 4 },
          ]},
          { title: "Connecting Letters & Words", order: 3, lessons: [
            { title: "Letter Connections", duration: "22 min", order: 1 },
            { title: "Word Spacing & Flow", duration: "20 min", order: 2 },
            { title: "Flourishing Basics", duration: "28 min", order: 3 },
          ]},
          { title: "Projects & Applications", order: 4, lessons: [
            { title: "Wedding & Event Invitations", duration: "30 min", order: 1 },
            { title: "Logo & Brand Lettering", duration: "25 min", order: 2 },
            { title: "Final Project: Complete Piece", duration: "35 min", order: 3 },
          ]},
        ],
      },
      {
        title: "Photography Masterclass: See the World Differently",
        slug: "photography-masterclass",
        description: "Transform your photography skills with this comprehensive masterclass. From understanding your camera to advanced composition, lighting, and post-processing techniques.",
        price: 2499, originalPrice: 4999, thumbnail: "/courses/photography.png",
        level: "Intermediate", duration: "15h", lessons: 36, students: 1567,
        rating: 4.9, ratingCount: 489, instructor: "Vikram Singh",
        featured: true, bestSeller: true, categoryId: catMap["photography"],
        chapters: [
          { title: "Photography Fundamentals", order: 1, lessons: [
            { title: "Understanding Your Camera", duration: "20 min", order: 1 },
            { title: "Exposure Triangle Explained", duration: "25 min", order: 2 },
            { title: "Shooting Modes Demystified", duration: "18 min", order: 3 },
          ]},
          { title: "Mastering Composition", order: 2, lessons: [
            { title: "Rule of Thirds & Beyond", duration: "22 min", order: 1 },
            { title: "Leading Lines & Framing", duration: "20 min", order: 2 },
            { title: "Negative Space & Minimalism", duration: "18 min", order: 3 },
          ]},
          { title: "Lighting Mastery", order: 3, lessons: [
            { title: "Natural Light Photography", duration: "28 min", order: 1 },
            { title: "Golden Hour & Blue Hour", duration: "22 min", order: 2 },
            { title: "Studio Lighting Basics", duration: "30 min", order: 3 },
          ]},
          { title: "Post-Processing", order: 4, lessons: [
            { title: "Lightroom Workflow", duration: "25 min", order: 1 },
            { title: "Color Grading Techniques", duration: "22 min", order: 2 },
            { title: "Final Project: Photo Series", duration: "35 min", order: 3 },
          ]},
        ],
      },
      {
        title: "Pottery & Ceramic Art Fundamentals",
        slug: "pottery-ceramic-art-fundamentals",
        description: "Learn the art of pottery from hand-building to wheel throwing. This course covers clay preparation, various forming techniques, glazing, and firing to create beautiful ceramic pieces.",
        price: 1799, originalPrice: 3499, thumbnail: "/courses/pottery.png",
        level: "Beginner", duration: "10h 45m", lessons: 28, students: 478,
        rating: 4.6, ratingCount: 156, instructor: "Sunita Patel",
        featured: false, bestSeller: false, categoryId: catMap["crafts-sculpture"],
        chapters: [
          { title: "Introduction to Pottery", order: 1, lessons: [
            { title: "Welcome to Pottery & Ceramics", duration: "10 min", order: 1 },
            { title: "Understanding Clay Types", duration: "20 min", order: 2 },
            { title: "Essential Tools & Equipment", duration: "18 min", order: 3 },
          ]},
          { title: "Hand-Building Techniques", order: 2, lessons: [
            { title: "Pinch Pot Method", duration: "25 min", order: 1 },
            { title: "Coil Building", duration: "30 min", order: 2 },
            { title: "Slab Construction", duration: "28 min", order: 3 },
          ]},
          { title: "Wheel Throwing Basics", order: 3, lessons: [
            { title: "Preparing & Centering Clay", duration: "25 min", order: 1 },
            { title: "Opening & Pulling Up Walls", duration: "30 min", order: 2 },
            { title: "Shaping Cylinders & Bowls", duration: "28 min", order: 3 },
          ]},
          { title: "Glazing & Firing", order: 4, lessons: [
            { title: "Understanding Glazes", duration: "22 min", order: 1 },
            { title: "Glazing Techniques", duration: "28 min", order: 2 },
            { title: "Final Project: Sculptural Piece", duration: "40 min", order: 3 },
          ]},
        ],
      },
      // ===== TRADING & STOCK MARKET COURSES =====
      {
        title: "Stock Market Trading: Complete Course for Beginners to Pros",
        slug: "stock-market-trading-complete",
        description: "Master the Indian stock market from scratch. Learn technical analysis, fundamental analysis, chart patterns, candlestick strategies, and risk management to trade confidently in NSE/BSE.",
        price: 2999, originalPrice: 5999, thumbnail: "/courses/stock-market.png",
        level: "Beginner", duration: "18h 30m", lessons: 48, students: 2847,
        rating: 4.9, ratingCount: 876, instructor: "Rajesh Nair",
        featured: true, bestSeller: true, categoryId: catMap["trading-stock-market"],
        chapters: [
          { title: "Stock Market Basics", order: 1, lessons: [
            { title: "What is the Stock Market?", duration: "15 min", order: 1 },
            { title: "How NSE & BSE Work", duration: "20 min", order: 2 },
            { title: "Opening a Demat Account", duration: "12 min", order: 3 },
            { title: "Understanding Stock Orders", duration: "18 min", order: 4 },
          ]},
          { title: "Fundamental Analysis", order: 2, lessons: [
            { title: "Reading Financial Statements", duration: "28 min", order: 1 },
            { title: "P/E Ratio, P/B Ratio & Valuation", duration: "25 min", order: 2 },
            { title: "Analyzing Balance Sheets", duration: "30 min", order: 3 },
            { title: "Sector Analysis", duration: "22 min", order: 4 },
          ]},
          { title: "Technical Analysis", order: 3, lessons: [
            { title: "Candlestick Patterns Mastery", duration: "35 min", order: 1 },
            { title: "Support & Resistance Levels", duration: "28 min", order: 2 },
            { title: "Moving Averages (SMA, EMA)", duration: "25 min", order: 3 },
            { title: "RSI, MACD & Indicators", duration: "30 min", order: 4 },
            { title: "Chart Patterns: Triangles, Flags, H&S", duration: "32 min", order: 5 },
          ]},
          { title: "Trading Strategies", order: 4, lessons: [
            { title: "Intraday Trading Strategies", duration: "30 min", order: 1 },
            { title: "Swing Trading for Beginners", duration: "28 min", order: 2 },
            { title: "Position Trading", duration: "22 min", order: 3 },
            { title: "Risk Management & Stop Loss", duration: "25 min", order: 4 },
          ]},
          { title: "Live Trading & Psychology", order: 5, lessons: [
            { title: "Trading Psychology Masterclass", duration: "28 min", order: 1 },
            { title: "Building a Trading Plan", duration: "22 min", order: 2 },
            { title: "Paper Trading Practice", duration: "20 min", order: 3 },
            { title: "Taxation & Legal Aspects", duration: "18 min", order: 4 },
            { title: "Final Project: Create Your Trading Journal", duration: "30 min", order: 5 },
          ]},
        ],
      },
      {
        title: "Options Trading Masterclass: Nifty & BankNifty Strategies",
        slug: "options-trading-masterclass",
        description: "Learn advanced options trading with proven strategies for Nifty and BankNifty. Master option Greeks, spread strategies, iron condors, straddles, and risk management for consistent profits.",
        price: 3999, originalPrice: 7999, thumbnail: "/courses/options-trading.png",
        level: "Advanced", duration: "22h", lessons: 56, students: 1523,
        rating: 4.8, ratingCount: 423, instructor: "Amit Verma",
        featured: true, bestSeller: true, categoryId: catMap["trading-stock-market"],
        chapters: [
          { title: "Options Fundamentals", order: 1, lessons: [
            { title: "What Are Options?", duration: "18 min", order: 1 },
            { title: "Call & Put Options Deep Dive", duration: "25 min", order: 2 },
            { title: "Option Premium & Pricing", duration: "22 min", order: 3 },
            { title: "Option Chain Analysis", duration: "28 min", order: 4 },
          ]},
          { title: "Option Greeks", order: 2, lessons: [
            { title: "Delta & Gamma Explained", duration: "30 min", order: 1 },
            { title: "Theta (Time Decay)", duration: "25 min", order: 2 },
            { title: "Vega & Implied Volatility", duration: "28 min", order: 3 },
            { title: "Greeks Calculator Practical", duration: "20 min", order: 4 },
          ]},
          { title: "Selling Strategies", order: 3, lessons: [
            { title: "Naked Puts & Covered Calls", duration: "28 min", order: 1 },
            { title: "Bull Put Spread", duration: "25 min", order: 2 },
            { title: "Bear Call Spread", duration: "25 min", order: 3 },
            { title: "Iron Condor Strategy", duration: "32 min", order: 4 },
          ]},
          { title: "Advanced Strategies & Live Trading", order: 4, lessons: [
            { title: "Straddle & Strangle", duration: "30 min", order: 1 },
            { title: "Calendar Spreads", duration: "22 min", order: 2 },
            { title: "Nifty Weekly Options Strategy", duration: "35 min", order: 3 },
            { title: "BankNifty Expiry Day Strategy", duration: "30 min", order: 4 },
            { title: "Risk Management for Options", duration: "28 min", order: 5 },
            { title: "Final Project: Build Options Strategy", duration: "35 min", order: 6 },
          ]},
        ],
      },
      {
        title: "Forex Trading for Beginners: Currency Markets Simplified",
        slug: "forex-trading-beginners",
        description: "Enter the world of forex trading with this beginner-friendly course. Learn currency pairs, pips, lots, technical analysis, and develop a profitable forex trading system.",
        price: 1999, originalPrice: 3999, thumbnail: "/courses/forex-trading.png",
        level: "Beginner", duration: "14h", lessons: 38, students: 987,
        rating: 4.7, ratingCount: 234, instructor: "Suresh Menon",
        featured: false, bestSeller: false, categoryId: catMap["trading-stock-market"],
        chapters: [
          { title: "Forex Market Introduction", order: 1, lessons: [
            { title: "What is Forex Trading?", duration: "18 min", order: 1 },
            { title: "Currency Pairs Explained", duration: "22 min", order: 2 },
            { title: "Pips, Lots & Leverage", duration: "25 min", order: 3 },
            { title: "Choosing a Forex Broker", duration: "15 min", order: 4 },
          ]},
          { title: "Technical Analysis for Forex", order: 2, lessons: [
            { title: "Forex Chart Patterns", duration: "28 min", order: 1 },
            { title: "Fibonacci Retracement", duration: "25 min", order: 2 },
            { title: "Multiple Time Frame Analysis", duration: "30 min", order: 3 },
          ]},
          { title: "Trading Strategies", order: 3, lessons: [
            { title: "Scalping Strategies", duration: "28 min", order: 1 },
            { title: "Trend Following System", duration: "25 min", order: 2 },
            { title: "Final Project: Build Your Forex Plan", duration: "35 min", order: 3 },
          ]},
        ],
      },
      // ===== MAKE MONEY ONLINE COURSES =====
      {
        title: "Freelancing: Start Earning Online Today",
        slug: "freelancing-start-earning-online",
        description: "Launch your freelancing career from zero. Learn to find clients on Upwork, Fiverr, and Indian platforms, write winning proposals, set your rates, and build a sustainable online income stream.",
        price: 1499, originalPrice: 2999, thumbnail: "/courses/freelancing.png",
        level: "Beginner", duration: "10h", lessons: 28, students: 2156,
        rating: 4.8, ratingCount: 567, instructor: "Neha Gupta",
        featured: true, bestSeller: true, categoryId: catMap["make-money-online"],
        chapters: [
          { title: "Freelancing Fundamentals", order: 1, lessons: [
            { title: "What is Freelancing?", duration: "15 min", order: 1 },
            { title: "Top Freelancing Skills in 2024", duration: "20 min", order: 2 },
            { title: "Setting Up Your Freelance Profile", duration: "25 min", order: 3 },
            { title: "Pricing Your Services", duration: "22 min", order: 4 },
          ]},
          { title: "Finding Clients", order: 2, lessons: [
            { title: "Upwork Profile & Proposals", duration: "28 min", order: 1 },
            { title: "Fiverr Gig Optimization", duration: "25 min", order: 2 },
            { title: "Indian Platforms: Internshala, Freelancer.in", duration: "20 min", order: 3 },
            { title: "Cold Emailing for Clients", duration: "22 min", order: 4 },
          ]},
          { title: "Growing Your Freelance Business", order: 3, lessons: [
            { title: "Building Long-term Client Relationships", duration: "25 min", order: 1 },
            { title: "Scaling with Systems", duration: "22 min", order: 2 },
            { title: "Tax & Legal for Indian Freelancers", duration: "18 min", order: 3 },
            { title: "Final Project: Launch Your Freelance Biz", duration: "30 min", order: 4 },
          ]},
        ],
      },
      {
        title: "YouTube Channel Growth Blueprint: 0 to 100K Subscribers",
        slug: "youtube-channel-growth-blueprint",
        description: "Build a successful YouTube channel from scratch. Learn niche selection, video SEO, thumbnail design, audience building, monetization strategies, and the exact blueprint to grow to 100K+ subscribers.",
        price: 1999, originalPrice: 3999, thumbnail: "/courses/youtube-marketing.png",
        level: "Beginner", duration: "12h", lessons: 32, students: 1876,
        rating: 4.9, ratingCount: 512, instructor: "Rohan Das",
        featured: true, bestSeller: false, categoryId: catMap["make-money-online"],
        chapters: [
          { title: "Channel Foundation", order: 1, lessons: [
            { title: "Choosing Your Niche", duration: "22 min", order: 1 },
            { title: "Channel Setup & Branding", duration: "18 min", order: 2 },
            { title: "Equipment on a Budget", duration: "20 min", order: 3 },
            { title: "Content Strategy & Calendar", duration: "25 min", order: 4 },
          ]},
          { title: "Video Production", order: 2, lessons: [
            { title: "Scripting for Retention", duration: "22 min", order: 1 },
            { title: "Shooting Professional Videos", duration: "28 min", order: 2 },
            { title: "Editing Like a Pro", duration: "25 min", order: 3 },
            { title: "Thumbnail Design Secrets", duration: "20 min", order: 4 },
          ]},
          { title: "Growth & Monetization", order: 3, lessons: [
            { title: "YouTube SEO Mastery", duration: "28 min", order: 1 },
            { title: "Understanding YouTube Algorithm", duration: "25 min", order: 2 },
            { title: "Monetization Beyond AdSense", duration: "22 min", order: 3 },
            { title: "Sponsorships & Brand Deals", duration: "20 min", order: 4 },
            { title: "Final Project: 30-Day Growth Plan", duration: "30 min", order: 5 },
          ]},
        ],
      },
      {
        title: "Affiliate Marketing A-Z: Earn While You Sleep",
        slug: "affiliate-marketing-az",
        description: "Master affiliate marketing from zero to hero. Learn to choose profitable niches, build review websites, leverage social media, and create passive income streams through affiliate programs.",
        price: 1799, originalPrice: 3499, thumbnail: "/courses/affiliate-marketing.png",
        level: "Beginner", duration: "11h", lessons: 30, students: 1432,
        rating: 4.7, ratingCount: 389, instructor: "Deepak Kumar",
        featured: false, bestSeller: false, categoryId: catMap["make-money-online"],
        chapters: [
          { title: "Affiliate Marketing Basics", order: 1, lessons: [
            { title: "What is Affiliate Marketing?", duration: "15 min", order: 1 },
            { title: "How Commissions Work", duration: "18 min", order: 2 },
            { title: "Top Affiliate Networks in India", duration: "22 min", order: 3 },
          ]},
          { title: "Building Your Platform", order: 2, lessons: [
            { title: "Niche Selection Strategy", duration: "25 min", order: 1 },
            { title: "Building a Review Blog", duration: "30 min", order: 2 },
            { title: "Social Media Affiliate Strategy", duration: "22 min", order: 3 },
          ]},
          { title: "Scaling & Automation", order: 3, lessons: [
            { title: "Email Marketing for Affiliates", duration: "25 min", order: 1 },
            { title: "SEO for Affiliate Sites", duration: "28 min", order: 2 },
            { title: "Final Project: Launch Affiliate Site", duration: "35 min", order: 3 },
          ]},
        ],
      },
      // ===== DIGITAL MARKETING COURSES =====
      {
        title: "Digital Marketing Complete Guide: Become a Certified Marketer",
        slug: "digital-marketing-complete-guide",
        description: "The ultimate digital marketing course covering SEO, SEM, social media marketing, email marketing, content marketing, Google Ads, and analytics. Perfect for beginners and aspiring marketers.",
        price: 2499, originalPrice: 4999, thumbnail: "/courses/digital-marketing.png",
        level: "Beginner", duration: "20h", lessons: 52, students: 3241,
        rating: 4.9, ratingCount: 923, instructor: "Ananya Reddy",
        featured: true, bestSeller: true, categoryId: catMap["digital-marketing"],
        chapters: [
          { title: "Digital Marketing Foundation", order: 1, lessons: [
            { title: "What is Digital Marketing?", duration: "15 min", order: 1 },
            { title: "The Digital Marketing Funnel", duration: "20 min", order: 2 },
            { title: "Setting Marketing Goals (KPIs)", duration: "18 min", order: 3 },
            { title: "Creating a Marketing Strategy", duration: "25 min", order: 4 },
          ]},
          { title: "Search Engine Optimization (SEO)", order: 2, lessons: [
            { title: "How Search Engines Work", duration: "20 min", order: 1 },
            { title: "Keyword Research Masterclass", duration: "28 min", order: 2 },
            { title: "On-Page SEO Techniques", duration: "25 min", order: 3 },
            { title: "Off-Page SEO & Link Building", duration: "22 min", order: 4 },
            { title: "Technical SEO Essentials", duration: "20 min", order: 5 },
          ]},
          { title: "Google Ads & PPC", order: 3, lessons: [
            { title: "Google Ads Platform Overview", duration: "22 min", order: 1 },
            { title: "Search Campaign Setup", duration: "28 min", order: 2 },
            { title: "Display & YouTube Ads", duration: "25 min", order: 3 },
            { title: "Bid Strategies & Optimization", duration: "22 min", order: 4 },
          ]},
          { title: "Social Media Marketing", order: 4, lessons: [
            { title: "Instagram Marketing Strategy", duration: "25 min", order: 1 },
            { title: "Facebook Ads Masterclass", duration: "30 min", order: 2 },
            { title: "LinkedIn for B2B Marketing", duration: "22 min", order: 3 },
            { title: "Content Calendar & Planning", duration: "20 min", order: 4 },
          ]},
          { title: "Analytics & Growth", order: 5, lessons: [
            { title: "Google Analytics 4 Deep Dive", duration: "28 min", order: 1 },
            { title: "Marketing Automation", duration: "22 min", order: 2 },
            { title: "Conversion Rate Optimization", duration: "25 min", order: 3 },
            { title: "Final Project: Full Marketing Plan", duration: "35 min", order: 4 },
          ]},
        ],
      },
      {
        title: "Social Media Marketing Mastery: Build Brands That Go Viral",
        slug: "social-media-marketing-mastery",
        description: "Master social media marketing across Instagram, Facebook, Twitter, and LinkedIn. Learn content creation, hashtag strategy, community building, paid ads, and viral growth techniques.",
        price: 1999, originalPrice: 3999, thumbnail: "/courses/social-media-marketing.png",
        level: "Intermediate", duration: "14h", lessons: 38, students: 1978,
        rating: 4.8, ratingCount: 534, instructor: "Kavita Joshi",
        featured: false, bestSeller: true, categoryId: catMap["digital-marketing"],
        chapters: [
          { title: "Social Media Strategy", order: 1, lessons: [
            { title: "Building Your Social Media Strategy", duration: "22 min", order: 1 },
            { title: "Brand Voice & Identity", duration: "18 min", order: 2 },
            { title: "Content Pillars & Themes", duration: "20 min", order: 3 },
          ]},
          { title: "Platform-Specific Strategies", order: 2, lessons: [
            { title: "Instagram Reels & Stories Strategy", duration: "28 min", order: 1 },
            { title: "Facebook Page & Group Growth", duration: "25 min", order: 2 },
            { title: "LinkedIn Personal Branding", duration: "22 min", order: 3 },
            { title: "Twitter/X Engagement Tactics", duration: "20 min", order: 4 },
          ]},
          { title: "Paid Social & Analytics", order: 3, lessons: [
            { title: "Meta Ads Manager Deep Dive", duration: "30 min", order: 1 },
            { title: "A/B Testing & Optimization", duration: "25 min", order: 2 },
            { title: "Social Media Analytics", duration: "22 min", order: 3 },
            { title: "Final Project: Social Media Campaign", duration: "35 min", order: 4 },
          ]},
        ],
      },
      {
        title: "SEO & Content Marketing: Rank #1 on Google",
        slug: "seo-content-marketing",
        description: "Learn to rank websites on the first page of Google with proven SEO and content marketing strategies. Master keyword research, on-page optimization, link building, and content that converts.",
        price: 1799, originalPrice: 3499, thumbnail: "/courses/seo-marketing.png",
        level: "Intermediate", duration: "13h", lessons: 34, students: 1654,
        rating: 4.8, ratingCount: 445, instructor: "Prakash Iyer",
        featured: false, bestSeller: false, categoryId: catMap["digital-marketing"],
        chapters: [
          { title: "SEO Fundamentals", order: 1, lessons: [
            { title: "How Google Ranking Works", duration: "20 min", order: 1 },
            { title: "Keyword Research with Free Tools", duration: "25 min", order: 2 },
            { title: "Competitor Analysis", duration: "22 min", order: 3 },
          ]},
          { title: "On-Page & Content", order: 2, lessons: [
            { title: "Perfect On-Page SEO Checklist", duration: "28 min", order: 1 },
            { title: "Content That Ranks & Converts", duration: "25 min", order: 2 },
            { title: "Blog Post SEO Template", duration: "22 min", order: 3 },
          ]},
          { title: "Off-Page & Technical SEO", order: 3, lessons: [
            { title: "Link Building Strategies", duration: "28 min", order: 1 },
            { title: "Technical SEO Audit", duration: "25 min", order: 2 },
            { title: "Final Project: SEO Audit Report", duration: "35 min", order: 3 },
          ]},
        ],
      },
      // ===== TOOLS & SOFTWARE COURSES =====
      {
        title: "Canva Design Masterclass: Create Professional Designs",
        slug: "canva-design-masterclass",
        description: "Master Canva from beginner to pro. Create stunning social media posts, presentations, logos, thumbnails, business cards, and marketing materials — no design degree needed.",
        price: 999, originalPrice: 1999, thumbnail: "/courses/canva-design.png",
        level: "Beginner", duration: "8h", lessons: 24, students: 2567,
        rating: 4.9, ratingCount: 678, instructor: "Meera Shah",
        featured: true, bestSeller: true, categoryId: catMap["tools-software"],
        chapters: [
          { title: "Canva Fundamentals", order: 1, lessons: [
            { title: "Getting Started with Canva", duration: "15 min", order: 1 },
            { title: "Navigating the Interface", duration: "18 min", order: 2 },
            { title: "Templates & Custom Designs", duration: "22 min", order: 3 },
          ]},
          { title: "Social Media Design", order: 2, lessons: [
            { title: "Instagram Posts & Stories", duration: "25 min", order: 1 },
            { title: "YouTube Thumbnails", duration: "22 min", order: 2 },
            { title: "Facebook & LinkedIn Banners", duration: "20 min", order: 3 },
          ]},
          { title: "Business & Brand Design", order: 3, lessons: [
            { title: "Logo Design in Canva", duration: "28 min", order: 1 },
            { title: "Business Cards & Letterheads", duration: "22 min", order: 2 },
            { title: "Presentations & Pitch Decks", duration: "25 min", order: 3 },
          ]},
          { title: "Advanced Techniques", order: 4, lessons: [
            { title: "Canva Pro Features", duration: "20 min", order: 1 },
            { title: "Brand Kit & Team Collaboration", duration: "18 min", order: 2 },
            { title: "Final Project: Complete Brand Kit", duration: "30 min", order: 3 },
          ]},
        ],
      },
      {
        title: "Excel & Google Sheets for Business: From Zero to Advanced",
        slug: "excel-google-sheets-business",
        description: "Master Excel and Google Sheets for business. Learn formulas, pivot tables, VLOOKUP, data analysis, dashboards, and automation to become a spreadsheet power user.",
        price: 1299, originalPrice: 2499, thumbnail: "/courses/excel-sheets.png",
        level: "Beginner", duration: "11h 30m", lessons: 30, students: 1987,
        rating: 4.8, ratingCount: 523, instructor: "Sanjay Mishra",
        featured: false, bestSeller: true, categoryId: catMap["tools-software"],
        chapters: [
          { title: "Spreadsheet Basics", order: 1, lessons: [
            { title: "Excel vs Google Sheets", duration: "15 min", order: 1 },
            { title: "Cells, Ranges & Formatting", duration: "20 min", order: 2 },
            { title: "Basic Formulas & Functions", duration: "25 min", order: 3 },
          ]},
          { title: "Advanced Formulas", order: 2, lessons: [
            { title: "VLOOKUP, XLOOKUP & INDEX-MATCH", duration: "28 min", order: 1 },
            { title: "IF, AND, OR & Nested Functions", duration: "25 min", order: 2 },
            { title: "Text & Date Functions", duration: "22 min", order: 3 },
          ]},
          { title: "Data Analysis & Visualization", order: 3, lessons: [
            { title: "Pivot Tables Deep Dive", duration: "30 min", order: 1 },
            { title: "Charts & Dashboards", duration: "28 min", order: 2 },
            { title: "Data Validation & Protection", duration: "20 min", order: 3 },
          ]},
          { title: "Automation & Macros", order: 4, lessons: [
            { title: "Conditional Formatting Mastery", duration: "22 min", order: 1 },
            { title: "Introduction to Macros", duration: "25 min", order: 2 },
            { title: "Final Project: Business Dashboard", duration: "35 min", order: 3 },
          ]},
        ],
      },
      {
        title: "Notion & Productivity Tools: Organize Your Life & Business",
        slug: "notion-productivity-tools",
        description: "Master Notion, Trello, Slack, and other productivity tools. Build personal knowledge management systems, project trackers, content calendars, and automate your workflow.",
        price: 999, originalPrice: 1999, thumbnail: "/courses/notion-productivity.png",
        level: "Beginner", duration: "9h", lessons: 26, students: 1432,
        rating: 4.7, ratingCount: 312, instructor: "Aditi Rao",
        featured: false, bestSeller: false, categoryId: catMap["tools-software"],
        chapters: [
          { title: "Notion Fundamentals", order: 1, lessons: [
            { title: "Getting Started with Notion", duration: "18 min", order: 1 },
            { title: "Pages, Blocks & Databases", duration: "22 min", order: 2 },
            { title: "Templates & Gallery", duration: "20 min", order: 3 },
          ]},
          { title: "Building Systems", order: 2, lessons: [
            { title: "Personal Task Manager", duration: "28 min", order: 1 },
            { title: "Content Calendar System", duration: "25 min", order: 2 },
            { title: "Project Management Dashboard", duration: "30 min", order: 3 },
          ]},
          { title: "Productivity Ecosystem", order: 3, lessons: [
            { title: "Integrating Trello & Slack", duration: "22 min", order: 1 },
            { title: "Automating Workflows with Zapier", duration: "25 min", order: 2 },
            { title: "Final Project: Complete Productivity System", duration: "35 min", order: 3 },
          ]},
        ],
      },
    ];

    // Create all products with chapters and lessons
    const products: { id: string; title: string }[] = [];
    for (const pData of productsData) {
      const { chapters, ...productData } = pData;
      const product = await db.product.create({
        data: {
          ...productData,
          status: "published",
          currency: "INR",
          chapters: {
            create: (chapters as NonNullable<typeof chapters>).map((ch) => ({
              ...ch,
              isFree: ch.order === 1,
              lessons: {
                create: ch.lessons.map((l, idx) => ({
                  title: l.title,
                  duration: l.duration,
                  order: l.order,
                  type: idx === 0 && ch.order === 1 ? "video" : "video",
                })),
              },
            })),
          },
        },
      });
      products.push({ id: product.id, title: product.title });
    }

    // --- Seed Reviews ---
    const reviewData = [
      { productTitle: "Watercolor Mastery", name: "Ananya R.", rating: 5, comment: "Absolutely loved this course! The step-by-step approach made watercolor painting so much easier. I can now paint landscapes confidently." },
      { productTitle: "Watercolor Mastery", name: "Rohit K.", rating: 5, comment: "Best watercolor course in India. Priya ma'am explains techniques so well. The color theory section was eye-opening!" },
      { productTitle: "Stock Market Trading", name: "Vikash S.", rating: 5, comment: "This course changed my life! I was scared of stock market but Rajesh sir made it so simple. Already making consistent profits with intraday trading." },
      { productTitle: "Stock Market Trading", name: "Pooja M.", rating: 5, comment: "From zero knowledge to confidently analyzing stocks. The technical analysis section is worth 10x the price. Highly recommend!" },
      { productTitle: "Digital Marketing Complete Guide", name: "Arjun T.", rating: 5, comment: "Comprehensive digital marketing course. Covers SEO, Google Ads, social media — everything you need. Got a job as a marketing executive after completing this!" },
      { productTitle: "Freelancing: Start Earning Online", name: "Sneha P.", rating: 5, comment: "I earned my first ₹50,000 within 2 months of completing this course. The proposal writing tips are gold!" },
      { productTitle: "Canva Design Masterclass", name: "Riya D.", rating: 5, comment: "I now design all my social media posts myself. Saved so much money on hiring designers. The thumbnail design section is amazing." },
      { productTitle: "Options Trading Masterclass", name: "Amit J.", rating: 4, comment: "Advanced course but worth every penny. The Nifty options strategies are practical and profitable. Need to practice more!" },
      { productTitle: "YouTube Channel Growth", name: "Pradeep G.", rating: 5, comment: "My channel went from 200 to 15K subscribers in 3 months using the strategies from this course. The SEO section alone is worth it." },
      { productTitle: "Excel & Google Sheets", name: "Kavitha N.", rating: 5, comment: "I went from being afraid of Excel to creating automated dashboards. My boss was impressed with my new skills!" },
      { productTitle: "Digital Illustration", name: "Manish R.", rating: 5, comment: "Arjun's teaching style is incredible. The character design module helped me land my first freelance illustration gig." },
      { productTitle: "Photography Masterclass", name: "Divya L.", rating: 5, comment: "The composition and lighting sections transformed my photography. My Instagram engagement increased 300% after applying these techniques." },
      { productTitle: "SEO & Content Marketing", name: "Raj P.", rating: 4, comment: "Very practical SEO course. My blog posts started ranking on page 1 within weeks. Great keyword research strategies." },
      { productTitle: "Notion & Productivity", name: "Swati M.", rating: 5, comment: "Finally organized my life with Notion! The template systems taught in this course are incredible. 10/10 would recommend." },
      { productTitle: "Affiliate Marketing A-Z", name: "Karan B.", rating: 4, comment: "Good foundational course for affiliate marketing. The blog building section was very helpful. Need more advanced strategies." },
    ];

    const productMap = Object.fromEntries(products.map((p) => [p.title, p.id]));
    for (const r of reviewData) {
      const productId = productMap[r.productTitle];
      if (!productId) continue;
      await db.review.create({
        data: {
          userId: demoUser.id,
          productId,
          rating: r.rating,
          comment: r.comment,
        },
      });
    }

    // --- Seed Coupons ---
    await Promise.all([
      db.coupon.create({
        data: { code: "KALAKRITI20", discount: 20, isActive: true, minAmount: 999, maxUses: 1000, usedCount: 0 },
      }),
      db.coupon.create({
        data: { code: "WELCOME50", discount: 50, isActive: true, minAmount: 1999, maxUses: 500, usedCount: 0 },
      }),
      db.coupon.create({
        data: { code: "TRADER10", discount: 10, isActive: true, minAmount: 2999, maxUses: 300, usedCount: 0 },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      counts: {
        categories: categories.length,
        products: products.length,
        reviews: reviewData.length,
        coupons: 3,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}