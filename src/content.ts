export type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  badge: string;
  role: string;
  summary: string;
  tags: string[];
  theme: 'cyan' | 'sand' | 'slate' | 'mint';
  metrics: { value: string; label: string }[];
  challenge: string;
  architecture: string;
  validation: string;
  detailHeading: string;
  nextSteps: string;
};

export const projects: Project[] = [
  {
    id: 'enterprise-ai',
    number: '01',
    title: 'Enterprise AI Answers Service',
    category: 'RAG / KNOWLEDGE SYSTEMS',
    badge: 'ENTERPRISE AI / 10-WEEK ROLLOUT',
    role: 'Sole engineer, Enterprise AI Answers Platform',
    summary:
      'I built the company-wide AI answers platform as its sole engineer, taking it from first commit to rollout in 10 weeks. It became the primary destination for tens of thousands of employees to ask questions about enterprise AI.',
    tags: ['LangGraph', 'Multi-stage RAG', 'Intent routing', 'MCP', 'GCP', 'Terraform'],
    theme: 'cyan',
    metrics: [
      { value: '10 weeks', label: 'from first commit to rollout' },
      { value: '98%', label: 'answer-or-decline accuracy in benchmark' },
      { value: '1,500+', label: 'automated tests' },
    ],
    challenge: 'Give employees a central place to ask questions about enterprise AI, with responses grounded in source documentation and unsupported questions declined.',
    architecture: 'I designed a multi-stage LangGraph RAG pipeline to route intent, rewrite conversational follow-ups, retrieve a narrow set of source documents, and generate grounded answers with bounded conversation history. I delivered it through a REST API, MCP server, and Webex bot with role-based access control, deployed on GCP with Terraform.',
    validation: 'I built a 100-case LLM-as-judge A/B benchmark with jailbreak and off-topic attacks to gate each release. On that benchmark, the platform scores above 90% on answer quality and makes the correct answer-or-decline call 98% of the time, backed by 1,500+ automated tests.',
    detailHeading: 'Knowledge operations',
    nextSteps: 'I automated conversion of documentation pages into LLM-generated Q&A pairs, with human review, versioned publishing, and rollback.',
  },
  {
    id: 'iterative-topic-resolver',
    number: '02',
    title: 'Iterative Topic Resolver',
    category: 'BATCH CLASSIFICATION / LLM SYSTEMS',
    badge: 'LLM / BATCH PIPELINE',
    role: 'Sole developer, Iterative Topic Resolver',
    summary:
      'I built a cloud LLM workflow that turns topic definitions into pipeline-ready example files, reducing turnaround from two weeks to one day.',
    tags: ['Cloud LLMs', 'Batch classification', 'Human review', 'Checkpointing'],
    theme: 'sand',
    metrics: [
      { value: '~316K', label: 'classifications across production runs' },
      { value: '2 weeks → 1 day', label: 'topic intake to pipeline-ready example files' },
      { value: '~90%', label: 'topics ready without manual tweaking' },
    ],
    challenge: 'Turn incoming topics and definitions into the complete set of example files required by a downstream boolean classification pipeline, reducing manual preparation and review.',
    architecture: 'I used a categorical scoring rubric with decisive-first ranking and automatic flags for ambiguous notes that need human review. Crash-safe checkpoints reconnect to in-flight cloud batch jobs after failures without resubmitting work.',
    validation: 'The workflow reduced elapsed turnaround from two weeks to one day, measured from receiving topics and definitions to having all example files ready for the boolean classification pipeline. Approximately 90% of topics could proceed from the automatic classifier, with 10% needing manual tweaks. The pipeline completed about 316,000 classifications across production runs.',
    detailHeading: 'Prompt-tuning data',
    nextSteps: 'I automated example curation with an LLM that selects diverse examples for the downstream boolean classification pipeline. Verbatim integrity checks reject fabricated or altered examples.',
  },
  {
    id: 'wifi-fraud-detection',
    number: '03',
    title: 'WiFi Sharing Fraud Detection',
    category: 'FRAUD DETECTION / PRODUCTION ML',
    badge: 'PRODUCTION FRAUD MODEL',
    role: 'Primary developer V1, end-to-end lead V2',
    summary:
      'I led Version 2 end-to-end, expanding subjects analyzed by 106%. Version 1 identified about 100 revenue-leakage accounts tied to $350K+ in annual recovered revenue.',
    tags: ['WiFi fraud detection', 'Production ML', 'Revenue leakage', 'Model deployment'],
    theme: 'slate',
    metrics: [
      { value: '$350K+', label: 'annual recovered revenue from V1' },
      { value: '~100', label: 'revenue-leakage accounts identified by V1' },
      { value: '+106%', label: 'subjects analyzed in V2' },
    ],
    challenge: 'I worked to identify WiFi sharing fraud and expand the number of subjects analyzed by the production model.',
    architecture: 'I was the primary developer for Version 1, then led Version 2 end-to-end with ownership of its code and deployment strategy.',
    validation: 'Version 1 identified about 100 revenue-leakage accounts and drove $350K+ in annual recovered revenue. Version 2 expanded the number of subjects analyzed by 106%.',
    detailHeading: 'Production pipeline ownership',
    nextSteps: 'During restructuring, I took technical lead of the broader work, including architecture and oversight of more than 10 production-level pipelines.',
  },
  {
    id: 'house-butler',
    number: '04',
    title: 'House Butler',
    category: 'VOICE / HOME AUTOMATION',
    badge: 'PERSONAL PROJECT',
    role: 'Independent project',
    summary: 'A Python voice assistant that turns spoken requests into home automation and personal-service actions through a tool-calling AI brain.',
    tags: ['Python', 'Function calling', 'WebSockets', 'LLM services', 'ElevenLabs', 'Govee / Tuya'],
    theme: 'mint',
    metrics: [
      { value: '5 skills', label: 'registered service integrations' },
      { value: '2 stages', label: 'tool dispatch and conversation' },
      { value: 'Streaming', label: 'sentence-by-sentence spoken replies' },
    ],
    challenge: 'Bring voice input, conversational context, and household services into one assistant that can execute requests and respond aloud.',
    architecture: 'A wake-word listener sends transcribed speech over WebSockets to a central Python service. A function-dispatch model selects tools from a registry of calendar, weather, news, Govee, and Tuya skills. Tool results feed a streaming conversational response, which is spoken through ElevenLabs text-to-speech.',
    validation: 'The repository includes mocked tests for conversation state, response streaming, and speech-output handling, plus manual skill and function-calling checks. Live-device reliability and end-to-end latency still need measured results for this case study.',
    detailHeading: 'Next steps',
    nextSteps: 'Add a recorded voice interaction and measured timings for the complete request-to-response loop.',
  },
];

export const experience: {
  period: string;
  role: string;
  organization: string;
  description: string;
  tags: string[];
}[] = [
  {
    period: 'Spring 2026 – present',
    role: 'Lead AI Systems Engineer',
    organization: 'Spectrum',
    description: 'Technical lead and sole engineer on the Enterprise AI Answers Platform, with ownership of architecture, software delivery, and cloud deployment. Sole developer of the Iterative Topic Resolver.',
    tags: ['LangGraph', 'RAG', 'Cloud LLMs', 'GCP', 'Terraform'],
  },
  {
    period: 'Summer 2022 – Spring 2026',
    role: 'Data Scientist · Associate Data Scientist · Intern',
    organization: 'Spectrum',
    description: 'Grew from intern to technical lead and people manager. Led production fraud-model development, managed Deepfield ETL processing over 2 TB daily, and refactored the Spectrum TV App forecasting workflow for an 83% efficiency improvement.',
    tags: ['Production ML', 'Data engineering', 'Technical leadership'],
  },
  {
    period: '2019 – 2023',
    role: 'B.A. Computer Science, cum laude',
    organization: 'University of Colorado Boulder',
    description: 'GPA 3.67. President Baker Scholar, recognized for academic and leadership achievement.',
    tags: ['Computer Science', 'Cum laude', 'President Baker Scholar'],
  },
];

export const profile = {
  name: 'Connor Dixon',
  title: 'Lead AI Systems Engineer',
  location: 'Denver, Colorado',
  email: 'connorddixon@gmail.com',
  linkedin: 'https://www.linkedin.com/in/connorddixon/',
  intro:
    'I’m Connor Dixon, a Lead AI Systems Engineer in Denver. I build production AI products from architecture through deployment, grounded in a data science and software engineering background.',
  about: [
    'I’m an AI systems engineer based in Denver. At Spectrum, I lead AI systems work and build enterprise products from architecture through rollout. My background includes production machine learning, fraud detection, large-scale data systems, and forecasting.',
    'For the enterprise AI answers platform, I was the sole engineer. I took leadership’s request through architecture, visual design, software development, and infrastructure deployment. I then presented the finished product to leadership and introduced it to wider audiences.',
  ],
};
