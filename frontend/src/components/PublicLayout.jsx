import React from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout({ children }) {
  const [showFooter, setShowFooter] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const hideTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isAtBottom) {
        // Show immediately when at bottom
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setShowFooter(true);
      } else {
        // Delay hiding by 3 seconds
        if (showFooter && !hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setShowFooter(false);
            hideTimeoutRef.current = null;
          }, 3000);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showFooter]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-5">
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

        <div
          className="bg-white border-2 border-black rounded-xl p-6 max-w-sm w-full text-center"
          style={{ boxShadow: '6px 6px 0px 0px #000000' }}
        >
          <div className="w-16 h-16 bg-[#D8B4FE] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
            <span className="material-icons-outlined text-3xl text-black">desktop_windows</span>
          </div>

          <h1
            className="text-2xl font-bold text-black mb-3 uppercase"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Desktop <span className="text-[#1A4D2E]">View</span> Required
          </h1>

          <p className="text-gray-600 mb-4 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            For the best experience, please open JobFor on a desktop or laptop computer.
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="material-icons-outlined text-[#1A4D2E] text-sm">check_circle</span>
              <span className="text-gray-700 font-medium text-xs">Full dashboard access</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="material-icons-outlined text-[#1A4D2E] text-sm">check_circle</span>
              <span className="text-gray-700 font-medium text-xs">AI-powered job matching</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <span className="material-icons-outlined text-[#1A4D2E] text-sm">check_circle</span>
              <span className="text-gray-700 font-medium text-xs">Resume analysis tools</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-xs mb-3">
              Current screen width: <span className="font-mono font-bold text-[#D8B4FE]">{window.innerWidth}px</span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#1A4D2E] hover:bg-green-900 text-white font-bold py-2 px-4 border-2 border-black transition-all text-sm"
              style={{ boxShadow: '3px 3px 0px 0px #000000' }}
            >
              <span className="flex items-center justify-center gap-1">
                <span className="material-icons-outlined text-xs">refresh</span>
                Check Again
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-gray-400 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          JobFor — Your Dream Job Awaits
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main style={{ flex: 1, paddingTop: 80 }}>
        {children}
      </main>
      {showFooter && <PublicFooter />}
    </div>
  );
}
