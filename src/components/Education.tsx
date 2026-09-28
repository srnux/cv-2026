import { useMessages } from '../i18n/context';

const Education = () => {
  const m = useMessages().education;
  return <section id="education" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          {m.heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-medium mb-8 border-b border-white pb-2">
              {m.academicHeading}
            </h3>
            <div className="space-y-8">
              {m.items.map((item, index) => <div key={index} className="mb-6">
                  <h4 className="text-xl font-medium">{item.degree}</h4>
                  <p className="text-lg font-light">{item.institution}</p>
                  <p className="text-md font-light text-gray-400 mb-2">
                    {item.period}
                  </p>
                  <p className="font-light">{item.description}</p>
                </div>)}
            </div>
            <h3 className="text-2xl font-medium mt-12 mb-6 border-b border-white pb-2">
              {m.certificationsHeading}
            </h3>
            <ul className="space-y-4">
              {m.certifications.map((cert, index) => <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span className="text-lg font-light">{cert}</span>
                </li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-medium mb-8 border-b border-white pb-2">
              {m.languagesHeading}
            </h3>
            <dl className="space-y-4">
              {m.languages.map(language => <div key={language.name} className="flex items-baseline justify-between border-b border-gray-800 pb-2">
                  <dt className="text-lg font-light">{language.name}</dt>
                  <dd className="text-lg font-light text-gray-400 font-grotesk tracking-wider">{language.level}</dd>
                </div>)}
            </dl>
            <h3 className="text-2xl font-medium mt-12 mb-6 border-b border-white pb-2">
              {m.citizenshipHeading}
            </h3>
            <p className="text-lg font-light">{m.citizenship}</p>
            <p className="text-lg font-light text-gray-400 mt-2">
              {m.citizenshipNote}
            </p>
            <h3 className="text-2xl font-medium mt-12 mb-6 border-b border-white pb-2">
              {m.baseHeading}
            </h3>
            <p className="text-lg font-light">{m.base}</p>
            <p className="text-lg font-light text-gray-400 mt-2">
              {m.baseNote}
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default Education;
