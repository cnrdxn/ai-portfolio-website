const references = [
  { href: '#project-enterprise-ai', names: ['Enterprise AI Answers Service', 'enterprise AI answers platform', 'company-wide AI answers platform'] },
  { href: '#project-iterative-topic-resolver', names: ['Iterative Topic Resolver', 'Topic Resolver'] },
  { href: '#project-wifi-fraud-detection', names: ['WiFi Sharing Fraud Detection', 'fraud detection work', 'production fraud-model development'] },
  { href: '#project-house-butler', names: ['House Butler'] },
  { href: '#experience-data-science', names: ['streaming-app forecasting workflow'] },
];

const aliases = references.flatMap(reference => reference.names.map(name => ({ name, href: reference.href })));
const pattern = new RegExp(`(${aliases.map(alias => alias.name).sort((a, b) => b.length - a.length).join('|')})`, 'gi');

export function ProjectReferences({ text }: { text: string }) {
  return <>{text.split(pattern).map((part, index) => {
    const reference = aliases.find(alias => alias.name.toLowerCase() === part.toLowerCase());
    return reference ? <a className="project-reference" href={reference.href} key={index}>{part}</a> : part;
  })}</>;
}
