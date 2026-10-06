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
  },
];

export const PROFILE = {
  name: "Ashutosh Joshi",
  role: "Software Engineer — AI/ML Systems",
  org: "NASA via SciGlob Instruments",
  headline: ["I build the systems that make", "AI fast, affordable and reliable."],
};

export const MANIFESTO =
  "I build the systems that make AI fast, affordable and reliable: LLM inference platforms tuned down to the GPU, the Kubernetes controllers that schedule them, and machine learning running across 300+ NASA instruments on five continents.";

/* The production LLM serving work, told as the chapters of the pinned
   "stack" section. Each chapter drives one arrangement of the 3D panels. */
export interface Chapter {
  eyebrow: string;
  title: string;
  body: string;
  metric?: string;
}

export const CHAPTERS: Chapter[] = [
  {
    eyebrow: "LLM inference",
    title: "Speed is a systems problem.",
    body: "Most of what an AI product costs, and most of its latency, lives below the model: batching, memory, parallelism and scheduling. That is where I work, from the request router down to the GPU, measured end to end.",
  },
  {
    eyebrow: "Serving",
    title: "Inference that pays for itself.",
    body: "I architected a production LLM inference platform on vLLM that powers RAG and agentic workflows, with continuous batching, chunked prefill and prefix caching tuned per workload.",
    metric: "+87% throughput per GPU · −20% P99 TTFT",
  },
  {
    eyebrow: "Orchestration",
    title: "Kubernetes that understands GPUs.",
    body: "Go controllers and CRDs own the model lifecycle: GPU-aware scheduling, MIG partitions for smaller models, tensor and pipeline parallelism over NCCL for large ones, cache-aware routing and SLO-driven autoscaling.",
    metric: "−40% idle GPU hours",
  },
  {
    eyebrow: "Efficiency",
    title: "Cheaper tokens, same answers.",
    body: "Quantized execution with FP8/INT8 and AWQ, plus speculative decoding, each checked against accuracy and latency targets before it reaches production.",
    metric: "−60% serving cost",
  },
  {
    eyebrow: "Benchmarks",
    title: "Nothing ships unmeasured.",
    body: "A benchmarking harness tracks TTFT, ITL, P95/P99 and MFU/MBU, and every model or config change has to pass it. vLLM, SGLang and TensorRT-LLM were compared head to head; regressions get root-caused with Nsight and PyTorch Profiler.",
    metric: "TTFT · ITL · P99 · MFU/MBU",
  },
];

export const TOOLCHAIN = ["vLLM", "SGLang", "TensorRT-LLM", "Triton", "Kubernetes", "NCCL", "CUDA"];

export const IMPACT_STATEMENT =
  "87% more throughput from every GPU, at 60% lower serving cost, on the LLM inference platform I architected and run in production.";

export interface ImpactMetric {
  sign: "+" | "−";
  value: number;
  label: string;
}

export const IMPACT_METRICS: ImpactMetric[] = [
  { sign: "+", value: 87, label: "Throughput per GPU" },
  { sign: "−", value: 20, label: "P99 time to first token" },
  { sign: "−", value: 60, label: "Serving cost" },
  { sign: "−", value: 40, label: "Idle GPU hours" },
];

/* ML and data systems running NASA's Pandora network. */
export interface FleetSystem {
  icon: "pulse" | "cloud" | "gauge" | "edge" | "chip";
  title: string;
  statement: string;
  label: string;
}

export const FLEET: FleetSystem[] = [
  {
    icon: "pulse",
    title: "Fleet anomaly detection",
    statement:
      "Deep-learning anomaly detection across 300+ Pandora spectrometers. Hours of daily manual monitoring, eliminated.",
    label: "Pandonia Global Network",
  },
  {
    icon: "cloud",
    title: "CNN cloud detection",
    statement:
      "An encoder–decoder CNN that detects clouds in real time, inside the live measurement loop.",
    label: "Computer vision",
  },
  {
    icon: "gauge",
    title: "Instrument health",
    statement:
      "A full-stack instrument-health app that gives operators the state of 300+ instruments on five continents.",
    label: "FastAPI · Next.js · TypeScript",
  },
  {
    icon: "edge",
    title: "Edge to cloud",
    statement:
      "Pipelines that parse raw L0 streams at the edge, score instrument health 0–100 and deliver auditable trace-gas datasets to NASA and ESA researchers.",
    label: "Edge → cloud ML",
  },
  {
    icon: "chip",
    title: "Blick in C++17",
    statement:
      "Leading the ground-up C++17 rewrite of the Blick spectral suite (L0→L2): 14 libraries, a parity harness and a CUDA-ready GPU layer.",
    label: "C++17 · CUDA",
  },
];

export interface Role {
  company: string;
  org?: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  icon: "trend" | "bars" | "flow";
  active?: boolean;
}

export const EXPERIENCE: Role[] = [
  {
    company: "SciGlob Instruments",
    org: "NASA",
    role: "Software Engineer — AI/ML Systems",
    period: "Nov 2024 — Present",
    location: "Columbia, MD",
    summary: "LLM inference platforms and production ML for NASA's Pandora network.",
    highlights: [
      "Architected a production vLLM platform for RAG and agents: +87% throughput per GPU, −20% P99 TTFT.",
      "Go Kubernetes controllers and CRDs for model lifecycle, GPU-aware scheduling and autoscaling.",
      "Cut serving cost 60% with FP8/INT8, AWQ and speculative decoding; idle GPU hours down 40%.",
      "Deep-learning anomaly detection and CNN cloud detection across 300+ spectrometers.",
      "Leading the C++17 rewrite of the Blick spectral processing suite.",
    ],
    icon: "trend",
    active: true,
  },
  {
    company: "407 Associates",
    role: "Data Analyst & Developer",
    period: "Apr 2024 — Nov 2024",
    location: "Laurel, MD",
    summary: "Data and ML pipelines that paid for themselves.",
    highlights: [
      "Python data and ML pipelines (PySpark, scikit-learn, TensorFlow) over SQL, S3 and Snowflake: operating costs down 25%.",
      "Automated multi-source cleaning and validation; Tableau and Power BI dashboards replaced spreadsheet workflows.",
    ],
    icon: "bars",
  },
  {
    company: "Tata Consultancy Services",
    role: "System Engineer",
    period: "Jun 2020 — Aug 2022",
    location: "Bangalore, IN",
    summary: "Enterprise-scale ETL and performance engineering.",
    highlights: [
      "ETL for Albertsons over 10M+ rows with 20+ automated quality checks: data defects down 30%.",
      "Load profiling and tuning: +25% throughput, −30% response time at 99.5%+ availability.",
      "CI/CD and monitoring automation: release time down 40%, MTTR down 25%.",
    ],
    icon: "flow",
  },
];

export interface Degree {
  degree: string;
  school: string;
  period?: string;
}

export const EDUCATION: Degree[] = [
  {
    degree: "M.S. in Data Science (Advanced Applied AI)",
    school: "University of Maryland, Baltimore County",
    period: "2022 — 2024",
  },
  {
    degree: "B.S. in Computer Science, specialization in AI",
    school: "Medi-Caps University",
  },
];

export const SKILLS: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "C++17", "Go", "CUDA", "SQL", "TypeScript", "Bash"] },
  {
    label: "LLM inference",
    items: [
      "vLLM",
      "SGLang",
      "TensorRT-LLM",
      "Triton",
      "KV cache",
      "PagedAttention",
      "Continuous batching",
      "Prefix caching",
      "Chunked prefill",
      "FP8 / INT8, AWQ, GPTQ",
      "Speculative decoding",
      "MoE serving",
    ],
  },
  {
    label: "Performance & profiling",
    items: [
      "TTFT",
      "ITL / TPOT",
      "P99 tail latency",
      "MFU / MBU",
      "Benchmarking",
      "Nsight Systems / Compute",
      "PyTorch Profiler",
      "Root-cause analysis",
    ],
  },
  {
    label: "Distributed GPU systems",
    items: [
      "Tensor & pipeline parallelism",
      "NCCL",
      "Disaggregated prefill / decode",
      "KV-cache offload",
      "RDMA",
      "GPUDirect",
      "NVLink / InfiniBand",
    ],
  },
  {
    label: "Kubernetes & orchestration",
    items: [
      "CRDs",
      "Helm",
      "GPU scheduling",
      "MIG",
      "Multi-tenant isolation",
      "Cache-aware routing",
      "Autoscaling",
    ],
  },
  {
    label: "ML & GenAI",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "Computer vision",
      "Time-series anomaly detection",
      "RAG",
      "pgvector",
      "Agentic AI",
      "Guardrails",
    ],
  },
  {
    label: "Data & backend",
    items: [
      "FastAPI",
      "Flask",
      "React / Next.js",
      "PySpark",
      "Snowflake",
      "PostgreSQL",
      "Redis",
      "ETL / ELT pipelines",
    ],
  },
  {
    label: "Cloud & DevOps",
    items: ["AWS", "GCP", "Azure", "Docker", "CI/CD", "Prometheus", "Grafana", "OpenTelemetry", "Linux"],
  },
];

export const CONTACT = {
  email: "http.ashutosh@gmail.com",
  phone: "+1 551 344 6092",
  github: "https://github.com/ashutoshjoshi1",
  linkedin: "https://www.linkedin.com/in/ashutosh--joshi/",
  resume: "/resume.pdf",
  location: "Baltimore, MD",
};
