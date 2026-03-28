const About = () => {
  return <section id="about" className="section-padding bg-white text-black">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-center">
          About Me
        </h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-12">
            <p className="text-lg font-light leading-relaxed mb-6">
              With over two decades of experience in software development and team
              leadership, I bring a unique blend of technical expertise and
              people management skills to the table. My journey in the tech
              industry has equipped me with a profound understanding of
              development lifecycles, cloud architecture, and effective team
              dynamics.
            </p>
            <p className="text-lg font-light leading-relaxed">
              I am passionate about creating elegant solutions to complex
              problems and staying at the forefront of modern software architecture. My
              approach combines analytical thinking with creative
              problem-solving, always with an eye toward scalable and
              maintainable code.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <div className="grid grid-cols-2 gap-4">
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