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
    "Filmmaker from Mumbai. I direct short films with my team at Cinetellex and lead productions from guru interviews in Rishikesh to live events, podcasts and brand films, with motion graphics and AI visuals built in, first idea to last cut.",
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
    label: "Portfolio",          // small label in the top row ("" = hide)

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
      { status: "Directing",  text: "I decide how a story feels and where it goes. One clear idea in every frame." },
      { status: "Cinematography",    text: "Camera, light and movement. Every frame has to earn its place." },
      { status: "Editing",    text: "Cuts, colour and sound that keep people watching." },
      { status: "Motion & AI", text: "Motion graphics, VFX and Gen AI video, used when they make the story better." },
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
      "I’m Abhishek Bind. I don’t see myself as someone who just makes videos. I’m there to make the content better than the brief I was given.",
      "I take ownership and care about the small decisions, like the pause before a line, the light on a face or the one shot that says it all, because those are what people remember.   Whether it’s a brand story or a short film, my job is the same: find the simplest way to say it, and make it look and sound like it matters.",
    ],
  },

  // Numbers that count up. Examples: "50+", "4+", "1.5K", "₹2M". Use [] for none.
  stats: [
    { value: "200+", label: "Videos delivered" },
    { value: "5+",  label: "Years of experience" },
    { value: "20+", label: "Brands & creators" },
  ],


  /* ------------------------------------------------------------------
     8. SERVICES  (copy a { } block to add one, delete a block to remove)
     ------------------------------------------------------------------ */
  services: [
    { title: "Creative Direction", text: "I start with the idea, then write it, plan it and decide how it should look and feel." },
    { title: "Cinematography",     text: "Lighting, framing and camera movement, built to serve the story." },
    { title: "Editing & Post",     text: "Pacing, colour grading, motion graphics, VFX and sound design." },
    { title: "GenAI Production",   text: "AI scenes, narration and visuals that overcome production limits." },
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
      role: "Editor, Motion Designer",
      format: "horizontal",
      youtube: "wXz7uEpQGME",
      thumbnail: "",
      description:
        "A film made for Sonu Nigam’s London concert. I edited the whole thing: sound design, motion graphics and compositing.",
      tools: ["Sound Design", "Motion Graphics", "Compositing"],
    },
    {
      title: "Artium | Business Showcase",
      category: "Brand",
      year: "2026",
      client: "Artium Academy",
      role: "Director, Editor, Motion Designer",
      format: "horizontal",
      youtube: "smGodYCAxL8",
      thumbnail: "",
      description:
        "Made for investors who needed to understand what Artium is and what it offers.",
      tools: ["Corporate Film", "Visual Storytelling", "Motion Graphics"],
    },
    {
      title: "The Cost of Time: Sacrifice",
      category: "Personal",
      year: "2025",
      client: "Cinetellex (Personal)",
      role: "Writer, Director, DOP, Editor",
      format: "horizontal",
      youtube: "Pdmp1P3y0eY",
      thumbnail: "",
      description:
        "A young man has to choose between his dream of becoming a cricketer and his family’s responsibilities. It’s a story about dreams and the sacrifices we make. I wrote, directed, shot and edited it myself.",
      tools: ["Screenplay", "Cinematography", "Visual Storytelling"],
    },
    {
      title: "Legends Of CIBOP",
      category: "Performance",
      year: "2026",
      client: "Imarticus Learning",
      role: "Director, DOP, Editor",
      format: "horizontal",
      youtube: "oEboJQ78XC0",
      thumbnail: "",
      description:
        "A film for CIBOP learners from Imarticus who now work at Goldman Sachs, Morgan Stanley, BNY and other big firms. Shot with the founder, who features in it. I directed, shot and edited it.",
      tools: ["Direction", "Motion Graphics", "Interview"],
    },
    {
      title: "ISFB Campus Walkthrough",
      category: "Brand",
      year: "2026",
      client: "Imarticus School of Finance & Business ",
      role: "DOP, Editor",
      format: "horizontal",
      youtube: "h3xiFr350_8",
      thumbnail: "",
      description:
        "A launch film that walks through ISFB’s classrooms, meeting room, gaming room and library, and shows what students can look forward to. Cameras weren’t allowed to show the campus building, so I built those shots from still images using AI. I shot the B-roll and edited the full film.",
      tools: ["Brand Launch", "GenAI", "Cinematography"],
    },
    {
      title: "Full Roadmap: Investment Banking as a Fresher",
      category: "Social",
      year: "2026",
      client: "Imarticus Learning",
      role: "DOP, Editor",
      format: "horizontal",
      youtube: "UrpRGbr3IWQ",
      thumbnail: "",
      description:
        "An educational green-screen video with clean compositing, colour grading, motion graphics and GenAI-generated visuals.",
      tools: ["Motion Graphics", "Storytelling", "Educational"],
    },

    {
      title: "Why to Choose Artium Academy",
      category: "Leadgen",
      year: "2026",
      client: "Artium Academy",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "-W-NiS5oqKU",
      thumbnail: "",
      description:
        "A cinematic bike sequence, gearing up and riding, with SFX, exhaust VFX, thunder effects and clean post-production.  The Artium story, Built as a vertical film for students and parents. It’s animation-heavy, built with SaaS-style motion graphics that explain what Artium offers in a few quick, clean scenes.",
      tools: ["SaaS Animation", "Motion Graphics"],
    },
    {
      title: "Why CMA?",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus Learning",
      role: "Director, DOP, Editor",
      format: "vertical",
      youtube: "5FLwRM4yvtk",
      thumbnail: "",
      description:
        "A cinematic take on one question: why choose CMA? The idea was mine, and I shot and edited it to feel more like a short film than a course ad.",
      tools: ["Cinematography", "Colour Grading"],
    },
    {
      title: "What is ACCA",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus Learning",
      role: "Director, DOP, Editor",
      format: "vertical",
      youtube: "Lp8E83TFUNE",
      thumbnail: "",
      description:
        "A cinematic vertical film on why ACCA is worth it. I came up with the idea, shot it and edited it.",
      tools: ["Cinematography", "Colour Grading"],
    },
    {
      title: "Finance Career After Bcom",
      category: "Social",
      year: "2026",
      client: "Imarticus Learning",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "NuC9B7n501Y",
      thumbnail: "",
      description:
        "A talking-head video on the finance careers open to B.Com graduates. I added heavy motion graphics over the speaker and used AI-generated visuals",
      tools: ["GenAI", "Motion Graphics"],
    },
    {
      title: "DSAI",
      category: "Leadgen",
      year: "2025",
      client: "Imarticus Learning",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "2iCstB0P9FM",
      thumbnail:
        "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/DSAILeadGen.jpg",
      description:
        "A lead-gen talking-head video for the DSAI course. The edit is dense with motion graphics, so every point on the programme lands visually while it’s being said.",
      tools: ["Green Screen", "Motion Graphics"],
    },
    {
      title: "CFA Isn't That Tough",
      category: "Podcast",
      year: "2025",
      client: "Imarticus Learning",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "2jGMaoHA0Kg",
      thumbnail:
        "https://raw.githubusercontent.com/abhibind/portfolio-image/refs/heads/main/RajeshCFA.jpg",
      description:
        "A podcast-style conversation that takes the fear out of the CFA. I cut it and used animation throughout to explain the ideas visually, so hard concepts are easy to follow.",
      tools: ["Motion Graphics", "Animation"],
    },
    {
      title: "Get Hired Abroad With ACCA",
      category: "Leadgen",
      year: "2026",
      client: "Imarticus Learning",
      role: "Editor, Motion Designer",
      format: "vertical",
      youtube: "p6DAC4SOtA4",
      thumbnail: "",
      description:
        "A trending format recreated in our own style, with Google Maps–style miniature edits. The map-zoom look carries the idea of working abroad.",
      tools: ["Miniature Edit", "Trend"],
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
