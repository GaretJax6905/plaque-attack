// Enemies are oral conditions and their causes. Stats drive gameplay;
// easy/pro text drives the Codex. Flags:
//   armored     - calculus: sickle scalers deal triple damage
//   subgingival - below the gumline: Gracey curets deal triple damage
//   hidden      - hard to see until the mouth mirror or explorer reveals it

export const ENEMIES = {
  plaque: {
    name: "Plaque (S. mutans)", color: "#f4e27a", hp: 10, speed: 22, dmg: 6, r: 5, xp: 1,
    easy: "Plaque is a sticky film of bacteria that builds up every day. Brushing and flossing remove it.",
    pro: "Dental biofilm. Streptococcus mutans ferments dietary sugars into acid, lowering plaque pH below about 5.5 and demineralizing enamel.",
  },
  acid: {
    name: "Acid Attack", color: "#9bff6b", hp: 6, speed: 40, dmg: 5, r: 4, xp: 1,
    easy: "After sugar, bacteria make acid that softens enamel for a while. Fewer sugary snacks means fewer acid attacks.",
    pro: "The Stephan curve: plaque pH drops within minutes of sugar exposure and takes roughly half an hour or more to recover. Frequency of exposure matters more than total amount.",
  },
  sugar: {
    name: "Sugar Cube", color: "#ffffff", hp: 22, speed: 12, dmg: 8, r: 6, xp: 3, spawns: "acid",
    easy: "Sugar feeds the bacteria that cause cavities.",
    pro: "Fermentable carbohydrates (especially sucrose) are the substrate for acid production by cariogenic bacteria.",
  },
  calculus: {
    name: "Calculus (Tartar)", color: "#d9c08a", hp: 34, speed: 14, dmg: 10, r: 7, xp: 4, armored: true,
    easy: "Tartar is plaque that hardened. Only a dental cleaning can remove it.",
    pro: "Mineralized biofilm (calcium phosphate salts). Supragingival calculus is most common on the lingual of mandibular anteriors and the buccal of maxillary molars, near the salivary duct openings; subgingival calculus is darker and harder.",
  },
  caries: {
    name: "Caries (Cavity)", color: "#6b4a2b", hp: 18, speed: 26, dmg: 8, r: 5, xp: 2, hidden: true,
    easy: "A cavity is a hole where acid has dissolved the tooth. Caught early, a white spot can harden again with fluoride.",
    pro: "Progresses from an enamel lesion (white spot, potentially reversible) into dentin and toward the pulp. Located and classified by G.V. Black's Classes I–VI.",
  },
  gingivitis: {
    name: "Gingivitis", color: "#ff5d73", hp: 14, speed: 24, dmg: 7, r: 5, xp: 2,
    easy: "Red, puffy gums that bleed when you brush. It's reversible with good cleaning at home.",
    pro: "Plaque-induced gingival inflammation with bleeding on probing but no clinical attachment loss; reversible.",
  },
  pging: {
    name: "P. gingivalis", color: "#b06bff", hp: 24, speed: 30, dmg: 9, r: 5, xp: 3, subgingival: true,
    easy: "A germ that lives deep under the gums and helps cause gum disease.",
    pro: "Porphyromonas gingivalis, an anaerobic keystone periodontal pathogen. Periodontitis means irreversible loss of attachment and bone (2017 classification: Stages I–IV, Grades A–C).",
  },
};

export const BOSSES = {
  plaqueKing: { name: "The Plaque King", base: "plaque", color: "#ffe14d", hp: 420, minion: "plaque" },
  calculusColossus: { name: "Calculus Colossus", base: "calculus", color: "#c9a764", hp: 520, minion: "calculus", armored: true },
  sugarTitan: { name: "Sugar Titan", base: "sugar", color: "#ffffff", hp: 480, minion: "acid" },
  hiddenLesion: { name: "The Hidden Lesion", base: "caries", color: "#5a3a1e", hp: 520, minion: "caries", hidden: true },
  pocketBeast: { name: "Pocket Beast", base: "pging", color: "#9b4dff", hp: 600, minion: "pging", subgingival: true },
  pulpInferno: { name: "Pulp Inferno", base: "caries", color: "#ff6a2a", hp: 640, minion: "acid" },
  wisdomTitan: { name: "Wisdom Tooth Titan", base: "calculus", color: "#f2efe6", hp: 720, minion: "gingivitis" },
};

// Extra Codex entries: tooth anatomy and diagnoses used by the cases.
export const ANATOMY = {
  enamel: { name: "Enamel", easy: "The hard white outer layer of the tooth crown — the hardest substance in the body.", pro: "About 96% mineral (hydroxyapatite) by weight; acellular, so it cannot regenerate, but early lesions can remineralize." },
  dentin: { name: "Dentin", easy: "The yellowish layer under the enamel. It's softer, so cavities spread faster here.", pro: "About 70% mineral; contains dentinal tubules that carry stimuli toward the pulp, explaining sensitivity." },
  pulp: { name: "Pulp", easy: "The soft center of the tooth with nerves and blood vessels.", pro: "Connective tissue with nerves, vessels and odontoblasts. Inflammation can be reversible or irreversible pulpitis." },
  cementum: { name: "Cementum", easy: "A thin layer covering the root.", pro: "Covers the root surface and anchors periodontal ligament fibers." },
  pdl: { name: "Periodontal Ligament", easy: "Tiny fibers that hold the tooth in its socket.", pro: "Connects cementum to alveolar bone; provides support, sensation and nutrition." },
  gingiva: { name: "Gingiva (Gums)", easy: "The pink tissue around your teeth.", pro: "Healthy gingiva is pink, firm and stippled with a sulcus depth of about 1–3 mm." },
  pulpitis: { name: "Irreversible Pulpitis", easy: "An inflamed tooth nerve that won't heal on its own, often causing lingering pain.", pro: "Lingering pain to thermal stimuli or spontaneous pain; treated with root canal therapy or extraction." },
  impaction: { name: "Impacted Third Molar", easy: "A wisdom tooth that is stuck and can't come in properly.", pro: "Third molar unable to erupt into function; evaluated radiographically (often a panoramic) for extraction." },
  drysocket: { name: "Dry Socket", easy: "A painful spot where the blood clot is lost after a tooth is pulled.", pro: "Alveolar osteitis: loss of the clot from the socket, usually 2–4 days after extraction; risk rises with smoking and suction (e.g. straws)." },
};
