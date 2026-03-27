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
        <a href="#about" className="bg-white text-black px-6 py-1.5 text-sm font-light tracking-wider hover:bg-gray-200 transition">
          More ...
        </a>
      </div>
    </header>
  );
};

export default Header;