// ============================================================
// Site Configuration — StudEx Super Agents
// ============================================================

export interface SiteConfig {
  language: string;
  brandName: string;
}

export const siteConfig: SiteConfig = {
  language: "en",
  brandName: "STUDEX SUPER AGENTS",
};

// ============================================================
// Navigation
// ============================================================

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationConfig {
  links: NavLink[];
  ctaText: string;
}

export const navigationConfig: NavigationConfig = {
  links: [
    { label: "The Stack", href: "#stack" },
    { label: "Standing Army", href: "#standing-army" },
    { label: "StudBot", href: "#studbot" },
    { label: "The Roster", href: "#alumni" },
    { label: "Architecture", href: "#cinematic" },
    { label: "The Orchestrator", href: "#orchestrator" },
    { label: "Commissions", href: "#orchestra" },
  ],
  ctaText: "Deploy Your Agent",
};

// ============================================================
// Live Ticker (fixed terminal bar + counter banner)
// ============================================================

export interface LiveTickerConfig {
  lines: string[];
  counterText: string;
}

export const liveTickerConfig: LiveTickerConfig = {
  // The floor feed: instruments at work. Editable — wire to the live
  // harness when the terminal layer ships.
  lines: [
    "Oracle is scanning 142 tenders on the Execution Exchange...",
    "Hunter deployed outreach to 38 warm leads...",
    "Care resolved 12 customer tickets overnight...",
    "Profit repriced 3 offers while you slept...",
    "Creator rendered 6 clips for the morning drop...",
    "Flow synced stock with the Kigali roastery...",
    "Ops patched the build. Zero downtime.",
    "Commander called the 04:00 board session to order...",
    "Mission Control dispatched 3 tasks to the crew — approvals pending your green light...",
    "StudBot provisioned a Cloud Boxer VM for a new founder...",
    "Welcome to the Orchestra.",
  ],
  counterText: "The Orchestra is running 47 companies right now",
};

// ============================================================
// Hero
// ============================================================

export interface HeroConfig {
  title: string;
  subtitleLine1: string;
  subtitleLine2: string;
  ctaText: string;
}

export const heroConfig: HeroConfig = {
  title: "Every Business Deserves an Orchestra",
  subtitleLine1: "Your AI co-founder runs the business while you sleep — twelve instruments on one private machine.",
  subtitleLine2: "From R1,599/month. Johannesburg — Kigali.",
  ctaText: "Meet the Instruments",
};

// ============================================================
// StudBot (launch product — black/gold product panel)
// ============================================================

export interface StudBotConfig {
  sectionLabel: string;
  name: string;
  descriptor: string;
  paragraphs: string[];
  badges: string[];
  image: string;
  mascotImage: string;
  caption: string;
  bootLines: string[];
}

export const studbotConfig: StudBotConfig = {
  sectionLabel: "The Product — Launching Now",
  name: "STUDBOT",
  descriptor: "AI Agent · VM Assistant · Cloud Boxer",
  paragraphs: [
    "Every Super Agents deployment wakes up as StudBot — the agent that runs on your own Cloud Boxer VM, isolated from the world and answerable only to you.",
    "StudBot is the face of the workforce: the first employee you meet, the one that provisions your machine, seats the instruments, and stays on shift when the office goes dark.",
    "Secure. Intelligent. Relentless. Powered by StudEx Global Markets.",
  ],
  badges: ["CLOUD BOXER VM", "ISOLATED · SECURE · SCALABLE", "POWERED BY STUDEX GLOBAL MARKETS"],
  image: "/images/studbot-head.jpg",
  mascotImage: "/images/studbot-mascot.jpg",
  caption: "studbot — the face of your workforce.",
  bootLines: [
    "studbot init --vm=cloud-boxer --client=you",
    "✓ VM provisioned — isolated, always on",
    "✓ Business Ghost mounted — memory restored",
    "✓ Mission Control connected — board ready",
    "✓ 12 instruments seated",
    "studbot ▸ on shift. 24/7.",
  ],
};

// ============================================================
// The Problem ("Your laptop sleeps. Your agent shouldn't.")
// ============================================================

export interface ProblemCard {
  title: string;
  body: string;
}

export interface ProblemConfig {
  sectionLabel: string;
  heading: string;
  cards: ProblemCard[];
}

export const problemConfig: ProblemConfig = {
  sectionLabel: "The Problem",
  heading: "Your laptop sleeps. Your agent shouldn't.",
  cards: [
    {
      title: "The machine fights itself",
      body: "Run more than one agent locally and they compete for CPU, RAM, and disk. Work slows to a crawl — right when it matters most.",
    },
    {
      title: "Your keys are on the table",
      body: "A local agent can touch your SSH keys, cloud credentials, browser sessions — your entire filesystem. One bad run and it's all exposed.",
    },
    {
      title: "Close the lid, lose the shift",
      body: "Laptop closed, agent dead. No memory between sessions, no continuity of work. Every morning starts from zero.",
    },
    {
      title: "Nobody's watching the watchman",
      body: "What did your agent do last night? What did it spend? Local runs give you nothing — no logs, no ledger, no oversight.",
    },
  ],
};

// ============================================================
// Deployment ("From handshake to orchestra in three nights")
// ============================================================

export interface DeploymentStep {
  numeral: string;
  title: string;
  body: string;
}

export interface DeploymentConfig {
  sectionLabel: string;
  heading: string;
  steps: DeploymentStep[];
}

export const deploymentConfig: DeploymentConfig = {
  sectionLabel: "How a Deployment Works",
  heading: "From handshake to orchestra in three nights.",
  steps: [
    {
      numeral: "I",
      title: "The VM wakes",
      body: "Your Cloud Boxer VM is provisioned — a private machine, isolated at the infrastructure level. Your data never shares a floor with anyone else's.",
    },
    {
      numeral: "II",
      title: "StudBot takes the chair",
      body: "StudBot boots into the machine, connects Mission Control, and learns your business — the brain dump becomes a board, tasks, and priorities.",
    },
    {
      numeral: "III",
      title: "The orchestra plays",
      body: "The instruments take their seats — ads, code, content, sales, care. They execute; you approve. Three decisions a day, the rest is music.",
    },
  ],
};

// ============================================================
// Ecosystem ("What StudBot will be — the flywheel")
// ============================================================

export interface FlywheelNode {
  kicker: string;
  title: string;
  body: string;
  items: string[];
}

export interface EcosystemConfig {
  sectionLabel: string;
  heading: string;
  intro: string;
  flowLabels: string[];
  nodes: FlywheelNode[];
  loopLabel: string;
  backbone: { title: string; body: string }[];
  closing: string;
}

export const ecosystemConfig: EcosystemConfig = {
  sectionLabel: "The Ecosystem — What StudBot Will Be",
  heading: "One machine, every economy it touches.",
  intro:
    "StudBot is not a chatbot. It is the employee that plugs your company into the whole StudEx machine — global technology in, African talent up, work and settlement flowing between.",
  flowLabels: [
    "Technology · Capital · Opportunities",
    "Projects · Tenders · Work",
    "Talent · Founders · New Companies",
  ],
  nodes: [
    {
      kicker: "Layer 01",
      title: "Global Companies",
      body: "AI companies, cloud providers, OEMs, investors, governments — patents, technology, infrastructure, universities, global expertise.",
      items: ["AI Companies", "Cloud Providers", "OEMs", "Investors", "Governments", "Universities"],
    },
    {
      kicker: "Layer 02",
      title: "StudEx Global Markets",
      body: "The bridge. International partnerships, global trade, IP, capital, data centres, hardware, research and government relationships — routed into Africa, and African work routed out.",
      items: ["Partnerships", "Trade", "IP & Patents", "Capital", "Data Centres", "Government Relations"],
    },
    {
      kicker: "Layer 03",
      title: "Super Agents",
      body: "The top 20–100 companies per country. Each one runs the full stack: Business Ghost memory, a private VM workspace, the Agent OS, an AI workforce — plus local distribution and enterprise sales.",
      items: ["Business Ghost", "Private VM", "StudEx Agent OS", "AI Workforce", "Distribution", "Enterprise Sales"],
    },
    {
      kicker: "Layer 04",
      title: "Agentic Rise",
      body: "100–1,000 startups per country. Developers, AI engineers, cloud teams, sales companies, studios, consultants, universities — they build, localise, deploy and support.",
      items: ["Build", "Localise", "Deploy", "Support"],
    },
    {
      kicker: "The Engine Room",
      title: "StudEx Arcade · Midnight Founders Club",
      body: "Gamers, programmers, creators and students play, pitch and earn a Talent Passport — while the Club coaches founders, runs Friday pitches and builds startups. Talent flows up; the flywheel turns.",
      items: ["Pitch + Play", "Talent Passport", "Coaching", "Friday Pitches", "Founder Community", "AI Workspace"],
    },
  ],
  loopLabel: "Talent, founders and new companies flow back up — the flywheel never stops.",
  backbone: [
    { title: "StudEx Brain", body: "Shared knowledge · institutional memory · business intelligence" },
    { title: "Business Ghosts", body: "One persistent business memory per company — goals, meetings, customers, decisions" },
    { title: "StudEx Agent OS", body: "Identity · permissions · goals · tasks · workflows · reporting · auditing" },
    { title: "Runtime & Cloud", body: "OpenClaw · Hermes · DenchClaw · CashClaw on StudEx Cloud VMs and edge nodes" },
    { title: "Execution Exchange", body: "Opportunities · tenders · partner matching · work allocation · settlement" },
  ],
  closing: "StudBot is how your company takes its seat in this machine.",
};

// ============================================================
// Standing Army ("Never Hire Again")
// ============================================================

export interface StandingArmyConfig {
  sectionLabel: string;
  heading: string;
  lines: string[];
  image: string;
  caption: string;
}

export const standingArmyConfig: StandingArmyConfig = {
  sectionLabel: "The Co-Founder That Never Sleeps",
  heading: "Never Hire Again",
  lines: [
    "You're a founder, or you should be.",
    "The Orchestra is your first employee. It never sleeps.",
    "The solo founder's standing army.",
  ],
  image: "/images/first-employee.jpg",
  caption: "Fig. 0 — Your first employee, on the night shift. As always.",
};

// ============================================================
// Your Team (role list — one orchestra, every chair)
// ============================================================

export interface TeamRole {
  agent: string;
  action: string;
  instrument: string;
}

export interface YourTeamConfig {
  sectionLabel: string;
  heading: string;
  roles: TeamRole[];
  closing: string;
  image: string;
  caption: string;
}

export const yourTeamConfig: YourTeamConfig = {
  sectionLabel: "One Orchestra. Every Chair.",
  heading: "The Orchestra is your team.",
  roles: [
    { agent: "Commander", action: "plans your roadmap.", instrument: "The Baton" },
    { agent: "Ops", action: "ships your code.", instrument: "Double Bass" },
    { agent: "Hunter", action: "runs your ads.", instrument: "Trumpet" },
    { agent: "Care", action: "replies to customers.", instrument: "Saxophone" },
    { agent: "Profit", action: "closes your deals.", instrument: "Grand Piano" },
    { agent: "Creator", action: "posts your content.", instrument: "E-Guitar" },
  ],
  closing: "Twelve instruments. Every chair.",
  image: "/images/orchestra-boardroom.jpg",
  caption: "Fig. 2 — The board meeting, 04:00. Nobody called in sick.",
};

// ============================================================
// Capabilities (Curriculum section)
// ============================================================

export interface CapabilityItem {
  title: string;
  slug: string;
  description: string;
  image: string;
}

export interface CapabilitiesConfig {
  sectionLabel: string;
  items: CapabilityItem[];
}

export const capabilitiesConfig: CapabilitiesConfig = {
  sectionLabel: "The Stack",
  items: [
    {
      title: "Business Ghost",
      slug: "business-ghost",
      description:
        "The memory of your company, alive. Business Ghost listens to every decision, document and deal — then answers back, in a voice you can talk to.",
      image: "/images/business-ghost.jpg",
    },
    {
      title: "DenchClaw",
      slug: "denchclaw",
      description:
        "CRM and sales automation with teeth. DenchClaw tracks every lead, chases every pipeline, and never lets a follow-up die in an inbox.",
      image: "/images/denchclaw.jpg",
    },
    {
      title: "CashClaw",
      slug: "cashclaw",
      description:
        "Services, jobs and commerce on rails. CashClaw routes work, quotes and payments through one commercial spine — so revenue never waits.",
      image: "/images/cashclaw.jpg",
    },
    {
      title: "Execution Exchange",
      slug: "execution-exchange",
      description:
        "The commercial center everything routes through. Tenders, opportunities and partnerships are matched to your company before your competitors wake up.",
      image: "/images/execution-exchange.jpg",
    },
  ],
};

// ============================================================
// Capability Detail (sub-pages)
// ============================================================

export interface CapabilityDetailData {
  title: string;
  subtitle: string;
  paragraphs: string[];
}

export interface CapabilityDetailConfig {
  sectionLabel: string;
  backLinkText: string;
  prevLabel: string;
  nextLabel: string;
  notFoundText: string;
  capabilities: Record<string, CapabilityDetailData>;
}

export const capabilityDetailConfig: CapabilityDetailConfig = {
  sectionLabel: "The Stack",
  backLinkText: "Back to the Stack",
  prevLabel: "Previous",
  nextLabel: "Next",
  notFoundText: "This capability does not exist.",
  capabilities: {
    "business-ghost": {
      title: "Business Ghost",
      subtitle: "Your company's second brain, on record.",
      paragraphs: [
        "Every company forgets. Decisions vanish into chat threads, lessons die with departing staff, and the same mistakes get made twice. Business Ghost ends that. It sits inside your operation — reading documents, watching deals, absorbing context — and builds a living memory of how your company actually works.",
        "Ask it anything. Why did we lose that tender in March? What did we promise the Kigali distributor? Business Ghost answers from your own history, not from a generic model's guess. It is your institutional memory, queryable in plain language, day or night.",
        "The Ghost ships as a talking agent with an animated presence — it briefs you in the morning, sits in on board sessions, and drafts from your company's own voice. Multilingual by design: English, French and Kinyarwanda at the core.",
        "Runs on your private VM, inside your perimeter. Your memory never trains someone else's model.",
      ],
    },
    denchclaw: {
      title: "DenchClaw",
      subtitle: "CRM and sales automation with teeth.",
      paragraphs: [
        "Most CRMs are graveyards — data goes in, nothing comes out. DenchClaw inverts that. It is an active sales agent that works your pipeline: scoring leads, drafting outreach, scheduling follow-ups, and escalating the deals that need a human touch.",
        "Every lead is tracked from first contact to signed invoice. DenchClaw knows which prospects are warm, which quotes are ageing, and which relationships need attention this week — and it acts on that knowledge instead of just reporting it.",
        "Built for African sales reality: WhatsApp threads, voice notes, long relationship cycles, cross-border deals. DenchClaw meets your customers where the conversation actually happens.",
        "Paired with the Super Agents roster, DenchClaw hands revenue context to Profit and pipeline signal to Hunter — your whole commercial brain, connected.",
      ],
    },
    cashclaw: {
      title: "CashClaw",
      subtitle: "Services, jobs and commerce on rails.",
      paragraphs: [
        "CashClaw is the transaction engine of the Super Agents stack. It routes work to your team, generates quotes, tracks jobs, and moves money through one commercial spine — the unglamorous plumbing that decides whether a company gets paid on time.",
        "From a customer request to a completed, invoiced job, CashClaw holds the thread. No lost quotes, no orphaned invoices, no 'I thought you sent it.' Every transaction is visible, auditable and chaseable.",
        "It plugs into the Stitch payment gateway for collections, with accounting handed to your books — clean separation between moving money and recording it, the way a serious operation should run.",
        "For service businesses, agencies and contractors, CashClaw turns a chaotic order book into a machine that hums.",
      ],
    },
    "execution-exchange": {
      title: "Execution Exchange",
      subtitle: "Where opportunity meets your company first.",
      paragraphs: [
        "Tenders close before you hear about them. Partnerships go to whoever showed up first. The Execution Exchange is built to end that disadvantage — a matching engine that continuously scans opportunities, tenders and collaborations and routes the right ones to your company.",
        "It is the commercial center of the StudEx ecosystem: everything routes through the Exchange. Global Markets events, Super Agents members, Startup Arcade graduates — supply and demand meet here, and members see the flow before the open market does.",
        "Your agents do the first pass: Fit score, deadline, documents required. You wake up to a shortlist, not a firehose.",
        "The Exchange is where a subscription becomes a pipeline — the reason Super Agents pays for itself.",
      ],
    },
  },
};

// ============================================================
// Architecture (CinematicVision section)
// ============================================================

export interface ArchitectureConfig {
  sectionLabel: string;
  videoPath: string;
  title: string;
  description: string;
}

export const architectureConfig: ArchitectureConfig = {
  sectionLabel: "Architecture",
  videoPath: "",
  title: "One private machine. An entire workforce.",
  description:
    "Every Super Agents deployment runs on your own private VM — Mission Control, our agent-first operating system, holds the board: brain dump to brief, tasks dispatched to the crew, every spend behind your approval. The StudEx Agent OS sets goals, workflows and permissions under your control; ADAM SMASHER routes inference across South Africa and Rwanda with cloud fallback, while the agent roster, Business Ghost, DenchClaw, CashClaw and the Execution Exchange plug in as one connected commercial brain. Your data stays in your perimeter; the workforce scales on command.",
};

// ============================================================
// Research (AlumniArchives section) — The Roster
// ============================================================

export interface ResearchProject {
  title: string;
  year: string;
  discipline: string;
  image: string;
}

export interface ResearchConfig {
  sectionLabel: string;
  projects: ResearchProject[];
}

export const researchConfig: ResearchConfig = {
  sectionLabel: "The Orchestra — Twelve Instruments on Duty",
  projects: [
    { title: "Oracle", year: "🎻 VIOLIN I", discipline: "Market Intelligence", image: "/images/oracle.jpg" },
    { title: "Creator", year: "🎸 E-GUITAR", discipline: "Content & Media", image: "/images/creator.jpg" },
    { title: "Profit", year: "🎹 GRAND PIANO", discipline: "Revenue & Pricing", image: "/images/profit.jpg" },
    { title: "Hunter", year: "🎺 TRUMPET", discipline: "Acquisition", image: "/images/hunter.jpg" },
    { title: "Care", year: "🎷 SAXOPHONE", discipline: "Customer Success", image: "/images/care.jpg" },
    { title: "Flow", year: "🥁 TIMPANI", discipline: "Supply Chain", image: "/images/flow.jpg" },
    { title: "Insight", year: "🎻 VIOLA", discipline: "Analytics", image: "/images/insight.jpg" },
    { title: "Ops", year: "🎻 DOUBLE BASS", discipline: "Operations", image: "/images/ops.jpg" },
    { title: "Vision", year: "🎹 CELESTA", discipline: "Innovation", image: "/images/vision.jpg" },
    { title: "Commander", year: "THE BATON", discipline: "Strategy & Control", image: "/images/commander.jpg" },
    { title: "Umukozi", year: "🎤 SOPRANO", discipline: "Voice — EN/FR/KIN", image: "/images/umukozi.jpg" },
    { title: "Vera", year: "🎤 MEZZO", discipline: "Voice — 11 Languages", image: "/images/vera.jpg" },
  ],
};

// ============================================================
// Footer
// ============================================================

export interface FooterLinkColumn {
  title: string;
  links: string[];
}

export interface FooterBottomLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  heading: string;
  columns: FooterLinkColumn[];
  copyright: string;
  bottomLinks: FooterBottomLink[];
}

export const footerConfig: FooterConfig = {
  heading: "Start a company tonight",
  columns: [
    {
      title: "Platform",
      links: [
        "Business Ghost",
        "DenchClaw",
        "CashClaw",
        "Execution Exchange",
        "StudEx Agent OS",
      ],
    },
    {
      title: "Ecosystem",
      links: [
        "Startup Arcade",
        "Midnight Founders Club",
        "Global Markets",
        "StudEx Arcade",
        "Agentic Rise",
      ],
    },
  ],
  copyright: "© 2026 StudEx Group. Johannesburg — Kigali.",
  bottomLinks: [
    { label: "stud.exchange", href: "https://stud.exchange" },
    { label: "superagents.studex-group.com", href: "https://superagents.studex-group.com" },
  ],
};

// ============================================================
// Product Panels (carousel-style money panels)
// ============================================================

export interface ProductPanel {
  index: string;
  name: string;
  subtitle: string;
  tagline: string;
  features: string[];
  moneyPoints: string[];
  badges: string[];
  image: string;
  slug: string;
}

export interface ProductPanelsConfig {
  sectionLabel: string;
  panels: ProductPanel[];
}

export const productPanelsConfig: ProductPanelsConfig = {
  sectionLabel: "The Stack — Machines That Pay",
  panels: [
    {
      index: "#1",
      name: "BUSINESS GHOST",
      subtitle: "YOUR COMPANY'S SECOND BRAIN",
      tagline: "It remembers everything. You stop repeating yourself.",
      features: [
        "Listens to every decision, document and deal",
        "Answers in plain language, day or night",
        "Talks back — animated, multilingual voice",
        "Runs on your private VM, inside your perimeter",
      ],
      moneyPoints: [
        "Stop paying for the same mistake twice",
        "Onboard new staff in hours, not months",
        "Win tenders with your own history on tap",
        "Your know-how becomes an asset you can sell",
      ],
      badges: ["PRIVATE VM", "EN / FR / KIN", "24/7 ON DUTY"],
      image: "/images/business-ghost.jpg",
      slug: "business-ghost",
    },
    {
      index: "#2",
      name: "DENCHCLAW",
      subtitle: "CRM & SALES WITH TEETH",
      tagline: "Not a database graveyard. A hunter that works your pipeline.",
      features: [
        "Scores every lead, chases every follow-up",
        "Drafts outreach in your company's voice",
        "Lives where deals happen — WhatsApp included",
        "Escalates the deals that need a human touch",
      ],
      moneyPoints: [
        "No lead ever dies in an inbox again",
        "Quotes go out same-day, not same-week",
        "Pipeline signal routes straight to your agents",
        "Sell while you sleep — literally",
      ],
      badges: ["ACTIVE PIPELINE", "WHATSAPP NATIVE", "CROSS-BORDER"],
      image: "/images/denchclaw.jpg",
      slug: "denchclaw",
    },
    {
      index: "#3",
      name: "CASHCLAW",
      subtitle: "SERVICES, JOBS & COMMERCE ON RAILS",
      tagline: "From request to invoice without the chaos.",
      features: [
        "Routes work, quotes and payments on one spine",
        "Every transaction visible, auditable, chaseable",
        "Stitch payment gateway built in",
        "Clean handoff to your accounting books",
      ],
      moneyPoints: [
        "Get paid on time — the system chases, not you",
        "Zero lost quotes, zero orphaned invoices",
        "Turn a chaotic order book into a machine",
        "Commerce that hums while you build",
      ],
      badges: ["STITCH PAYMENTS", "FULL AUDIT TRAIL", "ZERO LEAKAGE"],
      image: "/images/cashclaw.jpg",
      slug: "cashclaw",
    },
    {
      index: "#4",
      name: "EXECUTION EXCHANGE",
      subtitle: "OPPORTUNITY FINDS YOU FIRST",
      tagline: "The commercial center of the ecosystem routes through you.",
      features: [
        "Scans tenders, partnerships and openings 24/7",
        "Fit-scored shortlist, not a firehose",
        "Members see dealflow before the open market",
        "Global Markets events feed straight in",
      ],
      moneyPoints: [
        "Tenders land on your desk before competitors wake",
        "Your subscription becomes a pipeline",
        "Agents do the first pass — you decide",
        "The reason Super Agents pays for itself",
      ],
      badges: ["24/7 DEALFLOW", "MEMBER PRIORITY", "STUD.EXCHANGE"],
      image: "/images/execution-exchange.jpg",
      slug: "execution-exchange",
    },
  ],
};

// ============================================================
// The Flight (scroll-world cinematic dive)
// ============================================================

export interface FlightScene {
  id: string;
  kicker: string;
  title: string;
  line: string;
  image: string;
}

export interface ScrollWorldConfig {
  sectionLabel: string;
  scenes: FlightScene[];
}

export const scrollWorldConfig: ScrollWorldConfig = {
  sectionLabel: "The Flight — A Continuous Dive",
  scenes: [
    {
      id: "spark",
      kicker: "Movement I — The Spark",
      title: "Where your company touches the machine.",
      line: "Every deployment begins the same way: a founder reaches out — and something reaches back.",
      image: "/images/the-spark.jpg",
    },
    {
      id: "night-shift",
      kicker: "Movement II — The Night Shift",
      title: "Your first employee never sleeps.",
      line: "While the office goes dark, the terminal stays lit. The work continues.",
      image: "/images/first-employee.jpg",
    },
    {
      id: "board",
      kicker: "Movement III — The Board",
      title: "Twelve instruments take their seats.",
      line: "Market, revenue, pipeline, care, code — every chair filled, every voice tuned. Nobody calls in sick.",
      image: "/images/orchestra-boardroom.jpg",
    },
    {
      id: "orchestrator",
      kicker: "Movement IV — The Baton",
      title: "And one Orchestrator conducts it all.",
      line: "Agents execute. You approve. Three decisions a day — the orchestra does everything else.",
      image: "/images/agent-lord.jpg",
    },
  ],
};

// ============================================================
// Orchestra (commission tiers + six movements)
// ============================================================

export interface OrchestraTier {
  name: string;
  ensemble: string;
  price: string;
  tagline: string;
  includes: string[];
  featured: boolean;
}

export interface Movement {
  numeral: string;
  name: string;
  description: string;
}

export interface OrchestraConfig {
  sectionLabel: string;
  heading: string;
  intro: string;
  tiers: OrchestraTier[];
  movements: Movement[];
}

export const orchestraConfig: OrchestraConfig = {
  sectionLabel: "The Atelier Above the Subscription",
  heading: "The Mona Lisa Orchestra",
  intro:
    "For enterprises that want more than a subscription — a commissioned ensemble, handcrafted. Every agent an instrument. Every workflow a score. You hold the baton.",
  tiers: [
    {
      name: "The Soloist",
      ensemble: "1 instrument",
      price: "R500,000",
      tagline: "One instrument, perfected.",
      includes: [
        "One bespoke instrument-agent",
        "10 technique libraries",
        "90 days of tuning",
        "Personal Luthier (agent steward)",
      ],
      featured: false,
    },
    {
      name: "The Trio",
      ensemble: "3 instruments",
      price: "R1,500,000",
      tagline: "Chamber arrangement — emergent capability no soloist achieves.",
      includes: [
        "Three complementary agents",
        "Full orchestral section (unlimited tools)",
        "180 days of composition",
        "Concert Master (atelier director)",
      ],
      featured: false,
    },
    {
      name: "String Quartet",
      ensemble: "4 instruments",
      price: "R2,500,000",
      tagline: "A complete front line — research, synthesis, strategy, close.",
      includes: [
        "Two Violins, Viola, Cello",
        "Research-to-revenue coverage",
        "Quarterly repertoire expansion",
        "Priority tuning windows",
      ],
      featured: false,
    },
    {
      name: "Symphony Orchestra",
      ensemble: "Unlimited",
      price: "R5,000,000",
      tagline: "Full orchestral arrangement. You are Principal Conductor.",
      includes: [
        "Unlimited instrument-agents",
        "Orchestral pit (orchestration layer)",
        "365 days of composition",
        "World tour — global on-site curation",
      ],
      featured: true,
    },
    {
      name: "Composer-in-Residence",
      ensemble: "Private",
      price: "By inquiry",
      tagline: "The entire atelier, dedicated to one patron. Three per year.",
      includes: [
        "Exclusive multi-year engagement",
        "Custom instrument R&D",
        "Private concert hall (dedicated infra)",
        "Five Agent Architects on staff",
      ],
      featured: false,
    },
  ],
  movements: [
    { numeral: "I", name: "Overture", description: "We listen to your enterprise — its rhythms, tonalities, dissonances." },
    { numeral: "II", name: "Composition", description: "The score emerges. Instruments assigned their voices." },
    { numeral: "III", name: "Rehearsal", description: "Parts refined. Sectionals held. The instruments learn to breathe together." },
    { numeral: "IV", name: "Dress Rehearsal", description: "Full run-through. Dynamics tested. Your baton finds its rhythm." },
    { numeral: "V", name: "Opening Night", description: "The work premieres. Your customers experience something profound." },
    { numeral: "VI", name: "Perpetual Performance", description: "The symphony never concludes — it evolves toward perfection." },
  ],
};
