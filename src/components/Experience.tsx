import { useState } from 'react';

type Role = {
  title: string;
  company: string;
  context: string;
  location: string;
  period: string;
  description: string;
  highlights?: string[];
};

const Experience = () => {
  const [expanded, setExpanded] = useState(false);
  const experiences: Role[] = [{
    title: 'Lead Software Engineer',
    company: 'Empro (Whise Group)',
    context: 'Real estate CRM, 6,000+ customers, 95,000+ users, 4.2M+ managed properties. Formed within AVIV Group in Sep 2024, now part of Whise.',
    location: 'Hamburg, Germany · Fully remote',
    period: 'Sep 2024 – Present',
    description: 'Leading engineering direction for a modern SaaS CRM: architectural decisions, the full delivery lifecycle from technical planning to release, and mentoring of developers.',
    highlights: [
      'We built and maintain an agentic SDLC platform with a harness of Claude skills, slash commands, hooks and rules, plus MCP servers and RAG retrieval over our repositories, pipelines and issue tracking.',
      'We delivered LLM-powered inquiry automation and Elasticsearch-based search across the platform.',
      'We shipped a customer-facing agentic UI on the Agno framework in Python, extending agent capability from internal delivery tooling into the product itself.',
      'Our team owns an Angular design system of 87 components in an Nx monorepo. Infrastructure spans AWS with CDK and Azure Kubernetes Service, with PostgreSQL.',
      'Technical lead for six developers within an eleven-person cross-functional team; co-designed the agent workflow underpinning delivery.',
    ],
  }, {
    title: 'Senior Software Developer (Full-Stack)',
    company: 'immowelt GmbH / AVIV Group GmbH',
    context: "One of Germany's largest property portals.",
    location: 'Hamburg, Germany · Fully remote',
    period: 'Aug 2020 – Sep 2024',
    description: 'Designing and building scalable microservices and web applications for a high-traffic real estate platform.',
    highlights: [
      'We built cloud services on AWS following domain-driven design, with functional, unit and integration test coverage.',
      'We contributed to the CI/CD pipelines and worked in Scrum across backlog refinement, sprint planning, wireframes and prototypes.',
    ],
  }, {
    title: 'Senior Software Developer',
    company: 'neveling.net GmbH (now Neveling Reply)',
    context: 'Software development agency.',
    location: 'Hamburg, Germany',
    period: 'Sep 2015 – Aug 2020',
    description: 'Building and maintaining CMS solutions and custom web applications in C#, JavaScript and Sitecore. Responsive front-ends, backend services and third-party API integrations, with release versioning and CI/CD.',
  }, {
    title: 'Senior Software Developer',
    company: 'Spencer Stuart',
    context: 'Global executive search.',
    location: 'Dublin, Ireland',
    period: 'Jul 2014 – May 2015',
    description: 'Developing an executive search and recruitment platform in C#, JavaScript and T-SQL, and establishing CI/CD for continuous delivery.',
  }, {
    title: 'Team Lead & Principal Software Developer',
    company: 'Clarity Consulting (acquired by Perficient Inc.)',
    context: 'Software consulting.',
    location: 'Rijeka, Croatia',
    period: 'Jan 2012 – Jul 2014',
    description: 'Leading the team building Clarity Connect, a unified communications platform integrating with Microsoft Lync. Driving technical direction, coordinating sprint delivery, defining engineering standards, and running training and performance reviews.',
  }, {
    title: 'Head of Satellite Application Development',
    company: 'Erste Group Bank AG',
    context: 'Banking and finance.',
    location: 'Rijeka, Croatia',
    period: 'Jul 2008 – Jan 2012',
    description: 'Leading a team of 10 developers building satellite applications around a complex core banking platform: online banking, reporting and customer services on C# .NET, ASP.NET and Oracle PL/SQL. Owning technical direction and delivery across the satellite application portfolio.',
  }, {
    title: 'Senior Software Developer',
    company: 'Multilink',
    context: 'Telecommunications.',
    location: 'Croatia',
    period: 'Dec 2004 – Jul 2008',
    description: 'Building a web portal and supporting services for T-Mobile, handling client requirements analysis and full-stack feature delivery.',
  }, {
    title: 'Software Developer',
    company: 'Euris',
    context: 'On-site at Allianz S.p.A.',
    location: 'Trieste, Italy',
    period: 'Dec 2000 – Dec 2004',
    description: 'Building Windows desktop applications for the insurance sector and industrial support systems using VB6, C++ and MS SQL Server.',
  }];
  return <section id="experience" className="section-padding bg-black text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          Professional Experience
        </h2>
        <div className="space-y-12">
          {experiences.map((exp, index) => <div key={index} className={`flex flex-col md:flex-row border-t border-white pt-8${!expanded && index >= 3 ? ' print-show hidden' : ''}`}>
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
            {expanded ? 'Show less' : 'Show earlier roles'}
          </button>
        </div>
      </div>
    </section>;
};
export default Experience;
