const focusAreas = [
  { label: 'Agentic AI', href: '#skills-ai-agents' },
  { label: 'LLM platforms', href: '#skills-ai-agents' },
  { label: 'MCP servers', href: '#skills-ai-agents' },
  { label: 'RAG pipelines', href: '#skills-ai-agents' },
  { label: 'TypeScript', href: '#skills-languages' },
  { label: 'Python', href: '#skills-languages' },
  { label: 'AWS', href: '#skills-cloud-devops' },
  { label: 'Azure & Kubernetes', href: '#skills-cloud-devops' },
  { label: 'Full stack', href: '#about' },
  { label: 'Node.js / NestJS', href: '#skills-backend' },
  { label: 'Angular', href: '#skills-frontend' },
  { label: 'Team leadership', href: '#skills-practices' },
];

const Hero = () => {
  return <section id="home" className="h-screen flex items-center bg-black overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="w-full md:w-1/2 h-screen px-2">
          <img src="/images/luka-web-bw.jpg" alt="Luka Engels, Lead Software Engineer, Hamburg" className="w-full h-full object-contain grayscale" />
        </div>
        <div className="w-full md:w-1/2 px-4 md:px-8 md:pl-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wider mb-4">
            Luka Engels
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light mb-2">
            Lead Software Engineer
          </h3>
          <p className="text-base md:text-lg font-light tracking-wide text-gray-400 mb-6 font-grotesk">
            Agentic AI &amp; LLM Platforms · TypeScript / AWS · Hamburg, fully remote
          </p>

          <p className="text-lg font-light leading-relaxed mb-8">
            25 years of production software across real estate SaaS, banking, insurance and
            telecommunications, the last six fully remote. Today my team builds and maintains an
            agentic SDLC platform: AI agents on large language models, with a harness of Claude
            skills, commands, hooks and rules that our engineers work through every day. It holds up
            in production because the foundation underneath is ordinary engineering discipline,
            domain-driven design and event-driven serverless architecture on AWS.
          </p>
          <div className="flex flex-wrap gap-4 mb-8 font-grotesk">
            {focusAreas.map(area => <a key={area.label} href={area.href} className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">{area.label}</a>)}
            <a href="#about" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">...</a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
