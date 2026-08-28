const Projects = () => {
  const projects = [{
    title: 'Agentic SDLC platform',
    description: 'The delivery platform our team built and maintains for the CRM below. A harness of Claude skills, slash commands, hooks and rules that engineers work through daily, with MCP servers and RAG retrieval connecting agents to repositories, pipelines and issue tracking. Used every day by an eleven-person cross-functional team.',
    technologies: ['Claude skills, hooks & rules', 'MCP servers', 'RAG', 'TypeScript', 'Python', 'GitHub Actions'],
  }, {
    title: 'Empro — Real estate CRM',
    description: 'A modern SaaS CRM for real estate brokers, serving over 6,000 customers, 95,000 users and 4.2 million managed properties. We deliver LLM-powered inquiry automation, search profile matching, AI-generated property descriptions, Elasticsearch-based search, and calendar and email integrations, alongside a customer-facing agentic UI built on the Agno framework.',
    technologies: ['Angular', 'TypeScript', 'NestJS', 'AWS CDK', 'DynamoDB', 'Elasticsearch', 'Agno', 'Azure AKS', 'PostgreSQL'],
  }, {
    title: 'immowelt — Property portal',
    description: "Scalable microservices and web applications for one of Germany's largest property portals. We built cloud services on AWS following domain-driven design, with functional, unit and integration test coverage, and contributed to the CI/CD pipelines that shipped them.",
    technologies: ['TypeScript', 'Node.js', 'AWS', 'Microservices', 'DDD', 'CI/CD'],
  }, {
    title: 'Nivea — Portal & Web Shop',
    description: 'Feature development for the Nivea customer portal and web shop. We built product catalogue pages, shopping cart functionality, loyalty programme integration, and CMS-driven content management across multiple markets, on Sitecore and .NET with Azure underneath.',
    technologies: ['Sitecore CMS', '.NET', 'C#', 'SCSS', 'REST API', 'Azure'],
  }];
  return <section id="projects" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Portfolio Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8">
          {projects.map((project, index) => <div key={index} className="border border-black p-8 flex flex-col">
              <h3 className="text-2xl font-medium mb-4">{project.title}</h3>
              <p className="text-lg font-light mb-6 flex-grow">
                {project.description}
              </p>
              <div>
                <h4 className="text-lg font-medium mb-2">Technologies</h4>
                <div className="flex flex-wrap">
                  {project.technologies.map((tech, techIndex) => <span key={techIndex} className="mr-2 mb-2 px-3 py-1 border border-black text-sm">
                      {tech}
                    </span>)}
                </div>
              </div>
            </div>)}
        </div>
        <div className="mt-12 text-center">
          <a href="#contact" className="inline-block border border-black px-8 py-3 hover:bg-black hover:text-white transition duration-300">
            Get in touch
          </a>
        </div>
      </div>
    </section>;
};
export default Projects;
