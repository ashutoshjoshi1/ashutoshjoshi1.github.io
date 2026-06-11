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
    name: "CommonGround",
    domain: "AI Infrastructure",
    year: "2025",
    description:
      "Enterprise RAG platform — multimodal document ingestion with OCR, semantic Q&A with citations, prompt versioning, evaluation datasets and audit trails.",
    stack: ["FastAPI", "Next.js", "pgvector", "Redis", "Docker"],
    link: "https://github.com/ashutoshjoshi1/CommonGround",
    seed: 7,
  },
  {
    index: "02",
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
    index: "03",
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
    index: "04",
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
    index: "05",
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
    index: "06",
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
    index: "07",
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
    index: "08",
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
    role: "Software Engineer",
    location: "Columbia, MD",
    period: "2024 — NOW",
    description:
      "Building the data backbone of the Pandora atmospheric research network — acquisition, processing and storage pipelines that turn raw spectrometer noise into NASA science.",
    active: true,
  },
  {
    company: "407 Associates",
    role: "Data Analyst & Developer",
    location: "Laurel, MD",
    period: "2024",
    description:
      "Built internal web tools that retired the spreadsheets, and analytics that made gut-feeling decisions measurable.",
  },
  {
    company: "UMBC",
    role: "Graduate Student Assistant",
    location: "Baltimore, MD",
    period: "2023",
    description:
      "Taught, graded and debugged everything from off-by-one errors to existential dread while building web apps for coursework at scale.",
  },
  {
    company: "Tata Consultancy Services",
    role: "Systems Engineer",
    location: "Bangalore, IN",
    period: "2020 — 2022",
    description:
      "Engineered large-scale ETL pipelines for Albertsons — keeping inventory, orders and reality in agreement.",
  },
];

export const STACK: { label: string; items: string[] }[] = [
  { label: "Languages", items: ["Python", "TypeScript", "C++", "SQL"] },
  { label: "AI / ML", items: ["LLM Systems", "RAG", "Multi-Agent", "PyTorch", "Evals"] },
  { label: "Frontend", items: ["React", "Next.js", "React Native", "GSAP"] },
  { label: "Backend", items: ["FastAPI", "Node.js", "PostgreSQL", "Redis", "Celery"] },
  { label: "Infra", items: ["Docker", "GCP", "Azure", "CI/CD", "Linux"] },
];

export const CONTACT = {
  email: "ashutxsh.jxshi@gmail.com",
  phone: "+1 551 344 6092",
  github: "https://github.com/ashutoshjoshi1",
  linkedin: "https://www.linkedin.com/in/ashutosh--joshi/",
  resume: "/resume.pdf",
  location: "Columbia, MD",
  coords: "39.20°N / 76.86°W",
};

export const MANIFESTO =
  "I write software that listens to the physical world — a network of atmospheric instruments on five continents feeding NASA science, pipelines that turn raw photons into data products, and AI systems that turn data into decisions.";
