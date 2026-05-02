import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NeoButton from "./components/NeoButton";

const NEO = { boxShadow: "4px 4px 0px 0px #000000" };
const MARQUEE_ITEMS = ["404 Error", "Path Lost", "404 Error", "Path Lost", "404 Error", "Path Lost", "404 Error", "Path Lost"];

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Page Not Found — JobFor";
  }, []);

  const navigate = useNavigate();

  return (
    <div
      className="bg-[#D8B4FE] min-h-screen flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.1,
        }}
      />

      {/* NAV */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-3xl font-extrabold tracking-tighter text-[#1A4D2E]" style={{ fontFamily: "'Syne', sans-serif" }}>
            JobFor<span className="text-black">.</span>
          </a>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative z-10 text-center">

        {/* Heading */}
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-black uppercase leading-none mb-4 tracking-tighter"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          404 -{" "}
          <span
            className="bg-white px-2 border-4 border-black inline-block"
            style={{ transform: "rotate(-1deg)", ...NEO }}
          >
            CAREER PATH
          </span>
          <br />NOT FOUND
        </h1>

        <p className="text-xl md:text-2xl font-medium text-black max-w-lg mb-10 mx-auto">
          Looks like this link is a dead end. Let's get you back on track!
        </p>

        {/* Robot illustration */}
        <div className="relative w-full max-w-md aspect-square mb-12 mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">

            {/* Robot body */}
            <div
              className="absolute w-64 h-80 bg-[#1A4D2E] border-4 border-black overflow-hidden"
              style={{ borderRadius: "100px 100px 0 0", ...NEO }}
            >
              {/* Neck slot */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-24 bg-white border-x-4 border-b-4 border-black rounded-b-lg"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-32 bg-[#D8B4FE] border-x-2 border-black"></div>
            </div>

            {/* Robot head */}
            <div
              className="absolute -top-10 w-48 h-48 bg-[#1A4D2E] border-4 border-black rounded-full flex flex-col items-center pt-12"
              style={NEO}
            >
              <div className="flex gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-black rounded-full"></div>
                  </div>
                ))}
              </div>
              {/* Mouth */}
              <div className="w-12 h-4 border-t-4 border-black mt-4 rounded-full"></div>
            </div>

            {/* Left arm */}
            <div className="absolute -left-4 top-1/2 w-24 h-24 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1A4D2E] border-4 border-black rounded-xl"></div>
              <div className="w-32 h-4 bg-black border-2 border-black rotate-45 translate-y-4"></div>
              <Spark className="top-20 right-0" />
            </div>

            {/* Right arm */}
            <div className="absolute -right-4 top-1/2 w-24 h-24 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#1A4D2E] border-4 border-black rounded-xl"></div>
              <div className="w-32 h-4 bg-black border-2 border-black -rotate-45 translate-y-4"></div>
              <Spark className="top-20 left-0" />
            </div>

            {/* Floating question marks */}
            <span
              className="material-symbols-outlined absolute -top-16 -right-4 text-7xl font-bold text-black"
              style={{ transform: "rotate(12deg)" }}
            >
              question_mark
            </span>
            <span
              className="material-symbols-outlined absolute top-0 -left-12 text-5xl font-bold text-black"
              style={{ transform: "rotate(-12deg)" }}
            >
              question_mark
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center mx-auto">
          <NeoButton 
            onClick={() => navigate('/')}
            className="bg-[#1A4D2E] text-white text-lg py-4 px-8 uppercase tracking-tight w-full sm:w-auto"
          >
            Back to Dashboard
          </NeoButton>
          <NeoButton 
            onClick={() => navigate('/opportunities')}
            className="bg-white text-black text-lg py-4 px-8 uppercase tracking-tight w-full sm:w-auto"
          >
            Search Jobs
          </NeoButton>
        </div>
      </main>

      {/* Bottom marquee bar */}
      <div className="relative h-20 bg-black border-t-2 border-black overflow-hidden whitespace-nowrap flex items-center shrink-0">
        <div className="flex items-center h-full space-x-12 opacity-50 animate-marquee" style={{ animation: "marquee 18s linear infinite" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((label, i) => (
            <span key={i} className="text-white text-xl font-bold uppercase flex items-center gap-2">
              {label}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>
    </div>
  );
}

function Spark({ className = "" }) {
  return (
    <div
      className={`absolute w-3 h-3 ${className}`}
      style={{
        background: "#FACC15",
        clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      }}
    />
  );
}
