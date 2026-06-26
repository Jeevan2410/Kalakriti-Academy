import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // --- Clear existing data (respecting FK constraints) ---
    await db.review.deleteMany();
    await db.enrollment.deleteMany();
    await db.orderItem.deleteMany();
    await db.order.deleteMany();
    await db.cartItem.deleteMany();
    await db.chapter.deleteMany(); // cascades to lessons
    await db.product.deleteMany();
    await db.coupon.deleteMany();
    await db.user.deleteMany();
    await db.category.deleteMany();

    // --- Seed Categories ---
    const categories = await Promise.all([
      db.category.create({
        data: {
          name: "Painting & Drawing",
          slug: "painting-drawing",
          color: "#E85D04",
          icon: "Palette",
          description:
            "Explore watercolors, oils, acrylics, sketching, and more traditional painting & drawing techniques.",
        },
      }),
      db.category.create({
        data: {
          name: "Digital Art",
          slug: "digital-art",
          color: "#7B2CBF",
          icon: "Monitor",
          description:
            "Master digital illustration, UI/UX design, and creative tools like Procreate and Figma.",
        },
      }),
      db.category.create({
        data: {
          name: "Traditional Art",
          slug: "traditional-art",
          color: "#D00000",
          icon: "Brush",
          description:
            "Discover India's rich heritage of traditional art forms including Madhubani, Warli, and more.",
        },
      }),
      db.category.create({
        data: {
          name: "Calligraphy",
          slug: "calligraphy",
          color: "#1B4332",
          icon: "PenTool",
          description:
            "Learn beautiful lettering styles from modern calligraphy to traditional scripts.",
        },
      }),
      db.category.create({
        data: {
          name: "Photography",
          slug: "photography",
          color: "#0077B6",
          icon: "Camera",
          description:
            "Capture stunning photos with courses covering composition, lighting, editing, and storytelling.",
        },
      }),
      db.category.create({
        data: {
          name: "Crafts & Sculpture",
          slug: "crafts-sculpture",
          color: "#BC6C25",
          icon: "Hammer",
          description:
            "Get hands-on with pottery, ceramic art, sculpture, and various craft techniques.",
        },
      }),
    ]);

    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // --- Seed User ---
    const demoUser = await db.user.create({
      data: {
        email: "demo@kalakriti.com",
        name: "Demo User",
      },
    });

    // --- Seed Products ---
    const productsData = [
      {
        title: "Watercolor Mastery: From Basics to Brilliance",
        slug: "watercolor-mastery",
        description:
          "A comprehensive watercolor course that takes you from complete beginner to confident artist. Learn color theory, brush techniques, wet-on-wet, wet-on-dry, and create stunning landscapes, portraits, and still life paintings.",
        price: 1499,
        originalPrice: 2999,
        thumbnail: "/courses/watercolor.png",
        level: "Beginner",
        duration: "8h 30m",
        lessons: 24,
        students: 1247,
        rating: 4.8,
        ratingCount: 342,
        instructor: "Priya Sharma",
        featured: true,
        bestSeller: true,
        categoryId: catMap["painting-drawing"],
        chapters: [
          {
            title: "Introduction & Getting Started",
            order: 1,
            lessons: [
              { title: "Welcome to Watercolor Mastery", duration: "10 min", order: 1 },
              { title: "Understanding Your Materials", duration: "20 min", order: 2 },
              { title: "Setting Up Your Workspace", duration: "15 min", order: 3 },
            ],
          },
          {
            title: "Color Theory & Mixing",
            order: 2,
            lessons: [
              { title: "The Color Wheel Explained", duration: "18 min", order: 1 },
              { title: "Mixing Warm & Cool Tones", duration: "22 min", order: 2 },
              { title: "Creating Skin Tones", duration: "25 min", order: 3 },
              { title: "Color Harmony in Paintings", duration: "20 min", order: 4 },
            ],
          },
          {
            title: "Fundamental Techniques",
            order: 3,
            lessons: [
              { title: "Wet-on-Wet Technique", duration: "25 min", order: 1 },
              { title: "Wet-on-Dry Technique", duration: "22 min", order: 2 },
              { title: "Gradient Washes", duration: "18 min", order: 3 },
              { title: "Lifting & Erasing", duration: "15 min", order: 4 },
            ],
          },
          {
            title: "Painting Subjects",
            order: 4,
            lessons: [
              { title: "Painting Skies & Clouds", duration: "30 min", order: 1 },
              { title: "Water Reflections", duration: "28 min", order: 2 },
              { title: "Trees & Foliage", duration: "25 min", order: 3 },
              { title: "Simple Landscapes", duration: "35 min", order: 4 },
            ],
          },
          {
            title: "Advanced Projects",
            order: 5,
            lessons: [
              { title: "Botanical Illustration", duration: "30 min", order: 1 },
              { title: "Portrait in Watercolor", duration: "35 min", order: 2 },
              { title: "Urban Sketching", duration: "25 min", order: 3 },
              { title: "Final Project: Complete Painting", duration: "40 min", order: 4 },
            ],
          },
        ],
      },
      {
        title: "Digital Illustration for Modern Artists",
        slug: "digital-illustration-modern-artists",
        description:
          "Learn digital illustration from scratch using industry-standard tools. Cover character design, environment art, and commercial illustration with step-by-step projects.",
        price: 1999,
        originalPrice: 3999,
        thumbnail: "/courses/digital-art.png",
        level: "Intermediate",
        duration: "12h 15m",
        lessons: 32,
        students: 892,
        rating: 4.9,
        ratingCount: 267,
        instructor: "Arjun Mehta",
        featured: true,
        bestSeller: false,
        categoryId: catMap["digital-art"],
        chapters: [
          {
            title: "Getting Started with Digital Art",
            order: 1,
            lessons: [
              { title: "Course Overview & Tools", duration: "12 min", order: 1 },
              { title: "Setting Up Your Digital Workspace", duration: "20 min", order: 2 },
              { title: "Brush Basics & Custom Brushes", duration: "25 min", order: 3 },
            ],
          },
          {
            title: "Foundations of Digital Drawing",
            order: 2,
            lessons: [
              { title: "Sketching Digitally", duration: "22 min", order: 1 },
              { title: "Line Art Mastery", duration: "28 min", order: 2 },
              { title: "Understanding Layers", duration: "18 min", order: 3 },
              { title: "Working with Selections", duration: "20 min", order: 4 },
            ],
          },
          {
            title: "Color & Lighting",
            order: 3,
            lessons: [
              { title: "Digital Color Theory", duration: "25 min", order: 1 },
              { title: "Lighting & Shading Techniques", duration: "30 min", order: 2 },
              { title: "Creating Mood with Color", duration: "22 min", order: 3 },
              { title: "Texture & Material Rendering", duration: "28 min", order: 4 },
            ],
          },
          {
            title: "Character Design",
            order: 4,
            lessons: [
              { title: "Character Proportions", duration: "25 min", order: 1 },
              { title: "Designing Expressions", duration: "22 min", order: 2 },
              { title: "Creating a Character Sheet", duration: "35 min", order: 3 },
              { title: "Posing & Action", duration: "28 min", order: 4 },
              { title: "Outfit & Accessory Design", duration: "30 min", order: 5 },
            ],
          },
          {
            title: "Environment & Background Art",
            order: 5,
            lessons: [
              { title: "Perspective Fundamentals", duration: "25 min", order: 1 },
              { title: "Painting Skies & Landscapes", duration: "30 min", order: 2 },
              { title: "Urban Environments", duration: "28 min", order: 3 },
              { title: "Interior Scenes", duration: "25 min", order: 4 },
            ],
          },
          {
            title: "Commercial & Portfolio Projects",
            order: 6,
            lessons: [
              { title: "Book Cover Illustration", duration: "35 min", order: 1 },
              { title: "Social Media Art", duration: "20 min", order: 2 },
              { title: "Building Your Portfolio", duration: "18 min", order: 3 },
              { title: "Final Project: Full Illustration", duration: "40 min", order: 4 },
            ],
          },
        ],
      },
      {
        title: "Madhubani Art: Preserving Ancient Traditions",
        slug: "madhubani-art-preserving-ancient-traditions",
        description:
          "Dive into the rich world of Madhubani painting, a traditional Indian folk art from Bihar. Learn authentic patterns, motifs, and techniques passed down through generations.",
        price: 999,
        originalPrice: 1999,
        thumbnail: "/courses/madhubani.png",
        level: "Beginner",
        duration: "6h 45m",
        lessons: 18,
        students: 654,
        rating: 4.7,
        ratingCount: 198,
        instructor: "Kavita Devi",
        featured: false,
        bestSeller: false,
        categoryId: catMap["traditional-art"],
        chapters: [
          {
            title: "Introduction to Madhubani Art",
            order: 1,
            lessons: [
              { title: "History & Cultural Significance", duration: "15 min", order: 1 },
              { title: "Traditional Tools & Materials", duration: "20 min", order: 2 },
            ],
          },
          {
            title: "Basic Motifs & Patterns",
            order: 2,
            lessons: [
              { title: "Lotus Motif", duration: "25 min", order: 1 },
              { title: "Fish & Aquatic Life", duration: "22 min", order: 2 },
              { title: "Sun & Moon Patterns", duration: "20 min", order: 3 },
              { title: "Border Designs", duration: "18 min", order: 4 },
            ],
          },
          {
            title: "Human Figures & Deities",
            order: 3,
            lessons: [
              { title: "Drawing Human Figures", duration: "28 min", order: 1 },
              { title: "Lord Krishna Motifs", duration: "30 min", order: 2 },
              { title: "Goddess Durga Imagery", duration: "32 min", order: 3 },
              { title: "Wedding & Festival Scenes", duration: "25 min", order: 4 },
            ],
          },
          {
            title: "Animals & Nature",
            order: 4,
            lessons: [
              { title: "Peacock & Birds", duration: "25 min", order: 1 },
              { title: "Elephants & Horses", duration: "22 min", order: 2 },
              { title: "Tree of Life", duration: "28 min", order: 3 },
            ],
          },
          {
            title: "Complete Projects",
            order: 5,
            lessons: [
              { title: "Wall Art Project", duration: "35 min", order: 1 },
              { title: "Fabric Madhubani Painting", duration: "30 min", order: 2 },
              { title: "Final Composition: Village Scene", duration: "40 min", order: 3 },
            ],
          },
        ],
      },
      {
        title: "Modern Calligraphy & Hand Lettering",
        slug: "modern-calligraphy-hand-lettering",
        description:
          "Master the art of beautiful writing with modern calligraphy techniques. Learn brush pen calligraphy, pointed pen techniques, and creative hand lettering for projects and professional work.",
        price: 1299,
        originalPrice: 2499,
        thumbnail: "/courses/calligraphy.png",
        level: "Beginner",
        duration: "7h 20m",
        lessons: 20,
        students: 1089,
        rating: 4.8,
        ratingCount: 312,
        instructor: "Rahul Kapoor",
        featured: true,
        bestSeller: true,
        categoryId: catMap["calligraphy"],
        chapters: [
          {
            title: "Getting Started with Calligraphy",
            order: 1,
            lessons: [
              { title: "Introduction to Modern Calligraphy", duration: "12 min", order: 1 },
              { title: "Choosing Your Tools", duration: "18 min", order: 2 },
              { title: "Basic Strokes & Grip", duration: "22 min", order: 3 },
            ],
          },
          {
            title: "Mastering the Alphabet",
            order: 2,
            lessons: [
              { title: "Lowercase Letters A-M", duration: "28 min", order: 1 },
              { title: "Lowercase Letters N-Z", duration: "25 min", order: 2 },
              { title: "Uppercase Letters A-M", duration: "30 min", order: 3 },
              { title: "Uppercase Letters N-Z", duration: "28 min", order: 4 },
            ],
          },
          {
            title: "Connecting Letters & Words",
            order: 3,
            lessons: [
              { title: "Letter Connections", duration: "22 min", order: 1 },
              { title: "Word Spacing & Flow", duration: "20 min", order: 2 },
              { title: "Writing Common Words", duration: "25 min", order: 3 },
              { title: "Flourishing Basics", duration: "28 min", order: 4 },
            ],
          },
          {
            title: "Advanced Techniques",
            order: 4,
            lessons: [
              { title: "Bounce Lettering", duration: "22 min", order: 1 },
              { title: "Fake Calligraphy with Regular Pens", duration: "18 min", order: 2 },
              { title: "Creating Layouts & Compositions", duration: "25 min", order: 3 },
            ],
          },
          {
            title: "Projects & Applications",
            order: 5,
            lessons: [
              { title: "Wedding & Event Invitations", duration: "30 min", order: 1 },
              { title: "Logo & Brand Lettering", duration: "25 min", order: 2 },
              { title: "Social Media Quote Art", duration: "20 min", order: 3 },
              { title: "Final Project: Complete Piece", duration: "35 min", order: 4 },
              { title: "Building Your Calligraphy Business", duration: "18 min", order: 5 },
              { title: "Bonus: Digital Calligraphy", duration: "22 min", order: 6 },
            ],
          },
        ],
      },
      {
        title: "Pottery & Ceramic Art Fundamentals",
        slug: "pottery-ceramic-art-fundamentals",
        description:
          "Learn the art of pottery from hand-building to wheel throwing. This course covers clay preparation, various forming techniques, glazing, and firing to create beautiful ceramic pieces.",
        price: 1799,
        originalPrice: 3499,
        thumbnail: "/courses/pottery.png",
        level: "Beginner",
        duration: "10h 45m",
        lessons: 28,
        students: 478,
        rating: 4.6,
        ratingCount: 156,
        instructor: "Sunita Patel",
        featured: false,
        bestSeller: false,
        categoryId: catMap["crafts-sculpture"],
        chapters: [
          {
            title: "Introduction to Pottery",
            order: 1,
            lessons: [
              { title: "Welcome to Pottery & Ceramics", duration: "10 min", order: 1 },
              { title: "Understanding Clay Types", duration: "20 min", order: 2 },
              { title: "Essential Tools & Equipment", duration: "18 min", order: 3 },
            ],
          },
          {
            title: "Hand-Building Techniques",
            order: 2,
            lessons: [
              { title: "Pinch Pot Method", duration: "25 min", order: 1 },
              { title: "Coil Building", duration: "30 min", order: 2 },
              { title: "Slab Construction", duration: "28 min", order: 3 },
              { title: "Combining Techniques", duration: "22 min", order: 4 },
            ],
          },
          {
            title: "Wheel Throwing Basics",
            order: 3,
            lessons: [
              { title: "Preparing & Centering Clay", duration: "25 min", order: 1 },
              { title: "Opening & Pulling Up Walls", duration: "30 min", order: 2 },
              { title: "Shaping Cylinders & Bowls", duration: "28 min", order: 3 },
              { title: "Trimming & Finishing", duration: "22 min", order: 4 },
              { title: "Creating Handles & Attachments", duration: "20 min", order: 5 },
            ],
          },
          {
            title: "Surface Decoration",
            order: 4,
            lessons: [
              { title: "Carving & Sgraffito", duration: "22 min", order: 1 },
              { title: "Slip Trailing & Texture", duration: "25 min", order: 2 },
              { title: "Underglaze Painting", duration: "28 min", order: 3 },
              { title: "Stamping & Pattern Making", duration: "20 min", order: 4 },
            ],
          },
          {
            title: "Glazing & Firing",
            order: 5,
            lessons: [
              { title: "Understanding Glazes", duration: "22 min", order: 1 },
              { title: "Glazing Techniques", duration: "28 min", order: 2 },
              { title: "Kiln Firing Basics", duration: "25 min", order: 3 },
              { title: "Alternative Firing Methods", duration: "20 min", order: 4 },
            ],
          },
          {
            title: "Projects",
            order: 6,
            lessons: [
              { title: "Project: Coffee Mug Set", duration: "35 min", order: 1 },
              { title: "Project: Decorative Vase", duration: "30 min", order: 2 },
              { title: "Project: Serving Platter", duration: "32 min", order: 3 },
              { title: "Final Project: Sculptural Piece", duration: "40 min", order: 4 },
            ],
          },
        ],
      },
      {
        title: "Photography Masterclass: See the World Differently",
        slug: "photography-masterclass-see-the-world-differently",
        description:
          "Transform your photography skills with this comprehensive masterclass. From understanding your camera to advanced composition, lighting, and post-processing techniques.",
        price: 2499,
        originalPrice: 4999,
        thumbnail: "/courses/photography.png",
        level: "Intermediate",
        duration: "15h",
        lessons: 36,
        students: 1567,
        rating: 4.9,
        ratingCount: 489,
        instructor: "Vikram Singh",
        featured: true,
        bestSeller: true,
        categoryId: catMap["photography"],
        chapters: [
          {
            title: "Photography Fundamentals",
            order: 1,
            lessons: [
              { title: "Understanding Your Camera", duration: "20 min", order: 1 },
              { title: "Exposure Triangle Explained", duration: "25 min", order: 2 },
              { title: "Shooting Modes Demystified", duration: "18 min", order: 3 },
            ],
          },
          {
            title: "Mastering Composition",
            order: 2,
            lessons: [
              { title: "Rule of Thirds & Beyond", duration: "22 min", order: 1 },
              { title: "Leading Lines & Geometry", duration: "20 min", order: 2 },
              { title: "Framing & Negative Space", duration: "18 min", order: 3 },
              { title: "Color in Composition", duration: "25 min", order: 4 },
              { title: "Storytelling Through Photos", duration: "28 min", order: 5 },
            ],
          },
          {
            title: "Lighting Mastery",
            order: 3,
            lessons: [
              { title: "Understanding Natural Light", duration: "25 min", order: 1 },
              { title: "Golden Hour & Blue Hour", duration: "22 min", order: 2 },
              { title: "Artificial Lighting Setup", duration: "28 min", order: 3 },
              { title: "Flash Photography", duration: "25 min", order: 4 },
              { title: "Studio Lighting Patterns", duration: "30 min", order: 5 },
            ],
          },
          {
            title: "Genre-Specific Techniques",
            order: 4,
            lessons: [
              { title: "Portrait Photography", duration: "30 min", order: 1 },
              { title: "Landscape Photography", duration: "28 min", order: 2 },
              { title: "Street Photography", duration: "25 min", order: 3 },
              { title: "Macro & Close-up", duration: "22 min", order: 4 },
              { title: "Night Photography", duration: "28 min", order: 5 },
            ],
          },
          {
            title: "Post-Processing",
            order: 5,
            lessons: [
              { title: "Lightroom Workflow", duration: "30 min", order: 1 },
              { title: "Color Grading Techniques", duration: "25 min", order: 2 },
              { title: "Retouching Portraits", duration: "28 min", order: 3 },
              { title: "HDR & Panorama Stitching", duration: "22 min", order: 4 },
            ],
          },
          {
            title: "Business & Portfolio",
            order: 6,
            lessons: [
              { title: "Building Your Photography Portfolio", duration: "22 min", order: 1 },
              { title: "Social Media for Photographers", duration: "18 min", order: 2 },
              { title: "Freelance Photography Business", duration: "25 min", order: 3 },
              { title: "Final Project: Photo Essay", duration: "35 min", order: 4 },
              { title: "Course Wrap-up & Next Steps", duration: "15 min", order: 5 },
            ],
          },
        ],
      },
      {
        title: "Oil Painting: Classical Techniques for Modern Artists",
        slug: "oil-painting-classical-techniques",
        description:
          "Master the timeless art of oil painting with classical techniques adapted for modern artists. Learn glazing, impasto, alla prima, and create museum-worthy pieces.",
        price: 2199,
        originalPrice: 4499,
        thumbnail: "/courses/oil-painting.png",
        level: "Advanced",
        duration: "14h",
        lessons: 30,
        students: 723,
        rating: 4.7,
        ratingCount: 234,
        instructor: "Ananya Reddy",
        featured: false,
        bestSeller: false,
        categoryId: catMap["painting-drawing"],
        chapters: [
          {
            title: "Introduction to Oil Painting",
            order: 1,
            lessons: [
              { title: "History & Medium Overview", duration: "15 min", order: 1 },
              { title: "Materials & Safety", duration: "20 min", order: 2 },
              { title: "Preparing Your Canvas", duration: "18 min", order: 3 },
            ],
          },
          {
            title: "Color & Values",
            order: 2,
            lessons: [
              { title: "Oil Paint Color Mixing", duration: "28 min", order: 1 },
              { title: "Value Studies", duration: "25 min", order: 2 },
              { title: "Temperature & Color Relationships", duration: "22 min", order: 3 },
              { title: "Underpainting Techniques", duration: "30 min", order: 4 },
            ],
          },
          {
            title: "Classical Techniques",
            order: 3,
            lessons: [
              { title: "Glazing Method", duration: "32 min", order: 1 },
              { title: "Impasto Technique", duration: "28 min", order: 2 },
              { title: "Alla Prima (Wet-on-Wet)", duration: "30 min", order: 3 },
              { title: "Scumbling & Dry Brush", duration: "25 min", order: 4 },
              { title: "Fat Over Lean Principle", duration: "20 min", order: 5 },
            ],
          },
          {
            title: "Subject Mastery",
            order: 4,
            lessons: [
              { title: "Classical Still Life", duration: "35 min", order: 1 },
              { title: "Portrait Painting", duration: "40 min", order: 2 },
              { title: "Landscape in Oils", duration: "35 min", order: 3 },
              { title: "Painting Fabric & Drapery", duration: "30 min", order: 4 },
            ],
          },
          {
            title: "Advanced Projects",
            order: 5,
            lessons: [
              { title: "Chiaroscuro Study", duration: "35 min", order: 1 },
              { title: "Palette Knife Painting", duration: "28 min", order: 2 },
              { title: "Large Format Composition", duration: "40 min", order: 3 },
              { title: "Final Project: Master Copy", duration: "45 min", order: 4 },
              { title: "Varnishing & Presentation", duration: "18 min", order: 5 },
            ],
          },
        ],
      },
      {
        title: "UI/UX Design for Creative Professionals",
        slug: "uiux-design-creative-professionals",
        description:
          "A comprehensive UI/UX design course tailored for creatives. Learn design thinking, wireframing, prototyping, and build a stunning portfolio using Figma and modern design principles.",
        price: 3499,
        originalPrice: 6999,
        thumbnail: "/courses/uiux.png",
        level: "Intermediate",
        duration: "20h",
        lessons: 40,
        students: 2134,
        rating: 4.8,
        ratingCount: 678,
        instructor: "Neha Gupta",
        featured: true,
        bestSeller: true,
        categoryId: catMap["digital-art"],
        chapters: [
          {
            title: "UI/UX Foundations",
            order: 1,
            lessons: [
              { title: "What is UI/UX Design?", duration: "15 min", order: 1 },
              { title: "Design Thinking Process", duration: "25 min", order: 2 },
              { title: "Setting Up Figma", duration: "20 min", order: 3 },
            ],
          },
          {
            title: "User Research & Strategy",
            order: 2,
            lessons: [
              { title: "User Personas & Journey Maps", duration: "25 min", order: 1 },
              { title: "Competitive Analysis", duration: "20 min", order: 2 },
              { title: "Information Architecture", duration: "28 min", order: 3 },
              { title: "User Flows", duration: "22 min", order: 4 },
            ],
          },
          {
            title: "Wireframing & Layout",
            order: 3,
            lessons: [
              { title: "Wireframing Basics", duration: "22 min", order: 1 },
              { title: "Grid Systems & Layouts", duration: "25 min", order: 2 },
              { title: "Responsive Design Principles", duration: "28 min", order: 3 },
              { title: "Navigation Patterns", duration: "20 min", order: 4 },
              { title: "Mobile-First Design", duration: "25 min", order: 5 },
            ],
          },
          {
            title: "Visual Design",
            order: 4,
            lessons: [
              { title: "Typography for UI", duration: "25 min", order: 1 },
              { title: "Color Systems & Palettes", duration: "22 min", order: 2 },
              { title: "Iconography & Illustration", duration: "28 min", order: 3 },
              { title: "Component Design", duration: "30 min", order: 4 },
              { title: "Design Systems", duration: "25 min", order: 5 },
            ],
          },
          {
            title: "Prototyping & Interaction",
            order: 5,
            lessons: [
              { title: "Interactive Prototypes in Figma", duration: "30 min", order: 1 },
              { title: "Micro-interactions & Animations", duration: "25 min", order: 2 },
              { title: "Handoff to Developers", duration: "20 min", order: 3 },
              { title: "Usability Testing", duration: "28 min", order: 4 },
            ],
          },
          {
            title: "Portfolio & Career",
            order: 6,
            lessons: [
              { title: "Designing Your Portfolio", duration: "30 min", order: 1 },
              { title: "Case Study Writing", duration: "25 min", order: 2 },
              { title: "Freelancing as a Designer", duration: "22 min", order: 3 },
              { title: "Interview Preparation", duration: "20 min", order: 4 },
              { title: "Final Project: End-to-End App Design", duration: "45 min", order: 5 },
            ],
          },
        ],
      },
    ];

    // Create products with chapters and lessons
    const products = [];
    for (const pData of productsData) {
      const { chapters: chapterData, ...productFields } = pData;

      const product = await db.product.create({
        data: {
          ...productFields,
          shortDesc: productFields.description.slice(0, 120) + "...",
          chapters: {
            create: chapterData.map((ch, chIdx) => ({
              title: ch.title,
              order: ch.order,
              isFree: chIdx === 0,
              lessons: {
                create: ch.lessons.map((l) => ({
                  title: l.title,
                  duration: l.duration,
                  order: l.order,
                })),
              },
            })),
          },
        },
        include: { chapters: { include: { lessons: true } } },
      });

      products.push(product);
    }

    // --- Seed Coupon ---
    const coupon = await db.coupon.create({
      data: {
        code: "KALAKRITI20",
        discount: 20,
        maxUses: 100,
        usedCount: 0,
        minAmount: 999,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    });

    // --- Seed Reviews (3-4 per product) ---
    const reviewTemplates = [
      // Product 0 - Watercolor
      [
        { rating: 5, comment: "Amazing course! Learned so much about watercolor techniques. Priya Ma'am explains everything so clearly." },
        { rating: 5, comment: "The step-by-step approach is perfect for beginners. I went from zero to painting beautiful landscapes in weeks!" },
        { rating: 4, comment: "Great content and well-structured. Would love to see more advanced projects added." },
        { rating: 5, comment: "Best watercolor course I've taken online. The color mixing section alone was worth it." },
      ],
      // Product 1 - Digital Illustration
      [
        { rating: 5, comment: "Arjun is an incredible teacher. His digital illustration techniques are practical and easy to follow." },
        { rating: 5, comment: "This course transformed my digital art skills. The character design module is outstanding!" },
        { rating: 4, comment: "Very comprehensive course. Covers everything from basics to portfolio building." },
        { rating: 5, comment: "Worth every rupee. The projects are challenging but rewarding." },
      ],
      // Product 2 - Madhubani
      [
        { rating: 5, comment: "Beautiful course on our traditional art. Kavita Devi's passion for Madhubani shines through every lesson." },
        { rating: 4, comment: "Wonderful introduction to Madhubani art. The cultural context adds so much depth." },
        { rating: 5, comment: "I never thought I could create such beautiful traditional art. This course made it possible!" },
      ],
      // Product 3 - Calligraphy
      [
        { rating: 5, comment: "The instructor explains concepts very clearly. My lettering has improved dramatically." },
        { rating: 5, comment: "Rahul makes calligraphy so approachable. The bounce lettering section is my favorite!" },
        { rating: 4, comment: "Great course for beginners. Good progression from basic strokes to complete projects." },
        { rating: 5, comment: "I started a small calligraphy business after completing this course. Highly recommended!" },
      ],
      // Product 4 - Pottery
      [
        { rating: 4, comment: "Nice introduction to pottery. The hand-building section is very well done." },
        { rating: 5, comment: "Sunita Patel is a wonderful teacher. Her wheel throwing tutorials are crystal clear." },
        { rating: 4, comment: "Good fundamentals course. Would love a part 2 with more advanced techniques." },
      ],
      // Product 5 - Photography
      [
        { rating: 5, comment: "Vikram Singh is a phenomenal photographer and an even better teacher. This course covers everything!" },
        { rating: 5, comment: "The lighting module alone is worth the price. My photos have improved dramatically." },
        { rating: 5, comment: "Comprehensive, well-structured, and beautifully shot. A must for any photography enthusiast." },
        { rating: 4, comment: "Excellent content. The post-processing section could use more depth, but overall fantastic." },
      ],
      // Product 6 - Oil Painting
      [
        { rating: 5, comment: "Ananya Reddy's teaching of classical techniques is exceptional. The glazing module is a masterclass." },
        { rating: 4, comment: "Challenging but rewarding. Best suited for those with some painting background." },
        { rating: 5, comment: "The chiaroscuro study changed how I see light and shadow. Brilliant course!" },
        { rating: 4, comment: "Very thorough coverage of oil painting techniques. Well worth the investment." },
      ],
      // Product 7 - UI/UX
      [
        { rating: 5, comment: "Neha Gupta makes UI/UX design so accessible. This course helped me land my first design job!" },
        { rating: 5, comment: "The Figma tutorials are incredibly practical. I use what I learned every single day at work." },
        { rating: 5, comment: "Comprehensive course that takes you from design thinking to a complete portfolio. Outstanding value!" },
        { rating: 4, comment: "Great course overall. The design systems module is particularly well done." },
      ],
    ];

    let totalReviews = 0;
    for (let i = 0; i < products.length; i++) {
      const reviews = reviewTemplates[i];
      for (const r of reviews) {
        await db.review.create({
          data: {
            userId: demoUser.id,
            productId: products[i].id,
            rating: r.rating,
            comment: r.comment,
          },
        });
        totalReviews++;
      }
    }

    // --- Count everything ---
    const chapterCount = await db.chapter.count();
    const lessonCount = await db.lesson.count();

    return NextResponse.json({
      success: true,
      counts: {
        categories: categories.length,
        products: products.length,
        chapters: chapterCount,
        lessons: lessonCount,
        users: 1,
        coupons: 1,
        reviews: totalReviews,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}