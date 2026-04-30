import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const jobsData = [
  {
    id: 1,
    letter: "A",
    bgColor: "#D8B4FE",
    textColor: "#000000",
    title: "Senior Product Designer",
    company: "Atlassian",
    location: "Remote",
    match: "94%",
    checked: false,
    hasNote: false,
  },
  {
    id: 2,
    letter: "S",
    bgColor: "#FACC15",
    textColor: "#000000",
    title: "UX Researcher",
    company: "Spotify",
    location: "Stockholm, SE",
    match: "88%",
    checked: false,
    hasNote: true,
  },
  {
    id: 3,
    letter: "F",
    bgColor: "#1A4D2E",
    textColor: "#ffffff",
    title: "Lead Visual Designer",
    company: "Framer",
    location: "Amsterdam, NL",
    match: "91%",
    checked: true,
    hasNote: false,
  },
  {
    id: 4,
    letter: "G",
    bgColor: "#a855f7",
    textColor: "#ffffff",
    title: "Staff Designer",
    company: "GitHub",
    location: "Remote",
    match: "97%",
    checked: true,
    hasNote: false,
  },
  {
    id: 5,
    letter: "N",
    bgColor: "#dbeafe",
    textColor: "#000000",
    title: "Principal Researcher",
    company: "Notion",
    location: "San Francisco, US",
    match: "82%",
    checked: true,
    hasNote: false,
  },
];

const collections = [
  { id: 1, icon: "all_inbox", label: "All Saved", count: 24, active: false, iconColor: "#1A4D2E" },
  { id: 2, icon: "priority_high", label: "Top Priority", count: 5, active: true, iconColor: "#000000" },
  { id: 3, icon: "language", label: "Remote Roles", count: 12, active: false, iconColor: "#1A4D2E" },
  { id: 4, icon: "rocket_launch", label: "Startup Tech", count: 7, active: false, iconColor: "#1A4D2E" },
];

export default function SavedJobs() {
  useEffect(() => {
    document.title = "Saved Jobs — JobFor";
  }, []);

  const [jobs, setJobs] = useState(jobsData);
  const navigate = useNavigate();
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #ffffff;
          color: #000000;
        }

        h1, h2, h3, h4, h5 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
        }

        .shadow-neo {
          box-shadow: 4px 4px 0px 0px #000000;
        }

        .shadow-neo-lg {
          box-shadow: 8px 8px 0px 0px #000000;
        }

        .shadow-neo-sm {
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .card-hover {
          transition: box-shadow 0.15s ease;
        }

        .card-hover:hover {
          box-shadow: 8px 8px 0px 0px #000000;
        }

        .btn-hover:hover {
          transform: translateY(2px);
          box-shadow: none;
        }

        .icon-btn {
          width: 36px;
          height: 36px;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .icon-btn:hover {
          background-color: #D8B4FE;
        }

        .icon-btn-delete:hover {
          background-color: #f87171;
        }

        .collection-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          font-weight: 700;
          text-decoration: none;
          color: #000000;
          border: 2px solid transparent;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .collection-link:hover {
          border-color: #000000;
          background-color: #f9fafb;
        }

        .collection-link.active {
          background-color: #D8B4FE;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .create-btn {
          width: 100%;
          margin-top: 24px;
          padding: 12px;
          background: #ffffff;
          border: 4px solid #000000;
          box-shadow: 2px 2px 0px 0px #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
        }

        .create-btn:hover {
          box-shadow: none;
          transform: translate(2px, 2px);
        }

        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #000000;
          background: #ffffff;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }

        .checkbox-custom:checked {
          background-color: #1A4D2E;
        }

        .checkbox-custom:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 13px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .checkbox-white {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff;
          background: transparent;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }

        .checkbox-white:checked {
          background-color: #D8B4FE;
        }

        .checkbox-white:checked::after {
          content: '✓';
          position: absolute;
          color: black;
          font-size: 13px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .tag {
          background-color: #f3f4f6;
          border: 2px solid #000000;
          padding: 2px 8px;
          font-size: 0.625rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .tag-match {
          background-color: #1A4D2E;
          color: #ffffff;
          border: 2px solid #000000;
          padding: 2px 8px;
          font-size: 0.625rem;
          font-weight: 900;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .user-name { display: none; }
          .main-grid { flex-direction: column; }
          .aside { width: 100% !important; }
          .jobs-grid { grid-template-columns: 1fr !important; }
          .header-row { flex-direction: column; align-items: flex-start; }
          .h1-size { font-size: 2.5rem !important; }
        }

        @media (min-width: 768px) {
          .jobs-grid { grid-template-columns: repeat(2, 1fr); }
          .h1-size { font-size: 3rem; }
        }

        @media (min-width: 1280px) {
          .jobs-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Note: Top Navbar is handled by AppLayout automatically */}

      {/* Main */}
      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px 24px" }}>

        {/* Body: Content + Sidebar */}
        <div
          className="main-layout"
          style={{ display: "flex", flexWrap: "wrap", gap: "48px", marginTop: "32px" }}
        >
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, width: "100%" }}>

            {/* Jobs Grid */}
            <div
              className="jobs-grid"
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="card-hover shadow-neo"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "4px solid #000000",
                    padding: "16px",
                    position: "relative",
                  }}
                >
                  {/* Delete Button */}
                  <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                    <button
                      className="icon-btn icon-btn-delete shadow-neo-sm btn-hover"
                      title="Delete"
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#ffffff",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        // Deletion logic hooks
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                        delete_outline
                      </span>
                    </button>
                  </div>

                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: job.bgColor,
                        border: "2px solid #000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 900,
                          color: job.textColor,
                          fontFamily: "'Syne', sans-serif",
                        }}
                      >
                        {job.letter}
                      </span>
                    </div>

                    <div>
                      <h4
                        style={{
                          fontSize: "1.25rem",
                          lineHeight: "1.2",
                          fontFamily: "'Syne', sans-serif",
                          marginBottom: "4px",
                        }}
                      >
                        {job.title}
                      </h4>
                      <p
                        style={{
                          color: "#4b5563",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {job.company}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "16px",
                    }}
                  >
                    <span className="tag">{job.location}</span>
                    <span className="tag-match">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "12px" }}
                      >
                        bolt
                      </span>
                      {job.match} Match
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      </main>


    </>
  );
}
