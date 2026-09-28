import { useState } from 'react';
import { useMessages } from '../i18n/context';

const Experience = () => {
  const [expanded, setExpanded] = useState(false);
  const m = useMessages().experience;
  return <section id="experience" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          {m.heading}
        </h2>
        <div className="space-y-12">
          {m.roles.map((exp, index) => <div key={index} className={`flex flex-col md:flex-row border-t border-white pt-8${!expanded && index >= 3 ? ' print-show hidden' : ''}`}>
              <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-8">
                <h3 className="text-2xl font-medium">{exp.title}</h3>
                <p className="text-xl font-light">{exp.company}</p>
                <p className="text-lg font-light text-gray-400">{exp.location}</p>
                <p className="text-lg font-light text-gray-400">{exp.period}</p>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-sm font-light text-gray-400 mb-3">{exp.context}</p>
                <p className="text-lg font-light leading-relaxed">
                  {exp.description}
                </p>
                {exp.highlights && <ul className="mt-4 space-y-2">
                    {exp.highlights.map((item, i) => <li key={i} className="text-lg font-light leading-relaxed pl-5 relative before:content-['·'] before:absolute before:left-0 before:text-gray-400">
                        {item}
                      </li>)}
                  </ul>}
              </div>
            </div>)}
        </div>
        <div className="text-center mt-12">
          <button onClick={() => setExpanded(!expanded)} className="text-lg font-light border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors">
            {expanded ? m.showLess : m.showEarlier}
          </button>
        </div>
      </div>
    </section>;
};
export default Experience;
