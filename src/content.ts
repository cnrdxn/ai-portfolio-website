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
    badge: 'ENTERPRISE AI / PRODUCTION DELIVERY',
    role: 'Technical lead, Enterprise AI Answers Platform',
    summary:
      'I led development of an enterprise AI answers platform from first commit through production rollout, helping employees find grounded answers to enterprise AI questions.',
    tags: ['LangGraph', 'Multi-stage RAG', 'Intent routing', 'MCP', 'GCP', 'Terraform'],
    theme: 'cyan',
    challenge: 'Give employees a central place to ask questions about enterprise AI, with responses grounded in source documentation and unsupported questions declined.',
    architecture: 'I designed a multi-stage LangGraph RAG pipeline to route intent, rewrite conversational follow-ups, retrieve a narrow set of source documents, and generate grounded answers with bounded conversation history. I delivered it through a REST API, MCP server, and Webex bot with role-based access control, deployed on GCP with Terraform.',
    validation: 'I developed a defined evaluation suite covering supported, off-topic, and adversarial questions. Answer quality and answer-or-decline behavior were evaluated through a benchmark, with automated testing supporting release checks.',
    detailHeading: 'Knowledge operations',
    nextSteps: 'I automated conversion of documentation pages into LLM-generated Q&A pairs, with human review, versioned publishing, and rollback.',
  },
  {
    id: 'iterative-topic-resolver',
    number: '02',
    title: 'Iterative Topic Resolver',
    category: 'BATCH CLASSIFICATION / LLM SYSTEMS',
    badge: 'LLM / BATCH PIPELINE',
    role: 'Development lead, Iterative Topic Resolver',
    summary:
      'I led development of a cloud LLM workflow that turns topic definitions into pipeline-ready example files, shortening turnaround from intake to delivery.',
    tags: ['Cloud LLMs', 'Batch inference', 'Human-in-the-loop', 'Checkpointing', 'Prompt engineering', 'Data validation'],
    theme: 'sand',
    challenge: 'Turn incoming topics and definitions into the complete set of example files required by a downstream boolean classification pipeline, reducing manual preparation and review.',
    architecture: 'I used a categorical scoring rubric with decisive-first ranking and automatic flags for ambiguous notes that need human review. Crash-safe checkpoints reconnect to in-flight cloud batch jobs after failures without resubmitting work.',
    validation: 'The workflow shortened turnaround from receiving topic definitions to having example files ready for the classification pipeline. It processed production classification workloads and automated topic preparation, with human review and refinement where needed.',
    detailHeading: 'Prompt-tuning data',
    nextSteps: 'I automated example curation with an LLM that selects diverse examples for the downstream boolean classification pipeline. Verbatim integrity checks reject fabricated or altered examples.',
  },
  {
    id: 'wifi-fraud-detection',
    number: '03',
    title: 'WiFi Sharing Fraud Detection',
    category: 'FRAUD DETECTION / PRODUCTION ML',
    badge: 'PRODUCTION FRAUD MODEL',
    role: 'Core developer V1, technical lead V2',
    summary:
      'I contributed to the initial fraud model, which helped identify revenue-leakage accounts and recover revenue. I then led an expansion of the population analyzed by the model.',
    tags: ['Production ML', 'Fraud detection', 'Model deployment', 'Data pipelines', 'System design', 'Technical leadership'],
    theme: 'slate',
    challenge: 'I worked to identify WiFi sharing fraud and expand the number of subjects analyzed by the production model.',
    architecture: 'I contributed to Version 1 development, then led Version 2 implementation and deployment strategy.',
    validation: 'The initial model identified revenue-leakage accounts and helped recover revenue. A later iteration expanded the population analyzed by the model.',
    detailHeading: 'Production pipeline ownership',
    nextSteps: 'I led broader technical work, including architecture and oversight across production pipelines.',
  },
  {
    id: 'house-butler',
    number: '04',
    title: 'House Butler',
    category: 'VOICE / HOME AUTOMATION',
    badge: 'PERSONAL PROJECT',
    role: 'Personal project',
    summary: 'A Python voice assistant that turns spoken requests into home automation and personal-service actions through a tool-calling AI brain.',
    tags: ['Python', 'Function calling', 'WebSockets', 'LLMs', 'ElevenLabs', 'Govee / Tuya'],
    theme: 'mint',
    challenge: 'Bring voice input, conversational context, and household services into one assistant that can execute requests and respond aloud.',
    architecture: 'A wake-word listener sends transcribed speech over WebSockets to a central Python service. A function-dispatch model selects tools from a registry of calendar, weather, news, Govee, and Tuya skills. Tool results feed a streaming conversational response, which is spoken through ElevenLabs text-to-speech.',
    validation: 'The repository includes mocked tests for conversation state, response streaming, and speech-output handling, plus manual skill and function-calling checks. Live-device reliability and end-to-end latency still need measured results for this case study.',
    detailHeading: 'Next steps',
    nextSteps: 'Add a recorded voice interaction and measured timings for the complete request-to-response loop.',
  },
];

export const experience: {
  id: string;
  period: string;
  role: string;
  organization: string;
  description: string;
  tags: string[];
}[] = [
  {
    id: 'experience-ai-systems',
    period: '2026 – present',
    role: 'Lead AI Systems Engineer',
    organization: 'Company details on request',
    description: 'Technical lead for the Enterprise AI Answers Platform, guiding architecture, software delivery, and cloud deployment. Led development of the Iterative Topic Resolver.',
    tags: ['LangGraph', 'RAG', 'Cloud LLMs', 'GCP', 'Terraform'],
  },
  {
    id: 'experience-data-science',
    period: '2022 – 2026',
    role: 'Data Scientist · Associate Data Scientist · Intern',
    organization: 'Company details on request',
    description: 'Grew from intern to technical lead and people manager. Led production fraud-model development, managed data pipelines supporting analytics and machine learning, and improved a streaming-app forecasting workflow through refactoring.',
    tags: ['Production ML', 'Data engineering', 'Technical leadership'],
  },
  {
    id: 'experience-education',
    period: 'Undergraduate studies',
    role: 'B.A. Computer Science, cum laude',
    organization: 'University of Colorado Boulder',
    description: 'Graduated cum laude. President Baker Scholar, recognized for academic and leadership achievement.',
    tags: ['Computer Science', 'Cum laude', 'President Baker Scholar'],
  },
];

export const profile = {
  name: 'Connor Dixon',
  title: 'Lead AI Systems Engineer',
  location: 'Denver, Colorado',
  email: 'comms@connorddixon.com',
  linkedin: 'https://www.linkedin.com/in/connorddixon/',
  intro:
    'I’m Connor Dixon, a Lead AI Systems Engineer in Denver. I build production AI products from architecture through deployment, grounded in a data science and software engineering background.',
  about: [
    'I’m an AI systems engineer based in Denver. I lead AI systems work and build enterprise products from architecture through rollout. My background includes production machine learning, fraud detection, large-scale data systems, and forecasting.',
    'I led delivery of the enterprise AI answers platform, translating leadership’s request into architecture, visual design, software development, and infrastructure deployment. I presented the product to leadership and introduced its capabilities to wider audiences.',
  ],
};
