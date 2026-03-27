const Skills = () => {
  const skillCategories = [{
    category: 'Programming Languages',
    skills: ['TypeScript', 'JavaScript', 'C#']
  }, {
    category: 'Frameworks & Libraries',
    skills: ['Node.js','Angular','NestJS','Express', 'Nx']
  }, {
    category: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Azure']
  }, {
    category: 'Methodologies',
    skills: ['Agile', 'Scrum', 'TDD', 'DDD', 'Microservices', 'Onion Architecture', 'Event-Driven Architecture']
  }, {
    category: 'Tools',
    skills: ['VS Code', 'Claude Code','Git', 'GitHub - Code, Actions', 'Jira', 'Confluence', ]
  }];
  return <section id="skills" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Technical Expertise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => <div key={index} id={`skills-${category.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="border border-black p-8">
              <h3 className="text-2xl font-medium mb-6">{category.category}</h3>
              <div className="space-y-4">
                {category.skills.map((skill, skillIndex) => <div key={skillIndex} className="flex items-center">
                    <div className="w-full">
                      <p className="text-lg font-light mb-2">{skill}</p>
                      <div className="w-full bg-gray-200 h-2">
                        <div className="bg-black h-2" style={{
                    width: `${Math.floor(Math.random() * 30) + 70}%`
                  }}></div>
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Skills;