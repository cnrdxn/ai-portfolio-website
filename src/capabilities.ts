export type CapabilityExample = {
  title: string;
  body: string;
  href: string;
};

export const capabilities: {
  id: string;
  title: string;
  lines: string[];
  examples: [CapabilityExample, CapabilityExample];
  skills: [string, string, string];
}[] = [
  {
    id: 'ai-systems',
    title: 'AI systems',
    lines: ['AI', 'systems'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Led delivery from first commit through production rollout, helping employees find grounded answers. Evaluated answer quality and whether the platform answered supported questions and declined unsupported ones.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Iterative Topic Resolver',
        body: 'Led development of an LLM workflow that shortened turnaround from topic intake to pipeline-ready examples. It processed production classification workloads, with human refinement where needed.',
        href: '#project-iterative-topic-resolver',
      },
    ],
    skills: ['Multi-stage RAG', 'LLM-as-judge evaluation', 'MCP integration'],
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud infrastructure',
    lines: ['Cloud', 'infrastructure'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Led cloud deployment on GCP Cloud Run with Terraform. Secret Manager and Identity-Aware Proxy supported secrets management and secure access for the production service.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Iterative Topic Resolver',
        body: 'Guided delivery of a cloud batch workflow for production classification workloads. Crash-safe checkpoints reconnect to in-flight jobs after failures, avoiding duplicate submissions.',
        href: '#project-iterative-topic-resolver',
      },
    ],
    skills: ['GCP Cloud Run', 'Secret Manager', 'Identity-Aware Proxy'],
  },
  {
    id: 'data-science',
    title: 'Data science',
    lines: ['Data', 'science'],
    examples: [
      {
        title: 'WiFi Sharing Fraud Detection',
        body: 'Contributed to the initial fraud model, which helped identify revenue-leakage accounts and recover revenue. Led implementation and deployment of a later iteration, expanding the population analyzed.',
        href: '#project-wifi-fraud-detection',
      },
      {
        title: 'Data pipelines and forecasting',
        body: 'Managed production data pipelines supporting analytics and machine learning. Improved a streaming-app forecasting workflow through refactoring, alongside production machine-learning and data-engineering work.',
        href: '#experience-data-science',
      },
    ],
    skills: ['Python', 'Spark', 'SQL'],
  },
  {
    id: 'devops',
    title: 'DevOps',
    lines: ['DevOps'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Led delivery with Terraform-managed GCP deployments and release evaluation. A defined evaluation suite covers supported, off-topic, and adversarial questions, with automated testing supporting release checks.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Iterative Topic Resolver',
        body: 'Guided a recoverable batch workflow with crash-safe checkpoints that reconnect to running jobs. Example curation includes verbatim integrity checks to reject fabricated or altered source examples.',
        href: '#project-iterative-topic-resolver',
      },
    ],
    skills: ['Terraform', 'Docker', 'GitLab CI/CD'],
  },
  {
    id: 'presentations',
    title: 'Presentations',
    lines: ['Presentations'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Presented the product to company leadership after guiding it from the initial request through delivery. Demonstrations explained its capabilities and the technical decisions behind the finished experience.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Product communication and team guidance',
        body: 'Introduced enterprise AI capabilities to wider audiences and supported team learning through knowledge sessions and technical guidance. The focus is making technical work understandable and useful to others.',
        href: '#overview',
      },
    ],
    skills: ['Executive communication', 'Technical presentations', 'Product demos'],
  },
  {
    id: 'product-strategy',
    title: 'Product strategy',
    lines: ['Product', 'strategy'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Guided a leadership request through architecture, interface design, development, and production rollout. The platform helps employees find grounded answers to enterprise AI questions.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Iterative Topic Resolver',
        body: 'Led delivery around the topic-intake bottleneck, turning definitions into pipeline-ready example files. Shortened turnaround and automated topic preparation, with human review and refinement where needed.',
        href: '#project-iterative-topic-resolver',
      },
    ],
    skills: ['Requirements framing', 'Problem definition', 'Product delivery'],
  },
  {
    id: 'software-engineering',
    title: 'Software engineering',
    lines: ['Software', 'engineering'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Led software delivery through REST API, MCP, and chat interfaces with role-based access control. The platform combines grounded retrieval with release evaluation and automated testing.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'House Butler',
        body: 'Developed a Python voice assistant connecting spoken requests to multiple service integrations. Separate tool-dispatch and conversation stages produce streaming, sentence-by-sentence spoken replies.',
        href: '#project-house-butler',
      },
    ],
    skills: ['Python', 'FastAPI', 'REST APIs'],
  },
  {
    id: 'solution-architecture',
    title: 'Solution architecture',
    lines: ['Solution', 'architecture'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Guided architecture for intent routing, conversational rewriting, source retrieval, and grounded answers. Bounded conversation history and role-based access support delivery through API, MCP, and chat interfaces.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'Iterative Topic Resolver',
        body: 'Led a batch workflow combining categorical scoring, decisive-first ranking, and flags for human review. Checkpointing reconnects to in-flight cloud jobs after failures without resubmitting work.',
        href: '#project-iterative-topic-resolver',
      },
    ],
    skills: ['System design', 'RAG architecture', 'Intent routing'],
  },
  {
    id: 'technical-leadership',
    title: 'Technical leadership',
    lines: ['Technical', 'leadership'],
    examples: [
      {
        title: 'Production pipeline leadership',
        body: 'Led broader technical work, including architecture and oversight across production pipelines. This followed a progression from intern to technical lead and people manager.',
        href: '#experience-data-science',
      },
      {
        title: 'Team development',
        body: 'Supported team development through internal tools, knowledge sessions, and day-to-day technical guidance. Shared practical context to help colleagues understand technical decisions and build on the work.',
        href: '#overview',
      },
    ],
    skills: ['Technical leadership', 'Mentoring', 'Knowledge sharing'],
  },
  {
    id: 'visual-design',
    title: 'Visual design',
    lines: ['Visual', 'design'],
    examples: [
      {
        title: 'Enterprise AI Answers Service',
        body: 'Guided interface and visual design as part of delivery from a leadership request to launch. The product brings company knowledge into grounded, conversational tools for employee questions.',
        href: '#project-enterprise-ai',
      },
      {
        title: 'This portfolio and capability map',
        body: 'Shaped a responsive interface around project evidence and an interactive capability map. The orb supports rotation, keyboard exploration, and touch selection, with linked examples connecting capabilities to the work.',
        href: '#top',
      },
    ],
    skills: ['Interface design', 'Visual hierarchy', 'Product experience'],
  },
];
