import React from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout({ children }) {
  const [showFooter, setShowFooter] = React.useState(false);
  const hideTimeoutRef = React.useRef(null);

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
