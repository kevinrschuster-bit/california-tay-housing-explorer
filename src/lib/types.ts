export type FundingSection =
  | "Recommended capital sources"
  | "Recommended rental subsidies"
  | "Recommended operating / service funding"
  | "Likely public partners"
  | "Likely philanthropic gaps";

export type Program = {
  "Program Name"?: string;
  "Administering Agency"?: string;
  Level?: string;
  "Funding Category"?: string;
  "Short Description"?: string;
  "Best Project Types"?: string;
  "Best Housing Models"?: string;
  "Best Populations Served"?: string;
  "Typical Affordability Levels"?: string;
  "Typical Award Size"?: string;
  "Typical Share of Capital Stack"?: string;
  "Typical Term"?: string;
  Repayable?: string;
  "Competitive or Formula"?: string;
  "Application Timeline"?: string;
  "Sponsor Eligibility"?: string;
  "Site Control Required"?: string;
  "Nonprofit Eligible"?: string;
  "For-Profit Eligible"?: string;
  "Key Partners"?: string;
  "Major Advantages"?: string;
  "Major Limitations"?: string;
  "Common Pairings"?: string;
  "Development Stage"?: string;
  "Difficulty 1-5"?: string;
  "Flexibility 1-5"?: string;
  "Importance for TAY Project 1-5"?: string;
  Confidence?: string;
  "Why This Fits"?: string;
  "Watch Out For"?: string;
  "Official Source"?: string;
  "Technical Guide"?: string;
  "Plain-English Explainer"?: string;
  "Useful PDF or Handbook"?: string;
};

export type ProjectProfile = {
  geography: "City of Los Angeles" | "Los Angeles County outside City of LA" | "California statewide" | "Unknown";
  units: number;
  sponsorType: "nonprofit" | "for-profit" | "joint venture" | "public agency";
  projectType: "new construction" | "acquisition" | "rehabilitation" | "adaptive reuse" | "master lease" | "scattered-site";
  housingModel: "affordable housing" | "permanent supportive housing" | "transitional housing" | "rapid rehousing" | "mixed model";
  population:
    | "former foster youth"
    | "youth experiencing homelessness"
    | "parenting youth"
    | "behavioral health needs"
    | "justice-involved youth"
    | "mixed TAY"
    | "general affordable housing";
  affordability:
    | "30% Area Median Income"
    | "50% Area Median Income"
    | "60% Area Median Income"
    | "80% Area Median Income"
    | "mixed income";
  siteStatus: "no site" | "site identified" | "site controlled";
  serviceIntensity: "low" | "medium" | "high";
};

export type ScoredProgram = {
  program: Program;
  section: FundingSection;
  score: number;
  scoreBand: "Core fit" | "Strong fit" | "Conditional fit" | "Possible but limited" | "Low fit";
  reasons: string[];
  reasonCodes: string[];
  cautions: string[];
  nextSteps: string[];
};

export type ReadinessSignal = {
  score: number;
  band:
    | "Strong early-stage concept"
    | "Promising but needs partner commitments"
    | "Concept needs structuring"
    | "Early exploration"
    | "Not yet finance-ready";
  drivers: string[];
  cautions: string[];
};
