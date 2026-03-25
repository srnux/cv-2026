const Projects = () => {
  const projects = [{
    title: 'Enterprise Cloud Migration',
    description: 'Led the migration of legacy systems to AWS cloud infrastructure, implementing microservices architecture and CI/CD pipelines.',
    technologies: ['AWS', 'Docker', 'Node.js', 'Terraform']
  }, {
    title: 'E-commerce Platform',
    description: 'Developed a scalable e-commerce solution with real-time inventory management and payment processing integration.',
    technologies: ['React', 'Redux', 'Express', 'MongoDB']
  }, {
    title: 'Analytics Dashboard',
    description: 'Created an interactive data visualization dashboard for business intelligence, featuring real-time updates and customizable reports.',
    technologies: ['TypeScript', 'D3.js', 'Next.js', 'GraphQL']
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