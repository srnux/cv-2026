const Projects = () => {
  const projects = [{
    title: 'Empro – Real Estate CRM',
    description: 'Development of a modern SaaS CRM platform for real estate brokers, featuring AI-powered inquiry automation, search profile matching, AI-generated property descriptions, and calendar/email integrations to streamline daily operations.',
    technologies: ['Angular', 'TypeScript', 'Node.js', 'AWS', 'AI/ML', 'DynamoDB', 'Elasticsearch']
  }, {
    title: 'Nivea – Portal & Web Shop',
    description: 'Feature development for the Nivea customer portal and web shop, including product catalogue pages, shopping cart functionality, loyalty programme integration, and CMS-driven content management across multiple markets.',
    technologies: ['Sitecore CMS', '.NET','C#','SCSS', 'REST API', 'Azure']
  }, {
    title: 'Spencer Stuart – Executive Search Platform',
    description: 'Development and maintenance of an internal platform for Spencer Stuart employees worldwide, streamlining daily business operations including executive search workflows, consultant collaboration tools, and internal data management across multiple regions.',
    technologies: ['.NET', 'C#', 'MS SQL', 'REST API', 'MS SQL Server']
  }];
  return <section id="projects" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Portfolio Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            Discuss Your Project
          </a>
        </div>
      </div>
    </section>;
};
export default Projects;