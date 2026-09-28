import { useMessages } from '../i18n/context';

const About = () => {
  const m = useMessages().about;
  return <section id="about" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          {m.heading}
        </h2>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12">
            {m.paragraphs.map((paragraph, index) => <p key={index} className={`text-lg font-light leading-relaxed${index < m.paragraphs.length - 1 ? ' mb-6' : ''}`}>
                {paragraph}
              </p>)}
          </div>
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
              {m.facts.map(fact => <div key={fact.figure} className="p-6 border border-black">
                  <h3 className="text-xl font-medium mb-2">{fact.figure}</h3>
                  <p className="font-light">{fact.detail}</p>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default About;
