export interface Project {
  /* stable id: anchors and retrieval docs */
  slug: string;
  name: string;
  domain: string;
  year: string;
  description: string;
  stack: string[];
  link: string;
  /* the repo is private: show the work, but don't link visitors to a 404 */
  private?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "phulax",
    name: "Phulax",
    domain: "AI Agent Security / Open Source",
    year: "2026",
    description:
      "Open-source runtime security control plane for AI agents: a local gateway intercepts every tool call and enforces allow / deny / approval / freeze through a deterministic policy engine, with metadata-first audit trails that cite the exact rule behind every decision.",
    stack: ["Python", "PostgreSQL", "Redis", "Docker"],
    link: "https://github.com/phulax-io/phulax",
  },
  {
    slug: "commonground",
    name: "CommonGround",
    domain: "RAG / AI Infrastructure",
    year: "2025",
    description:
      "Enterprise RAG platform: multimodal document ingestion with OCR, pgvector semantic Q&A with citations, prompt versioning, evaluation datasets and audit trails for compliance-ready retrieval.",
    stack: ["FastAPI", "Next.js", "pgvector", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/CommonGround",
  },
  {
    slug: "incortex",
    name: "InCortex",
    domain: "Agentic AI / Open Source",
    year: "2026",
    description:
      "Self-learning agentic AI framework: persistent vector memory with forgetting curves, gated tool use with human-in-the-loop approval, strategies competing under UCB bandits, Brier/ECE calibration audits. 450 tests, 100% coverage.",
    stack: ["Python", "Vector Memory", "REST", "pytest"],
    link: "https://github.com/ashutoshjoshi1/InCortex",
  },
  {
    slug: "office",
    name: "Office.ai",
    domain: "Agentic AI / 3D",
    year: "2026",
    description:
      "An AI-staffed software company as an operating system: eight specialized agents take an idea from validation to a deployed, billing SaaS through real GitHub PRs, Vercel deploys and Stripe, all rendered as a navigable 3D office with human approval gates.",
    stack: ["Next.js", "React Three Fiber", "FastAPI", "Supabase", "Stripe"],
    link: "https://github.com/ashutoshjoshi1/Office.ai",
  },
  {
    slug: "sciglob-library",
    name: "SciGlob Library",
    domain: "Instrument Control / NASA",
    year: "2026",
    description:
      "Unified Python interface to every device in a Pandora-class atmospheric instrument: 14 device types behind one YAML-configured facade, each with a hardware driver and a simulation twin so the full instrument runs without physical hardware.",
    stack: ["Python", "pyserial", "YAML", "OpenCV"],
    link: "https://github.com/ashutoshjoshi1/SciGlob-Library",
  },
  {
    slug: "blicko",
    name: "BlickO-CPP",
    domain: "Systems / NASA",
    year: "2026",
    description:
      "Ground-up C++17 rewrite of the Blick spectral processing suite (L0→L2): 14 modular libraries, parity test harness, GPU-ready acceleration framework.",
    stack: ["C++17", "CMake", "CUDA-ready", "CI"],
    link: "https://github.com/ashutoshjoshi1/BlickO-CPP",
    private: true,
  },
  {
    slug: "pandora-summarizer",
    name: "Pandora Summarizer",
    domain: "Distributed Systems / NASA",
    year: "2025",
    description:
      "Fleet health monitoring for the global Pandora spectrometer network: parses raw L0 streams at the edge, scores instrument health, ships daily summaries to cloud dashboards.",
    stack: ["Python", "GCS", "Flask", "Pydantic"],
    link: "https://github.com/ashutoshjoshi1/Pandora-Summarizer",
  },
  {
    slug: "moneyball",
    name: "MoneyBall",
    domain: "AI Agents",
    year: "2025",
    description:
      "Multi-agent sports intelligence: six specialized agents reason over stats, availability, news, venue and matchups, then synthesize NBA & IPL game predictions.",
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Zep", "OpenAI"],
    link: "https://github.com/ashutoshjoshi1/MoneyBall",
    private: true,
  },
  {
    slug: "harborline",
    name: "HarborLine",
    domain: "ML Platform / Forecasting",
    year: "2026",
    description:
      "Forecasting, model-review and governance workbench for risk-oriented portfolio teams: baseline and challenger forecasts, scenario planning, supervised risk classification with model comparison, model cards with a governance review timeline, and monitoring rules with alerting.",
    stack: ["FastAPI", "Next.js 14", "PostgreSQL", "Redis", "Dramatiq", "Docker"],
    link: "https://github.com/ashutoshjoshi1/HarborLine",
  },
  {
    slug: "fasal",
    name: "FASAL",
    domain: "Hyperspectral AI / Agriculture",
    year: "2026",
    description:
      "Drone-based hyperspectral + AI system that screens pesticide-residue risk in crop fields before harvest and maps it as a low / medium / high heatmap: a tested spectroscopy pipeline (calibration → preprocessing → QC → segmentation), PLS-DA / RF / SVM / GBM baselines with uncertainty and out-of-distribution checks, and 1D-CNN spectral–spatial fusion. Screening, not certification.",
    stack: ["Python", "1D-CNN", "PLS-DA / RF / SVM / GBM", "Geospatial"],
    link: "https://github.com/ashutoshjoshi1/Fasal",
  },
  {
    slug: "rebirth",
    name: "ReBirth",
    domain: "Generative AI / MLOps",
    year: "2025",
    description:
      "AI video generation platform: audio synthesis, facial animation, refinement and encoding orchestrated through a Celery job state machine with full observability.",
    stack: ["Next.js", "FastAPI", "Celery", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/ReBirth",
    private: true,
  },
  {
    slug: "topstepx",
    name: "Claude TopstepX",
    domain: "LLM Systems",
    year: "2026",
    description:
      "LLM-driven futures trading engine with a fully deterministic core: seven-dimension context scoring, risk gate chain, immutable domain models, ~93% test coverage.",
    stack: ["Python", "Anthropic API", "pytest"],
    link: "https://github.com/ashutoshjoshi1/Claude-TopstepX",
    private: true,
  },
  {
    slug: "retrve",
    name: "RETRVE",
    domain: "Product / Fintech",
    year: "2025",
    description:
      "Personal finance platform: transaction intelligence, subscription tracking, budgets and an AI copilot. Mobile app plus marketing site on a Supabase backend.",
    stack: ["Expo", "React Native", "Supabase", "pgvector"],
    link: "https://github.com/ashutoshjoshi1/RETRVE",
    private: true,
  },
  {
    slug: "imu",
    name: "IMU-3D",
    domain: "Graphics / Native",
    year: "2025",
    description:
      "Native C++ desktop app streaming live IMU sensor data into a real-time OpenGL 3D scene: quaternion orientation, glTF models, GPS reverse-geocoding.",
    stack: ["C++17", "OpenGL", "Dear ImGui", "GLFW"],
    link: "https://github.com/ashutoshjoshi1/IMU-3D-model-SW",
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
  role: "Software Engineer, AI/ML Systems",
  org: "NASA via SciGlob Instruments",
};

export const HERO = {
  name: ["Ashutosh", "Joshi"] as const,
  role: "AI/ML systems engineer at SciGlob, for NASA",
  lede: "I make LLM inference fast and cheap on GPUs, and run machine learning across NASA’s 300+ Pandora instruments.",
  photo: "/images/hero-portrait.webp",
  photoAlt: "Black-and-white portrait of Ashutosh Joshi against a black background",
  /* the short introduction under the name: the first line set heavier */
  intro: [
    "I build the systems that make AI fast, affordable and reliable.",
    "Most days that means LLM inference tuned down to the GPU: continuous batching, quantization, speculative decoding, and the Kubernetes controllers that schedule it all. The platform I architected serves 87% more tokens from every GPU, at 60% lower cost.",
    "It also means machine learning for a network of instruments that watch the sun: 300+ Pandora spectrometers on five continents, run for NASA. My models flag their faults, read their skies and score their health every day.",
    "Before SciGlob I built data pipelines at 407 Associates and enterprise ETL at Tata Consultancy Services, and took an M.S. in Data Science at UMBC.",
  ],
};

export const MANIFESTO =
  "I build the systems that make AI fast, affordable and reliable: LLM inference platforms tuned down to the GPU, the Kubernetes controllers that schedule them, and machine learning running across 300+ NASA instruments on five continents.";

/* The production LLM serving work, told as the steps of the pinned
   inference story. Each step sets the levers of the simulated server
   beside it, so the field shows what the step describes. */
export interface InferenceStep {
  id: string;
  title: string;
  /* the result, set at poster size: a resume figure, never a simulated one */
  figure?: { value: string; label: string };
  body: string;
  /* a second result, set small under the body */
  also?: string;
  levers: {
    continuous: boolean;
    chunkedPrefill: boolean;
    prefixCache: boolean;
    speculative: boolean;
    fp8: boolean;
  };
  /* requests per second the simulated server receives during this step */
  load: number;
}

export const INFERENCE_STEPS: InferenceStep[] = [
  {
    id: "naive",
    title: "Speed is a systems problem.",
    body: "Most of what an AI product costs, and most of its latency, lives below the model: batching, memory, parallelism and scheduling. The small simulated server here runs twelve request slots the naive way, whole batches and whole prompts at a time. Watch the grey bands: slots standing empty while requests queue.",
    levers: { continuous: false, chunkedPrefill: false, prefixCache: false, speculative: false, fp8: false },
    load: 6,
  },
  {
    id: "batching",
    title: "Every slot kept busy.",
    figure: { value: "+87%", label: "throughput per GPU" },
    body: "I architected and run a production LLM inference platform on vLLM for RAG and agentic workflows. Continuous batching refills a slot the moment a request finishes, chunked prefill stops long prompts stalling everyone else’s stream, and prefix caching keeps one shared copy of the system prompt: the gold marks, where a prompt starts from the cache.",
    also: "−20% P99 time to first token",
    levers: { continuous: true, chunkedPrefill: true, prefixCache: true, speculative: false, fp8: false },
    load: 6,
  },
  {
    id: "efficiency",
    title: "Cheaper tokens, same answers.",
    figure: { value: "−60%", label: "serving cost" },
    body: "Quantized execution with FP8/INT8 and AWQ, plus speculative decoding: a draft model proposes tokens and the target checks several in one pass, so the ticks bunch together. Every change was held to accuracy and latency targets before rollout.",
    levers: { continuous: true, chunkedPrefill: true, prefixCache: true, speculative: true, fp8: true },
    load: 6,
  },
  {
    id: "orchestration",
    title: "Kubernetes that understands GPUs.",
    figure: { value: "−40%", label: "idle GPU hours" },
    body: "Go controllers and CRDs own the model lifecycle: GPU-aware scheduling, MIG partitions for small models, tensor and pipeline parallelism over NCCL for large ones, cache-aware routing and SLO-driven autoscaling. Here the same server takes half again as much traffic.",
    levers: { continuous: true, chunkedPrefill: true, prefixCache: true, speculative: true, fp8: true },
    load: 9,
  },
];

export const BENCHMARK_TITLE = "Nothing ships unmeasured.";

export const BENCHMARK_NOTE =
  "A benchmarking harness tracks TTFT, ITL, P95/P99 latency and MFU/MBU and gates every model and config change. I compared vLLM, SGLang and TensorRT-LLM head to head before recommending the production runtime, and root-cause latency regressions with Nsight Systems and PyTorch Profiler.";

export const SIMULATION_NOTE =
  "The server is a toy, simulated one forward pass at a time in your browser: twelve batch slots, illustrative costs, random traffic. Its numbers are its own. The large figures are from production.";

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

/* ML and data systems running NASA's Pandora network */
export const NASA_INTRO =
  "Pandora spectrometers stand on rooftops on five continents and follow the sun from dawn to dusk, splitting its light to measure the gases in the air. NASA and ESA use the data to check satellites such as TEMPO. I build the machine learning and the data systems that keep 300+ of them honest.";

export interface FleetSystem {
  title: string;
  statement: string;
  label: string;
}

export const FLEET: FleetSystem[] = [
  {
    title: "Fleet anomaly detection",
    statement:
      "Deep-learning models watch live streams from 300+ Pandora spectrometers and flag sensor and data irregularities the moment they appear. Hours of daily manual monitoring, eliminated.",
    label: "Pandonia Global Network",
  },
  {
    title: "CNN cloud detection",
    statement:
      "An encoder–decoder CNN reads the sky in real time and gates sun-scan measurements on actual conditions, raising scan quality across the network.",
    label: "Computer vision",
  },
  {
    title: "Instrument health platform",
    statement:
      "A full-stack instrument-health app that gives operators the state of 300+ instruments on five continents.",
    label: "FastAPI · Next.js · TypeScript",
  },
  {
    title: "Fleet health scoring",
    statement:
      "Raw L0 instrument streams parsed at the edge, health scored 0–100 per instrument, daily summaries shipped to cloud dashboards.",
    label: "Edge → cloud ML",
  },
  {
    title: "Evals, guardrails, observability",
    statement:
      "Evaluation and monitoring for production ML: a fleet-wide observability dashboard that speeds triage across five continents, and per-scan traceable logging that makes every data product auditable end to end.",
    label: "ML reliability",
  },
  {
    title: "Analysis-ready NASA data",
    statement:
      "Automated acquisition, cleaning and feature-engineering pipelines that turn raw spectrometer measurements into reproducible, auditable trace-gas datasets for NASA and ESA researchers.",
    label: "Data engineering",
  },
  {
    title: "Blick in C++17",
    statement:
      "Leading the ground-up C++17 rewrite of the Blick spectral suite (L0→L2): 14 libraries, a parity harness against legacy output and a CUDA-ready GPU layer.",
    label: "C++17 · CUDA",
  },
];

/* one line of the resume: what changed, and by how much when there is a number */
export interface Highlight {
  text: string;
  figure?: string;
}

export interface Role {
  company: string;
  org?: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: Highlight[];
  active?: boolean;
}

export const EXPERIENCE: Role[] = [
  {
    company: "SciGlob Instruments",
    org: "NASA",
    role: "Software Engineer, AI/ML Systems",
    period: "Nov 2024 – Present",
    location: "Columbia, MD",
    summary: "LLM inference platforms and production ML for NASA's Pandora network.",
    highlights: [
      { text: "Throughput per GPU on the production vLLM platform I architected for RAG and agents", figure: "+87%" },
      { text: "P99 time to first token on the same platform", figure: "−20%" },
      { text: "Serving cost, with FP8/INT8 and AWQ quantization and speculative decoding", figure: "−60%" },
      { text: "Idle GPU hours, with Go Kubernetes controllers for GPU-aware scheduling and autoscaling", figure: "−40%" },
      { text: "vLLM, SGLang and TensorRT-LLM benchmarked head to head to choose the production runtime" },
      { text: "Spectrometers watched by my deep-learning anomaly detection and CNN cloud detection", figure: "300+" },
      { text: "Libraries in the C++17 rewrite of the Blick spectral processing suite, which I lead", figure: "14" },
    ],
    active: true,
  },
  {
    company: "407 Associates",
    role: "Data Analyst & Developer",
    period: "Apr 2024 – Nov 2024",
    location: "Laurel, MD",
    summary: "Data and ML pipelines that paid for themselves.",
    highlights: [
      { text: "Operating costs, with Python data and ML pipelines (PySpark, scikit-learn, TensorFlow) over SQL, S3 and Snowflake", figure: "−25%" },
      { text: "Spreadsheet workflows replaced by automated cleaning and validation, and Tableau and Power BI dashboards" },
    ],
  },
  {
    company: "UMBC",
    role: "Graduate Student Assistant",
    period: "2022 – 2024",
    location: "Baltimore, MD",
    summary: "Teaching and grading alongside the M.S. in Data Science.",
    highlights: [
      {
        text: "Machine learning concentration by day; taught, graded and debugged everything from off-by-one errors to existential dread the rest of the time",
      },
    ],
  },
  {
    company: "Tata Consultancy Services",
    role: "System Engineer",
    period: "Jun 2020 – Aug 2022",
    location: "Bangalore, IN",
    summary: "Enterprise-scale ETL and performance engineering.",
    highlights: [
      { text: "Rows through the Albertsons ETL I built, with 20+ automated quality checks", figure: "10M+" },
      { text: "Data defects in the same pipelines", figure: "−30%" },
      { text: "Throughput after load profiling and tuning, at 99.5%+ availability", figure: "+25%" },
      { text: "Response time from the same tuning", figure: "−30%" },
      { text: "Release time, with CI/CD and monitoring automation", figure: "−40%" },
      { text: "Mean time to recovery", figure: "−25%" },
    ],
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
    period: "2022 – 2024",
    note: "GPA 3.89",
  },
  {
    degree: "B.S. in Computer Science, specialization in AI",
    school: "Medi-Caps University",
  },
];

export const SKILLS_LEAD =
  "The toolkit behind the work above: Python, C++ and Go every day, CUDA where it counts, and the inference, machine learning and data stacks I have taken to production.";

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
    label: "Generative AI and agents",
    items: [
      "RAG",
      "Embeddings and vector search",
      "pgvector",
      "Multi-agent systems",
      "Tool use and function calling",
      "Evals and guardrails",
      "LLM observability",
      "Prompt versioning",
      "Anthropic and OpenAI APIs",
    ],
  },
  {
    label: "Performance",
    items: [
      "TTFT",
      "ITL / TPOT",
      "P99 tail latency",
      "MFU / MBU",
      "Benchmarking",
      "Nsight Systems and Compute",
      "PyTorch Profiler",
      "Root-cause analysis",
    ],
  },
  {
    label: "GPUs and orchestration",
    items: [
      "Tensor and pipeline parallelism",
      "NCCL",
      "Disaggregated prefill / decode",
      "KV-cache offload",
      "RDMA, GPUDirect",
      "NVLink, InfiniBand",
      "Kubernetes CRDs",
      "Helm",
      "GPU scheduling, MIG",
      "Multi-tenant isolation",
      "Cache-aware routing",
      "Autoscaling",
    ],
  },
  {
    label: "Machine learning",
    items: [
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
      "CNNs, encoder–decoders",
      "Computer vision",
      "Time-series anomaly detection",
      "PySpark",
      "Pandas, NumPy",
    ],
  },
  {
    label: "Data and backend",
    items: [
      "FastAPI",
      "Flask",
      "React, Next.js",
      "Snowflake",
      "PostgreSQL",
      "Redis",
      "ETL / ELT pipelines",
      "Tableau, Power BI",
    ],
  },
  {
    label: "Cloud and operations",
    items: ["AWS", "GCP", "Azure", "Docker", "CI/CD", "MLOps", "Prometheus", "Grafana", "OpenTelemetry", "Linux"],
  },
];

/* How I work, as a short letter: each paragraph opens with its rule */
export interface Principle {
  title: string;
  body: string;
  /* the phrase the highlighter passes over */
  mark?: string;
}

export const PRINCIPLES: Principle[] = [
  {
    title: "I measure first.",
    body: "Every model and config change I ship runs through a benchmark harness: TTFT, ITL, P95 and P99, MFU and MBU. Intuition picks the experiment; numbers pick the winner.",
  },
  {
    title: "I design for the tail.",
    body: "People feel the P99, not the average. Chunked prefill keeps one long prompt from stalling everyone's stream, and cache-aware routing keeps hot prefixes hot.",
  },
  {
    title: "I treat idle silicon as a bug.",
    body: "Quantization, speculative decoding, MIG for small models and SLO-driven autoscaling: every GPU hour has an owner, and it is not a cost of doing business.",
  },
  {
    title: "I keep the core deterministic.",
    body: "LLMs get to reason; they don't get to gamble. The Blick rewrite answers to a parity harness against legacy output before any optimization lands, because fast and wrong is just wrong, sooner.",
    mark: "fast and wrong is just wrong, sooner",
  },
  {
    title: "And I start at the sensor.",
    body: "Dashboards drift; photons don't. Every system I build starts at the instrument and works backwards, and if the instrument disagrees with the chart, the chart loses.",
  },
];

export const CONTACT_PICTURE = {
  src: "/images/umbc-graduation.webp",
  alt: "Ashutosh Joshi smiling in a black and gold UMBC graduation stole",
  caption: "Graduation day at UMBC, Baltimore.",
};

export const CONTACT = {
  email: "http.ashutosh@gmail.com",
  phone: "+1 551 344 6092",
  github: "https://github.com/ashutoshjoshi1",
  linkedin: "https://www.linkedin.com/in/ashutosh--joshi/",
  resume: "/resume.pdf",
  location: "Baltimore, MD",
};
