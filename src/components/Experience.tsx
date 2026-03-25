const Experience = () => {
  const experiences = [{
    title: 'Senior Software Engineer',
    company: 'Tech Innovations Inc.',
    period: '2019 - Present',
    description: 'Lead developer for cloud-based solutions, managing a team of 5 engineers. Implemented TypeScript microservices architecture reducing deployment time by 40%.'
  }, {
    title: 'Full Stack Developer',
    company: 'Digital Solutions Ltd.',
    period: '2016 - 2019',
    description: 'Developed and maintained multiple client-facing applications. Spearheaded the migration from legacy systems to modern React-based architecture.'
  }, {
    title: 'Junior Developer',
    company: 'WebCraft Studios',
    period: '2014 - 2016',
    description: 'Contributed to front-end development using JavaScript and CSS. Collaborated with design teams to implement responsive web designs.'
  }];
  return <section id="experience" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Professional Experience
        </h2>
        <div className="space-y-12">
          {experiences.map((exp, index) => <div key={index} className="flex flex-col md:flex-row border-t border-white pt-8">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-2xl font-medium">{exp.title}</h3>
                <p className="text-xl font-light">{exp.company}</p>
                <p className="text-lg font-light text-gray-400">{exp.period}</p>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-lg font-light leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Experience;