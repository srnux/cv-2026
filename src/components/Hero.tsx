import React from 'react';
const Hero = () => {
  return <section id="home" className="pt-24 min-h-screen flex items-center bg-black">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <img src="/images/luka-web-bw.jpg" alt="Professional portrait" className="w-full h-auto object-cover grayscale" />
        </div>
        <div className="w-full md:w-1/2 md:pl-12 flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wider mb-2">
            SKILLS
            <br />
            UNVEILED
          </h2>
          <h3 className="text-2xl font-light mt-8 mb-4">
            IT Recruiter's Delight
          </h3>
          <p className="text-lg font-light leading-relaxed mb-8">
            Welcome to Luka Engels CV, your gateway to a journey through the
            skills and experience of a software developer and team lead
            proficient in Typescript and AWS cloud services. Dive into the world
            of code and leadership showcased through creative illustrations and
            dynamic content.
          </p>
          <div>
            <a href="#about" className="inline-block border border-white px-8 py-3 hover:bg-white hover:text-black transition duration-300">
              Explore Now
            </a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;