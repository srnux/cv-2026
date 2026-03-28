import { useState } from 'react';

const Experience = () => {
  const [expanded, setExpanded] = useState(false);
  const experiences = [{
    title: 'Lead Software Engineer',
    company: 'Empro / AVIV Group GmbH',
    location: 'Hamburg, Germany · Remote',
    period: 'Sep 2024 - Present',
    description: 'Leading software engineering efforts, driving architectural decisions, and mentoring developers. Overseeing the full development lifecycle from technical planning to delivery while ensuring code quality and scalable system design.'
  }, {
    title: 'Senior Software Developer',
    company: 'immowelt GmbH / AVIV Group GmbH',
    location: 'Hamburg, Germany · Remote',
    period: 'Aug 2020 - Present',
    description: 'Designing and developing scalable web applications and microservices for a large real estate platform. Building features across the full stack using modern frameworks, optimizing performance, and contributing to CI/CD pipelines and cloud infrastructure.'
  }, {
    title: 'Senior Software Developer',
    company: 'neveling.net GmbH',
    location: 'Hamburg, Germany',
    period: 'Sep 2015 - Aug 2020',
    description: 'Developing and maintaining content management systems and custom web applications. Implementing responsive front-end solutions, building backend services, and integrating third-party APIs for diverse client projects.'
  }, {
    title: 'Senior Software Developer',
    company: 'Spencer Stuart',
    location: 'Dublin, Ireland',
    period: 'Jul 2014 - May 2015',
    description: 'Developing and enhancing an executive search and recruitment platform. Gathering user requirements, defining technical specifications, and delivering full-stack features to streamline candidate management and client engagement workflows.'
  }, {
    title: 'Team Lead, Principal Software Developer',
    company: 'Clarity Consulting',
    location: 'Rijeka, Croatia',
    period: 'Jan 2012 - Jul 2014',
    description: 'Leading a development team building and evolving the Clarity Connect product, a unified communications platform integrating with Microsoft Lync. Driving technical direction, coordinating sprint deliveries, and developing core features using .NET WPF, ASP.NET MVC, MS SQL, and UCMA.'
  }, {
    title: 'Head of Satellite Application Development',
    company: 'Erste Group Bank AG',
    location: 'Rijeka, Croatia',
    period: 'Jan 2008 - Jan 2012',
    description: 'Overseeing the development of satellite applications supporting a complex core banking platform. Building and integrating ancillary systems for online banking, reporting, and customer services using C# .NET, ASP.NET, and Oracle PL/SQL.'
  }, {
    title: 'Senior Software Developer',
    company: 'Multilink',
    location: 'Croatia',
    period: '2004 - 2008',
    description: 'Developing and maintaining a web portal and supporting services for T-Mobile, handling client requirements analysis and full-stack feature delivery.'
  }, {
    title: 'Software Developer',
    company: 'Euris',
    location: 'Trieste, Italy',
    period: 'May 2001 - Feb 2005',
    description: 'Building Windows desktop applications for the insurance sector and industrial support systems using VB6, C++, and MS SQL Server.'
  }];
  return <section id="experience" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Professional Experience
        </h2>
        <div className="space-y-12">
          {(expanded ? experiences : experiences.slice(0, 3)).map((exp, index) => <div key={index} className="flex flex-col md:flex-row border-t border-white pt-8">
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h3 className="text-2xl font-medium">{exp.title}</h3>
                <p className="text-xl font-light">{exp.company}</p>
                <p className="text-lg font-light text-gray-400">{exp.location}</p>
                <p className="text-lg font-light text-gray-400">{exp.period}</p>
              </div>
              <div className="w-full md:w-2/3">
                <p className="text-lg font-light leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>)}
        </div>
        <div className="text-center mt-12">
          <button onClick={() => setExpanded(!expanded)} className="text-lg font-light border border-white px-8 py-3 hover:bg-white hover:text-black transition-colors">
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>
    </section>;
};
export default Experience;