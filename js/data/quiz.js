// Quiz bank. "answer" is the index of the correct option; "why" is shown
// after answering. "cases" lists the cases a question belongs to (empty =
// general knowledge, usable after any case).

export const QUESTIONS = [
  // ------------------------------------------------------------- Easy mode
  { id: "e-brush", mode: "easy", cases: ["checkup"], q: "How long should you brush your teeth each time?", options: ["About 2 minutes", "About 10 seconds", "About 10 minutes", "Only after dessert"], answer: 0, why: "Two minutes, twice a day, with fluoride toothpaste." },
  { id: "e-gingivitis", mode: "easy", cases: ["checkup"], q: "Gingivitis means…", options: ["Red, bleeding gums that can heal", "A broken tooth", "A type of filling", "A wisdom tooth"], answer: 0, why: "Gingivitis is gum inflammation, and it's reversible with good cleaning." },
  { id: "e-floss", mode: "easy", cases: ["checkup", "classII"], q: "What does floss clean that a toothbrush can't?", options: ["Between the teeth", "The tongue", "The roof of the mouth", "The lips"], answer: 0, why: "Floss reaches the surfaces between teeth." },
  { id: "e-tartar", mode: "easy", cases: ["tartar"], q: "What is tartar?", options: ["Plaque that hardened", "A kind of toothpaste", "Tooth enamel", "A gum disease germ"], answer: 0, why: "Plaque mineralizes into tartar (calculus), which needs a professional cleaning." },
  { id: "e-mirror", mode: "easy", cases: ["tartar"], q: "Why does the dentist use a small mirror?", options: ["To see hidden spots", "To whiten teeth", "To numb the gums", "To measure pockets"], answer: 0, why: "It shows surfaces you can't see directly and reflects light." },
  { id: "e-sugar", mode: "easy", cases: ["classI"], q: "What do cavity-causing bacteria feed on?", options: ["Sugar", "Water", "Fluoride", "Calcium"], answer: 0, why: "Bacteria turn sugar into acid that dissolves enamel." },
  { id: "e-cure", mode: "easy", cases: ["classI", "classII"], q: "What does the blue curing light do?", options: ["Hardens tooth-colored fillings", "Whitens teeth", "Numbs the tooth", "Kills the nerve"], answer: 0, why: "The blue light hardens (cures) composite fillings." },
  { id: "e-sealant", mode: "easy", cases: ["classI"], q: "Where do sealants go?", options: ["Grooves of back teeth", "Under the gums", "On the tongue", "Inside the root"], answer: 0, why: "Sealants fill the deep grooves where cavities often start." },
  { id: "e-bitewing", mode: "easy", cases: ["classII"], q: "Which X-ray finds cavities between back teeth?", options: ["Bitewing", "Chest X-ray", "Hand X-ray", "Bone scan"], answer: 0, why: "Bitewings show the sides of back teeth, where cavities hide." },
  { id: "e-pocket", mode: "easy", cases: ["perio"], q: "Healthy gum pockets usually measure about…", options: ["1–3 mm", "6–8 mm", "10–12 mm", "20 mm"], answer: 0, why: "1–3 mm is healthy; deeper pockets with bleeding suggest gum disease." },
  { id: "e-perio", mode: "easy", cases: ["perio"], q: "What does a periodontal probe do?", options: ["Measures gum pockets", "Drills teeth", "Takes X-rays", "Hardens fillings"], answer: 0, why: "It's a tiny ruler marked in millimeters." },
  { id: "e-pulp", mode: "easy", cases: ["endo"], q: "Which part of the tooth has nerves and blood vessels?", options: ["Pulp", "Enamel", "Crown", "Gums"], answer: 0, why: "The pulp is the soft living center of the tooth." },
  { id: "e-rootcanal", mode: "easy", cases: ["endo"], q: "A root canal cleans out…", options: ["The inside of the tooth's roots", "The gums", "The outside of the tooth", "The tongue"], answer: 0, why: "Infected pulp is removed and the canals are cleaned, shaped and sealed." },
  { id: "e-wisdom", mode: "easy", cases: ["extraction"], q: "After a tooth is pulled, why avoid straws?", options: ["Suction can pull out the healing clot", "Straws stain teeth", "They cause cavities", "No reason"], answer: 0, why: "Losing the clot causes a painful 'dry socket'." },
  { id: "e-enamel", mode: "easy", cases: [], q: "What's the hardest substance in your body?", options: ["Tooth enamel", "Bone", "Fingernails", "Dentin"], answer: 0, why: "Enamel is about 96% mineral." },
  { id: "e-fluoride", mode: "easy", cases: [], q: "What helps make enamel stronger?", options: ["Fluoride", "Soda", "Candy", "Ice"], answer: 0, why: "Fluoride helps enamel resist acid and repair early damage." },
  { id: "e-adult", mode: "easy", cases: [], q: "How many permanent teeth do most adults have (including wisdom teeth)?", options: ["32", "20", "28", "36"], answer: 0, why: "32, numbered 1–32 in the Universal system. Children have 20 baby teeth." },
  { id: "e-hve", mode: "easy", cases: [], q: "Why does the dentist use suction?", options: ["To remove water, saliva and debris", "To pull teeth", "To whiten teeth", "To check pockets"], answer: 0, why: "Suction keeps the area clear so the dentist can see and work." },

  // ------------------------------------------------------------ Dental Pro
  { id: "p-19", mode: "pro", cases: ["classII"], q: "In the Universal system, #19 is the…", options: ["Mandibular left first molar", "Maxillary left first molar", "Mandibular right first molar", "Mandibular left second premolar"], answer: 0, why: "#17 is the mandibular left third molar, so #19 is the first molar (FDI 36)." },
  { id: "p-30", mode: "pro", cases: ["classI", "perio"], q: "In the Universal system, #30 is the…", options: ["Mandibular right first molar", "Mandibular left first molar", "Maxillary right first molar", "Mandibular right second molar"], answer: 0, why: "#32 is the mandibular right third molar, so #30 is the first molar (FDI 46)." },
  { id: "p-3fdi", mode: "pro", cases: ["endo"], q: "Universal #3 in FDI notation is…", options: ["16", "13", "26", "46"], answer: 0, why: "Quadrant 1 (upper right), sixth tooth from the midline: 16." },
  { id: "p-32fdi", mode: "pro", cases: ["extraction"], q: "Universal #32 in FDI notation is…", options: ["48", "38", "18", "28"], answer: 0, why: "Quadrant 4 (lower right), eighth tooth: 48." },
  { id: "p-classI", mode: "pro", cases: ["classI"], q: "Occlusal pit-and-fissure caries on a molar is G.V. Black Class…", options: ["I", "II", "III", "V"], answer: 0, why: "Class I covers pits and fissures." },
  { id: "p-classII", mode: "pro", cases: ["classII"], q: "Mesio-occlusal caries on a molar is G.V. Black Class…", options: ["II", "I", "III", "IV"], answer: 0, why: "Class II: proximal surfaces of posterior teeth." },
  { id: "p-classIV", mode: "pro", cases: [], q: "Proximal caries on an incisor that involves the incisal angle is Class…", options: ["IV", "III", "II", "VI"], answer: 0, why: "Class III spares the incisal angle; Class IV involves it." },
  { id: "p-classV", mode: "pro", cases: [], q: "Class V lesions are found…", options: ["In the cervical third of facial or lingual surfaces", "On cusp tips", "On proximal surfaces of molars", "In occlusal fissures"], answer: 0, why: "Class V: gingival (cervical) third, facial or lingual." },
  { id: "p-bitewing", mode: "pro", cases: ["classII"], q: "Which radiograph is best for detecting interproximal caries?", options: ["Bitewing", "Periapical", "Panoramic", "Occlusal"], answer: 0, why: "Bitewings show posterior crowns and contacts with little overlap." },
  { id: "p-sickle", mode: "pro", cases: ["tartar"], q: "Which instrument is designed for supragingival calculus only?", options: ["Sickle scaler", "Gracey curet", "Universal curet", "Periodontal probe"], answer: 0, why: "Its pointed tip and back can traumatize tissue subgingivally." },
  { id: "p-calcsite", mode: "pro", cases: ["tartar"], q: "Supragingival calculus forms most heavily on the…", options: ["Lingual of mandibular anteriors", "Facial of maxillary anteriors", "Occlusal of premolars", "Distal of third molars"], answer: 0, why: "Near the submandibular and sublingual duct openings." },
  { id: "p-calcmin", mode: "pro", cases: ["tartar"], q: "Dental calculus is best described as…", options: ["Mineralized biofilm (calcium phosphate)", "Demineralized enamel", "Food debris", "Dead pulp tissue"], answer: 0, why: "Plaque mineralizes from salivary (supragingival) or crevicular-fluid (subgingival) minerals." },
  { id: "p-odu", mode: "pro", cases: ["tartar", "perio"], q: "The ODU 11/12 explorer is designed mainly to…", options: ["Detect subgingival calculus by feel", "Remove supragingival calculus", "Measure pocket depth", "Polish teeth"], answer: 0, why: "Explorers are assessment instruments; scalers and curets remove deposits." },
  { id: "p-mirror", mode: "pro", cases: ["tartar"], q: "Why are front-surface mouth mirrors preferred?", options: ["No double (ghost) image", "They magnify 10×", "They never fog", "They are disposable"], answer: 0, why: "The reflective coating is on the front, so light reflects only once." },
  { id: "p-g1314", mode: "pro", cases: ["perio"], q: "Gracey 13/14 is designed for…", options: ["Distal surfaces of posterior teeth", "Mesial surfaces of posterior teeth", "Anterior teeth", "Facial surfaces of premolars"], answer: 0, why: "11/12 = posterior mesial; 13/14 = posterior distal." },
  { id: "p-gface", mode: "pro", cases: ["perio"], q: "The face of a Gracey curet is offset to the lower shank at…", options: ["70°", "90°", "45°", "110°"], answer: 0, why: "The offset blade gives one working cutting edge; universal curets are at 90°." },
  { id: "p-williams", mode: "pro", cases: ["perio", "checkup"], q: "Williams probe markings are at…", options: ["1-2-3-5-7-8-9-10 mm", "Every mm to 15", "3.5, 5.5, 8.5, 11.5 mm", "Every 2 mm to 12"], answer: 0, why: "The missing 4 and 6 mm marks make it easier to read." },
  { id: "p-perio", mode: "pro", cases: ["perio"], q: "What distinguishes periodontitis from gingivitis?", options: ["Clinical attachment loss", "Bleeding on probing", "Red gingiva", "Plaque on teeth"], answer: 0, why: "Gingivitis bleeds and is red too, but only periodontitis has attachment and bone loss." },
  { id: "p-pging", mode: "pro", cases: ["perio"], q: "Which bacterium is considered a keystone periodontal pathogen?", options: ["Porphyromonas gingivalis", "Streptococcus mutans", "Lactobacillus", "Candida albicans"], answer: 0, why: "S. mutans is the classic cariogenic species instead." },
  { id: "p-reeval", mode: "pro", cases: ["perio"], q: "After scaling and root planing, re-evaluation is typically at about…", options: ["4–6 weeks", "1 day", "1 week", "1 year"], answer: 0, why: "Time for tissue healing before measuring the response." },
  { id: "p-camphor", mode: "pro", cases: ["classI", "classII"], q: "Camphorquinone, the common composite photoinitiator, absorbs light near…", options: ["468 nm (blue)", "550 nm (green)", "650 nm (red)", "365 nm (UV)"], answer: 0, why: "Curing lights emit roughly 400–500 nm." },
  { id: "p-increment", mode: "pro", cases: ["classI", "classII"], q: "Conventional composite is typically placed and cured in increments of about…", options: ["2 mm", "5 mm", "8 mm", "0.1 mm"], answer: 0, why: "Thin increments cure fully and reduce shrinkage stress." },
  { id: "p-etch", mode: "pro", cases: ["classI", "classII"], q: "Enamel is usually etched with…", options: ["35–37% phosphoric acid", "5% sodium fluoride", "Sodium hypochlorite", "Hydrogen peroxide"], answer: 0, why: "Etching creates micro-porosities for resin bonding." },
  { id: "p-ianb", mode: "pro", cases: ["classI", "classII", "extraction"], q: "Mandibular molars are most commonly anesthetized with…", options: ["An inferior alveolar nerve block", "Buccal infiltration only", "A greater palatine block", "A nasopalatine block"], answer: 0, why: "Dense mandibular bone limits infiltration in adults." },
  { id: "p-lido", mode: "pro", cases: [], q: "A very common dental local anesthetic is…", options: ["2% lidocaine with 1:100,000 epinephrine", "10% lidocaine plain", "0.5% lidocaine with 1:10,000 epinephrine", "Benzocaine injection"], answer: 0, why: "Benzocaine is a topical anesthetic, not injected." },
  { id: "p-naocl", mode: "pro", cases: ["endo"], q: "The most common root canal irrigant is…", options: ["Sodium hypochlorite", "Phosphoric acid", "Hydrogen peroxide gel", "Chlorhexidine varnish"], answer: 0, why: "It dissolves organic tissue and disinfects." },
  { id: "p-gp", mode: "pro", cases: ["endo"], q: "Root canals are usually obturated with…", options: ["Gutta-percha and sealer", "Amalgam", "Composite resin", "Glass ionomer only"], answer: 0, why: "Gutta-percha is a thermoplastic filling material." },
  { id: "p-irrev", mode: "pro", cases: ["endo"], q: "Lingering pain after a cold stimulus most suggests…", options: ["Irreversible pulpitis", "Reversible pulpitis", "Healthy pulp", "Gingivitis"], answer: 0, why: "Reversible pulpitis pain goes away within seconds of removing the stimulus." },
  { id: "p-damendo", mode: "pro", cases: ["endo"], q: "For root canal treatment, the rubber dam clamp goes…", options: ["On the tooth being treated", "One tooth distal", "Two teeth mesial", "No dam is used"], answer: 0, why: "Single-tooth isolation; for restorations the clamp often goes one tooth distal." },
  { id: "p-151", mode: "pro", cases: ["extraction"], q: "Universal forceps for mandibular teeth are…", options: ["#151", "#150", "#88R", "#23"], answer: 0, why: "#150 is the maxillary universal." },
  { id: "p-elevator", mode: "pro", cases: ["extraction"], q: "Before forceps, an elevator is used to…", options: ["Luxate the tooth and expand the socket", "Section the crown", "Suture the site", "Retract the tongue"], answer: 0, why: "Luxation makes delivery with forceps controlled and safer." },
  { id: "p-dry", mode: "pro", cases: ["extraction"], q: "Alveolar osteitis (dry socket) most often appears…", options: ["2–4 days after extraction", "Immediately", "After 6 months", "Before extraction"], answer: 0, why: "Loss of the clot; smoking and suction raise the risk." },
  { id: "p-critpH", mode: "pro", cases: ["classI", "checkup"], q: "Enamel begins to demineralize below a critical pH of about…", options: ["5.5", "7.0", "8.5", "3.0"], answer: 0, why: "Dentin and cementum demineralize at a higher pH, around 6.2–6.7." },
  { id: "p-varnish", mode: "pro", cases: ["checkup"], q: "5% sodium fluoride varnish contains about…", options: ["22,600 ppm fluoride", "1,000 ppm fluoride", "5,000 ppm fluoride", "100 ppm fluoride"], answer: 0, why: "Regular toothpaste is roughly 1,000–1,500 ppm." },
  { id: "p-mutans", mode: "pro", cases: ["classI"], q: "The bacterium most associated with dental caries is…", options: ["Streptococcus mutans", "Porphyromonas gingivalis", "Staphylococcus aureus", "Escherichia coli"], answer: 0, why: "It's acidogenic and acid-tolerant." },
  { id: "p-coolant", mode: "pro", cases: ["classI", "endo"], q: "Why does the high-speed handpiece spray water?", options: ["To cool the tooth and protect the pulp", "To numb the tooth", "To etch enamel", "To polish"], answer: 0, why: "Friction heat can injure the pulp." },
  { id: "p-modbass", mode: "pro", cases: ["checkup"], q: "In the modified Bass technique, bristles point toward the sulcus at about…", options: ["45°", "90°", "10°", "180°"], answer: 0, why: "Then short vibratory strokes and a roll toward the occlusal." },
];

/** Shuffle a question's options with a seeded/random function, keeping track of the answer. */
export function shuffled(question, random = Math.random) {
  const order = question.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answer: order.indexOf(question.answer),
  };
}

/** Pick up to n questions for a case and mode: case-specific first, then general. */
export function quizFor(caseId, mode, n = 3, random = Math.random) {
  const pool = QUESTIONS.filter((q) => q.mode === mode);
  const specific = pool.filter((q) => q.cases.includes(caseId));
  const general = pool.filter((q) => !q.cases.includes(caseId));
  const pick = (list) => [...list].sort(() => random() - 0.5);
  return [...pick(specific), ...pick(general)].slice(0, n).map((q) => shuffled(q, random));
}
