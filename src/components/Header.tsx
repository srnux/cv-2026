import React, { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={
        `fixed top-0 left-0 right-0 bg-black bg-opacity-90 z-50 transform transition-transform duration-300 ` +
        (visible ? 'translate-y-0' : '-translate-y-full')
      }
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="2" width="20" height="20" />
              <line x1="2" y1="2" x2="22" y2="22" />
              <line x1="2" y1="22" x2="22" y2="2" />
            </svg>
          </div>
          <h1 className="text-xl font-light">Luka Engels CV</h1>
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
                Book Online
              </a>
            </li>
            <li>
              <a href="#projects" className="hover:underline">
                Portfolio
              </a>
            </li>
          </ul>
        </nav>
        <a href="#about" className="bg-white text-black px-6 py-2 rounded-full text-sm hover:bg-gray-200 transition">
          Learn More
        </a>
      </div>
    </header>
  );
};

export default Header;