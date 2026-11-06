// Dental instruments. The first group are in-game weapons ("kind" says how
// each one behaves); the rest appear in procedures, the quiz and the Codex.
// Each has an Easy explanation and a more detailed Dental Pro explanation.
// Educational summaries only — not clinical training.

export const WEAPONS = {
  toothbrush: {
    name: "Toothbrush", icon: "🪥", kind: "sweep",
    easy: "Brush for 2 minutes, twice a day, with fluoride toothpaste. Brushing breaks up plaque before it hardens.",
    pro: "Modified Bass technique: soft bristles angled about 45° toward the gingival sulcus, short vibratory strokes, then a roll toward the occlusal/incisal surface.",
  },
  floss: {
    name: "Floss", icon: "🧵", kind: "whip",
    easy: "Floss cleans between teeth, where a toothbrush can't reach.",
    pro: "Wrap in a C-shape against each proximal surface and slide gently just below the contact into the sulcus to disrupt interproximal biofilm.",
  },
  mirror: {
    name: "Mouth Mirror", icon: "🪞", kind: "aura",
    easy: "The little mirror lets the dentist see hidden spots and bounce light into your mouth.",
    pro: "Four uses: indirect vision, retraction (cheek and tongue), illumination, and transillumination. Front-surface mirrors avoid a double (ghost) image.",
  },
  explorer: {
    name: "Explorer", icon: "🪝", kind: "shot",
    easy: "A thin, pointed hook used to feel the surfaces of teeth and fillings.",
    pro: "Tactile assessment of tooth surfaces, calculus and restoration margins (e.g. #23 shepherd's hook, ODU 11/12 for subgingival). Avoid forceful probing of pits: it can cavitate early lesions; rely on visual and radiographic findings.",
  },
  probe: {
    name: "Periodontal Probe", icon: "📏", kind: "mark",
    easy: "A tiny ruler that measures the pocket between gum and tooth. About 1–3 mm is healthy.",
    pro: "Probing depth in mm at six sites per tooth (MB, B, DB, ML, L, DL). Williams probe marks 1-2-3-5-7-8-9-10 mm; UNC-15 marks every mm to 15. Depths ≥4 mm with bleeding on probing point toward periodontal disease.",
  },
  sickle: {
    name: "Sickle Scaler", icon: "🔪", kind: "slash", bonus: "armored",
    easy: "A pointed scraper that removes hardened tartar above the gumline.",
    pro: "Triangular cross-section, two cutting edges, pointed tip and back. For supragingival calculus; its pointed tip makes it unsuitable for subgingival use.",
  },
  gracey: {
    name: "Gracey Curet", icon: "🥄", kind: "slash", bonus: "subgingival",
    easy: "A thin scraper with a rounded tip that cleans tartar below the gumline.",
    pro: "Area-specific curet: one cutting edge, face offset 70° to the lower shank, rounded toe. 1/2 and 3/4 anteriors; 5/6 anteriors and premolars; 7/8 and 9/10 posterior facial and lingual; 11/12 posterior mesial; 13/14 posterior distal.",
  },
  highspeed: {
    name: "High-Speed Handpiece", icon: "⚡", kind: "burst",
    easy: "The 'drill'. It spins very fast to remove decay, with a water spray to keep the tooth cool.",
    pro: "Air-driven, up to about 400,000 rpm, with water spray coolant to protect the pulp from heat. Used with burs to remove enamel, old restorations and decay, and to shape preparations.",
  },
  airwater: {
    name: "Air-Water Syringe", icon: "💨", kind: "pulse",
    easy: "Sprays air, water, or both to rinse and dry teeth.",
    pro: "Three-way syringe: air, water or spray. A clean, dry, isolated field is essential for bonding composite and sealants.",
  },
  hve: {
    name: "HVE Suction", icon: "🌀", kind: "magnet",
    easy: "Strong suction that removes water, saliva and debris.",
    pro: "High-volume evacuator: removes large volumes of fluid and aerosol during handpiece use. The saliva ejector is the low-volume tip for pooled saliva.",
  },
  curing: {
    name: "Curing Light", icon: "💡", kind: "cone",
    easy: "A blue light that hardens tooth-colored fillings in seconds.",
    pro: "Visible blue light (about 400–500 nm; camphorquinone absorbs near 468 nm) polymerizes light-cured composites, sealants and adhesives. Cure in increments of about 2 mm and use orange eye shields.",
  },
  varnish: {
    name: "Fluoride Varnish", icon: "🛡️", kind: "armor",
    easy: "Fluoride painted onto teeth makes enamel stronger and helps stop early cavities.",
    pro: "5% sodium fluoride varnish (22,600 ppm F) adheres to enamel and releases fluoride, promoting remineralization. Enamel demineralizes below a critical pH of about 5.5.",
  },
  sealant: {
    name: "Sealant", icon: "🧴", kind: "shield",
    easy: "A thin plastic coating painted into the grooves of back teeth to keep cavities out.",
    pro: "Resin pit-and-fissure sealant: clean, isolate, etch (35–37% phosphoric acid), rinse, dry, apply, light-cure, then check retention and occlusion.",
  },
};

// Instruments and materials that appear in procedures, the quiz and the Codex.
export const TOOLS = {
  bitewing: {
    name: "Bitewing Radiograph", icon: "🩻",
    easy: "An X-ray that shows the sides of back teeth, where cavities hide between them.",
    pro: "Shows the crowns of posterior teeth and the crestal bone; the best radiograph for detecting interproximal (Class II) caries.",
  },
  periapical: {
    name: "Periapical Radiograph", icon: "🩻",
    easy: "An X-ray of a whole tooth, from crown to root tip.",
    pro: "Shows the entire tooth and surrounding bone to the apex; used to evaluate periapical pathology and for endodontic working length.",
  },
  panoramic: {
    name: "Panoramic Radiograph", icon: "🩻",
    easy: "One wide X-ray of all your teeth and jaws.",
    pro: "Extraoral image of both arches, TMJs and sinuses; useful for third molars and impactions, less detailed than intraoral films.",
  },
  syringe: {
    name: "Anesthetic Syringe", icon: "💉",
    easy: "Numbs the area so treatment doesn't hurt.",
    pro: "Aspirating syringe. A common anesthetic is 2% lidocaine with 1:100,000 epinephrine. Mandibular molars are usually anesthetized with an inferior alveolar nerve block; maxillary teeth usually by infiltration. Aspirate to avoid intravascular injection.",
  },
  dam: {
    name: "Rubber Dam", icon: "🟩",
    easy: "A stretchy sheet that keeps one tooth dry and separate from the rest of the mouth.",
    pro: "Isolation for moisture control, visibility and airway protection. For restorations the clamp often goes one tooth distal; for root canal treatment it goes on the treated tooth.",
  },
  lowspeed: {
    name: "Slow-Speed Handpiece", icon: "🔩",
    easy: "A slower drill used for gentle work and polishing.",
    pro: "High torque at lower speeds (typically under about 40,000 rpm): removing soft carious dentin near the pulp, finishing, and polishing with a prophy angle.",
  },
  matrix: {
    name: "Matrix Band & Wedge", icon: "🧱",
    easy: "A thin metal band that acts like a temporary wall while the filling is placed.",
    pro: "Recreates the missing proximal wall in Class II restorations; the wedge seals the gingival margin and separates teeth slightly for a tight contact.",
  },
  composite: {
    name: "Composite Resin", icon: "🦷",
    easy: "Tooth-colored filling material that bonds to the tooth.",
    pro: "Resin matrix with filler particles; bonded after etching and adhesive, placed in increments of about 2 mm and light-cured to reduce polymerization shrinkage stress.",
  },
  files: {
    name: "Endodontic Files", icon: "🪡",
    easy: "Tiny flexible files that clean the inside of a tooth's roots.",
    pro: "Stainless steel K-files and rotary NiTi files clean and shape canals to working length, with sodium hypochlorite irrigation to dissolve tissue and disinfect.",
  },
  guttapercha: {
    name: "Gutta-Percha", icon: "🟠",
    easy: "A rubbery material that fills and seals the roots after a root canal.",
    pro: "Thermoplastic obturation material used with a sealer to fill the cleaned, shaped canal space.",
  },
  elevator: {
    name: "Elevator", icon: "🔧",
    easy: "A tool that gently loosens a tooth before it is removed.",
    pro: "Luxates the tooth and expands the socket before forceps delivery (e.g. straight elevator).",
  },
  forceps: {
    name: "Extraction Forceps", icon: "🗜️",
    easy: "Special pliers that remove a loosened tooth.",
    pro: "Deliver the luxated tooth with controlled force. Universal forceps: #150 for maxillary teeth, #151 for mandibular teeth.",
  },
  prophy: {
    name: "Prophy Angle & Paste", icon: "🌀",
    easy: "A spinning rubber cup with gritty paste that polishes teeth.",
    pro: "Rubber cup on a slow-speed handpiece removes extrinsic stain and residual biofilm after scaling.",
  },
};

export const ALL_INSTRUMENTS = { ...WEAPONS, ...TOOLS };
