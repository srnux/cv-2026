const Skills = () => {
  const skillCategories = [{
    category: 'Programming Languages',
    skills: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C#']
  }, {
    category: 'Frameworks & Libraries',
    skills: ['React', 'Node.js', 'Express', 'Next.js', 'Django']
  }, {
    category: 'Cloud & DevOps',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
  }, {
    category: 'Tools & Methodologies',
    skills: ['Git', 'Agile', 'Scrum', 'TDD', 'DDD']
  }];
  return <section id="skills" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Technical Expertise
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => <div key={index} className="border border-black p-8">
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