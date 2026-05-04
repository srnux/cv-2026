const About = () => {
  return <section id="about" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          About Me
        </h2>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <p className="text-lg font-light leading-relaxed mb-6">
              Over two decades of experience in software development and team
              leadership helped me shape a unique blend of technical expertise and
              people management skills. A long journey through the tech
              industry has built a profound understanding of development
              lifecycles, cloud architecture, and effective team dynamics.
            </p>
            <p className="text-lg font-light leading-relaxed mb-6">
              A genuine drive for crafting elegant solutions to complex
              problems, paired with a constant focus on modern software
              architecture. Analytical thinking balanced with creative
              problem-solving, always with an eye toward scalable and
              maintainable code.
            </p>
            <p className="text-lg font-light leading-relaxed">
              Deep expertise in Large Language
              Models and their practical application in software development.
              From integrating LLM-powered features into production systems to
              leveraging AI-assisted coding workflows, these tools are applied
              to accelerate delivery, improve code quality, and unlock new
              product capabilities — always with a mindful eye toward the
              architectural and ethical considerations they bring.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="p-6 border border-black">
                <h3 className="text-xl font-medium mb-2">Vision</h3>
                <p className="font-light">
                  Creating innovative solutions that make a meaningful impact
                </p>
              </div>
              <div className="p-6 border border-black">
                <h3 className="text-xl font-medium mb-2">Mission</h3>
                <p className="font-light">
                  Delivering excellence through thoughtful design and robust
                  code
                </p>
              </div>
              <div className="p-6 border border-black">
                <h3 className="text-xl font-medium mb-2">Values</h3>
                <p className="font-light">
                  Integrity, collaboration, continuous learning
                </p>
              </div>
              <div className="p-6 border border-black">
                <h3 className="text-xl font-medium mb-2">Approach</h3>
                <p className="font-light">
                  User-centered, detail-oriented, future-proof
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default About;