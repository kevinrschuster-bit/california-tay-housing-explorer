import type { ProjectProfile } from "./types";

export type StackLine = {
  source: string;
  amount: number;
  percent: number | null;
  role: string;
  category: string;
  whyIncluded: string;
};

export type CapitalStackEstimate = {
  isCapitalProject: boolean;
  units: number;
  totalDevelopmentCost: number | null;
  developmentCostPerUnit: number | null;
  annualRentSubsidyNeed: number;
  monthlyRentSubsidyPerUnit: number;
  annualServiceBudget: number;
  serviceCostPerUnit: number;
  lines: StackLine[];
  operatingLines: StackLine[];
  notes: string[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function formatCurrency(value: number) {
  return currency.format(Math.round(value));
}

function developmentCostPerUnit(profile: ProjectProfile) {
  if (profile.projectType === "master lease" || profile.projectType === "scattered-site") return null;
  if (profile.housingModel === "transitional housing") return 300000;
  if (profile.projectType === "adaptive reuse") return 400000;
  if (profile.projectType === "acquisition" || profile.projectType === "rehabilitation") return 350000;
  return 600000;
}

function serviceCostPerUnit(profile: ProjectProfile) {
  if (profile.housingModel === "permanent supportive housing") return 8000;
  if (profile.serviceIntensity === "high") return 12000;
  if (profile.serviceIntensity === "medium") return 7500;
  return 3000;
}

function rentSubsidyPerUnit(profile: ProjectProfile) {
  const deeplyAffordable =
    profile.affordability === "30% Area Median Income" ||
    profile.housingModel === "permanent supportive housing" ||
    profile.population === "youth experiencing homelessness";

  return deeplyAffordable ? 1500 : 1000;
}

function percentAmount(total: number, percent: number) {
  return Math.round(total * percent);
}

function makeLine(source: string, amount: number, total: number | null, role: string, category: string, whyIncluded: string): StackLine {
  return {
    source,
    amount,
    percent: total ? Math.round((amount / total) * 1000) / 10 : null,
    role,
    category,
    whyIncluded
  };
}

export function buildCapitalStackEstimate(profile: ProjectProfile): CapitalStackEstimate {
  const units = Math.max(1, profile.units || 1);
  const perUnitCost = developmentCostPerUnit(profile);
  const isCapitalProject = perUnitCost !== null;
  const totalDevelopmentCost = perUnitCost ? perUnitCost * units : null;
  const serviceUnitCost = serviceCostPerUnit(profile);
  const monthlyRentSubsidyPerUnit = rentSubsidyPerUnit(profile);
  const annualRentSubsidyNeed = monthlyRentSubsidyPerUnit * units * 12;
  const annualServiceBudget = serviceUnitCost * units;

  const notes = [
    `${formatCurrency(monthlyRentSubsidyPerUnit)} per unit per month rent subsidy assumption.`,
    `${formatCurrency(serviceUnitCost)} per unit per year service funding assumption.`
  ];

  if (!isCapitalProject) {
    return {
      isCapitalProject,
      units,
      totalDevelopmentCost,
      developmentCostPerUnit: perUnitCost,
      annualRentSubsidyNeed,
      monthlyRentSubsidyPerUnit,
      annualServiceBudget,
      serviceCostPerUnit: serviceUnitCost,
      lines: [],
      operatingLines: [
        makeLine(
          "Rental subsidy need",
          annualRentSubsidyNeed,
          null,
          "Annual rent support",
          "Rental Subsidies",
          "Master lease and scattered-site models depend on rent assistance rather than development financing."
        ),
        makeLine(
          "Service funding need",
          annualServiceBudget,
          null,
          "Annual services",
          "Operating / Service Funding",
          "Sized from service intensity and unit count."
        )
      ],
      notes: ["No development cost shown for master lease or scattered-site models.", ...notes]
    };
  }

  const capitalTotal = totalDevelopmentCost ?? 0;
  const lihtcPercent = profile.projectType === "new construction" || profile.projectType === "rehabilitation" ? 0.52 : 0.45;
  const statePercent =
    profile.housingModel === "permanent supportive housing" || profile.population === "behavioral health needs" ? 0.2 : 0.15;
  const localPercent = profile.affordability === "30% Area Median Income" ? 0.18 : 0.14;
  const permanentLoanPercent =
    profile.affordability === "30% Area Median Income" || profile.housingModel === "permanent supportive housing" ? 0.07 : 0.14;

  const lihtcAmount = percentAmount(capitalTotal, lihtcPercent);
  const stateAmount = percentAmount(capitalTotal, statePercent);
  const localAmount = percentAmount(capitalTotal, localPercent);
  const permanentLoanAmount = percentAmount(capitalTotal, permanentLoanPercent);
  const flexibleGap = Math.max(0, capitalTotal - lihtcAmount - stateAmount - localAmount - permanentLoanAmount);

  const stateSource =
    profile.projectType === "adaptive reuse" || profile.projectType === "acquisition"
      ? "Homekey / Homekey+ or acquisition conversion capital"
      : profile.housingModel === "permanent supportive housing"
        ? "No Place Like Home / Multifamily Housing Program"
        : "Multifamily Housing Program or state soft debt";

  const lines = [
    makeLine(
      "LIHTC equity",
      lihtcAmount,
      totalDevelopmentCost,
      "Primary capital source",
      "Capital / Development Financing",
      "Illustrative 45%-60% equity role for affordable housing new construction or rehab."
    ),
    makeLine(
      stateSource,
      stateAmount,
      totalDevelopmentCost,
      "State gap subsidy",
      "Capital / Development Financing",
      "Represents state capital subsidy for deeply affordable, PSH, acquisition, or conversion projects."
    ),
    makeLine(
      "Local gap funding: LACDA NOFA, HOME, or AHTF",
      localAmount,
      totalDevelopmentCost,
      "Local soft funding",
      "Capital / Development Financing",
      "Local subsidy fills the gap after tax credits and state sources."
    ),
    makeLine(
      "Permanent loan",
      permanentLoanAmount,
      totalDevelopmentCost,
      "Mortgage proceeds",
      "Private / Permanent Debt",
      "Kept lower for 30% AMI and PSH projects because rents generally support less debt."
    ),
    makeLine(
      "Philanthropic or flexible capital gap",
      flexibleGap,
      totalDevelopmentCost,
      "Residual gap",
      "Philanthropic / Flexible Gap",
      "Calculated as the remaining amount needed to balance this illustrative stack."
    )
  ];

  return {
    isCapitalProject,
    units,
    totalDevelopmentCost,
    developmentCostPerUnit: perUnitCost,
    annualRentSubsidyNeed,
    monthlyRentSubsidyPerUnit,
    annualServiceBudget,
    serviceCostPerUnit: serviceUnitCost,
    lines,
    operatingLines: [
      makeLine(
        "Project-based vouchers, CoC rental assistance, FYI/FUP, or HCV pathway",
        annualRentSubsidyNeed,
        null,
        "Annual rent support",
        "Rental Subsidies",
        "Approximate rent subsidy need based on affordability and housing model."
      ),
      makeLine(
        "DMH, BHSA, LAHSA/CoC services, HHAP, or philanthropy",
        annualServiceBudget,
        null,
        "Annual services",
        "Operating / Service Funding",
        "Service budget estimate based on service intensity and unit count."
      )
    ],
    notes
  };
}
