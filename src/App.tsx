import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Education from './components/Education';
import Projects from './components/Projects';
import Writing from './components/Writing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { LangProvider } from './i18n/context';
import type { Lang } from './i18n/lang';

export function App({ lang }: { lang: Lang }) {
  return <LangProvider lang={lang}>
    <div className="font-inter bg-black text-white min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Education />
        <Projects />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </div>
  </LangProvider>;
}
