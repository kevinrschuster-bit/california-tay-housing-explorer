import type { FundingSection, Program, ProjectProfile, ReadinessSignal, ScoredProgram } from "./types";

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
  high: 4,
  medium: 2,
  low: 0
};

const textOf = (program: Program, fields: Array<keyof Program>) =>
  fields.map((field) => program[field] || "").join(" ").toLowerCase();

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term.toLowerCase()));

const numberField = (program: Program, field: keyof Program) => Number.parseInt(program[field] || "0", 10) || 0;

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const isYes = (value?: string) => (value || "").toLowerCase().includes("yes");

const allProgramText = (program: Program) =>
  textOf(program, [
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
    "Development Stage",
    "Major Advantages",
    "Major Limitations",
    "Why This Fits",
    "Watch Out For"
  ]);

export function scoreBand(score: number): ScoredProgram["scoreBand"] {
  if (score >= 90) return "Core fit";
  if (score >= 75) return "Strong fit";
  if (score >= 55) return "Conditional fit";
  if (score >= 35) return "Possible but limited";
  return "Low fit";
}

export function readinessBand(score: number): ReadinessSignal["band"] {
  if (score >= 85) return "Strong early-stage concept";
  if (score >= 65) return "Promising but needs partner commitments";
  if (score >= 45) return "Concept needs structuring";
  if (score >= 25) return "Early exploration";
  return "Not yet finance-ready";
}

export function sectionForProgram(program: Program): FundingSection {
  const category = (program["Funding Category"] || "").toLowerCase();
  const explicit = SECTION_BY_CATEGORY.find((entry) => includesAny(category, entry.terms));
  if (explicit) return explicit.section;
  if (includesAny(textOf(program, ["Program Name", "Administering Agency"]), ["foundation", "philanthropic"])) {
    return "Likely philanthropic gaps";
  }
  return "Likely public partners";
}

function buildNextSteps(program: Program, profile: ProjectProfile, section: FundingSection, allText: string) {
  const name = (program["Program Name"] || "").toLowerCase();
  const agency = program["Administering Agency"] || "the administering agency";
  const siteControlRequired = includesAny((program["Site Control Required"] || "").toLowerCase(), ["yes", "target", "usually", "preferred"]);
  const needsHousingAuthority = includesAny(allText, ["pha", "housing authority", "hacla", "lacda", "project-based voucher", "voucher", "section 8"]);
  const steps: string[] = [];

  if (includesAny(name, ["low-income housing tax credit", "lihtc"])) {
    steps.push("First conversation: speak with an experienced tax credit consultant, syndicator, or development finance advisor.");
    steps.push("First analysis: compare whether 4% or 9% credits better fit the project timeline and gap needs.");
    steps.push("Biggest prerequisite: confirm site control and a credible local gap-funding path.");
    steps.push("Practical next action: review the next CTCAC application calendar.");
  } else if (includesAny(name, ["multifamily housing program", "homekey"])) {
    steps.push(`First conversation: contact ${agency} or a development finance advisor about current NOFA timing.`);
    steps.push("First document: prepare a preliminary development budget, sources-and-uses, and affordability summary.");
    steps.push("Biggest prerequisite: confirm eligible costs, affordability requirements, and site readiness.");
    steps.push("Practical next action: coordinate timing with tax credits or other permanent capital sources.");
  } else if (includesAny(name, ["no place like home", "behavioral health"])) {
    steps.push("First conversation: meet with the county behavioral health agency or supportive housing lead.");
    steps.push("First document: outline the supportive housing population, service model, and referral pathway.");
    steps.push("Biggest prerequisite: confirm the behavioral health partnership and eligible supportive housing population.");
    steps.push("Practical next action: verify how the county is currently administering or pairing this source.");
  } else if (includesAny(name, ["project-based voucher", "housing choice voucher", "family unification", "foster youth to independence"])) {
    steps.push("First conversation: meet with the local Housing Authority or voucher administrator.");
    steps.push("First analysis: prepare preliminary rent, operating, and underwriting assumptions for the units.");
    steps.push("Biggest prerequisite: determine voucher availability and whether the project can meet award timing.");
    steps.push("Practical next action: ask how the authority handles project-based, sponsor-based, or youth-specific voucher commitments.");
  } else if (includesAny(name, ["continuum of care", "lahsa", "youth homelessness", "homeless housing"])) {
    steps.push("First conversation: meet with LAHSA, Continuum of Care staff, or the relevant homeless-services lead.");
    steps.push("First document: draft a referral, services, and operating subsidy concept for the target population.");
    steps.push("Biggest prerequisite: confirm project eligibility, coordinated-entry alignment, and service-provider role.");
    steps.push("Practical next action: map the application or allocation timeline against lease-up and financing milestones.");
  } else if (includesAny(name, ["home investment", "home "])) {
    steps.push("First conversation: meet with the local HOME administrator for the project jurisdiction.");
    steps.push("First document: prepare a preliminary sources-and-uses, affordability summary, and eligible-cost review.");
    steps.push("Biggest prerequisite: confirm environmental review, federal compliance, and local allocation availability.");
    steps.push("Practical next action: ask how HOME timing should coordinate with tax credits, local gap funds, or HCD sources.");
  } else if (includesAny(allText, ["philanthropic", "foundation", "donor", "cdfi"])) {
    steps.push("First conversation: speak with a foundation program officer, CDFI, or flexible-capital partner.");
    steps.push("First document: prepare a short concept memo with the financing gap, impact case, and use of funds.");
    steps.push("Biggest prerequisite: clarify what public sources are already likely and what gap remains flexible.");
    steps.push("Practical next action: identify whether the ask is grant, recoverable grant, guarantee, PRI, or operating support.");
  } else if (section === "Recommended capital sources") {
    steps.push(`First conversation: contact ${agency} or a housing finance advisor about fit and timing.`);
    steps.push("First document: prepare a preliminary pro forma, sources-and-uses, and site-readiness summary.");
    steps.push(siteControlRequired ? "Biggest prerequisite: confirm site control or a realistic path to site control." : "Biggest prerequisite: confirm eligible project costs and development-stage requirements.");
    steps.push("Practical next action: review the current NOFA, application calendar, or program guidelines.");
  } else if (section === "Recommended rental subsidies") {
    steps.push(`First conversation: contact ${agency} or the relevant rental subsidy administrator.`);
    steps.push("First analysis: estimate rents, payment standards, operating subsidy needs, and underwriting assumptions.");
    steps.push("Biggest prerequisite: confirm subsidy availability, unit eligibility, and award timing.");
    steps.push("Practical next action: ask what documentation is needed for a preliminary commitment or reservation.");
  } else if (section === "Recommended operating / service funding") {
    steps.push(`First conversation: meet with ${agency}, a service provider, or the relevant public contract lead.`);
    steps.push("First document: draft a service model, staffing plan, referral pathway, and annual service budget.");
    steps.push("Biggest prerequisite: confirm the eligible population, provider role, and contract pathway.");
    steps.push("Practical next action: compare the service funding timeline with housing lease-up or construction milestones.");
  } else {
    steps.push(`First conversation: contact ${agency} to clarify role, eligibility, and timing.`);
    steps.push("First document: prepare a short project profile with units, population, site status, partners, and funding need.");
    steps.push("Biggest prerequisite: identify the public, nonprofit, service, or financing partner needed to make this source usable.");
    steps.push("Practical next action: confirm whether this source is a direct application, partner conversation, or pairing strategy.");
  }

  if (profile.siteStatus === "no site" && (siteControlRequired || section === "Recommended capital sources")) {
    steps.push("Common early action: identify site-control options before treating this as a near-term application.");
  }
  if (needsHousingAuthority && !steps.some((step) => step.toLowerCase().includes("housing authority"))) {
    steps.push("Common early action: meet with the Housing Authority to discuss voucher availability and timing.");
  }
  if (profile.serviceIntensity !== "low" && section !== "Recommended capital sources") {
    steps.push("Common early action: identify the service partner and a realistic annual service budget.");
  }

  return Array.from(new Set(steps)).slice(0, 6);
}

export function scoreProgram(program: Program, profile: ProjectProfile): ScoredProgram {
  let rawScore = 0;
  let scoreCap = 100;
  const reasons: string[] = [];
  const reasonCodes: string[] = [];
  const cautions: string[] = [];
  const section = sectionForProgram(program);
  const allText = allProgramText(program);
  const isCapital = section === "Recommended capital sources";
  const isRental = section === "Recommended rental subsidies";
  const isService = section === "Recommended operating / service funding";
  const isLeaseModel = profile.projectType === "master lease" || profile.projectType === "scattered-site";
  const siteControlRequired = includesAny((program["Site Control Required"] || "").toLowerCase(), ["yes", "target", "usually", "preferred"]);
  const needsHousingAuthority = includesAny(allText, ["pha", "housing authority", "hacla", "lacda", "project-based voucher", "voucher", "section 8"]);

  if (isCapital && !isLeaseModel) rawScore += 18;
  else if (isRental && (profile.affordability === "30% Area Median Income" || profile.housingModel === "permanent supportive housing" || isLeaseModel)) rawScore += 18;
  else if (isService && (profile.serviceIntensity !== "low" || profile.housingModel === "permanent supportive housing")) rawScore += 17;
  else if (section === "Likely public partners") rawScore += 12;
  else if (section === "Likely philanthropic gaps") rawScore += 10;
  else rawScore += 6;

  if (isService) reasonCodes.push("Service-only source");
  if (isCapital) reasonCodes.push("Capital-only source");

  if (includesAny(allText, MODEL_TERMS[profile.housingModel])) {
    rawScore += 18;
    reasons.push(`Fits a ${profile.housingModel} model.`);
    reasonCodes.push("Matched housing model");
  } else if (profile.housingModel === "permanent supportive housing" && includesAny(allText, ["special needs", "homeless", "supportive"])) {
    rawScore += 12;
    reasons.push("Related to supportive or special-needs housing, but PSH rules should be verified.");
    reasonCodes.push("Conditional / verify rules");
  } else if (profile.housingModel === "affordable housing" && includesAny(allText, ["psh", "permanent supportive", "supportive housing"])) {
    rawScore += 8;
    scoreCap = Math.min(scoreCap, 70);
    cautions.push("This appears PSH-focused, so fit is conditional for general affordable housing.");
    reasonCodes.push("Conditional / verify rules");
  }

  if (includesAny(allText, POPULATION_TERMS[profile.population])) {
    rawScore += 18;
    reasons.push(`Names or strongly implies ${profile.population}.`);
    reasonCodes.push("Matched population");
  } else if (profile.population.includes("youth") || profile.population === "mixed TAY") {
    if (includesAny(allText, ["low-income", "homeless", "special-needs", "affordable"])) {
      rawScore += 9;
      cautions.push("Population fit is indirect; verify TAY eligibility and targeting rules.");
      reasonCodes.push("Conditional / verify rules");
    }
  } else if (profile.population === "general affordable housing" && includesAny(allText, ["foster", "fyi", "fup", "youth", "tay"])) {
    rawScore += 6;
    scoreCap = Math.min(scoreCap, 65);
    cautions.push("This appears youth or foster-care specific, so fit is limited for general affordable housing.");
    reasonCodes.push("Conditional / verify rules");
  }

  if (includesAny(allText, PROJECT_TERMS[profile.projectType])) {
    rawScore += 14;
    reasons.push(`Matches ${profile.projectType} project activity.`);
    reasonCodes.push("Matched project type");
  } else if (!isLeaseModel && isCapital && includesAny(allText, ["multifamily", "development", "construction", "rehab", "acquisition"])) {
    rawScore += 10;
    reasons.push("Can support a capital project, subject to project-type rules.");
    reasonCodes.push("Conditional / verify rules");
  } else if (isLeaseModel && isCapital) {
    scoreCap = Math.min(scoreCap, 60);
    cautions.push("Capital-only sources are usually a weak fit for master lease or scattered-site models.");
  }

  if (includesAny(allText, AFFORDABILITY_TERMS[profile.affordability])) {
    rawScore += 9;
    reasons.push(`Works around ${profile.affordability.replace(" Area Median Income", " AMI")}.`);
    reasonCodes.push("Matched affordability");
  } else if (profile.affordability === "30% Area Median Income" && includesAny(allText, ["low-income", "eli", "homeless", "psh"])) {
    rawScore += 6;
    cautions.push("Deep affordability may require additional rental or operating subsidy.");
    reasonCodes.push("Conditional / verify rules");
  }

  if (profile.sponsorType === "nonprofit" && isYes(program["Nonprofit Eligible"])) {
    rawScore += 10;
    reasons.push("Nonprofit sponsors are eligible.");
    reasonCodes.push("Sponsor eligible");
  }

  if (profile.sponsorType === "for-profit") {
    if (isYes(program["For-Profit Eligible"])) {
      rawScore += 10;
      reasons.push("For-profit participation appears possible.");
      reasonCodes.push("Sponsor eligible");
    } else {
      rawScore -= 25;
      cautions.push("A nonprofit, public agency, or eligible service partner may be required.");
      reasonCodes.push("Conditional / verify rules");
    }
  }

  if (profile.sponsorType === "joint venture") {
    rawScore += includesAny(allText, ["joint", "co-applicant", "partnership", "partner", "nonprofit", "developer"]) ? 10 : 6;
    reasons.push("Joint venture structure can help satisfy partner requirements.");
    reasonCodes.push("Sponsor eligible");
  }

  if (profile.sponsorType === "public agency" && includesAny(allText, ["public", "city", "county", "pha", "jurisdiction"])) {
    rawScore += 10;
    reasons.push("Public agency involvement is useful or required.");
    reasonCodes.push("Sponsor eligible");
  } else if (profile.sponsorType === "public agency" && !includesAny(allText, ["public", "city", "county", "pha", "jurisdiction"])) {
    rawScore += 5;
  }

  if (profile.geography === "City of Los Angeles" && includesAny(allText, ["hacla", "city of la", "city of los angeles", "lahsa", "los angeles"])) {
    rawScore += 10;
    reasons.push("Relevant to the City of Los Angeles ecosystem.");
    reasonCodes.push("Geography match");
  }

  if (profile.geography === "Los Angeles County outside City of LA" && includesAny(allText, ["lacda", "county", "los angeles county", "lahsa"])) {
    rawScore += 10;
    reasons.push("Relevant to Los Angeles County-side implementation.");
    reasonCodes.push("Geography match");
    if (includesAny(allText, ["city of los angeles", "hacla"]) && !includesAny(allText, ["lacda", "county"])) {
      scoreCap = Math.min(scoreCap, 50);
      cautions.push("Geography may not apply outside the City of Los Angeles.");
    }
  }

  if (profile.geography === "California statewide" && includesAny(allText, ["hcd", "california", "state"])) {
    rawScore += 10;
    reasons.push("Statewide California source or framework.");
    reasonCodes.push("Geography match");
  }

  if (profile.geography === "City of Los Angeles" && includesAny(allText, ["lacda", "outside city", "not for city"])) {
    scoreCap = Math.min(scoreCap, 50);
    cautions.push("Geography appears limited outside the City of Los Angeles.");
  }

  if (profile.geography === "Unknown") {
    rawScore += 4;
    cautions.push("Geography should be confirmed before treating this as a strong fit.");
    reasonCodes.push("Conditional / verify rules");
  }

  if (profile.siteStatus === "site controlled") {
    rawScore += siteControlRequired || isCapital ? 10 : 6;
    if (siteControlRequired) reasonCodes.push("Requires site control");
  } else if (profile.siteStatus === "site identified") {
    rawScore += siteControlRequired || isCapital ? 7 : 5;
    if (siteControlRequired) {
      cautions.push("Site control or advanced site readiness will likely be needed.");
      reasonCodes.push("Requires site control");
    }
  } else if (siteControlRequired || isCapital) {
    rawScore -= 20;
    cautions.push("Most capital sources will require or strongly prefer site control.");
    reasonCodes.push("Requires site control");
  }

  const importance = numberField(program, "Importance for TAY Project 1-5");
  const confidence = confidencePoints[(program.Confidence || "").toLowerCase()] || 0;
  if (importance || confidence) {
    rawScore += Math.min(10, Math.max(0, importance) + confidence);
    if (importance >= 4) reasons.push("High stated importance for TAY projects.");
  }

  if (profile.population === "former foster youth" && includesAny(allText, ["foster", "fyi", "family unification", "dcfs", "child welfare"])) {
    rawScore += 4;
    reasons.unshift("Strong foster-youth pathway alignment.");
  }

  if (profile.population === "youth experiencing homelessness" && includesAny(allText, ["coc", "continuum", "yhdp", "lahsa", "rapid rehousing", "project-based voucher", "homeless"])) {
    rawScore += 4;
    reasons.unshift("Strong youth-homelessness pathway alignment.");
  }

  if (profile.housingModel === "permanent supportive housing" && includesAny(allText, ["project-based voucher", "continuum", "behavioral health", "no place like home", "dmh", "psh"])) {
    rawScore += 3;
    reasons.push("Useful in a PSH financing stack.");
  }

  if (profile.serviceIntensity === "high" && includesAny(allText, ["behavioral health", "dmh", "continuum", "service", "philanthropic", "operating"])) {
    rawScore += 4;
    reasons.push("High service intensity makes this more useful.");
  }

  if (profile.units < 20 && section === "Recommended capital sources" && includesAny(allText, ["lihtc", "bond", "multifamily"])) {
    rawScore -= 8;
    cautions.push("Very small projects may struggle with LIHTC or bond transaction costs.");
  }

  if (isService && !isLeaseModel) scoreCap = Math.min(scoreCap, 70);
  if (isCapital && isLeaseModel) scoreCap = Math.min(scoreCap, 60);
  if (needsHousingAuthority) {
    rawScore -= profile.sponsorType === "public agency" ? 3 : 7;
    cautions.push("Housing authority or voucher administrator partnership will likely be needed.");
    reasonCodes.push("Needs housing authority partner");
  }
  if (includesAny(allText, ["service provider", "dmh", "dcfs", "lahsa", "coc"]) && profile.sponsorType !== "public agency") {
    rawScore -= 5;
    cautions.push("A service or public agency partner may be needed to access this source.");
    reasonCodes.push("Conditional / verify rules");
  }

  if ((program["Watch Out For"] || "").trim()) cautions.push(program["Watch Out For"] || "");
  if (reasons.length === 0 && (program["Why This Fits"] || "").trim()) reasons.push(program["Why This Fits"] || "");

  let finalScore = Math.round(Math.min(scoreCap, rawScore * 0.82));
  if (finalScore >= 98 && profile.siteStatus !== "site controlled") finalScore = 95;
  if (finalScore >= 98 && reasonCodes.length < 6) finalScore = 96;
  finalScore = clamp(finalScore);

  return {
    program,
    section,
    score: finalScore,
    scoreBand: scoreBand(finalScore),
    reasons: Array.from(new Set(reasons)).slice(0, 4),
    reasonCodes: Array.from(new Set(reasonCodes)).slice(0, 6),
    cautions: Array.from(new Set(cautions)).slice(0, 3),
    nextSteps: buildNextSteps(program, profile, section, allText)
  };
}

export function getRecommendations(programs: Program[], profile: ProjectProfile) {
  const scored = programs.map((program) => scoreProgram(program, profile)).sort((a, b) => b.score - a.score);
  return {
    scored,
    bySection: {
      "Recommended capital sources": scored.filter((item) => item.section === "Recommended capital sources"),
      "Recommended rental subsidies": scored.filter((item) => item.section === "Recommended rental subsidies"),
      "Recommended operating / service funding": scored.filter((item) => item.section === "Recommended operating / service funding"),
      "Likely public partners": scored
        .filter((item) => includesAny(textOf(item.program, ["Administering Agency", "Key Partners", "Level"]), ["county", "city", "pha", "lahsa", "lacda", "hacla", "hcd", "dmh", "dcfs"]))
        .slice(0, 8),
      "Likely philanthropic gaps": scored
        .filter((item) =>
          includesAny(textOf(item.program, ["Program Name", "Administering Agency", "Funding Category"]), [
            "philanthropic",
            "foundation",
            "donor"
          ])
        )
        .slice(0, 8)
    }
  };
}

export function buildReadinessSignal(profile: ProjectProfile, scored: ScoredProgram[]): ReadinessSignal {
  let score = 35;
  const drivers: string[] = [];
  const cautions: string[] = [];
  const strongCapital = scored.some((item) => item.section === "Recommended capital sources" && item.score >= 75);
  const strongRental = scored.some((item) => item.section === "Recommended rental subsidies" && item.score >= 75);
  const strongService = scored.some((item) => item.section === "Recommended operating / service funding" && item.score >= 65);
  const conditionalCount = scored.slice(0, 10).filter((item) => item.scoreBand === "Conditional fit" || item.scoreBand === "Possible but limited").length;

  if (profile.siteStatus === "site controlled") {
    score += 25;
    drivers.push("Site is controlled.");
  } else if (profile.siteStatus === "site identified") {
    score += 15;
    drivers.push("Site is identified but control still matters.");
  } else {
    cautions.push("No site yet; most capital paths remain early exploration.");
  }

  if (profile.sponsorType === "nonprofit" || profile.sponsorType === "joint venture") {
    score += 15;
    drivers.push("Sponsor structure is compatible with many public and nonprofit-friendly sources.");
  } else if (profile.sponsorType === "for-profit") {
    score += 5;
    cautions.push("For-profit sponsorship may need a nonprofit or public partner.");
  } else {
    score += 12;
    drivers.push("Public agency sponsorship can strengthen partner-dependent strategies.");
  }

  if (profile.projectType === "new construction") {
    score -= 10;
    cautions.push("New construction adds entitlement, underwriting, and long-cycle funding complexity.");
  } else if (profile.projectType === "adaptive reuse" || profile.projectType === "acquisition" || profile.projectType === "rehabilitation") {
    score -= 5;
    cautions.push("Acquisition, rehab, or reuse still needs a credible takeout and due diligence path.");
  } else {
    score += 10;
    drivers.push("Lease or scattered-site models can move faster than development projects.");
  }

  if (profile.housingModel === "permanent supportive housing") {
    score -= 15;
    if (strongRental && strongService) {
      score += 15;
      drivers.push("PSH complexity is partly offset by strong rental and service matches.");
    } else {
      cautions.push("PSH needs both rental subsidy and durable service funding commitments.");
    }
  }

  if (profile.serviceIntensity === "high") {
    score -= 10;
    cautions.push("High service intensity requires a durable provider and contract pathway.");
  }

  if (strongRental) {
    score += 15;
    drivers.push("Strong rental subsidy match is present.");
  }

  if ((profile.serviceIntensity === "medium" || profile.serviceIntensity === "high") && strongService) {
    score += 15;
    drivers.push("Strong service funding match is present.");
  }

  if (strongCapital) {
    score += 15;
    drivers.push("Strong capital stack match is present.");
  }

  if (scored.slice(0, 5).some((item) => item.reasonCodes.includes("Needs housing authority partner"))) {
    score -= 5;
    cautions.push("Voucher or housing authority partnership likely needs to be secured.");
  }

  if (scored.slice(0, 8).some((item) => includesAny(textOf(item.program, ["Competitive or Formula", "Application Timeline"]), ["competitive", "nofa", "round"]))) {
    score -= 5;
    cautions.push("Several likely sources appear competitive or long-cycle.");
  }

  if (conditionalCount >= 5) {
    score -= 10;
    cautions.push("Many top recommendations are conditional rather than clean fits.");
  }

  const finalScore = clamp(Math.round(score));
  return {
    score: finalScore,
    band: readinessBand(finalScore),
    drivers: Array.from(new Set(drivers)).slice(0, 4),
    cautions: Array.from(new Set(cautions)).slice(0, 4)
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
