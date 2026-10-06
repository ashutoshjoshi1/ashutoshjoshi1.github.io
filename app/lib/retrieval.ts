import {
  PROJECTS,
  MORE_WORK,
  EXPERIENCE,
  EDUCATION,
  SKILLS,
  CHAPTERS,
  FLEET,
  PRINCIPLES,
  IMPACT_STATEMENT,
  IMPACT_METRICS,
  CONTACT,
  MANIFESTO,
} from "./data";

/*
 * RETRIEVAL — the console's brain. TF-IDF vectors + cosine similarity over
 * a corpus built from the site's own data. Every answer is retrieved from
 * an indexed document — nothing is generated, so nothing is hallucinated.
 */

export interface Doc {
  id: string;
  /* source chip label, e.g. "01 · CommonGround" */
  tag: string;
  /* text that gets indexed for matching */
  text: string;
  /* what the console prints when this doc wins */
  answer: string;
  link?: string;
}

export interface AskResult {
  answer: string;
  sources: Doc[];
  /* top cosine score, 0 when intent-matched or unmatched */
  score: number;
  ms: number;
  kind: "intent" | "retrieval" | "miss";
}

/* ------------------------------------------------------------- corpus */

const projectDocs: Doc[] = PROJECTS.map((p) => ({
  id: `project-${p.index}`,
  tag: `${p.index} · ${p.name}`,
  text: `${p.name} ${p.domain} ${p.description} ${p.stack.join(" ")}`,
  answer: `${p.name} (${p.year}, ${p.domain}) — ${p.description} Built with ${p.stack.join(", ")}.${
    p.private ? " The repo is private; a walkthrough is available on request." : ""
  }`,
  /* private repos would 404 for visitors — point at the card instead */
  link: p.private ? "#work" : p.link,
}));

const moreWorkDocs: Doc[] = MORE_WORK.flatMap((group) =>
  group.items.map((item) => ({
    id: `repo-${item.name}`,
    tag: `GitHub · ${item.name}`,
    text: `${item.name} ${item.summary} ${item.language} ${item.year} ${group.label} github repository project`,
    answer: `${item.name} (${item.year}, ${item.language}) — ${item.summary}`,
    link: item.link,
  })),
);

const principleDocs: Doc[] = PRINCIPLES.map((p, i) => ({
  id: `principle-${i}`,
  tag: `Principle · ${p.title}`,
  text: `${p.title} ${p.body} principles how work philosophy approach values rules`,
  answer: `${p.title} ${p.body}`,
  link: "#principles",
}));

const experienceDocs: Doc[] = EXPERIENCE.map((r, i) => ({
  id: `experience-${i}`,
  tag: `Experience · ${r.company}`,
  text: `${r.company} ${r.org ?? ""} ${r.role} ${r.location} ${r.period} ${r.summary} ${r.highlights.join(" ")} experience work job career`,
  answer: `${r.role} at ${r.company}${r.org ? ` (${r.org})` : ""}, ${r.location}, ${r.period}. ${r.summary} ${r.highlights.join(" ")}`,
  link: "#experience",
}));

const chapterDocs: Doc[] = CHAPTERS.map((c, i) => ({
  id: `serving-${i}`,
  tag: `Serving · ${c.eyebrow}`,
  text: `${c.eyebrow} ${c.title} ${c.body} ${c.metric ?? ""} llm inference serving platform production`,
  answer: `${c.title} ${c.body}${c.metric ? ` (${c.metric})` : ""}`,
  link: "#serving",
}));

const fleetDocs: Doc[] = FLEET.map((f, i) => ({
  id: `fleet-${i}`,
  tag: `NASA · ${f.title}`,
  text: `${f.title} ${f.statement} ${f.label} nasa pandora instruments spectrometers`,
  answer: `${f.title}: ${f.statement}`,
  link: "#systems",
}));

const FACT_DOCS: Doc[] = [
  {
    id: "fact-mission",
    tag: "About",
    text: `mission manifesto about who is ashutosh ashu summary bio introduction ${MANIFESTO}`,
    answer: MANIFESTO,
    link: "#top",
  },
  {
    id: "fact-impact",
    tag: "Impact",
    text: `impact results metrics numbers achievements savings throughput cost latency ttft idle gpu hours ${IMPACT_STATEMENT}`,
    answer: `${IMPACT_STATEMENT} In numbers: ${IMPACT_METRICS.map((m) => `${m.sign}${m.value}% ${m.label.toLowerCase()}`).join(", ")}.`,
    link: "#impact",
  },
  {
    id: "fact-inference",
    tag: "LLM inference",
    text:
      "llm inference serving vllm sglang tensorrt-llm triton kv cache pagedattention continuous batching prefix caching chunked prefill quantization fp8 int8 awq gptq speculative decoding moe serving throughput latency rag agents",
    answer:
      "LLM inference is the core of the day job: a production vLLM platform for RAG and agentic workflows, tuned with continuous batching, chunked prefill and prefix caching (+87% throughput per GPU, −20% P99 TTFT), plus FP8/INT8 and AWQ quantization and speculative decoding (−60% serving cost). Also fluent in SGLang, TensorRT-LLM, Triton, PagedAttention and MoE serving.",
    link: "#serving",
  },
  {
    id: "fact-runtimes",
    tag: "Runtime bake-off",
    text: "vllm versus sglang versus tensorrt-llm compare comparison evaluated runtime choice which engine benchmark head to head",
    answer:
      "vLLM, SGLang and TensorRT-LLM were evaluated head to head on throughput, tail latency and quantization support, and the production runtime was recommended from workload-specific benchmarks rather than reputation.",
    link: "#serving",
  },
  {
    id: "fact-gpu",
    tag: "GPU systems",
    text:
      "gpu gpus cuda distributed multi-gpu tensor parallelism pipeline parallelism nccl disaggregated prefill decode kv-cache offload rdma gpudirect nvlink infiniband mig",
    answer:
      "Distributed GPU serving: large models across multi-GPU nodes with tensor and pipeline parallelism over NCCL, MIG partitions for smaller models, and working knowledge of disaggregated prefill/decode, KV-cache offload, RDMA, GPUDirect and NVLink/InfiniBand. Idle GPU hours came down 40%.",
    link: "#serving",
  },
  {
    id: "fact-k8s",
    tag: "Kubernetes",
    text:
      "kubernetes k8s go golang controllers crds operators helm gpu scheduling mig multi-tenant isolation cache-aware routing autoscaling slo orchestration model lifecycle",
    answer:
      "Kubernetes for GPUs: Go controllers and CRDs for model lifecycle management, GPU-aware scheduling and autoscaling of vLLM workloads, shipped with Helm, plus MIG partitioning, multi-tenant isolation, cache-aware routing and SLO-driven autoscaling.",
    link: "#serving",
  },
  {
    id: "fact-profiling",
    tag: "Performance",
    text:
      "performance profiling benchmark benchmarking harness ttft itl tpot p95 p99 tail latency mfu mbu nsight systems compute pytorch profiler root cause regression incidents",
    answer:
      "A benchmarking harness tracks TTFT, ITL, P95/P99 latency and MFU/MBU, and every model or config change has to pass it. Latency regressions across multi-tier RAG and agent pipelines get root-caused end to end with Nsight Systems/Compute and PyTorch Profiler.",
    link: "#serving",
  },
  {
    id: "fact-ai",
    tag: "AI/ML",
    text:
      "ai ml machine learning artificial intelligence llm large language models rag retrieval augmented generation embeddings vector search pgvector agents multi-agent orchestration evals evaluation prompt engineering generative ai agent security guardrails safety experience",
    answer:
      "Beyond serving, AI runs through the side projects: a runtime security control plane for AI agents (Phulax), an enterprise RAG platform with evaluation datasets (CommonGround), a self-learning agentic framework (InCortex), an eight-agent AI software company in a 3D office (Office.ai), a six-agent sports prediction system (MoneyBall) and an LLM trading engine with a deterministic core (Claude TopstepX). At work: deep-learning anomaly detection and CNN cloud detection on 300+ NASA Pandora instruments.",
    link: "#work",
  },
  {
    id: "fact-nasa",
    tag: "NASA",
    text:
      "nasa gsfc goddard pandora pandonia spectrometer atmosphere atmospheric science instruments ground network sciglob space physical world sensors esa trace gas",
    answer:
      "At SciGlob, for NASA: ML and data systems for the Pandora network of 300+ spectrometers on five continents. Deep-learning anomaly detection, an encoder–decoder CNN for real-time cloud detection, a full-stack instrument-health platform, edge-to-cloud pipelines delivering auditable trace-gas datasets to NASA and ESA researchers, and a ground-up C++17 rewrite of the Blick spectral processing suite.",
    link: "#systems",
  },
  {
    id: "fact-cpp",
    tag: "C++ / CUDA",
    text: "c++ cpp c++17 cuda systems programming native performance opengl imgui cmake low level graphics",
    answer:
      "C++ work: leading the ground-up C++17 rewrite of the Blick spectral processing suite (L0→L2: 14 modular libraries, a parity harness against legacy output, a CUDA-ready GPU acceleration layer), and IMU-3D, a native desktop app streaming live sensor data into a real-time OpenGL scene.",
    link: "#work",
  },
  {
    id: "fact-python",
    tag: "Python",
    text: "python fastapi flask pydantic celery data pipelines etl backend scripting numpy",
    answer:
      "Python is the daily driver — Pandora fleet monitoring at the edge (Pandora Summarizer), FastAPI backends for CommonGround, MoneyBall and ReBirth, and the deterministic LLM trading core of Claude TopstepX (~93% test coverage).",
    link: "#work",
  },
  {
    id: "fact-frontend",
    tag: "Frontend",
    text: "frontend react next.js nextjs typescript react native expo web ui ux design gsap animation mobile app",
    answer:
      "Frontend: React/Next.js and React Native (RETRVE ships as an Expo app), and the full-stack instrument-health app for NASA is FastAPI plus Next.js and TypeScript. This site is a Next.js static export animated with GSAP and Lenis, with no template.",
    link: "#skills",
  },
  {
    id: "fact-education",
    tag: "Education",
    text: "education degree university masters bachelors graduate school umbc maryland medi-caps study studied college data science computer science gpa grades teaching assistant",
    answer: `Education: ${EDUCATION.map((e) => `${e.degree}, ${e.school}${e.note ? ` (${e.note})` : ""}`).join("; ")}. Alongside the M.S., a Graduate Student Assistant at UMBC from 2022 to 2024.`,
    link: "#experience",
  },
  {
    id: "fact-ds",
    tag: "Data science",
    text:
      "data science data engineering analytics etl elt pipelines pyspark pandas numpy scikit-learn tensorflow pytorch snowflake tableau power bi dashboards anomaly detection time series computer vision cnn model training evaluation precision recall roc auc",
    answer:
      "Data science end to end: deep learning (CNNs, encoder–decoder), computer vision and time-series anomaly detection in production at NASA scale; PyTorch, TensorFlow, scikit-learn and PySpark for training and pipelines; ETL over Snowflake and PostgreSQL with Tableau and Power BI on top (−25% operating cost at 407 Associates, −30% data defects at TCS).",
    link: "#systems",
  },
  {
    id: "fact-hire",
    tag: "Why hire",
    text:
      "why hire should we hire strengths good fit value candidate interview opportunity recruiter team what makes different unique",
    answer:
      "The overlap that's hard to find: LLM inference performance (vLLM tuning, quantization, speculative decoding, multi-GPU serving), the platform around it (Go Kubernetes controllers, benchmark gates, profiling), and production ML on a real NASA instrument network. Results, not adjectives: +87% throughput per GPU, −60% serving cost, −40% idle GPU hours.",
    link: "#contact",
  },
  {
    id: "fact-site",
    tag: "This site",
    text:
      "site website portfolio built how this page console terminal lab neural network playground backprop tf-idf tfidf retrieval simulation simulator serving lab interactive hero animation how does this work",
    answer:
      "This site is a Next.js static export animated with GSAP and Lenis. The hero is a simulated LLM server you can flood with traffic, the serving story plays out on CSS 3D panels, and the serving lab lets you flip batching, chunked prefill, prefix caching, speculative decoding and FP8 weights while capacity and latency update live. The lab trains a 2-8-8-1 MLP with hand-written backprop, the footer measures this page's own Core Web Vitals, and this console is TF-IDF + cosine retrieval over the site's text. No AI API calls; everything runs in your browser.",
    link: "#lab",
  },
  {
    id: "fact-location",
    tag: "Location",
    text: "location where based city live remote columbia maryland dc washington baltimore timezone",
    answer: `Based in ${CONTACT.location}, in the DC/Baltimore corridor on US Eastern time, and open to new opportunities.`,
    link: "#contact",
  },
  {
    id: "fact-stack",
    tag: "Skills",
    text: `stack skills tools technologies capabilities ${SKILLS.map((g) => `${g.label} ${g.items.join(" ")}`).join(" ")}`,
    answer: SKILLS.map((g) => `${g.label}: ${g.items.join(", ")}`).join(" // "),
    link: "#skills",
  },
  {
    id: "fact-contact",
    tag: "Contact",
    text: "contact email phone reach call linkedin github resume cv hire touch message",
    answer: `Email ${CONTACT.email} · ${CONTACT.phone} · GitHub ${CONTACT.github} · LinkedIn ${CONTACT.linkedin} · Resume at ${CONTACT.resume}`,
    link: `mailto:${CONTACT.email}`,
  },
];

export const CORPUS: Doc[] = [
  ...projectDocs,
  ...moreWorkDocs,
  ...experienceDocs,
  ...chapterDocs,
  ...fleetDocs,
  ...principleDocs,
  ...FACT_DOCS,
];

/* ---------------------------------------------------------- tokenizer */

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "do", "does", "for",
  "from", "has", "have", "he", "his", "how", "i", "in", "is", "it", "its",
  "me", "my", "of", "on", "or", "s", "so", "such", "that", "the", "their",
  "them", "there", "they", "this", "to", "was", "we", "what", "when", "where",
  "which", "who", "why", "will", "with", "you", "your", "about", "tell",
  "any", "some", "can", "did", "him", "her",
]);

/* domain synonyms folded into query tokens so "ml" finds "machine learning" */
const SYNONYMS: Record<string, string[]> = {
  ml: ["machine", "learning", "ai"],
  ai: ["ml", "artificial", "intelligence"],
  llm: ["language", "model", "ai"],
  llms: ["llm", "language", "model"],
  rag: ["retrieval", "augmented", "generation", "embeddings"],
  agent: ["agents", "multi-agent"],
  agents: ["agent", "multi-agent"],
  job: ["work", "experience", "career"],
  nn: ["neural", "network"],
  neural: ["network", "ml"],
  cpp: ["c++", "systems"],
  frontend: ["react", "web", "ui"],
  backend: ["api", "server", "pipelines"],
  school: ["education", "university"],
  degree: ["education", "university"],
  inference: ["serving", "llm", "vllm"],
  serving: ["inference", "vllm"],
  vllm: ["inference", "serving"],
  sglang: ["vllm", "runtime"],
  tensorrt: ["tensorrt-llm"],
  gpu: ["gpus", "cuda", "nccl"],
  gpus: ["gpu", "cuda"],
  k8s: ["kubernetes"],
  kubernetes: ["k8s", "controllers", "crds"],
  golang: ["go", "controllers"],
  quantization: ["fp8", "int8", "awq"],
  latency: ["ttft", "p99", "itl"],
  ttft: ["latency", "p99"],
  cost: ["serving", "quantization"],
  profiling: ["nsight", "profiler", "benchmark"],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/c\+\+/g, "cpp")
    .split(/[^a-z0-9.#-]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/* ------------------------------------------------------------- index */

interface Indexed {
  doc: Doc;
  vector: Map<string, number>;
  norm: number;
}

function buildIndex(docs: Doc[]): { indexed: Indexed[]; idf: Map<string, number> } {
  const docTokens = docs.map((d) => tokenize(d.text));
  const df = new Map<string, number>();
  for (const tokens of docTokens) {
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, n] of df) idf.set(t, Math.log((docs.length + 1) / (n + 1)) + 1);

  const indexed = docs.map((doc, i) => {
    const tf = new Map<string, number>();
    for (const t of docTokens[i]) tf.set(t, (tf.get(t) ?? 0) + 1);
    const vector = new Map<string, number>();
    let normSq = 0;
    for (const [t, n] of tf) {
      const w = (1 + Math.log(n)) * (idf.get(t) ?? 1);
      vector.set(t, w);
      normSq += w * w;
    }
    return { doc, vector, norm: Math.sqrt(normSq) || 1 };
  });

  return { indexed, idf };
}

const { indexed: INDEX, idf: IDF } = buildIndex(CORPUS);

export function search(query: string, topK = 3): { doc: Doc; score: number }[] {
  const raw = tokenize(query);
  const expanded = [...raw];
  for (const t of raw) {
    const extra = SYNONYMS[t];
    if (extra) expanded.push(...extra.map((x) => x.replace(/c\+\+/g, "cpp")));
  }
  if (expanded.length === 0) return [];

  const qtf = new Map<string, number>();
  for (const t of expanded) qtf.set(t, (qtf.get(t) ?? 0) + 1);
  const qvec = new Map<string, number>();
  let qnormSq = 0;
  for (const [t, n] of qtf) {
    const w = (1 + Math.log(n)) * (IDF.get(t) ?? 0.3);
    qvec.set(t, w);
    qnormSq += w * w;
  }
  const qnorm = Math.sqrt(qnormSq) || 1;

  return INDEX.map(({ doc, vector, norm }) => {
    let dot = 0;
    for (const [t, w] of qvec) {
      const dw = vector.get(t);
      if (dw) dot += w * dw;
    }
    return { doc, score: dot / (norm * qnorm) };
  })
    .filter((r) => r.score > 0.04)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/* ------------------------------------------------------------ intents */

const HELP_TEXT =
  "Ask anything about the work, e.g. \"LLM inference experience?\", \"vLLM vs SGLang?\", \"tell me about the NASA work\", \"why hire ashu?\". Commands: projects · stack · contact · resume · clear. Answers are retrieved from indexed docs, never generated.";

function intentAnswer(query: string): AskResult | null {
  const q = query.trim().toLowerCase();
  const done = (answer: string, sources: Doc[] = []): AskResult => ({
    answer,
    sources,
    score: 0,
    ms: 0,
    kind: "intent",
  });

  if (/^(help|\?|commands?)$/.test(q)) return done(HELP_TEXT);
  /* standalone greetings only — "hi, do you know rag?" must reach retrieval */
  if (/^(hi|hey|hello|yo|sup|namaste|hola)( there)?[\s!.]*$/.test(q)) {
    return done("Hello. You're talking to a TF-IDF index, not a chatbot — ask about projects, experience, or type `help`.");
  }
  if (/^projects?$/.test(q) || /list.*(projects|work)/.test(q)) {
    return done(
      PROJECTS.map((p) => `${p.index} ${p.name} — ${p.domain}`).join("\n"),
      projectDocs,
    );
  }
  if (/^stack$/.test(q) || /^skills?$/.test(q)) {
    const doc = FACT_DOCS.find((d) => d.id === "fact-stack");
    return done(doc?.answer ?? "", doc ? [doc] : []);
  }
  if (/^(contact|email|phone)$/.test(q)) {
    const doc = FACT_DOCS.find((d) => d.id === "fact-contact");
    return done(doc?.answer ?? "", doc ? [doc] : []);
  }
  if (/^(resume|cv)$/.test(q)) {
    return done(`Opening ${CONTACT.resume} — also linked in the footer.`, [
      { id: "resume", tag: "Resume", text: "", answer: "", link: CONTACT.resume },
    ]);
  }
  return null;
}

/* --------------------------------------------------------------- ask */

export function ask(query: string): AskResult {
  const t0 = performance.now();
  const intent = intentAnswer(query);
  if (intent) return { ...intent, ms: performance.now() - t0 };

  const hits = search(query, 3);
  const ms = performance.now() - t0;

  if (hits.length === 0) {
    return {
      answer:
        "No strong match in the corpus, and this console refuses to make things up. Try `help`, or ask about inference, gpus, kubernetes, nasa, rag, c++ or hiring.",
      sources: [],
      score: 0,
      ms,
      kind: "miss",
    };
  }

  const top = hits[0];
  /* keep secondary sources only when they're nearly as relevant */
  const sources = hits.filter((h) => h.score > top.score * 0.55).map((h) => h.doc);
  return { answer: top.doc.answer, sources, score: top.score, ms, kind: "retrieval" };
}
