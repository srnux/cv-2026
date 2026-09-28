import { useMessages } from '../i18n/context';

const Hero = () => {
  const m = useMessages().hero;
  return <section id="home" className="min-h-screen md:h-screen flex items-center bg-black md:overflow-hidden">
      <div className="flex flex-col md:flex-row w-full md:h-full pb-12 md:pb-0">
        <div className="w-full shrink-0 h-[45vh] md:h-screen md:w-1/2 px-2 mb-8 md:mb-0">
          <img src="/images/luka-web-bw.jpg" alt={m.imageAlt} className="w-full h-full object-contain grayscale" />
        </div>
        <div className="w-full md:w-1/2 px-4 md:px-8 md:pl-12 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wider mb-4">
            Luka Engels
          </h2>
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light mb-2">
            {m.title}
          </h3>
          <p className="text-base md:text-lg font-light tracking-wide text-gray-400 mb-6 font-grotesk">
            {m.tagline}
          </p>

          <p className="text-lg font-light leading-relaxed mb-8">
            {m.intro}
          </p>
          <div className="flex flex-wrap gap-4 md:mb-8 font-grotesk">
            {m.focusAreas.map(area => <a key={area.label} href={area.href} className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">{area.label}</a>)}
            <a href="#about" aria-label={m.moreLabel} className="border px-4 py-1.5 text-sm font-light tracking-wider hover:bg-white hover:text-black transition">...</a>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
