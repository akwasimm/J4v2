import React from 'react';

export default function Navbar({ 
  links, 
  rightContent, 
  activeLink, 
  bgClass = "bg-white", 
  maxWidthClass = "max-w-7xl",
  textColor = "text-gray-900" 
}) {
  return (
    <nav className={`border-b-2 border-black sticky top-0 z-50 ${bgClass}`}>
      <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-8">
            <a href="#" className="text-3xl font-extrabold tracking-tighter text-[#1A4D2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
              JobFor<span className="text-[#D8B4FE]">.</span>
            </a>
            {links && links.length > 0 && (
              <div className="hidden md:flex space-x-6 lg:space-x-8">
                {links.map((l) => {
                  const isActive = activeLink === l;
                  return (
                    <a
                      key={l}
                      href="#"
                      className={`font-medium transition-colors ${isActive ? "text-[#1A4D2E] underline decoration-4 decoration-[#D8B4FE]" : `${textColor} hover:text-[#1A4D2E]`}`}
                    >
                      {l}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {rightContent}
          </div>
        </div>
      </div>
    </nav>
  );
}
