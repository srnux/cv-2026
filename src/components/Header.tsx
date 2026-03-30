import React, { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setHovered(e.clientY < window.innerHeight * 0.1);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const visible = scrolled || hovered;

  return (
    <header
      className={
        `fixed top-0 left-0 right-0 bg-black bg-opacity-90 z-50 transform transition-transform duration-300 ` +
        (visible ? 'translate-y-0' : '-translate-y-full')
      }
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center font-grotesk">
        <div className="flex items-center">
          <div className="mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="4" width="20" height="16" />
              <polyline points="7,9 11,12 7,15" />
              <line x1="13" y1="15" x2="17" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-light">Luka Engels</h1>
        </div>
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <a href="#home" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="#projects" className="hover:underline">
                Portfolio
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            <button onClick={() => window.open('/cv-luka-engels-de.html', '_blank')} className="text-sm font-light tracking-wider font-grotesk hover:underline">de</button> |
            <button onClick={() => window.open('/cv-luka-engels-en.html', '_blank')} className="text-sm font-light tracking-wider font-grotesk hover:underline">en</button>
          </div>
          <a href="#about" className="border px-4 py-1.5 text-sm font-light tracking-wider font-grotesk hover:bg-white hover:text-black transition">
            More
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;