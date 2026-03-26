const Hero = () => {
  return <section id="home" className="min-h-screen flex items-center bg-black">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <img src="/images/luka-web-bw.jpg" alt="Professional portrait" className="w-full h-auto object-cover grayscale" />
        </div>
        <div className="w-full md:w-1/2 md:pl-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wider mb-4">
            Luka Engels
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light mb-4">
             Software Development Team Lead
          </h3>
          <div className="flex flex-wrap gap-4 mb-8 font-grotesk">
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">Team leadership</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">TypeScript</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">AWS</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">Cloud architecture</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">Microservices</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">Node.JS</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">Angular</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">SCRUM</span>
            <span className="border px-4 py-1.5 text-sm font-light tracking-wider">GitHub</span>
          </div>
          <p className="text-lg font-light leading-relaxed mb-8">
            A decade of building scalable cloud solutions, leading high-performing engineering teams, and shipping production-grade TypeScript microservices on AWS. From hands-on code, strategic leadership to deployment. Turning complex distributed systems into reliable, maintainable platforms that deliver real impact.
          </p>
          <div>
            <a href="#about" className="inline-block border border-white px-8 py-3 hover:bg-white hover:text-black transition duration-300">
              More ...
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;