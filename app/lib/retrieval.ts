import { PROJECTS, MISSIONS, STACK, CONTACT, MANIFESTO } from "./data";

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
  answer: `${p.name} (${p.year}, ${p.domain}) — ${p.description} Built with ${p.stack.join(", ")}.`,
  link: p.link,
}));

const missionDocs: Doc[] = MISSIONS.map((m, i) => ({
  id: `mission-${i}`,
  tag: `LOG · ${m.company}`,
  text: `${m.company} ${m.detail ?? ""} ${m.role} ${m.location} ${m.period} ${m.description} experience work job career`,
  answer: `${m.role} @ ${m.company}${m.detail ? ` (${m.detail})` : ""}, ${m.location}, ${m.period}. ${m.description}`,
  link: "#log",
}));

const FACT_DOCS: Doc[] = [
  {
    id: "fact-mission",
    tag: "00 · Mission",
    text: `mission manifesto about who is ashutosh ashu summary bio introduction ${MANIFESTO}`,
    answer: MANIFESTO,
    link: "#top",
  },
  {
    id: "fact-ai",
    tag: "AI/ML",
    text:
      "ai ml machine learning artificial intelligence llm large language models rag retrieval augmented generation embeddings vector search pgvector agents multi-agent orchestration evals evaluation prompt engineering generative ai experience",
    answer:
      "AI/ML runs through most of the work: an enterprise RAG platform with evaluation datasets (CommonGround), a self-learning agentic framework with vector memory and calibration audits (InCortex), a six-agent sports prediction system (MoneyBall), an LLM trading engine with a deterministic core and ~93% test coverage (Claude TopstepX), and a generative video pipeline (ReBirth). Day job: deep-learning anomaly detection and CNN cloud detection running on 300+ NASA Pandora instruments. Plus this page — the lab section above trains a neural net in your browser, and this console is TF-IDF retrieval.",
    link: "#work",
  },
  {
    id: "fact-nasa",
    tag: "LOG · NASA",
    text:
      "nasa gsfc goddard pandora spectrometer atmosphere atmospheric science instruments satellite ground network sciglob space physical world sensors",
    answer:
      "Day job: building the ML and data backbone of NASA's Pandora atmospheric network at SciGlob — 300+ spectrometers on five continents running deep-learning anomaly detection on live streams, an encoder–decoder CNN gating sun-scans on real-time sky conditions, fleet health scoring at the edge, and a ground-up C++17 rewrite of the Blick spectral processing suite.",
    link: "#log",
  },
  {
    id: "fact-cpp",
    tag: "C++",
    text: "c++ cpp c++17 systems programming native performance opengl imgui cmake cuda low level graphics",
    answer:
      "C++ work: BlickO-CPP, a ground-up C++17 rewrite of NASA's Blick spectral processing suite (14 modular libraries, parity test harness, GPU-ready), and IMU-3D, a native desktop app streaming live sensor data into a real-time OpenGL scene.",
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
      "Frontend: React/Next.js and React Native (RETRVE ships as an Expo app). This site is a Next.js static export with GSAP, a custom zero-dependency 3D wireframe engine, and a hand-rolled neural net — no template.",
    link: "#stack",
  },
  {
    id: "fact-education",
    tag: "Education",
    text: "education degree university masters graduate school umbc maryland study studied college data science gpa",
    answer:
      "Graduate school: M.P.S. in Data Science (Machine Learning concentration) at UMBC, GPA 3.89 — where he also taught and graded as a Graduate Student Assistant. Before that: Systems Engineer at Tata Consultancy Services in Bangalore.",
    link: "#log",
  },
  {
    id: "fact-ds",
    tag: "Data science",
    text:
      "data science data engineering analytics etl elt pipelines pyspark pandas numpy scikit-learn tensorflow pytorch snowflake tableau power bi dashboards anomaly detection time series computer vision cnn model training evaluation precision recall roc auc",
    answer:
      "Data science end to end: deep learning (CNNs, encoder–decoder), computer vision and time-series anomaly detection in production at NASA scale; PyTorch, TensorFlow, scikit-learn, PySpark for training and pipelines; ETL over Snowflake/PostgreSQL with Tableau and Power BI on top. Model evaluation is a habit, not an afterthought — precision/recall/F1, ROC-AUC, calibration.",
    link: "#systems",
  },
  {
    id: "fact-hire",
    tag: "Why hire",
    text:
      "why hire should we hire strengths good fit value candidate interview opportunity recruiter team what makes different unique",
    answer:
      "The rare overlap: production ML systems (RAG, agents, evals) AND hard systems engineering (C++17 for NASA instruments) AND full product velocity (design to deploy — you're looking at it). Six years shipping, five continents of instruments in production, and a bias for deterministic, testable AI.",
    link: "#contact",
  },
  {
    id: "fact-site",
    tag: "This site",
    text:
      "site website portfolio built how this page console terminal lab neural network playground backprop tf-idf tfidf retrieval how does this work",
    answer:
      "This site is a Next.js static export: GSAP + Lenis motion, a custom 3D wireframe engine, a 2-8-8-1 MLP with hand-written backprop training live in the lab section, and this console — TF-IDF + cosine retrieval over the site's own corpus. Zero AI API calls; everything runs in your browser.",
    link: "#lab",
  },
  {
    id: "fact-location",
    tag: "Location",
    text: "location where based city live remote columbia maryland dc washington baltimore timezone",
    answer: `Based in ${CONTACT.location} (${CONTACT.coords}) — the DC/Baltimore corridor, US Eastern time. Currently: open to opportunities.`,
    link: "#contact",
  },
  {
    id: "fact-stack",
    tag: "Stack",
    text: `stack skills tools technologies capabilities ${STACK.map((g) => `${g.label} ${g.items.join(" ")}`).join(" ")}`,
    answer: STACK.map((g) => `${g.label}: ${g.items.join(", ")}`).join(" // "),
    link: "#stack",
  },
  {
    id: "fact-contact",
    tag: "Contact",
    text: "contact email phone reach call linkedin github resume cv hire touch message",
    answer: `Email ${CONTACT.email} · ${CONTACT.phone} · GitHub ${CONTACT.github} · LinkedIn ${CONTACT.linkedin} · Resume at ${CONTACT.resume}`,
    link: `mailto:${CONTACT.email}`,
  },
];

export const CORPUS: Doc[] = [...projectDocs, ...missionDocs, ...FACT_DOCS];

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
  "Ask anything about the work — e.g. \"experience with RAG?\", \"c++ or python?\", \"tell me about the NASA work\", \"why hire ashu?\". Commands: projects · stack · contact · resume · clear. Answers are retrieved from indexed docs, never generated.";

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
        "No strong match in the corpus — and this console refuses to make things up. Try `help`, or ask about rag, agents, c++, nasa, python, or hiring.",
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
