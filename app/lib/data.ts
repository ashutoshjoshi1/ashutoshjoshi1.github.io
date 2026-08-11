export interface Project {
  index: string;
  name: string;
  domain: string;
  year: string;
  description: string;
  stack: string[];
  link: string;
  /* seed that shapes this project's generative waveform signature */
  seed: number;
  /* spectral band — the domain's color on the spectrum (CSS variable) */
  band: string;
}

export const PROJECTS: Project[] = [
  {
    index: "01",
    name: "Phulax",
    domain: "AI Agent Security / Open Source",
    year: "2026",
    description:
      "Open-source runtime security control plane for AI agents — a local gateway intercepts every tool call and enforces allow / deny / approval / freeze through a deterministic policy engine, with metadata-first audit trails that cite the exact rule behind every decision.",
    stack: ["Python", "PostgreSQL", "Redis", "Docker"],
    link: "https://github.com/phulax-io/phulax",
    seed: 97,
    band: "var(--volt)",
  },
  {
    index: "02",
    name: "CommonGround",
    domain: "RAG / AI Infrastructure",
    year: "2025",
    description:
      "Enterprise RAG platform — multimodal document ingestion with OCR, pgvector semantic Q&A with citations, prompt versioning, evaluation datasets and audit trails for compliance-ready retrieval.",
    stack: ["FastAPI", "Next.js", "pgvector", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/CommonGround",
    seed: 7,
    band: "var(--cyan)",
  },
  {
    index: "03",
    name: "InCortex",
    domain: "Agentic AI / Open Source",
    year: "2026",
    description:
      "Self-learning agentic AI framework — persistent vector memory with forgetting curves, gated tool use with human-in-the-loop approval, strategies competing under UCB bandits, Brier/ECE calibration audits. 450 tests, 100% coverage.",
    stack: ["Python", "Vector Memory", "REST", "pytest"],
    link: "https://github.com/ashutoshjoshi1/InCortex",
    seed: 23,
    band: "var(--uv)",
  },
  {
    index: "04",
    name: "Office.ai",
    domain: "Agentic AI / 3D",
    year: "2026",
    description:
      "An AI-staffed software company as an operating system — eight specialized agents take an idea from validation to a deployed, billing SaaS through real GitHub PRs, Vercel deploys and Stripe, all rendered as a navigable 3D office with human approval gates.",
    stack: ["Next.js", "React Three Fiber", "FastAPI", "Supabase", "Stripe"],
    link: "https://github.com/ashutoshjoshi1/Office.ai",
    seed: 59,
    band: "var(--green)",
  },
  {
    index: "05",
    name: "SciGlob Library",
    domain: "Instrument Control / NASA",
    year: "2026",
    description:
      "Unified Python interface to every device in a Pandora-class atmospheric instrument — 14 device types behind one YAML-configured facade, each with a hardware driver and a simulation twin so the full instrument runs without physical hardware.",
    stack: ["Python", "pyserial", "YAML", "OpenCV"],
    link: "https://github.com/ashutoshjoshi1/SciGlob-Library",
    seed: 37,
    band: "var(--amber)",
  },
  {
    index: "06",
    name: "BlickO-CPP",
    domain: "Systems / NASA",
    year: "2026",
    description:
      "Ground-up C++17 rewrite of the Blick spectral processing suite (L0→L2) — 14 modular libraries, parity test harness, GPU-ready acceleration framework.",
    stack: ["C++17", "CMake", "CUDA-ready", "CI"],
    link: "https://github.com/ashutoshjoshi1/BlickO-CPP",
    seed: 31,
    band: "var(--amber)",
  },
  {
    index: "07",
    name: "Pandora Summarizer",
    domain: "Distributed Systems / NASA",
    year: "2025",
    description:
      "Fleet health monitoring for the global Pandora spectrometer network — parses raw L0 streams at the edge, scores instrument health, ships daily summaries to cloud dashboards.",
    stack: ["Python", "GCS", "Flask", "Pydantic"],
    link: "https://github.com/ashutoshjoshi1/Pandora-Summarizer",
    seed: 13,
    band: "var(--blue)",
  },
  {
    index: "08",
    name: "MoneyBall",
    domain: "AI Agents",
    year: "2025",
    description:
      "Multi-agent sports intelligence — six specialized agents reason over stats, availability, news, venue and matchups, then synthesize NBA & IPL game predictions.",
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Zep", "OpenAI"],
    link: "https://github.com/ashutoshjoshi1/MoneyBall",
    seed: 53,
    band: "var(--uv)",
  },
  {
    index: "09",
    name: "ReBirth",
    domain: "Generative AI / MLOps",
    year: "2025",
    description:
      "AI video generation platform — audio synthesis, facial animation, refinement and encoding orchestrated through a Celery job state machine with full observability.",
    stack: ["Next.js", "FastAPI", "Celery", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/ReBirth",
    seed: 19,
    band: "var(--green)",
  },
  {
    index: "10",
    name: "Claude TopstepX",
    domain: "LLM Systems",
    year: "2026",
    description:
      "LLM-driven futures trading engine with a fully deterministic core — seven-dimension context scoring, risk gate chain, immutable domain models, ~93% test coverage.",
    stack: ["Python", "Anthropic API", "pytest"],
    link: "https://github.com/ashutoshjoshi1/Claude-TopstepX",
    seed: 41,
    band: "var(--volt)",
  },
  {
    index: "11",
    name: "RETRVE",
    domain: "Product / Fintech",
    year: "2025",
    description:
      "Personal finance platform — transaction intelligence, subscription tracking, budgets and an AI copilot. Mobile app plus marketing site on a Supabase backend.",
    stack: ["Expo", "React Native", "Supabase", "pgvector"],
    link: "https://github.com/ashutoshjoshi1/RETRVE",
    seed: 67,
    band: "var(--blue)",
  },
  {
    index: "12",
    name: "IMU-3D",
    domain: "Graphics / Native",
    year: "2025",
    description:
      "Native C++ desktop app streaming live IMU sensor data into a real-time OpenGL 3D scene — quaternion orientation, glTF models, GPS reverse-geocoding.",
    stack: ["C++17", "OpenGL", "Dear ImGui", "GLFW"],
    link: "https://github.com/ashutoshjoshi1/IMU-3D-model-SW",
    seed: 89,
    band: "var(--amber)",
  },
];

/* Production ML systems built and operated at SciGlob / NASA GSFC —
   the professional counterpart to the personal projects above. */
export interface MLSystem {
  tag: string;
  title: string;
  detail: string;
  metric: string;
  band: string;
  seed: number;
}

export const ML_SYSTEMS: MLSystem[] = [
  {
    tag: "Deep Learning",
    title: "Fleet anomaly detection",
    detail:
      "Deep-learning models watch live streams from every instrument in the network, flagging sensor and data irregularities the moment they appear — hours of daily manual monitoring, eliminated.",
    metric: "300+ instruments · live",
    band: "var(--cyan)",
    seed: 11,
  },
  {
    tag: "Computer Vision",
    title: "CNN cloud detection",
    detail:
      "An encoder–decoder CNN reads the sky in real time and gates sun-scan measurements on actual conditions — raising scan quality across the whole network.",
    metric: "in the live scan loop",
    band: "var(--blue)",
    seed: 29,
  },
  {
    tag: "Edge → Cloud",
    title: "Fleet health scoring",
    detail:
      "Raw L0 instrument streams parsed at the edge, health scored 0–100 per instrument, daily summaries shipped to cloud dashboards.",
    metric: "0–100, every day",
    band: "var(--green)",
    seed: 47,
  },
  {
    tag: "ML Reliability",
    title: "Evals, guardrails, observability",
    detail:
      "Evaluation and monitoring for production ML — a fleet-wide observability dashboard that accelerates triage across five continents, plus per-scan traceable logging that makes every data product auditable end to end.",
    metric: "5 continents",
    band: "var(--uv)",
    seed: 61,
  },
  {
    tag: "High-Performance Compute",
    title: "Blick L0→L2 in C++17",
    detail:
      "Leading the ground-up rewrite of the spectral processing suite — 14 modular libraries, a parity harness validated against legacy output, GPU-ready acceleration.",
    metric: "14 libraries",
    band: "var(--amber)",
    seed: 73,
  },
  {
    tag: "Data Engineering",
    title: "Analysis-ready NASA data",
    detail:
      "Automated acquisition, cleaning and feature-engineering pipelines that turn raw spectrometer measurements into reproducible, analysis-ready datasets for NASA and ESA researchers.",
    metric: "NASA / ESA",
    band: "var(--volt)",
    seed: 83,
  },
];

export interface Mission {
  company: string;
  detail?: string;
  role: string;
  location: string;
  period: string;
  description: string;
  active?: boolean;
}

export const MISSIONS: Mission[] = [
  {
    company: "SciGlob Instruments",
    detail: "NASA GSFC",
    role: "Software Engineer — AI/ML Systems",
    location: "Columbia, MD",
    period: "2024 — NOW",
    description:
      "Building the ML and data backbone of NASA's Pandora network — 300+ spectrometers on five continents running deep-learning anomaly detection, CNN cloud detection in the live scan loop, and a C++17 rewrite of the spectral processing core.",
    active: true,
  },
  {
    company: "407 Associates",
    role: "Data Analyst & Developer",
    location: "Laurel, MD",
    period: "2024",
    description:
      "Python ETL and ML pipelines (PySpark, scikit-learn, TensorFlow) over AWS S3 and Snowflake — cut operating costs 25% and retired the spreadsheets with dashboards and internal tools.",
  },
  {
    company: "UMBC",
    detail: "M.P.S. Data Science · 3.89",
    role: "Graduate Student Assistant",
    location: "Baltimore, MD",
    period: "2022 — 2024",
    description:
      "Machine learning concentration by day; taught, graded and debugged everything from off-by-one errors to existential dread the rest of the time.",
  },
  {
    company: "Tata Consultancy Services",
    role: "Systems Engineer",
    location: "Bangalore, IN",
    period: "2020 — 2022",
    description:
      "Large-scale ETL for Albertsons — 10M+ rows with 20+ automated quality checks (−30% defects), plus load analysis and CI/CD automation that cut release time 40%.",
  },
];

export const STACK: { label: string; items: string[] }[] = [
  {
    label: "Generative AI / LLM",
    items: [
      "RAG",
      "Embeddings & Vector Search",
      "Multi-Agent Systems",
      "Tool Use / Function Calling",
      "Evals & Guardrails",
      "LLM Observability",
      "Prompt Versioning",
      "Anthropic & OpenAI APIs",
    ],
  },
  {
    label: "ML & Data Science",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "CNNs / Encoder–Decoder",
      "Computer Vision",
      "Anomaly Detection",
      "PySpark",
      "Pandas / NumPy",
    ],
  },
  { label: "Languages", items: ["Python", "C++17", "TypeScript", "SQL", "Java"] },
  {
    label: "Cloud & Platform",
    items: ["FastAPI", "Docker", "GCP", "Azure", "AWS", "CI/CD", "MLOps", "Linux"],
  },
  {
    label: "Data Engineering",
    items: ["ETL / ELT", "PostgreSQL / pgvector", "Redis", "Snowflake", "Tableau / Power BI"],
  },
];

export const CONTACT = {
  email: "http.ashutosh@gmail.com",
  phone: "+1 551 344 6092",
  github: "https://github.com/ashutoshjoshi1",
  linkedin: "https://www.linkedin.com/in/ashutosh--joshi/",
  resume: "/resume.pdf",
  location: "Columbia, MD",
  coords: "39.20°N / 76.86°W",
};

export const MANIFESTO =
  "I build AI systems that listen to the physical world — a network of atmospheric instruments on five continents feeding NASA science, pipelines that turn raw photons into data products, and LLM agents that turn data into decisions.";
