/* =====================================================================
   CONTENT FILE: THE ONLY FILE YOU NEED TO EDIT
   ---------------------------------------------------------------------
   Everything on the website comes from here: text, colours, fonts,
   images, videos, labels, which sections show, and animation options.

   RULES (so nothing breaks):
   1. Keep the "quotes" around text.
   2. Keep the comma at the end of every line.
   3. Lines starting with // are notes. They do nothing.
   4. To switch something off, use false. To switch on, use true.

   MAP OF THIS FILE:
     1. BASIC INFO         name, role, intro, email
     2. THEME              colours and fonts
     3. SETTINGS           cursor, animations, photo style
     4. HEADER             header photo, floating cards, typing panel
     5. MOVING BAND        the big scrolling words under the header
     6. SECTIONS           show/hide and rename each section
     7. ABOUT              about text, photos, numbers
     8. SERVICES           what you offer
     9. WORKS              your videos (add / remove / reorder here)
    10. CONTACT            contact heading, form labels, messages
    11. SOCIAL & FOOTER    social links and footer text
   ===================================================================== */

const SITE = {

  /* ------------------------------------------------------------------
     1. BASIC INFO
     ------------------------------------------------------------------ */
  name: "Abhishek Bind",                      // shown in header, top bar and footer
  role: "Creative Director",                  // shown large under your name, and at the top of the header
  disciplines: "Direction · Cinematography · Editing",
  tagline:
    "I direct, shoot and edit films with a cinematic eye, turning simple ideas into stories that connect instantly.",
  email: "ak.rk.bind@gmail.com",
  availability: "Available for new projects", // small line with a glowing dot ("" = hide)
  showreel: "",                               // YouTube link/ID of your showreel (or an .mp4 file name), or "" to hide
  showreelThumbnail: "",                      // cover image for the showreel (optional)
  showreelFormat: "horizontal",               // "horizontal" or "vertical"
  videoFolder: "videos/",                     // only needed if you use .mp4 files (instead of YouTube)


  /* ------------------------------------------------------------------
     2. THEME  (colours + fonts)
     The site alternates dark and light sections:
       header, contact, footer = dark      about = dark grey
       moving band, services   = white     work  = light (off-white)
     Colours: any hex code, e.g. "#ffffff".
     Fonts: any Google Font name. Then paste its link in fontsUrl.
     ------------------------------------------------------------------ */
  theme: {
    dark: "#0b0b0b",          // near-black sections
    darkGrey: "#151515",      // dark grey section (About)
    light: "#f4f3f0",         // off-white section (Work)
    white: "#ffffff",         // white sections (moving band, Services)
    textOnDark: "#f2f1ee",    // text colour on dark sections
    textOnLight: "#0d0d0d",   // text colour on light sections
    serifFont: "Instrument Serif",     // your name, big numbers and the italic words
    sansFont: "Inter Tight",           // headings and all other text
    fontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
  },


  /* ------------------------------------------------------------------
     3. SETTINGS
     ------------------------------------------------------------------ */
  settings: {
    customCursor: true,          // glowing dot + ring cursor (desktop only)
    smoothScroll: false,         // true = extra-soft (delayed) mouse-wheel scrolling, false = normal scrolling
    intro: true,                 // short loading screen with your name (shown once per visit)
    particles: true,             // small stars in the header that move away from the mouse
    grain: true,                 // film grain over the whole site
    mouseGlow: false,            // very soft light that follows the mouse
    tilt: true,                  // video cards tilt in 3D under the mouse
    photoStyle: "bw",            // "bw" = black & white, full colour on hover (tap on phones), "color" = always colour
    thumbsBlackAndWhite: true,   // true = video covers are B&W and turn colour on hover
    nameOnTwoLines: false,       // true = name always on two lines (phones switch automatically when needed)
    countUpSeconds: 1.6,         // how long the numbers take to count up
    showFilters: true,           // category filter buttons above the videos
    hoverPreview: true,          // video plays (muted) when the mouse is on its card (desktop)
    viewerStartsMuted: false,    // true = opened video starts muted
    skipSeconds: 10,             // how far the forward / back buttons jump
    protectVideos: true,         // blocks right-click and dragging on videos and covers
  },


  /* ------------------------------------------------------------------
     4. HEADER
     layout: "center"     photo in the middle with floating cards around it
             "background" photo behind everything (faded)
             "none"       no photo
     ------------------------------------------------------------------ */
  hero: {
    image:
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Shooting2.jpg",
    alt: "Abhishek Bind",
    layout: "center",
    opacity: 0.35,                         // only for "background": photo strength, 0 to 1
    year: "2026",                          // small "Year 2026." label ("" = hide)
    label: "Portfolio / Vol. 01",          // small label in the top row ("" = hide)

    // Glass cards floating around the photo (they glide away from the mouse). Use 2 to 4.
    chips: [
      { title: "Script",    sub: "Story & Text" },
      { title: "Dynamics",  sub: "Camera" },
      { title: "Emotions",  sub: "Character Mood" },
      { title: "Voiceover", sub: "Sound & SFX" },
    ],

    // "Currently" panel on the right: the big word changes and the line is typed out.
    nowLabel: "02 — Currently",
    prompts: [
      { status: "Directing",  text: "Warm highlights, deep shadows, one clear idea in every frame." },
      { status: "Editing",    text: "Cutting to the beat. Every frame has to earn its place." },
      { status: "Grading",    text: "True skin tones, rich blacks, colour that feels like memory." },
      { status: "Generating", text: "GenAI scenes that go beyond what the budget could shoot." },
    ],
  },
  heroButtons: {
    primary: "View selected work",   // main button, scrolls to your work
    showreel: "Watch showreel",      // only shown if showreel is set above
    talk: "Let's talk",              // top-right button and chat button in the glass panel
  },


  /* ------------------------------------------------------------------
     5. MOVING BAND (big words that scroll sideways under the header)
     marquee:      big words. [] = automatic (your disciplines + services)
     marqueeLines: small lines in the second row. [] = hide the row
     ------------------------------------------------------------------ */
  marquee: ["Direction", "Cinematography", "Editing", "Colour", "Motion", "GenAI"],
  marqueeLines: [
    "Light shapes the story",
    "Cut on emotion",
    "Sound is half the picture",
    "Colour is a feeling",
    "Stillness before the shot",
  ],


  /* ------------------------------------------------------------------
     6. SECTIONS
     show:     true / false (hide a whole section)
     nav:      word in the top menu ("" = not in menu)
     title:    big heading (the last word gets the glowing italic style)
     subtitle: small text next to heading ("" = none)
     ------------------------------------------------------------------ */
  sections: {
    work:     { show: true, nav: "Work",    title: "Selected Work", subtitle: "Films, brand stories & reels" },
    about:    { show: true, nav: "About",   title: "Behind the lens", subtitle: "The person behind the camera" },
    services: { show: true, nav: "",        title: "What I do",     subtitle: "From idea to final grade" },
    contact:  { show: true, nav: "Contact", title: "Contact",       subtitle: "Let's work together" },
  },
  filterAllLabel: "All",      // text of the first filter button


  /* ------------------------------------------------------------------
     7. ABOUT
     ------------------------------------------------------------------ */
  about: {
    // Photos that fade one into the next. Visitors can click the small bars to jump.
    images: [
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Shooting2.jpg",
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Presentation.jpg",
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Setup1.jpg",
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Shooting.jpg",
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Timeline2.png",
      "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/Camera.jpg",
    ],
    fadeSeconds: 1.2,       // how long each fade takes
    holdSeconds: 2.5,       // how long each photo stays on screen
    imageAlt: "Portrait of Abhishek Bind",
    heading: "A filmmaker with a cinematic approach.",
    paragraphs: [
      "I am Abhishek Bind, a filmmaker who directs, shoots and edits content with a cinematic approach.",
      "I create impactful visual stories for brands, creators and personal projects, supported by motion graphics, colour grading and modern AI tools, transforming simple ideas into films, reels and long-form videos that connect instantly with the audience.",
    ],
  },

  // Numbers that count up. Examples: "50+", "4+", "1.5K", "₹2M". Use [] for none.
  stats: [
    { value: "50+", label: "Films delivered" },
    { value: "4+",  label: "Years of experience" },
    { value: "20+", label: "Brands & creators" },
  ],


  /* ------------------------------------------------------------------
     8. SERVICES  (copy a { } block to add one, delete a block to remove)
     ------------------------------------------------------------------ */
  services: [
    { title: "Creative Direction", text: "Concept, script, look and feel, shaping an idea into a clear visual language." },
    { title: "Cinematography",     text: "Lighting, framing and camera work built to serve the story." },
    { title: "Editing & Post",     text: "Pacing, colour grading, motion graphics, VFX, sound and SFX design." },
    { title: "GenAI Production",   text: "AI-generated scenes, narration and visuals that overcome production limits." },
  ],


  /* ------------------------------------------------------------------
     9. WORKS  (your videos)
     ADD    → copy one { } block, paste it below the last one, edit it.
     REMOVE → delete the block (or add  hidden: true,  to keep it for later).
     REORDER→ move blocks up or down. Order here = order on the site.

     Fields:
       title        name of the project
       category     groups videos for the filter buttons
       year         optional
       client       optional
       role         your role on it
       format       "horizontal" (16:9)  or  "vertical" (9:16)
       youtube      YouTube link OR the 11-letter video ID. Any of these work:
                      "https://www.youtube.com/watch?v=QsXyP8juI_w"
                      "https://youtu.be/QsXyP8juI_w"
                      "https://www.youtube.com/shorts/QsXyP8juI_w"
                      "QsXyP8juI_w"
                    The video plays INSIDE your website. In YouTube Studio, set
                    the video to Public or Unlisted and keep "Allow embedding" ON.
       video        OPTIONAL: use this instead of youtube if you host an .mp4
                    file in your repo, e.g. "ek-villain.mp4" (videos/ folder).
       thumbnail    YOUR cover image (link or path like "images/cover.jpg").
                    Leave "" to use YouTube's automatic cover.
       description  short text
       tools        small tags
       hidden       true = hide this video
     ------------------------------------------------------------------ */
  works: [
    {
      title: "Artium x Sonu Nigam",
      category: "Brand",
      year: "2026",
      client: "Artium Academy",
      role: "Director, Cinematographer, Editor",
      format: "horizontal",
      youtube: "wXz7uEpQGME",
      thumbnail: "",
      description:
        "It's a short film about a young man who must choose between his dream of becoming a cricketer and his family responsibilities. It’s a story about dreams, and the sacrifices we make in life.",
      tools: ["Sound Design", "Visual Storytelling", "Colour Grading"],
    },
    {
      title: "Artium | Business Showcase",
      category: "Brand",
      year: "2026",
      client: "Artium Academy",
      role: "Director, Cinematographer, Editor",
      format: "horizontal",
      youtube: "smGodYCAxL8",
      thumbnail: "",
      description:
        "It's a short film about a young man who must choose between his dream of becoming a cricketer and his family responsibilities. It’s a story about dreams, and the sacrifices we make in life.",
      tools: ["Sound Design", "Visual Storytelling", "Colour Grading"],
    },
    {
      title: "The Cost of Time: Sacrifice | Short Film",
      category: "Personal",
      year: "2025",
      client: "Self-initiated",
      role: "Director, Cinematographer, Editor",
      format: "horizontal",
      youtube: "Pdmp1P3y0eY",
      thumbnail: "",
      description:
        "It's a short film about a young man who must choose between his dream of becoming a cricketer and his family responsibilities. It’s a story about dreams, and the sacrifices we make in life.",
      tools: ["Sound Design", "Visual Storytelling", "Colour Grading"],
    },
    {
      title: "Legends Of Cibop",
      category: "Performance",
      year: "2026",
      client: "Imarticus Learning",
      role: "Director, Editor",
      format: "horizontal",
      youtube: "oEboJQ78XC0",
      thumbnail: "",
      description:
        "A brand launch film built on ISFB's brand guidelines, with dynamic motion graphics and an AI-generated classroom to overcome production limitations.",
      tools: ["Brand Film", "Motion Graphics", "GenAI"],
    },
    {
      title: "ISFB Campus Walkthrough",
      category: "Brand",
      year: "2026",
      client: "Imarticus School of Finance & Business ",
      role: "Director, Editor",
      format: "horizontal",
      youtube: "h3xiFr350_8",
      thumbnail: "",
      description:
        "A narrative documentary following a student's journey, with emotional storytelling, GenAI scenes, colour grading, SFX and AI narration.",
      tools: ["Documentary", "GenAI", "Sound Design"],
    },
    {
      title: "Full Roadmap: Investment Banking as a Fresher",
      category: "Social",
      year: "2026",
      client: "Imarticus Learning",
      role: "Editor, Motion Designer",
      format: "horizontal",
      youtube: "UrpRGbr3IWQ",
      thumbnail: "",
      description:
        "An educational green-screen video with clean compositing, colour grading, motion graphics and GenAI-generated visuals.",
      tools: ["Compositing", "Motion Graphics", "GenAI"],
    },

    {
      title: "Why to Choose Artium Academy",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus",
      role: "Director, Cinematographer, Editor",
      format: "vertical",
      youtube: "-W-NiS5oqKU",
      thumbnail: "",
      description:
        "A cinematic bike sequence, gearing up and riding, with SFX, exhaust VFX, thunder effects and clean post-production.",
      tools: ["VFX", "SFX"],
    },
    {
      title: "Why CMA?",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus",
      role: "Director, Cinematographer, Editor",
      format: "vertical",
      youtube: "5FLwRM4yvtk",
      thumbnail: "",
      description:
        "A cinematic bike sequence, gearing up and riding, with SFX, exhaust VFX, thunder effects and clean post-production.",
      tools: ["VFX", "SFX"],
    },
    {
      title: "What is ACCA",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus",
      role: "Editor",
      format: "vertical",
      youtube: "Lp8E83TFUNE",
      thumbnail: "",
      description:
        "Explains Amazon's tracking and collaborative filtering using GenAI visuals and motion graphics.",
      tools: ["GenAI", "Motion Graphics"],
    },
    {
      title: "Finance Career After Bcom",
      category: "Social",
      year: "2026",
      client: "Imarticus",
      role: "Editor",
      format: "vertical",
      youtube: "NuC9B7n501Y",
      thumbnail: "",
      description:
        "Explains Amazon's tracking and collaborative filtering using GenAI visuals and motion graphics.",
      tools: ["GenAI", "Motion Graphics"],
    },
    {
      title: "DSAI",
      category: "Leadgen",
      year: "2025",
      client: "DSAI",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "2iCstB0P9FM",
      thumbnail:
        "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/DSAILeadGen.jpg",
      description:
        "A green-screen lead-gen ad where the speaker explains course details, visualised through motion graphics and sharp storytelling.",
      tools: ["Green Screen", "Motion Graphics"],
    },
    {
      title: "CFA Isn't That Tough",
      category: "Podcast",
      year: "2025",
      client: "CFA Podcast",
      role: "Editor",
      format: "vertical",
      youtube: "2jGMaoHA0Kg",
      thumbnail:
        "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/RajeshCFA.jpg",
      description:
        "A CFA podcast clip visualising exam levels and concepts using motion graphics, grading and SFX.",
      tools: ["Motion Graphics", "SFX"],
    },
    {
      title: "Get Hired Abroad With ACCA",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus",
      role: "Editor",
      format: "vertical",
      youtube: "p6DAC4SOtA4",
      thumbnail: "",
      description:
        "Explains Amazon's tracking and collaborative filtering using GenAI visuals and motion graphics.",
      tools: ["GenAI", "Motion Graphics"],
    },


    /* ---- TEMPLATE: copy the block below (without these grey note lines) to add a video ----
    {
      title: "New Project",
      category: "Brand",
      year: "2026",
      client: "Client Name",
      role: "Director, Editor",
      format: "horizontal",
      youtube: "VIDEO_ID_OR_YOUTUBE_LINK",
      thumbnail: "",
      description: "One or two lines about the project.",
      tools: ["Colour Grading"],
    },
    ------------------------------------------------------------------------- */
  ],


  /* ------------------------------------------------------------------
     10. CONTACT
     ------------------------------------------------------------------ */
  formEndpoint: "https://formspree.io/f/mnnladay",   // your Formspree link (receives messages)
  contact: {
    headingLine1: "Have a story",
    headingLine2: "to tell?",                       // shown in the glowing italic style
    labels: { name: "Your name", email: "Email address", message: "Tell me about the project", button: "Send message" },
    copyLabel: "Copy",
    copiedLabel: "Copied",
    sending: "Sending…",
    success: "Thank you. Your message has been sent.",
    error: "Something went wrong. Please try again or email me directly.",
  },


  /* ------------------------------------------------------------------
     11. SOCIAL LINKS & FOOTER
     Social: remove the // in front of a line and add your link.
     Footer: "" = automatic "© year name".
     ------------------------------------------------------------------ */
  social: [
    // { label: "Instagram", url: "https://instagram.com/yourhandle" },
    // { label: "YouTube",   url: "https://youtube.com/@yourchannel" },
    // { label: "LinkedIn",  url: "https://linkedin.com/in/yourname" },
  ],
  footerText: "",
};
