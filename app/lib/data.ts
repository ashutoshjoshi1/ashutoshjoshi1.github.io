export interface Project {
  index: string;
  name: string;
  domain: string;
  year: string;
  description: string;
  stack: string[];
  link: string;
  /* the repo is private: show the work, but don't link visitors to a 404 */
  private?: boolean;
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
    private: true,
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
    private: true,
    seed: 53,
  },
  {
    index: "09",
    name: "HarborLine",
    domain: "ML Platform / Forecasting",
    year: "2026",
    description:
      "Forecasting, model-review and governance workbench for risk-oriented portfolio teams — baseline and challenger forecasts, scenario planning, supervised risk classification with model comparison, model cards with a governance review timeline, and monitoring rules with alerting.",
    stack: ["FastAPI", "Next.js 14", "PostgreSQL", "Redis", "Dramatiq", "Docker"],
    link: "https://github.com/ashutoshjoshi1/HarborLine",
    seed: 71,
  },
  {
    index: "10",
    name: "FASAL",
    domain: "Hyperspectral AI / Agriculture",
    year: "2026",
    description:
      "Drone-based hyperspectral + AI system that screens pesticide-residue risk in crop fields before harvest and maps it as a low / medium / high heatmap — a tested spectroscopy pipeline (calibration → preprocessing → QC → segmentation), PLS-DA / RF / SVM / GBM baselines with uncertainty and out-of-distribution checks, and 1D-CNN spectral–spatial fusion. Screening, not certification.",
    stack: ["Python", "1D-CNN", "PLS-DA / RF / SVM / GBM", "Geospatial"],
    link: "https://github.com/ashutoshjoshi1/Fasal",
    seed: 83,
  },
  {
    index: "11",
    name: "ReBirth",
    domain: "Generative AI / MLOps",
    year: "2025",
    description:
      "AI video generation platform — audio synthesis, facial animation, refinement and encoding orchestrated through a Celery job state machine with full observability.",
    stack: ["Next.js", "FastAPI", "Celery", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/ReBirth",
    private: true,
    seed: 19,
  },
  {
    index: "12",
    name: "Claude TopstepX",
    domain: "LLM Systems",
    year: "2026",
    description:
      "LLM-driven futures trading engine with a fully deterministic core — seven-dimension context scoring, risk gate chain, immutable domain models, ~93% test coverage.",
    stack: ["Python", "Anthropic API", "pytest"],
    link: "https://github.com/ashutoshjoshi1/Claude-TopstepX",
    private: true,
    seed: 41,
  },
  {
    index: "13",
    name: "RETRVE",
    domain: "Product / Fintech",
    year: "2025",
    description:
      "Personal finance platform — transaction intelligence, subscription tracking, budgets and an AI copilot. Mobile app plus marketing site on a Supabase backend.",
    stack: ["Expo", "React Native", "Supabase", "pgvector"],
    link: "https://github.com/ashutoshjoshi1/RETRVE",
    private: true,
    seed: 67,
  },
  {
    index: "14",
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

/* More public repos, listed compactly under the featured grid. Each line is
   taken from the repo's README, GitHub description or file layout. */
export interface RepoLink {
  name: string;
  year: string;
  language: string;
  summary: string;
  link: string;
}

export const MORE_WORK: { label: string; items: RepoLink[] }[] = [
  {
    label: "Instruments & science software",
    items: [
      {
        name: "L0-to-L1",
        year: "2026",
        language: "Python",
        summary: "Pandora L0→L1 spectral processing with corrections and a GPU backend, run against real Izaña station data.",
        link: "https://github.com/ashutoshjoshi1/L0-to-L1",
      },
      {
        name: "deep-learning-anomaly",
        year: "2026",
        language: "Python",
        summary: "Deep-learning anomaly detection for instrument data: a trained Keras model and scaler behind a Python app.",
        link: "https://github.com/ashutoshjoshi1/deep-learning-anomaly",
      },
      {
        name: "Pandora-Dashboard",
        year: "2026",
        language: "TypeScript",
        summary: "Web dashboard for the Pandora instrument fleet, including an instrument-cycle breakdown view.",
        link: "https://github.com/ashutoshjoshi1/Pandora-Dashboard",
      },
      {
        name: "lid-control-em27",
        year: "2026",
        language: "Go",
        summary: "Go controller for an EM27 spectrometer's lid motor over Modbus, built as a Windows executable.",
        link: "https://github.com/ashutoshjoshi1/lid-control-em27",
      },
      {
        name: "EM27-GUI",
        year: "2026",
        language: "Python",
        summary: "Desktop control app for an EM27 spectrometer, with motor controllers and hardware drivers.",
        link: "https://github.com/ashutoshjoshi1/EM27-GUI",
      },
      {
        name: "SciLab",
        year: "2026",
        language: "Python",
        summary: "Lab GUI for laser and spectroscopy analysis at SciGlob, driving DLL-backed spectrometers (Hamamatsu included) on Windows.",
        link: "https://github.com/ashutoshjoshi1/SciLab-V3.3",
      },
    ],
  },
  {
    label: "Earlier ML, vision & experiments",
    items: [
      {
        name: "AI-Trader",
        year: "2025",
        language: "MQL5",
        summary: "XAUUSD expert advisor for MetaTrader 5: three combined strategies with ATR stops, position sizing and drawdown protection.",
        link: "https://github.com/ashutoshjoshi1/AI-Trader",
      },
      {
        name: "Twitter-Sarcasm-Analysis",
        year: "2024",
        language: "Jupyter",
        summary: "Sarcasm analysis on Twitter data in a Jupyter notebook.",
        link: "https://github.com/ashutoshjoshi1/Twitter-Sarcasm-Analysis",
      },
      {
        name: "Graduate-Admission-NN",
        year: "2025",
        language: "Python",
        summary: "Keras neural network that predicts the probability of university admission.",
        link: "https://github.com/ashutoshjoshi1/Graduate-Admission-Neural-Network-",
      },
      {
        name: "Diabetic Retinopathy Classifier",
        year: "2021",
        language: "Python",
        summary: "Diabetic-retinopathy image classifier served as a Streamlit web app.",
        link: "https://github.com/ashutoshjoshi1/Website_DR_CLF",
      },
      {
        name: "Social-Distancing",
        year: "2020",
        language: "Python",
        summary: "Social-distancing monitor built with Python and OpenCV.",
        link: "https://github.com/ashutoshjoshi1/Social-Distancing",
      },
      {
        name: "YOLOV3",
        year: "2019",
        language: "Jupyter",
        summary: "YOLOv3 object detection in a notebook.",
        link: "https://github.com/ashutoshjoshi1/YOLOV3",
      },
      {
        name: "Student-Non-Student-Classifier",
        year: "2019",
        language: "Jupyter",
        summary: "OpenCV and TensorFlow classifier that tells students from non-students, built for schools.",
        link: "https://github.com/ashutoshjoshi1/Student-Non-Student-Classifier",
      },
    ],
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

/* the previous site's mission statement, kept for the NASA section */
export const FIELD_STATEMENT =
  "I build AI systems that listen to the physical world — a network of atmospheric instruments on five continents feeding NASA science, pipelines that turn raw photons into data products, and LLM agents that turn data into decisions.";

/* Where the work has shipped — shown as a muted wordmark row. */
export const EMPLOYERS = ["NASA GSFC", "SciGlob Instruments", "407 Associates", "UMBC", "Tata Consultancy Services"];

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
  icon: "pulse" | "cloud" | "gauge" | "edge" | "shield" | "database" | "chip";
  title: string;
  statement: string;
  label: string;
}

export const FLEET: FleetSystem[] = [
  {
    icon: "pulse",
    title: "Fleet anomaly detection",
    statement:
      "Deep-learning models watch live streams from 300+ Pandora spectrometers and flag sensor and data irregularities the moment they appear. Hours of daily manual monitoring, eliminated.",
    label: "Pandonia Global Network",
  },
  {
    icon: "cloud",
    title: "CNN cloud detection",
    statement:
      "An encoder–decoder CNN reads the sky in real time and gates sun-scan measurements on actual conditions, raising scan quality across the network.",
    label: "Computer vision",
  },
  {
    icon: "gauge",
    title: "Instrument health platform",
    statement:
      "A full-stack instrument-health app that gives operators the state of 300+ instruments on five continents.",
    label: "FastAPI · Next.js · TypeScript",
  },
  {
    icon: "edge",
    title: "Fleet health scoring",
    statement:
      "Raw L0 instrument streams parsed at the edge, health scored 0–100 per instrument, daily summaries shipped to cloud dashboards.",
    label: "Edge → cloud ML",
  },
  {
    icon: "shield",
    title: "Evals, guardrails, observability",
    statement:
      "Evaluation and monitoring for production ML: a fleet-wide observability dashboard that speeds triage across five continents, and per-scan traceable logging that makes every data product auditable end to end.",
    label: "ML reliability",
  },
  {
    icon: "database",
    title: "Analysis-ready NASA data",
    statement:
      "Automated acquisition, cleaning and feature-engineering pipelines that turn raw spectrometer measurements into reproducible, auditable trace-gas datasets for NASA and ESA researchers.",
    label: "Data engineering",
  },
  {
    icon: "chip",
    title: "Blick in C++17",
    statement:
      "Leading the ground-up C++17 rewrite of the Blick spectral suite (L0→L2): 14 libraries, a parity harness against legacy output and a CUDA-ready GPU layer.",
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
  icon: "trend" | "bars" | "flow" | "school";
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
      "Benchmarked vLLM, SGLang and TensorRT-LLM head to head and recommended the production runtime.",
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
    company: "UMBC",
    role: "Graduate Student Assistant",
    period: "2022 — 2024",
    location: "Baltimore, MD",
    summary: "Teaching and grading alongside the M.S. in Data Science.",
    highlights: [
      "Machine learning concentration by day; taught, graded and debugged everything from off-by-one errors to existential dread the rest of the time.",
    ],
    icon: "school",
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
  note?: string;
}

export const EDUCATION: Degree[] = [
  {
    degree: "M.S. in Data Science (Advanced Applied AI)",
    school: "University of Maryland, Baltimore County",
    period: "2022 — 2024",
    note: "GPA 3.89",
  },
  {
    degree: "B.S. in Computer Science, specialization in AI",
    school: "Medi-Caps University",
  },
];

/* resume skills, merged with the previous site's capability list */
export const SKILLS: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "C++17", "Go", "CUDA", "SQL", "TypeScript", "Bash", "Java"] },
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
    label: "Generative AI & agents",
    items: [
      "RAG",
      "Embeddings & vector search",
      "pgvector",
      "Multi-agent systems",
      "Agentic AI",
      "Tool use / function calling",
      "Evals & guardrails",
      "LLM observability",
      "Prompt versioning",
      "Anthropic & OpenAI APIs",
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
    label: "ML & data science",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "CNNs / encoder–decoder",
      "Computer vision",
      "Time-series anomaly detection",
      "PySpark",
      "Pandas / NumPy",
    ],
  },
  {
    label: "Data & backend",
    items: [
      "FastAPI",
      "Flask",
      "React / Next.js",
      "Snowflake",
      "PostgreSQL",
      "Redis",
      "ETL / ELT pipelines",
      "Tableau / Power BI",
    ],
  },
  {
    label: "Cloud & DevOps",
    items: [
      "AWS",
      "GCP",
      "Azure",
      "Docker",
      "CI/CD",
      "MLOps",
      "Prometheus",
      "Grafana",
      "OpenTelemetry",
      "Linux",
    ],
  },
];

/* How I work: four rules from the inference work, four from the previous
   site's flight rules. `model` picks the wireframe drawn on each card. */
export interface Principle {
  model: "waveGrid" | "torus" | "lattice" | "octahedron" | "dish" | "icosahedron" | "helix" | "globe";
  title: string;
  body: string;
}

export const PRINCIPLES: Principle[] = [
  {
    model: "waveGrid",
    title: "Measure, then tune.",
    body: "Every model and config change runs through the benchmark harness: TTFT, ITL, P95/P99, MFU/MBU. Intuition picks the experiment; numbers pick the winner.",
  },
  {
    model: "torus",
    title: "The tail is the product.",
    body: "Users feel P99, not the average. Chunked prefill keeps one long prompt from stalling everyone's decode, and cache-aware routing keeps hot prefixes hot.",
  },
  {
    model: "lattice",
    title: "Every GPU hour has an owner.",
    body: "Quantization, speculative decoding, MIG for small models and SLO-driven autoscaling. Idle silicon is a bug, not a cost of doing business.",
  },
  {
    model: "octahedron",
    title: "Parity before speed.",
    body: "The Blick C++17 rewrite answers to a parity harness against legacy output before any optimization lands. Fast and wrong is just wrong, sooner.",
  },
  {
    model: "dish",
    title: "Hardware doesn't lie.",
    body: "Dashboards drift; photons don't. Every system I build starts at the sensor and works backwards — if the instrument disagrees with the chart, the chart loses.",
  },
  {
    model: "icosahedron",
    title: "Determinism beats vibes.",
    body: "LLMs get to reason. They don't get to gamble. The core stays deterministic, immutable and tested — my trading engine ships at ~93% coverage for a reason.",
  },
  {
    model: "helix",
    title: "Close the loop.",
    body: "An agent that acts but never measures is just noise with confidence. Pipelines end where feedback begins — every output feeds the next decision.",
  },
  {
    model: "globe",
    title: "Ship the signal.",
    body: "Data isn't a product until someone downstream can act on it. Five continents of instruments mean nothing if the science never lands.",
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
