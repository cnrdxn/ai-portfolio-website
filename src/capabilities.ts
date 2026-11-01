export const capabilities: {
  id: string;
  title: string;
  lines: string[];
  description: string;
  skills: [string, string, string];
}[] = [
  {
    id: 'ai-systems',
    title: 'AI systems',
    lines: ['AI', 'systems'],
    description: 'I build production AI systems with multi-stage RAG, grounded answers, LLM-as-judge evaluation, and MCP integrations.',
    skills: ['Multi-stage RAG', 'LLM-as-judge evaluation', 'MCP integration'],
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud infrastructure',
    lines: ['Cloud', 'infrastructure'],
    description: 'I deploy services on GCP Cloud Run with Secret Manager and Identity-Aware Proxy for secure access.',
    skills: ['GCP Cloud Run', 'Secret Manager', 'Identity-Aware Proxy'],
  },
  {
    id: 'data-science',
    title: 'Data science',
    lines: ['Data', 'science'],
    description: 'I build production ML systems for fraud detection and forecasting, backed by large-scale data pipelines.',
    skills: ['Python', 'Spark', 'SQL'],
  },
  {
    id: 'devops',
    title: 'DevOps',
    lines: ['DevOps'],
    description: 'I manage cloud deployments with Terraform and automated testing.',
    skills: ['Terraform', 'Docker', 'GitLab CI/CD'],
  },
  {
    id: 'presentations',
    title: 'Presentations',
    lines: ['Presentations'],
    description: 'I explain product capabilities and technical decisions to company leadership and wider audiences.',
    skills: ['Executive communication', 'Technical presentations', 'Product demos'],
  },
  {
    id: 'product-strategy',
    title: 'Product strategy',
    lines: ['Product', 'strategy'],
    description: 'I shaped a leadership request into an enterprise AI product that I built as the sole engineer.',
    skills: ['Requirements framing', 'Problem definition', 'Product delivery'],
  },
  {
    id: 'software-engineering',
    title: 'Software engineering',
    lines: ['Software', 'engineering'],
    description: 'I develop Python REST services and internal tools for AI workflows and data products.',
    skills: ['Python', 'FastAPI', 'REST APIs'],
  },
  {
    id: 'solution-architecture',
    title: 'Solution architecture',
    lines: ['Solution', 'architecture'],
    description: 'I designed the architecture for an enterprise AI platform with grounded retrieval and intent routing.',
    skills: ['System design', 'RAG architecture', 'Intent routing'],
  },
  {
    id: 'technical-leadership',
    title: 'Technical leadership',
    lines: ['Technical', 'leadership'],
    description: 'I equip my team with internal tools, knowledge sessions, and technical guidance.',
    skills: ['Technical leadership', 'Mentoring', 'Knowledge sharing'],
  },
  {
    id: 'visual-design',
    title: 'Visual design',
    lines: ['Visual', 'design'],
    description: 'I use visual and interface design to make enterprise AI products clear and usable.',
    skills: ['Interface design', 'Visual hierarchy', 'Product experience'],
  },
];
