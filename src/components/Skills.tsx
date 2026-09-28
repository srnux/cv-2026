import { useMessages } from '../i18n/context';

const Skills = () => {
  const m = useMessages().skills;
  return <section id="skills" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-4 text-center">
          {m.heading}
        </h2>
        <p className="text-lg font-light text-center mb-12 max-w-3xl mx-auto">
          {m.intro}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {m.categories.map(category => <div key={category.id} id={category.id} className={`border border-black p-8${category.lead ? ' md:col-span-2' : ''}`}>
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
