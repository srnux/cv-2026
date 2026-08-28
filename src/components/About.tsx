const facts = [
  {
    figure: 'Full stack',
    detail: 'Angular and React at the front, Node.js, NestJS and .NET Core behind them, and the data layer underneath. Shipping at every layer, not only coordinating the people who do.',
  },
  {
    figure: 'AWS and Azure',
    detail: 'Event-driven serverless on AWS with Lambda, DynamoDB, S3, CloudFront and CDK, alongside Azure Kubernetes Service, PostgreSQL and Elasticsearch. Infrastructure as code, CI/CD by default.',
  },
  {
    figure: '6,000+ customers',
    detail: 'The real estate CRM we build serves more than 95,000 users and over 4.2 million managed properties.',
  },
  {
    figure: '11-person team',
    detail: 'Six developers, two QA engineers, two product owners and a scrum master. I hold the technical direction and lead the developers.',
  },
];

const About = () => {
  return <section id="about" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          About Me
        </h2>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <p className="text-lg font-light leading-relaxed mb-6">
              25 years in software development and team leadership, across real estate SaaS,
              banking, insurance and telecommunications. As Lead Software Engineer I hold the
              technical direction for a modern SaaS CRM for real estate brokers and I lead six
              developers inside an eleven-person cross-functional team.
            </p>
            <p className="text-lg font-light leading-relaxed mb-6">
              Our team builds and maintains the agentic SDLC that delivers that product. The harness
              layer is the set of Claude skills, slash commands, hooks and rules the team works
              through, with Model Context Protocol servers and RAG retrieval connecting agents to
              our repositories, pipelines and issue tracking. A stakeholder-approved prototype
              enters the pipeline through specification extraction; agents then groom, implement,
              review and test, while hooks and rules enforce our standards so throughput does not
              turn into verification debt.
            </p>
            <p className="text-lg font-light leading-relaxed mb-6">
              We also took that capability into the product itself, shipping a customer-facing
              agentic UI on the Agno framework. None of it would survive contact with production
              without ordinary engineering discipline underneath.
            </p>
            <p className="text-lg font-light leading-relaxed">
              That discipline is where most of the 25 years went, and the work has always spanned
              both ends of the stack: Angular and React interfaces, Node.js, NestJS and .NET Core
              services behind them, and the schemas, queues and indexes underneath. Today that
              means domain-driven design and event-driven serverless architecture on AWS, using
              Lambda, DynamoDB, S3, CloudFront and CDK, alongside Azure Kubernetes Service,
              PostgreSQL and Elasticsearch, with infrastructure as code, tests that mean something,
              and CI/CD people actually trust. Our team also owns an Angular design system of 87
              components in an Nx monorepo.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
              {facts.map(fact => <div key={fact.figure} className="p-6 border border-black">
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
