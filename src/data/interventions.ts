export type StrategyPopulation =
  | "Former foster youth"
  | "Youth experiencing homelessness"
  | "Parenting youth"
  | "Youth with behavioral health needs"
  | "Justice-involved youth"
  | "Mixed TAY";

export type StrategyChallenge =
  | "Prevention / housing instability"
  | "Immediate housing access"
  | "Long-term affordable supply"
  | "High-acuity supportive housing"
  | "Transition from foster care or systems";

export type StrategyGeography =
  | "City of Los Angeles"
  | "Los Angeles County outside City of LA"
  | "California statewide"
  | "Other / unknown";

export type StrategyTimeHorizon = "0-6 months" | "6-24 months" | "2-5 years" | "5+ years";
export type StrategyScale = "25 youth" | "100 youth" | "500 youth" | "1,000+ youth";
export type StrategyCapital = "Under $1M" | "$1M-$5M" | "$5M-$25M" | "$25M+";
export type StrategyServiceIntensity = "Low" | "Medium" | "High";

export type StrategyProfile = {
  population: StrategyPopulation;
  challenge: StrategyChallenge;
  geography: StrategyGeography;
  timeHorizon: StrategyTimeHorizon;
  scale: StrategyScale;
  flexibleCapital: StrategyCapital;
  serviceIntensity: StrategyServiceIntensity;
};

export type HousingIntervention = {
  name: string;
  category: string;
  bestFor: StrategyPopulation[];
  bestChallengeTypes: StrategyChallenge[];
  timeToImpact: string;
  capitalIntensity: "Low" | "Medium" | "High" | "Very high";
  operatingIntensity: "Low" | "Medium" | "High";
  serviceIntensity: "Low" | "Medium" | "High";
  typicalScale: string;
  estimatedCostPerYouth: string;
  bestUseCase: string;
  limitations: string;
  likelyPartners: string;
  philanthropyRole: string;
  whenNotToUse: string;
  connectionToProjectFinance: string;
  nextSteps: string[];
};

export type ScoredIntervention = HousingIntervention & {
  score: number;
  fitBand: "Core strategy" | "Strong option" | "Conditional" | "Not primary";
  reasons: string[];
  tradeoffs: string[];
};

export const defaultStrategyProfile: StrategyProfile = {
  population: "Youth experiencing homelessness",
  challenge: "Immediate housing access",
  geography: "Los Angeles County outside City of LA",
  timeHorizon: "0-6 months",
  scale: "100 youth",
  flexibleCapital: "$1M-$5M",
  serviceIntensity: "Medium"
};

export const strategyOptions: Record<keyof StrategyProfile, string[]> = {
  population: [
    "Former foster youth",
    "Youth experiencing homelessness",
    "Parenting youth",
    "Youth with behavioral health needs",
    "Justice-involved youth",
    "Mixed TAY"
  ],
  challenge: [
    "Prevention / housing instability",
    "Immediate housing access",
    "Long-term affordable supply",
    "High-acuity supportive housing",
    "Transition from foster care or systems"
  ],
  geography: ["City of Los Angeles", "Los Angeles County outside City of LA", "California statewide", "Other / unknown"],
  timeHorizon: ["0-6 months", "6-24 months", "2-5 years", "5+ years"],
  scale: ["25 youth", "100 youth", "500 youth", "1,000+ youth"],
  flexibleCapital: ["Under $1M", "$1M-$5M", "$5M-$25M", "$25M+"],
  serviceIntensity: ["Low", "Medium", "High"]
};

export const housingInterventions: HousingIntervention[] = [
  {
    name: "New construction affordable housing",
    category: "Long-term supply",
    bestFor: ["Mixed TAY", "Former foster youth", "Parenting youth"],
    bestChallengeTypes: ["Long-term affordable supply"],
    timeToImpact: "5+ years",
    capitalIntensity: "Very high",
    operatingIntensity: "Medium",
    serviceIntensity: "Medium",
    typicalScale: "50-150+ homes per project",
    estimatedCostPerYouth: "$500k-$750k+ per home",
    bestUseCase: "Creating durable, deed-restricted affordable homes when land, subsidy, and development capacity are available.",
    limitations: "Slow timeline, high subsidy need, entitlement risk, and heavy reliance on competitive capital sources.",
    likelyPartners: "Affordable housing developer, public land owner, HCD, local housing department, CTCAC, service provider.",
    philanthropyRole: "Predevelopment, site acquisition, guarantees, early operating support, youth engagement, or gap capital.",
    whenNotToUse: "When the need is immediate shelter or flexible short-term housing access.",
    connectionToProjectFinance: "Use Project Finance Explorer to test LIHTC, MHP, HOME, local gap funding, and rental subsidy pairings.",
    nextSteps: [
      "Identify a site or public land opportunity.",
      "Engage an experienced affordable housing developer.",
      "Prepare an early sources-and-uses and subsidy gap estimate."
    ]
  },
  {
    name: "Permanent supportive housing",
    category: "Supportive housing",
    bestFor: ["Youth experiencing homelessness", "Youth with behavioral health needs", "Mixed TAY"],
    bestChallengeTypes: ["High-acuity supportive housing", "Long-term affordable supply"],
    timeToImpact: "2-5 years",
    capitalIntensity: "Very high",
    operatingIntensity: "High",
    serviceIntensity: "High",
    typicalScale: "30-120 supportive homes",
    estimatedCostPerYouth: "$500k-$800k+ per home plus annual services",
    bestUseCase: "Youth with high service needs who require permanent housing, rental subsidy, and intensive support.",
    limitations: "Requires durable services, referral pathways, operating subsidy, and complex capital stack coordination.",
    likelyPartners: "Supportive housing developer, DMH or behavioral health agency, LAHSA/CoC, housing authority, service provider.",
    philanthropyRole: "Service model design, bridge services, evaluation, reserves, or early flexible gap funding.",
    whenNotToUse: "When the primary problem is shallow rent instability or when services cannot be funded durably.",
    connectionToProjectFinance: "Use Project Finance Explorer for PBVs, CoC rental assistance, NPLH, MHP, LIHTC, and BHSA/service funding.",
    nextSteps: [
      "Confirm the target supportive housing population and referral pathway.",
      "Identify service and rental subsidy partners.",
      "Build a capital, rental subsidy, and service funding timeline."
    ]
  },
  {
    name: "Acquisition/rehabilitation small sites",
    category: "Medium-term supply",
    bestFor: ["Former foster youth", "Parenting youth", "Mixed TAY"],
    bestChallengeTypes: ["Immediate housing access", "Long-term affordable supply"],
    timeToImpact: "6-24 months",
    capitalIntensity: "High",
    operatingIntensity: "Medium",
    serviceIntensity: "Medium",
    typicalScale: "5-50 homes per site or portfolio",
    estimatedCostPerYouth: "$250k-$500k per home before services",
    bestUseCase: "Creating faster dedicated supply through existing buildings, small sites, motels, or scattered portfolios.",
    limitations: "Acquisition competition, rehab unknowns, operating scale, and permanent financing can be difficult.",
    likelyPartners: "Mission-driven owner, nonprofit operator, CDFI, local housing agency, property manager, service provider.",
    philanthropyRole: "Fast acquisition capital, recoverable grants, guarantees, predevelopment, or operating reserves.",
    whenNotToUse: "When no acquisition pipeline exists or rehab risk cannot be evaluated quickly.",
    connectionToProjectFinance: "Use Project Finance Explorer for Homekey/Homekey+, HOME, local NOFA, bridge capital, and operating subsidy.",
    nextSteps: [
      "Scan for acquisition candidates and willing sellers.",
      "Estimate rehab scope and operating model.",
      "Line up bridge capital and permanent takeout options."
    ]
  },
  {
    name: "Master leasing",
    category: "Rapid access",
    bestFor: ["Youth experiencing homelessness", "Parenting youth", "Mixed TAY"],
    bestChallengeTypes: ["Immediate housing access", "Prevention / housing instability"],
    timeToImpact: "0-6 months",
    capitalIntensity: "Low",
    operatingIntensity: "High",
    serviceIntensity: "Medium",
    typicalScale: "10-250 youth depending on operator capacity",
    estimatedCostPerYouth: "$18k-$35k per year plus services",
    bestUseCase: "Rapidly securing units through leases while services, rent assistance, and landlord relationships are coordinated.",
    limitations: "Lease risk, vacancy exposure, landlord relationships, and ongoing subsidy needs.",
    likelyPartners: "Nonprofit operator, landlords, housing authority, LAHSA/CoC, local homelessness agency, service provider.",
    philanthropyRole: "Risk pool, lease-up reserve, shallow subsidy, security deposits, flexible services, or operating bridge.",
    whenNotToUse: "When there is no operator able to manage leases, rent payments, and tenancy support.",
    connectionToProjectFinance: "Use Project Finance Explorer for rental subsidy, LAHSA/CoC supports, HHAP, and philanthropic operating support.",
    nextSteps: [
      "Identify an operator with leasing and property-management capacity.",
      "Estimate rent subsidy, vacancy, and damage reserve needs.",
      "Start landlord outreach and draft lease-risk terms."
    ]
  },
  {
    name: "Shared housing",
    category: "Rapid access",
    bestFor: ["Former foster youth", "Youth experiencing homelessness", "Justice-involved youth", "Mixed TAY"],
    bestChallengeTypes: ["Immediate housing access", "Transition from foster care or systems"],
    timeToImpact: "0-6 months",
    capitalIntensity: "Low",
    operatingIntensity: "Medium",
    serviceIntensity: "Medium",
    typicalScale: "10-200 youth with strong matching and support",
    estimatedCostPerYouth: "$10k-$25k per year plus services",
    bestUseCase: "Stretching rent assistance and creating faster placements when youth are open to roommate models.",
    limitations: "Requires careful matching, conflict resolution, tenancy support, and youth choice.",
    likelyPartners: "Shared housing provider, youth-serving nonprofit, landlords, housing navigators, legal aid.",
    philanthropyRole: "Pilot funding, roommate matching, deposits, mediation support, flexible rent assistance, or evaluation.",
    whenNotToUse: "When youth preference, safety, household composition, or acuity make shared tenancy inappropriate.",
    connectionToProjectFinance: "Use Project Finance Explorer for flexible rental assistance, FYI/FUP, HCV pathways, and philanthropy.",
    nextSteps: [
      "Validate youth interest and safety considerations.",
      "Identify a shared-housing operator or matching protocol.",
      "Budget deposits, furniture, mediation, and tenancy support."
    ]
  },
  {
    name: "Landlord risk reduction fund / guarantee",
    category: "Market access",
    bestFor: ["Former foster youth", "Youth experiencing homelessness", "Parenting youth", "Justice-involved youth", "Mixed TAY"],
    bestChallengeTypes: ["Immediate housing access", "Prevention / housing instability", "Transition from foster care or systems"],
    timeToImpact: "0-6 months",
    capitalIntensity: "Low",
    operatingIntensity: "Medium",
    serviceIntensity: "Low",
    typicalScale: "50-1,000+ youth depending on landlord network",
    estimatedCostPerYouth: "$1k-$7.5k reserve exposure plus administration",
    bestUseCase: "Unlocking private-market units by reducing perceived landlord risk and speeding placements.",
    limitations: "Does not create new affordable supply and still needs rent assistance for deeply affordable needs.",
    likelyPartners: "Housing navigators, landlords, public agencies, legal aid, philanthropy, property managers.",
    philanthropyRole: "Seed guarantee pool, flexible claims fund, landlord incentives, administration, or evaluation.",
    whenNotToUse: "When rent levels are too high without subsidy or when landlord engagement capacity is absent.",
    connectionToProjectFinance: "Use Project Finance Explorer for rental subsidy pairings, philanthropy, and housing authority pathways.",
    nextSteps: [
      "Define eligible claims and maximum exposure per household.",
      "Recruit landlord and housing-navigation partners.",
      "Pair the fund with rent assistance or voucher pathways."
    ]
  },
  {
    name: "Flexible rental assistance / prevention fund",
    category: "Prevention and stabilization",
    bestFor: ["Former foster youth", "Youth experiencing homelessness", "Parenting youth", "Justice-involved youth", "Mixed TAY"],
    bestChallengeTypes: ["Prevention / housing instability", "Immediate housing access", "Transition from foster care or systems"],
    timeToImpact: "0-6 months",
    capitalIntensity: "Low",
    operatingIntensity: "Medium",
    serviceIntensity: "Low",
    typicalScale: "25-1,000+ youth depending on subsidy depth",
    estimatedCostPerYouth: "$2.5k-$20k per youth per year",
    bestUseCase: "Preventing homelessness, resolving short-term rent gaps, deposits, arrears, move-in costs, or shallow subsidy needs.",
    limitations: "May not solve long-term affordability without income, voucher, or deeper rent support.",
    likelyPartners: "Youth-serving nonprofit, public agency, landlord network, legal aid, benefits navigator, philanthropy.",
    philanthropyRole: "Flexible dollars for prevention, deposits, arrears, shallow subsidy, rapid response, and learning agenda.",
    whenNotToUse: "When the housing gap is structural and requires permanent subsidy or dedicated affordable supply.",
    connectionToProjectFinance: "Use Project Finance Explorer for flexible operating funds, voucher pathways, and philanthropic gaps.",
    nextSteps: [
      "Define eligible uses, approval authority, and target response time.",
      "Estimate average assistance amount and duration.",
      "Design referral, documentation, and youth feedback loops."
    ]
  }
];

function addScore(
  current: { score: number; reasons: string[]; tradeoffs: string[] },
  points: number,
  reason?: string,
  tradeoff?: string
) {
  current.score += points;
  if (reason) current.reasons.push(reason);
  if (tradeoff) current.tradeoffs.push(tradeoff);
}

function fitBand(score: number): ScoredIntervention["fitBand"] {
  if (score >= 85) return "Core strategy";
  if (score >= 70) return "Strong option";
  if (score >= 50) return "Conditional";
  return "Not primary";
}

export function scoreInterventions(profile: StrategyProfile): ScoredIntervention[] {
  return housingInterventions
    .map((intervention) => {
      const result = { score: 35, reasons: [] as string[], tradeoffs: [] as string[] };
      const name = intervention.name.toLowerCase();
      const nonDevelopment = ["master leasing", "shared housing", "landlord risk", "flexible rental"].some((term) => name.includes(term));
      const development = ["new construction", "permanent supportive", "acquisition"].some((term) => name.includes(term));

      if (intervention.bestFor.includes(profile.population)) addScore(result, 14, `Strong population fit for ${profile.population.toLowerCase()}.`);
      if (intervention.bestChallengeTypes.includes(profile.challenge)) addScore(result, 18, `Directly responds to ${profile.challenge.toLowerCase()}.`);

      if (profile.timeHorizon === "0-6 months") {
        if (nonDevelopment) addScore(result, 18, "Can move quickly within a 0-6 month horizon.");
        if (name.includes("new construction")) addScore(result, -24, undefined, "New construction is not a near-term response.");
        if (name.includes("permanent supportive") || name.includes("acquisition")) addScore(result, -8, undefined, "Development or acquisition timelines may be too slow for immediate access.");
      }
      if (profile.timeHorizon === "6-24 months") {
        if (name.includes("acquisition") || nonDevelopment) addScore(result, 12, "Timeline fits a 6-24 month implementation window.");
      }
      if (profile.timeHorizon === "2-5 years" && (name.includes("permanent supportive") || name.includes("acquisition"))) {
        addScore(result, 12, "Medium-term horizon supports acquisition, rehab, or PSH structuring.");
      }
      if (profile.timeHorizon === "5+ years" && development) addScore(result, 16, "Long horizon makes development and permanent supply strategies more viable.");

      if (profile.challenge === "Long-term affordable supply" && development) addScore(result, 18, "Builds or preserves long-term affordable supply.");
      if (profile.challenge === "High-acuity supportive housing" && name.includes("permanent supportive")) addScore(result, 24, "Best suited to high-acuity supportive housing needs.");
      if (profile.challenge === "Prevention / housing instability" && (name.includes("flexible rental") || name.includes("landlord risk"))) {
        addScore(result, 18, "Targets housing instability before deeper intervention is needed.");
      }

      if (profile.population === "Former foster youth" && (name.includes("landlord risk") || name.includes("shared housing") || name.includes("flexible rental"))) {
        addScore(result, 12, "Useful for FYI/FUP-linked or transition-age foster youth strategies.");
      }
      if (profile.population === "Youth experiencing homelessness" && (name.includes("master leasing") || name.includes("permanent supportive") || name.includes("landlord risk") || name.includes("flexible rental"))) {
        addScore(result, 12, "Supports rapid access or supportive pathways for youth experiencing homelessness.");
      }
      if (profile.population === "Parenting youth" && (name.includes("master leasing") || name.includes("flexible rental") || name.includes("new construction"))) {
        addScore(result, 10, "Can be adapted for family-sized units or flexible family stabilization.");
      }

      if (profile.serviceIntensity === "High") {
        if (intervention.serviceIntensity === "High") addScore(result, 12, "Matches high service intensity.");
        if (intervention.operatingIntensity === "High") result.tradeoffs.push("High service intensity increases operating complexity.");
      }
      if (profile.serviceIntensity === "Low" && intervention.serviceIntensity === "High") {
        addScore(result, -8, undefined, "May be more service-rich than the current profile requires.");
      }

      if (profile.flexibleCapital === "Under $1M") {
        if (nonDevelopment) addScore(result, 14, "Low flexible capital favors non-development strategies.");
        if (development) addScore(result, -16, undefined, "Available flexible capital is likely too limited for development without major public subsidy.");
      }
      if (profile.flexibleCapital === "$1M-$5M" && nonDevelopment) addScore(result, 10, "Flexible capital can seed rapid access, guarantees, or prevention.");
      if (profile.flexibleCapital === "$5M-$25M" && (name.includes("acquisition") || name.includes("permanent supportive") || nonDevelopment)) {
        addScore(result, 10, "Capital level can support acquisition, pilots, reserves, or service-rich strategies.");
      }
      if (profile.flexibleCapital === "$25M+" && development) addScore(result, 16, "Large flexible capital makes development and acquisition strategies more realistic.");

      if (profile.scale === "500 youth" || profile.scale === "1,000+ youth") {
        if (name.includes("landlord risk") || name.includes("flexible rental")) addScore(result, 12, "Can scale across many youth faster than site-based development.");
        if (name.includes("new construction") || name.includes("permanent supportive")) result.tradeoffs.push("Site-based development may not scale quickly enough alone.");
      }

      if (profile.geography === "Other / unknown") result.tradeoffs.push("Local partners and administering agencies need to be confirmed.");
      if (profile.geography.includes("Los Angeles") && (name.includes("master leasing") || name.includes("permanent supportive"))) {
        addScore(result, 4, "Los Angeles ecosystem includes relevant homelessness, housing authority, and service partners.");
      }

      const score = Math.max(0, Math.min(98, Math.round(result.score * 0.84)));
      return {
        ...intervention,
        score,
        fitBand: fitBand(score),
        reasons: Array.from(new Set(result.reasons)).slice(0, 4),
        tradeoffs: Array.from(new Set([intervention.limitations, ...result.tradeoffs])).slice(0, 4)
      };
    })
    .sort((a, b) => b.score - a.score);
}
