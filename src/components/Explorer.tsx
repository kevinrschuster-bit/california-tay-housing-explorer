"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ClipboardList,
  Gauge,
  Handshake,
  Home,
  Info,
  Landmark,
  Layers3,
  Link as LinkIcon,
  MapPinned,
  PieChart,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Wand2
} from "lucide-react";
import programsData from "@/data/programs.json";
import { buildCapitalStackEstimate, formatCurrency, type CapitalStackEstimate } from "@/lib/capitalStack";
import {
  buildStarterSummary,
  getRecommendations,
  keyRisks,
  timelineConsiderations
} from "@/lib/matching";
import { defaultProfile } from "@/lib/profile";
import type { FundingSection, Program, ProjectProfile, ScoredProgram } from "@/lib/types";

const programs = programsData as Program[];

const options = {
  geography: ["City of Los Angeles", "Los Angeles County outside City of LA", "California statewide", "Unknown"],
  sponsorType: ["nonprofit", "for-profit", "joint venture", "public agency"],
  projectType: ["new construction", "acquisition", "rehabilitation", "adaptive reuse", "master lease", "scattered-site"],
  housingModel: ["affordable housing", "permanent supportive housing", "transitional housing", "rapid rehousing", "mixed model"],
  population: [
    "former foster youth",
    "youth experiencing homelessness",
    "parenting youth",
    "behavioral health needs",
    "justice-involved youth",
    "mixed TAY",
    "general affordable housing"
  ],
  affordability: ["30% Area Median Income", "50% Area Median Income", "60% Area Median Income", "80% Area Median Income", "mixed income"],
  siteStatus: ["no site", "site identified", "site controlled"],
  serviceIntensity: ["low", "medium", "high"]
} as const;

const sections: FundingSection[] = [
  "Recommended capital sources",
  "Recommended rental subsidies",
  "Recommended operating / service funding",
  "Likely public partners",
  "Likely philanthropic gaps"
];

const sectionIcons: Record<FundingSection, React.ReactNode> = {
  "Recommended capital sources": <Landmark className="h-5 w-5" />,
  "Recommended rental subsidies": <Building2 className="h-5 w-5" />,
  "Recommended operating / service funding": <Handshake className="h-5 w-5" />,
  "Likely public partners": <Layers3 className="h-5 w-5" />,
  "Likely philanthropic gaps": <Gauge className="h-5 w-5" />
};

const sectionTitles: Record<FundingSection, string> = {
  "Recommended capital sources": "Capital Sources",
  "Recommended rental subsidies": "Rental Subsidies",
  "Recommended operating / service funding": "Operating / Service Funding",
  "Likely public partners": "Partners & Implementation",
  "Likely philanthropic gaps": "Philanthropic Gaps"
};

const sectionDescriptions: Record<FundingSection, string> = {
  "Recommended capital sources": "Sources that could help pay for acquisition, construction, rehabilitation, or conversion.",
  "Recommended rental subsidies": "Tools that help make deeply affordable or supportive units financially feasible.",
  "Recommended operating / service funding": "Potential annual funding for services, navigation, operations, and launch gaps.",
  "Likely public partners": "Public agencies and implementation partners likely to shape the path forward.",
  "Likely philanthropic gaps": "Flexible dollars that can cover launch, reserves, evaluation, or early operating risk."
};

const categoryTone = {
  capital: "border-indigo-200 bg-indigo-50 text-indigo-700",
  rental: "border-sky-200 bg-sky-50 text-sky-700",
  services: "border-emerald-200 bg-emerald-50 text-emerald-700",
  risk: "border-amber-200 bg-amber-50 text-amber-800",
  neutral: "border-slate-200 bg-slate-50 text-slate-700"
};

function labelize(value: string) {
  return value
    .split(" ")
    .map((word) => {
      if (["TAY", "AMI", "LA"].includes(word)) return word;
      if (word.includes("%")) return word;
      return word
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("-");
    })
    .join(" ");
}

function SelectField<T extends keyof typeof options>({
  id,
  label,
  helper,
  defaultValue,
  onChange
}: {
  id: T;
  label: string;
  helper?: string;
  defaultValue: ProjectProfile[T];
  onChange: (value: ProjectProfile[T]) => void;
}) {
  function handleValueChange(event: React.ChangeEvent<HTMLSelectElement> | React.FormEvent<HTMLSelectElement>) {
    onChange(event.currentTarget.value as ProjectProfile[T]);
  }

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-900" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        name={id}
        defaultValue={String(defaultValue)}
        onChange={handleValueChange}
        onInput={handleValueChange}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 shadow-sm outline-none transition hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      >
        {options[id].map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
      {helper ? <span className="text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function ScoreBar({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-indigo-500" : "bg-slate-400";
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Fit score</span>
        <span>{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RatingPill({ label, value }: { label: string; value?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
      {label}: <strong className="text-slate-900">{value || "n/a"}</strong>
    </span>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof categoryTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryTone[tone]}`}>
      {children}
    </span>
  );
}

function ProgramCard({ item }: { item: ScoredProgram }) {
  const program = item.program;
  const officialUrl = program["Official Source"];
  const category = program["Funding Category"] || "Funding category not listed";
  const requiresSiteControl = (program["Site Control Required"] || "").toLowerCase().includes("yes");
  const nonprofitFriendly = (program["Nonprofit Eligible"] || "").toLowerCase().includes("yes");
  const categoryToneKey: keyof typeof categoryTone = category.toLowerCase().includes("rental")
    ? "rental"
    : category.toLowerCase().includes("service") || category.toLowerCase().includes("operating")
      ? "services"
      : category.toLowerCase().includes("capital") || category.toLowerCase().includes("development")
        ? "capital"
        : "neutral";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone={categoryToneKey}>{category}</Badge>
            {item.score >= 80 ? <Badge tone="services">High Fit</Badge> : null}
            {requiresSiteControl ? <Badge tone="risk">Requires Site Control</Badge> : null}
            {nonprofitFriendly ? <Badge tone="neutral">Nonprofit Friendly</Badge> : null}
          </div>
          <h3 className="text-base font-semibold text-slate-950">{program["Program Name"] || "Unnamed program"}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{program["Short Description"] || program["Why This Fits"] || "No description supplied."}</p>
        </div>
        <div className="min-w-36 rounded-lg bg-slate-50 p-3">
          <ScoreBar score={item.score} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-indigo-50/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Info className="h-4 w-4" />
            Why this fits
          </div>
          <ul className="space-y-1 text-sm leading-5 text-slate-600">
            {item.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-amber-50/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
            <AlertTriangle className="h-4 w-4" />
            Watch out for
          </div>
          <ul className="space-y-1 text-sm leading-5 text-slate-600">
            {item.cautions.map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p>
          <strong className="text-slate-950">Typical role:</strong> {program["Typical Award Size"] || "Not specified"}
          {program["Typical Share of Capital Stack"] ? `; ${program["Typical Share of Capital Stack"]}` : ""}
        </p>
        <p>
          <strong className="text-slate-950">Key partners:</strong> {program["Key Partners"] || program["Administering Agency"] || "Not specified"}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RatingPill label="Difficulty" value={program["Difficulty 1-5"]} />
        <RatingPill label="Flexibility" value={program["Flexibility 1-5"]} />
        <RatingPill label="Importance" value={program["Importance for TAY Project 1-5"]} />
        <RatingPill label="Confidence" value={program.Confidence} />
      </div>

      {officialUrl ? (
        <a
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-indigo-300 hover:text-indigo-700"
          href={officialUrl}
          target="_blank"
          rel="noreferrer"
        >
          <LinkIcon className="h-4 w-4" />
          Official source
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : null}
    </article>
  );
}

function InsightList({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold text-slate-950">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BuilderSection({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">{icon}</div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h2>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{note}</div>
    </div>
  );
}

function StackBar({ estimate }: { estimate: CapitalStackEstimate }) {
  const colors = ["bg-indigo-600", "bg-emerald-500", "bg-sky-500", "bg-slate-500", "bg-amber-500"];
  if (!estimate.isCapitalProject) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Annual subsidy view: rent support and service funding are shown as recurring needs rather than development sources.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
        {estimate.lines.map((line, index) => (
          <div
            key={line.source}
            className={`${colors[index % colors.length]} transition-all`}
            style={{ width: `${line.percent || 0}%` }}
            title={`${line.source}: ${line.percent}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {estimate.lines.map((line, index) => (
          <span key={line.source} className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${colors[index % colors.length]}`} />
            {line.source} {line.percent === null ? "" : `${line.percent}%`}
          </span>
        ))}
      </div>
    </div>
  );
}

function StackLineTable({ estimate }: { estimate: CapitalStackEstimate }) {
  const lines = estimate.isCapitalProject ? estimate.lines : estimate.operatingLines;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[minmax(170px,1.35fr)_minmax(112px,0.7fr)_minmax(72px,0.45fr)_minmax(135px,0.9fr)_minmax(180px,1.25fr)] gap-0 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 max-xl:hidden">
        <div>Source</div>
        <div>Amount</div>
        <div>Percent</div>
        <div>Role</div>
        <div>Why included</div>
      </div>
      <div className="divide-y divide-slate-200">
        {lines.map((line) => (
          <div
            key={line.source}
            className="grid gap-2 px-3 py-3 text-sm text-slate-600 xl:grid-cols-[minmax(170px,1.35fr)_minmax(112px,0.7fr)_minmax(72px,0.45fr)_minmax(135px,0.9fr)_minmax(180px,1.25fr)]"
          >
            <div>
              <div className="font-semibold text-slate-950">{line.source}</div>
              <div className="mt-1 text-xs text-slate-500 xl:hidden">{line.category}</div>
            </div>
            <div className="font-semibold text-slate-950">{formatCurrency(line.amount)}</div>
            <div>{line.percent === null ? "n/a" : `${line.percent}%`}</div>
            <div>
              <div>{line.role}</div>
              <div className="mt-1 hidden text-xs text-slate-500 xl:block">{line.category}</div>
            </div>
            <div className="leading-5">{line.whyIncluded}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IllustrativeCapitalStack({ estimate }: { estimate: CapitalStackEstimate }) {
  return (
    <section className="grid gap-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">
            <PieChart className="h-4 w-4" />
            Illustrative capital stack
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {estimate.isCapitalProject ? "Example sources to balance the project" : "Annual operating and subsidy estimate"}
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            This planning view translates the profile into simple source amounts so users can see how capital, rent subsidy, and services might fit together.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label={estimate.isCapitalProject ? "Total development cost" : "Development cost"}
          value={estimate.totalDevelopmentCost ? formatCurrency(estimate.totalDevelopmentCost) : "Not shown"}
          note={
            estimate.developmentCostPerUnit
              ? `${formatCurrency(estimate.developmentCostPerUnit)} per unit x ${estimate.units} units`
              : "Master lease and scattered-site models use annual subsidy estimates."
          }
        />
        <MetricCard
          label="Annual rent subsidy need"
          value={formatCurrency(estimate.annualRentSubsidyNeed)}
          note={`${formatCurrency(estimate.monthlyRentSubsidyPerUnit)} per unit per month, approximate`}
        />
        <MetricCard
          label="Annual service budget"
          value={formatCurrency(estimate.annualServiceBudget)}
          note={`${formatCurrency(estimate.serviceCostPerUnit)} per unit per year`}
        />
      </div>

      <StackBar estimate={estimate} />

      <StackLineTable estimate={estimate} />

      <div className="grid gap-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {estimate.notes.map((note) => (
          <div key={note}>{note}</div>
        ))}
        <div className="font-medium text-slate-950">
          This is an illustrative planning estimate, not a development budget, underwriting model, or financing commitment. Actual project costs,
          subsidy sizing, rent limits, operating expenses, and financing terms must be verified with qualified affordable housing professionals and
          official program guidance.
        </div>
      </div>
    </section>
  );
}

function ExecutiveStrategySummary({
  profile,
  summary,
  recommendations,
  risks
}: {
  profile: ProjectProfile;
  summary: string;
  recommendations: ScoredProgram[];
  risks: string[];
}) {
  const topFive = recommendations.slice(0, 5);
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Math.round((topFive.reduce((sum, item) => sum + item.score, 0) / Math.max(1, topFive.length)) - (profile.siteStatus === "no site" ? 8 : 0))
    )
  );
  const primaryCapital = recommendations.find((item) => item.section === "Recommended capital sources")?.program["Program Name"] || "Capital source to confirm";
  const rentalSubsidy = recommendations.find((item) => item.section === "Recommended rental subsidies")?.program["Program Name"] || "Rental subsidy to confirm";
  const serviceFunding =
    recommendations.find((item) => item.section === "Recommended operating / service funding")?.program["Program Name"] || "Service funding to confirm";
  const takeaways = [
    `Primary capital source: ${primaryCapital}.`,
    `Likely rental subsidy: ${rentalSubsidy}.`,
    `Major service funding need: ${serviceFunding}.`,
    `Biggest risk: ${risks[0] || "Confirm eligibility and timing with public partners."}`,
    profile.siteStatus === "site controlled" ? "Next step: align commitments and underwriting." : "Next step: sharpen site and partner readiness."
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Executive strategy summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">A working strategy for this project profile</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Readiness score</div>
          <div className="mt-1 text-4xl font-semibold">{readinessScore}</div>
          <div className="text-xs text-white/70">Illustrative fit signal</div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {takeaways.map((takeaway) => (
          <div key={takeaway} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-700">
            {takeaway}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Explorer({ initialProfile = defaultProfile }: { initialProfile?: ProjectProfile }) {
  const [profile, setProfile] = React.useState<ProjectProfile>(initialProfile);
  const [formVersion, setFormVersion] = React.useState(0);
  const formRef = React.useRef<HTMLFormElement>(null);
  const recommendations = getRecommendations(programs, profile);
  const starterSummary = buildStarterSummary(profile, recommendations.scored);
  const capitalStackEstimate = buildCapitalStackEstimate(profile);
  const timelineItems = timelineConsiderations(profile);
  const riskItems = keyRisks(profile);

  function update<K extends keyof ProjectProfile>(key: K, value: ProjectProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function resetProfile() {
    setProfile(initialProfile);
    setFormVersion((current) => current + 1);
  }

  function applyCurrentFormValues() {
    const form = formRef.current;
    if (!form) return;

    const data = new FormData(form);
    setProfile({
      geography: String(data.get("geography") || initialProfile.geography) as ProjectProfile["geography"],
      units: Math.max(1, Number(data.get("units")) || initialProfile.units),
      sponsorType: String(data.get("sponsorType") || initialProfile.sponsorType) as ProjectProfile["sponsorType"],
      projectType: String(data.get("projectType") || initialProfile.projectType) as ProjectProfile["projectType"],
      housingModel: String(data.get("housingModel") || initialProfile.housingModel) as ProjectProfile["housingModel"],
      population: String(data.get("population") || initialProfile.population) as ProjectProfile["population"],
      affordability: String(data.get("affordability") || initialProfile.affordability) as ProjectProfile["affordability"],
      siteStatus: String(data.get("siteStatus") || initialProfile.siteStatus) as ProjectProfile["siteStatus"],
      serviceIntensity: String(data.get("serviceIntensity") || initialProfile.serviceIntensity) as ProjectProfile["serviceIntensity"]
    });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/70 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                <ShieldCheck className="h-4 w-4" />
                Strategy dashboard for early-stage housing finance
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">California TAY Housing Finance Explorer</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                Design a housing project and explore potential financing, subsidy, service, and partnership strategies for transition-aged youth housing.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="rounded-xl bg-indigo-50 p-3">
                <div className="text-2xl font-semibold text-indigo-700">{programs.length}</div>
                <div className="text-xs text-slate-600">Programs</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <div className="text-2xl font-semibold text-emerald-700">{capitalStackEstimate.units}</div>
                <div className="text-xs text-slate-600">Units</div>
              </div>
              <div className="rounded-xl bg-sky-50 p-3">
                <div className="text-2xl font-semibold text-sky-700">{recommendations.scored[0]?.score || 0}</div>
                <div className="text-xs text-slate-600">Top fit</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
        <form
          key={formVersion}
          ref={formRef}
          method="get"
          action="/"
          onSubmit={(event) => {
            event.preventDefault();
            applyCurrentFormValues();
          }}
          className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-panel backdrop-blur"
        >
          <div className="mb-5 flex items-start justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Project builder</p>
              <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-950">Shape the deal</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Edit the profile to see how the strategy changes.</p>
            </div>
            <Search className="mt-1 h-6 w-6 shrink-0 text-indigo-600" />
          </div>

          <div className="grid gap-4 overflow-auto pr-1">
            <BuilderSection title="Project Basics" icon={<ClipboardList className="h-4 w-4" />}>
              <SelectField id="geography" label="County / geography" helper="Local front doors and housing authorities vary by jurisdiction." defaultValue={profile.geography} onChange={(value) => update("geography", value)} />
              <label className="grid gap-2 text-sm font-medium text-slate-900" htmlFor="units">
                <span>Number of units</span>
                <input
                  id="units"
                  name="units"
                  min={1}
                  max={500}
                  type="number"
                  defaultValue={profile.units}
                  onChange={(event) => update("units", Math.max(1, Number(event.target.value) || 1))}
                  onInput={(event) => update("units", Math.max(1, Number(event.currentTarget.value) || 1))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 shadow-sm outline-none transition hover:border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
                <span className="text-xs leading-5 text-slate-500">Unit count drives development cost, rental subsidy, and service estimates.</span>
              </label>
              <SelectField id="sponsorType" label="Sponsor type" helper="Some sources favor nonprofit or public-agency partnerships." defaultValue={profile.sponsorType} onChange={(value) => update("sponsorType", value)} />
            </BuilderSection>

            <BuilderSection title="Housing Model" icon={<Home className="h-4 w-4" />}>
              <SelectField id="projectType" label="Project type" helper="Construction, acquisition, and lease models use different cost assumptions." defaultValue={profile.projectType} onChange={(value) => update("projectType", value)} />
              <SelectField id="housingModel" label="Housing model" helper="Permanent supportive housing usually requires both rental subsidy and service funding." defaultValue={profile.housingModel} onChange={(value) => update("housingModel", value)} />
              <SelectField id="affordability" label="Affordability level" helper="30% AMI projects usually need durable subsidy beyond capital." defaultValue={profile.affordability} onChange={(value) => update("affordability", value)} />
            </BuilderSection>

            <BuilderSection title="Population & Services" icon={<UsersRound className="h-4 w-4" />}>
              <SelectField id="population" label="Population served" helper="Target population affects referral partners and special-purpose resources." defaultValue={profile.population} onChange={(value) => update("population", value)} />
              <SelectField id="serviceIntensity" label="Service intensity" helper="Higher service intensity increases the annual service budget estimate." defaultValue={profile.serviceIntensity} onChange={(value) => update("serviceIntensity", value)} />
            </BuilderSection>

            <BuilderSection title="Readiness" icon={<MapPinned className="h-4 w-4" />}>
              <SelectField id="siteStatus" label="Site status" helper="Site control can affect competitiveness for capital sources." defaultValue={profile.siteStatus} onChange={(value) => update("siteStatus", value)} />
            </BuilderSection>
          </div>

          <div className="sticky bottom-0 mt-5 grid grid-cols-[1fr_auto] gap-2 border-t border-slate-200 bg-white/95 pt-4">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Wand2 className="h-4 w-4" />
              Update Strategy
            </button>
            <button
              type="button"
              aria-label="Reset profile"
              onClick={resetProfile}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>

      <section className="grid min-w-0 gap-6">
        <ExecutiveStrategySummary profile={profile} summary={starterSummary} recommendations={recommendations.scored} risks={riskItems} />

        <div className="grid gap-4 xl:grid-cols-2">
          <InsightList title="Timeline considerations" icon={<CalendarClock className="h-5 w-5 text-indigo-600" />} items={timelineItems} />
          <InsightList title="Key risks" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} items={riskItems} />
        </div>

        <IllustrativeCapitalStack estimate={capitalStackEstimate} />

        {sections.map((section) => {
          const items = recommendations.bySection[section];
          return (
            <div key={section} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                    {sectionIcons[section]}
                    {sectionTitles[section]}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{sectionDescriptions[section]}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length} shown</span>
              </div>
              {items.length > 0 ? (
                <div className="grid gap-4">
                  {items.map((item) => (
                    <ProgramCard key={`${section}-${item.program["Program Name"]}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No strong matches found for this section. Try broadening the housing model or population profile.
                </div>
              )}
            </div>
          );
        })}

        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm leading-6 text-slate-600">
          This tool is for early-stage planning and learning. It does not replace official program guidance, legal advice, underwriting, or
          conversations with public agencies and housing finance professionals.
        </div>
      </section>
      </main>
    </div>
  );
}
