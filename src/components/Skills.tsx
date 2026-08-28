const skillCategories = [{
  id: 'skills-ai-agents',
  category: 'AI & Agents',
  lead: true,
  skills: [
    'Generative AI (GenAI)',
    'Large language models (LLMs)',
    'AI agents and multi-agent systems',
    'Agno',
    'Prompt and context engineering',
    'Claude skills, subagents, slash commands, hooks and rules',
    'Model Context Protocol (MCP) server design',
    'RAG pipelines',
    'Agent workflow architecture',
    'Guardrail and policy design',
    'Token-cost engineering',
  ],
}, {
  id: 'skills-languages',
  category: 'Languages',
  skills: [
    'TypeScript',
    'JavaScript',
    'C#',
    'Python',
    'SQL',
    'Elasticsearch Query Language',
    'HTML / CSS / Sass',
  ],
}, {
  id: 'skills-frontend',
  category: 'Frontend',
  skills: [
    'Angular',
    'React',
    'Design systems and component libraries',
    'Nx monorepos',
  ],
}, {
  id: 'skills-backend',
  category: 'Backend',
  skills: [
    'Node.js',
    'NestJS',
    '.NET Core',
    'REST',
    'Event-driven services',
  ],
}, {
  id: 'skills-cloud-devops',
  category: 'Cloud & DevOps',
  skills: [
    'AWS (Lambda, DynamoDB, S3, CloudFront, CDK)',
    'Azure (AKS)',
    'Kubernetes',
    'PostgreSQL',
    'Elasticsearch',
    'Docker',
    'GitHub Actions',
    'CI/CD',
  ],
}, {
  id: 'skills-practices',
  category: 'Practices',
  skills: [
    'Domain-Driven Design',
    'Microservices',
    'TDD',
    'Agile / Scrum',
    'Technical leadership and mentoring',
  ],
}];

const Skills = () => {
  return <section id="skills" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-4 text-center">
          Technical Expertise
        </h2>
        <p className="text-lg font-light text-center mb-12 max-w-3xl mx-auto">
          Everything below is in daily or recent production use, not a wish list.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map(category => <div key={category.id} id={category.id} className={`border border-black p-8${category.lead ? ' md:col-span-2' : ''}`}>
              <h3 className="text-2xl font-medium mb-6">{category.category}</h3>
              <ul className="flex flex-wrap gap-2">
                {category.skills.map(skill => <li key={skill} className="px-3 py-1.5 border border-black text-base font-light">
                    {skill}
                  </li>)}
              </ul>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Skills;
