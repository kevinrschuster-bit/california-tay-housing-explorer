import type { FundingSection, Program, ProjectProfile, ScoredProgram } from "./types";

const SECTION_BY_CATEGORY: Array<{ section: FundingSection; terms: string[] }> = [
  { section: "Recommended capital sources", terms: ["capital", "development", "financing", "lending"] },
  { section: "Recommended rental subsidies", terms: ["rental subsid", "voucher", "rental assistance"] },
  { section: "Recommended operating / service funding", terms: ["operating", "service", "homelessness", "philanthropic"] }
];

const PROJECT_TERMS: Record<ProjectProfile["projectType"], string[]> = {
  "new construction": ["new construction", "construction"],
  acquisition: ["acquisition", "acquisition-rehab", "site acquisition"],
  rehabilitation: ["rehab", "rehabilitation", "acquisition-rehab"],
  "adaptive reuse": ["adaptive reuse", "conversion", "motel", "hotel"],
  "master lease": ["master lease", "leasing", "sponsor-based"],
  "scattered-site": ["scattered-site", "tenant-based", "landlord"]
};

const MODEL_TERMS: Record<ProjectProfile["housingModel"], string[]> = {
  "affordable housing": ["affordable", "lihtc", "rental housing"],
  "permanent supportive housing": ["psh", "permanent supportive", "supportive housing"],
  "transitional housing": ["transitional", "interim"],
  "rapid rehousing": ["rapid rehousing", "rrh", "time-limited"],
  "mixed model": ["mixed", "special needs", "affordable", "psh"]
};

const POPULATION_TERMS: Record<ProjectProfile["population"], string[]> = {
  "former foster youth": ["foster", "child welfare", "fup", "fyi", "tay"],
  "youth experiencing homelessness": ["homeless", "youth", "tay", "unaccompanied"],
  "parenting youth": ["parenting", "family", "families", "child welfare"],
  "behavioral health needs": ["behavioral health", "mental health", "serious mental", "dmh", "tay"],
  "justice-involved youth": ["justice", "court", "tay"],
  "mixed TAY": ["tay", "youth", "special-needs", "low-income"],
  "general affordable housing": ["low-income", "affordable", "renters"]
};

const AFFORDABILITY_TERMS: Record<ProjectProfile["affordability"], string[]> = {
  "30% Area Median Income": ["30%", "eli", "extremely low", "deep"],
  "50% Area Median Income": ["50%", "low-income"],
  "60% Area Median Income": ["60%", "lihtc", "low-income"],
  "80% Area Median Income": ["80%"],
  "mixed income": ["mixed", "30%-80%", "30%-60%"]
};

const confidencePoints: Record<string, number> = {
  high: 12,
  medium: 7,
  low: 3
};

const textOf = (program: Program, fields: Array<keyof Program>) =>
  fields.map((field) => program[field] || "").join(" ").toLowerCase();

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term.toLowerCase()));

const numberField = (program: Program, field: keyof Program) => Number.parseInt(program[field] || "0", 10) || 0;

export function sectionForProgram(program: Program): FundingSection {
  const category = (program["Funding Category"] || "").toLowerCase();
  const explicit = SECTION_BY_CATEGORY.find((entry) => includesAny(category, entry.terms));
  if (explicit) return explicit.section;
  if (includesAny(textOf(program, ["Program Name", "Administering Agency"]), ["foundation", "philanthropic"])) {
    return "Likely philanthropic gaps";
  }
  return "Likely public partners";
}

export function scoreProgram(program: Program, profile: ProjectProfile): ScoredProgram {
  let score = 0;
  const reasons: string[] = [];
  const cautions: string[] = [];
  const section = sectionForProgram(program);
  const allText = textOf(program, [
    "Program Name",
    "Administering Agency",
    "Level",
    "Funding Category",
    "Short Description",
    "Best Project Types",
    "Best Housing Models",
    "Best Populations Served",
    "Typical Affordability Levels",
    "Sponsor Eligibility",
    "Key Partners",
    "Common Pairings",
    "Why This Fits"
  ]);

  // Category match gives each program a baseline for the section it naturally belongs in.
  if (section === "Recommended capital sources" || section === "Recommended rental subsidies") score += 8;
  if (section === "Recommended operating / service funding") score += 7;

  if (includesAny(allText, PROJECT_TERMS[profile.projectType])) {
    score += 12;
    reasons.push(`Matches ${profile.projectType} project activity.`);
  }

  if (includesAny(allText, MODEL_TERMS[profile.housingModel])) {
    score += 12;
    reasons.push(`Fits a ${profile.housingModel} model.`);
  }

  if (includesAny(allText, POPULATION_TERMS[profile.population])) {
    score += 14;
    reasons.push(`Names or strongly implies ${profile.population}.`);
  }

  if (includesAny(allText, AFFORDABILITY_TERMS[profile.affordability])) {
    score += 8;
    reasons.push(`Works around ${profile.affordability.replace(" Area Median Income", " AMI")}.`);
  }

  if (profile.sponsorType === "nonprofit" && (program["Nonprofit Eligible"] || "").toLowerCase().includes("yes")) {
    score += 6;
    reasons.push("Nonprofit sponsors are eligible.");
  }

  if (profile.sponsorType === "for-profit") {
    if ((program["For-Profit Eligible"] || "").toLowerCase().includes("yes")) {
      score += 5;
      reasons.push("For-profit participation appears possible.");
    } else {
      score -= 10;
      cautions.push("A nonprofit, public agency, or eligible service partner may be required.");
    }
  }

  if (profile.sponsorType === "joint venture") {
    score += includesAny(allText, ["joint", "co-applicant", "partnership", "partner"]) ? 6 : 2;
    reasons.push("Joint venture structure can help satisfy partner requirements.");
  }

  if (profile.sponsorType === "public agency" && includesAny(allText, ["public", "city", "county", "pha", "jurisdiction"])) {
    score += 6;
    reasons.push("Public agency involvement is useful or required.");
  }

  if (profile.geography === "City of Los Angeles" && includesAny(allText, ["hacla", "city of la", "city of los angeles", "lahsa", "los angeles"])) {
    score += 6;
    reasons.push("Relevant to the City of Los Angeles ecosystem.");
  }

  if (profile.geography === "Los Angeles County outside City of LA" && includesAny(allText, ["lacda", "county", "los angeles county", "lahsa"])) {
    score += 7;
    reasons.push("Relevant to Los Angeles County-side implementation.");
  }

  if (profile.geography === "California statewide" && includesAny(allText, ["hcd", "california", "state"])) {
    score += 6;
    reasons.push("Statewide California source or framework.");
  }

  const importance = numberField(program, "Importance for TAY Project 1-5");
  if (importance) {
    score += importance * 4;
    if (importance >= 4) reasons.push("High stated importance for TAY projects.");
  }

  score += confidencePoints[(program.Confidence || "").toLowerCase()] || 0;

  // Special rules make the prototype opinionated about TAY-relevant scenarios.
  if (profile.population === "former foster youth" && includesAny(allText, ["foster", "fyi", "family unification", "dcfs", "child welfare"])) {
    score += 22;
    reasons.unshift("Special boost for former foster youth resources.");
  }

  if (profile.population === "youth experiencing homelessness" && includesAny(allText, ["coc", "continuum", "yhdp", "lahsa", "rapid rehousing", "project-based voucher", "homeless"])) {
    score += 18;
    reasons.unshift("Special boost for youth homelessness pathways.");
  }

  if (profile.housingModel === "permanent supportive housing" && includesAny(allText, ["project-based voucher", "continuum", "behavioral health", "no place like home", "dmh", "psh"])) {
    score += 12;
    reasons.push("PSH stack booster applied.");
  }

  if (["new construction", "rehabilitation"].includes(profile.projectType) && includesAny(allText, ["lihtc", "multifamily", "home", "nofa", "capital", "development"])) {
    score += 9;
    reasons.push("Construction or rehab capital booster applied.");
  }

  if (["acquisition", "rehabilitation", "adaptive reuse"].includes(profile.projectType) && includesAny(allText, ["homekey", "acquisition", "predevelopment", "bridge", "conversion"])) {
    score += 11;
    reasons.push("Acquisition/adaptive reuse booster applied.");
  }

  if (profile.serviceIntensity === "high" && includesAny(allText, ["behavioral health", "dmh", "continuum", "service", "philanthropic", "operating"])) {
    score += 10;
    reasons.push("High service intensity makes this more useful.");
  }

  if (profile.siteStatus === "no site" && includesAny((program["Site Control Required"] || "").toLowerCase(), ["yes", "target", "usually"])) {
    score -= 8;
    cautions.push("Most capital sources will require or strongly prefer site control.");
  }

  if (profile.units < 20 && section === "Recommended capital sources" && includesAny(allText, ["lihtc", "bond", "multifamily"])) {
    score -= 8;
    cautions.push("Very small projects may struggle with LIHTC or bond transaction costs.");
  }

  if ((program["Watch Out For"] || "").trim()) cautions.push(program["Watch Out For"] || "");
  if (reasons.length === 0 && (program["Why This Fits"] || "").trim()) reasons.push(program["Why This Fits"] || "");

  return {
    program,
    section,
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    cautions: Array.from(new Set(cautions)).slice(0, 3)
  };
}

export function getRecommendations(programs: Program[], profile: ProjectProfile) {
  const scored = programs.map((program) => scoreProgram(program, profile)).sort((a, b) => b.score - a.score);
  return {
    scored,
    bySection: {
      "Recommended capital sources": scored.filter((item) => item.section === "Recommended capital sources").slice(0, 5),
      "Recommended rental subsidies": scored.filter((item) => item.section === "Recommended rental subsidies").slice(0, 5),
      "Recommended operating / service funding": scored.filter((item) => item.section === "Recommended operating / service funding").slice(0, 5),
      "Likely public partners": scored
        .filter((item) => includesAny(textOf(item.program, ["Administering Agency", "Key Partners", "Level"]), ["county", "city", "pha", "lahsa", "lacda", "hacla", "hcd", "dmh", "dcfs"]))
        .slice(0, 5),
      "Likely philanthropic gaps": scored
        .filter((item) =>
          includesAny(textOf(item.program, ["Program Name", "Administering Agency", "Funding Category"]), [
            "philanthropic",
            "foundation",
            "donor"
          ])
        )
        .slice(0, 4)
    }
  };
}

export function buildStarterSummary(profile: ProjectProfile, scored: ScoredProgram[]) {
  const topCapital = scored.find((item) => item.section === "Recommended capital sources")?.program["Program Name"];
  const topRental = scored.find((item) => item.section === "Recommended rental subsidies")?.program["Program Name"];
  const topService = scored.find((item) => item.section === "Recommended operating / service funding")?.program["Program Name"];
  const siteNote =
    profile.siteStatus === "no site"
      ? "Start with site acquisition capacity and expect readiness requirements to shape the capital path."
      : "Use the current site status to move quickly into underwriting and public partner conversations.";

  return [
    `For a ${profile.units || "small"}-unit ${profile.housingModel} project serving ${profile.population}, the likely strategy is to pair ${topCapital || "a capital gap source"} with ${topRental || "a durable rental subsidy"} and ${topService || "service funding"}.`,
    siteNote,
    profile.serviceIntensity === "high"
      ? "Because service intensity is high, the stack should treat behavioral health, LAHSA/CoC, and philanthropic operating support as core feasibility pieces."
      : "Keep services sized to the operating model, then use flexible funds for lease-up, reserves, and youth engagement gaps."
  ].join(" ");
}

export function timelineConsiderations(profile: ProjectProfile) {
  const notes = [
    "Capital sources usually need site control, underwriting, environmental review, and a complete partner table before award or closing.",
    "Rental subsidies and service contracts often run on different timelines than tax credits or state soft debt, so align commitments early."
  ];
  if (profile.projectType === "adaptive reuse" || profile.projectType === "acquisition") {
    notes.push("Acquisition and conversion strategies can move faster, but closing pressure increases if the permanent takeout is not already credible.");
  }
  if (profile.siteStatus === "no site") {
    notes.push("With no site, near-term work should focus on acquisition/predevelopment funding, public agency fit, and referral/service design.");
  }
  return notes;
}

export function keyRisks(profile: ProjectProfile) {
  const risks = [
    "Using tenant-based vouchers as if they were underwritable project revenue.",
    "Treating youth targeting as a substitute for formal eligibility, referral, and service agreements."
  ];
  if (profile.sponsorType === "for-profit") risks.push("For-profit sponsors may need a nonprofit or public partner for CoC, youth, or service funding.");
  if (profile.affordability === "30% Area Median Income") risks.push("30% AMI units usually need rental subsidy or operating support beyond capital funds.");
  if (profile.serviceIntensity === "high") risks.push("High-intensity services require a durable provider and contract pathway, not only launch grants.");
  return risks;
}
