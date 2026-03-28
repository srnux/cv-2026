const Skills = () => {
  const skillCategories = [{
    category: 'Programming Languages',
    skills: [
      { name: 'TypeScript', percentage: 95 },
      { name: 'JavaScript', percentage: 90 },
      { name: 'C#', percentage: 75 },
      { name: 'SQL', percentage: 70 },
    ]
  }, {
    category: 'Frameworks & Libraries',
    skills: [
      { name: 'Node.js', percentage: 90 },
      { name: 'Angular', percentage: 90 },
      { name: 'React', percentage: 60 },
      { name: 'NestJS', percentage: 90 },
      { name: 'AWS CDK', percentage: 80 },
      { name: 'Express', percentage: 60 },
      { name: 'Nx', percentage: 78 },
      { name: 'Elasticsearch', percentage: 75 },
    ]
  }, {
    category: 'Cloud & DevOps',
    skills: [
      { name: 'AWS', percentage: 80 },
      { name: 'Docker', percentage: 60 },
      { name: 'Azure', percentage: 65 },
    ]
  }, {
    category: 'Methodologies',
    skills: [
      { name: 'Agile', percentage: 92 },
      { name: 'Scrum', percentage: 90 },
      { name: 'TDD', percentage: 85 },
      { name: 'DDD', percentage: 80 },
      { name: 'Microservices', percentage: 85 },
      { name: 'Onion Architecture', percentage: 78 },
      { name: 'Event-Driven Architecture', percentage: 80 },
    ]
  }, {
    category: 'Tools',
    skills: [
      { name: 'VS Code', percentage: 95 },
      { name: 'Claude Code', percentage: 90 },
      { name: 'Git', percentage: 90 },
      { name: 'GitHub - Code, Actions', percentage: 80 },
      { name: 'Jira', percentage: 80 },
      { name: 'Confluence', percentage: 78 },
    ]
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
                      <p className="text-lg font-light mb-2">{skill.name}</p>
                      <div className="w-full bg-gray-200 h-2">
                        <div className="bg-black h-2" style={{ width: `${skill.percentage ?? 100}%` }}></div>
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