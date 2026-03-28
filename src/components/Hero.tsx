const Hero = () => {
  return <section id="home" className="h-screen flex items-center bg-black overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="w-full md:w-1/2 h-screen px-2">
          <img src="/images/luka-web-bw.jpg" alt="Professional portrait" className="w-full h-full object-contain grayscale" />
        </div>
        <div className="w-full md:w-1/2 px-4 md:px-8 md:pl-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wider mb-4">
            Luka Engels
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light mb-4">
             Software Development Team Lead
          </h3>
          
          <p className="text-lg font-light leading-relaxed mb-8">
            A decade of building scalable cloud solutions, leading high-performing engineering teams, and shipping production-grade TypeScript microservices on AWS. From hands-on code, strategic leadership to deployment. Turning complex distributed systems into reliable, maintainable platforms that deliver real impact.
          </p><div className="flex flex-wrap gap-4 mb-8 font-grotesk">
            <a href="#about" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Team leadership</a>
            <a href="#skills-programming-languages" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">TypeScript</a>
            <a href="#skills-cloud-devops" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">AWS</a>
            <a href="#skills-cloud-devops" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Cloud architecture</a>
            <a href="#skills-methodologies" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Microservices</a>
            <a href="#skills-frameworks-libraries" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Node.JS</a>
            <a href="#skills-frameworks-libraries" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Angular</a>
            <a href="#skills-frameworks-libraries" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">Elasticsearch</a>
            <a href="#skills-methodologies" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">SCRUM</a>
            <a href="#skills-tools" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">GitHub</a>
            <a href="#about" className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">...</a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;