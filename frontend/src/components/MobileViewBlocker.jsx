import { useEffect, useState } from 'react';

export default function MobileViewBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isMobile) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

      <div
        className="bg-white border-2 border-black rounded-2xl p-8 max-w-md w-full text-center"
        style={{ boxShadow: '8px 8px 0px 0px #000000' }}
      >
        <div className="w-20 h-20 bg-[#D8B4FE] rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-black">
          <span className="material-icons-outlined text-4xl text-black">desktop_windows</span>
        </div>

        <h1
          className="text-3xl font-bold text-black mb-4 uppercase"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Desktop <span className="text-[#1A4D2E]">View</span> Required
        </h1>

        <p className="text-gray-600 mb-6 text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          For the best experience, please open JobFor on a desktop or laptop computer.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="material-icons-outlined text-[#1A4D2E]">check_circle</span>
            <span className="text-gray-700 font-medium text-sm">Full dashboard access</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="material-icons-outlined text-[#1A4D2E]">check_circle</span>
            <span className="text-gray-700 font-medium text-sm">AI-powered job matching</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <span className="material-icons-outlined text-[#1A4D2E]">check_circle</span>
            <span className="text-gray-700 font-medium text-sm">Resume analysis tools</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">
            Current screen width: <span className="font-mono font-bold text-[#D8B4FE]">{window.innerWidth}px</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#1A4D2E] hover:bg-green-900 text-white font-bold py-3 px-6 border-2 border-black transition-all"
            style={{ boxShadow: '4px 4px 0px 0px #000000' }}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-sm">refresh</span>
              Check Again
            </span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        JobFor — Your Dream Job Awaits
      </p>
    </div>
  );
}
