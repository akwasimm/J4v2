import React from "react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";

export default function PublicLayout({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PublicNavbar />
      <main style={{ flex: 1, paddingTop: 80 }}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
