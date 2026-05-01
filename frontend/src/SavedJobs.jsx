import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'
import { getMyApplications, deleteApplication, updateApplication, getSavedJobs } from './api/client'

// Mock collections for saved jobs
const collections = [
  { id: 1, icon: "all_inbox", label: "All Saved", count: 24, active: false, iconColor: "#1A4D2E" },
  { id: 2, icon: "priority_high", label: "Top Priority", count: 5, active: true, iconColor: "#000000" },
  { id: 3, icon: "language", label: "Remote Roles", count: 12, active: false, iconColor: "#1A4D2E" },
  { id: 4, icon: "rocket_launch", label: "Startup Tech", count: 7, active: false, iconColor: "#1A4D2E" },
];

// Applied jobs columns structure
const INITIAL_COLUMNS = {
  applied: { id: "applied", title: "Applied", badgeBg: "#000000", badgeColor: "#ffffff", cardIds: [] },
  viewed: { id: "viewed", title: "Viewed", badgeBg: "#000000", badgeColor: "#ffffff", cardIds: [] },
  interviewing: { id: "interviewing", title: "Interviewing", badgeBg: "#1A4D2E", badgeColor: "#ffffff", cardIds: [] },
  offered: { id: "offered", title: "Offered", badgeBg: "#D8B4FE", badgeColor: "#000000", cardIds: [] },
  closed: { id: "closed", title: "Closed", badgeBg: "#9ca3af", badgeColor: "#ffffff", cardIds: [] }
};

const COLUMN_ORDER = ["applied", "viewed", "interviewing", "offered", "closed"];

// Status to column mapping
const STATUS_TO_COLUMN = {
  "applied": "applied",
  "viewed": "viewed",
  "interviewing": "interviewing",
  "offered": "offered",
  "rejected": "closed",
  "withdrawn": "closed",
  "accepted": "offered"
};

export default function SavedJobs() {
  // Placeholder check
  if (!FEATURES.savedJobs) {
    return <ComingSoon pageName="Saved Jobs" description="View your bookmarked jobs" />
  }

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'applied' ? 'applied' : 'saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = activeTab === 'saved' ? "Saved Jobs — JobFor" : "Applied Jobs — JobFor";
  }, [activeTab]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedJobs();
    } else if (activeTab === 'applied') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchSavedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSavedJobs();
      const jobs = response.data || response || [];
      setSavedJobs(jobs);
    } catch (err) {
      setError('Failed to load saved jobs');
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyApplications();
      const apps = response.data || response || [];
      setApplications(apps);

      // Organize applications into columns based on status
      const newColumns = { ...INITIAL_COLUMNS };
      Object.keys(newColumns).forEach(key => {
        newColumns[key] = { ...newColumns[key], cardIds: [] };
      });

      apps.forEach((app, index) => {
        const columnId = STATUS_TO_COLUMN[app.status?.toLowerCase()] || "applied";
        if (newColumns[columnId]) {
          newColumns[columnId].cardIds.push(`card-${app.id || index}`);
        }
      });

      setColumns(newColumns);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await deleteApplication(appId);
      fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplication(appId, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'applied') {
      setSearchParams({ tab: 'applied' });
    } else {
      setSearchParams({});
    }
  };
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

        .view-toggle {
          display: inline-flex;
          background: #ffffff;
          border: 3px solid #000000;
          box-shadow: 4px 4px 0px 0px #000000;
          overflow: hidden;
        }

        .view-toggle-btn {
          padding: 10px 24px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .view-toggle-btn:hover {
          background-color: #f3f4f6;
        }

        .view-toggle-btn.active {
          background-color: #D8B4FE;
          color: #000000;
        }

        .view-toggle-btn:not(.active) {
          color: #6b7280;
        }

        .view-toggle-btn:first-child {
          border-right: 2px solid #000000;
        }

        /* Kanban Column Styles for Applied View */
        .kanban-column {
          background: #f9fafb;
          border: 3px solid #000000;
          min-width: 280px;
          max-width: 320px;
          display: flex;
          flex-direction: column;
        }

        .kanban-column-header {
          padding: 12px 16px;
          border-bottom: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kanban-badge {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 2px solid #000000;
        }

        .kanban-card {
          background: #ffffff;
          border: 2px solid #000000;
          margin: 12px;
          padding: 12px;
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .kanban-card:hover {
          box-shadow: 4px 4px 0px 0px #000000;
          transform: translateY(-2px);
          transition: all 0.15s ease;
        }

        .status-select {
          padding: 6px 10px;
          border: 2px solid #000000;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          background: #ffffff;
        }

        .status-select:focus {
          outline: none;
          box-shadow: 2px 2px 0px 0px #000000;
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

        {/* Toggle Button - Top Left */}
        <div style={{ marginBottom: "32px" }}>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${activeTab === 'saved' ? 'active' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                bookmark
              </span>
              Saved
            </button>
            <button
              className={`view-toggle-btn ${activeTab === 'applied' ? 'active' : ''}`}
              onClick={() => handleTabChange('applied')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                send
              </span>
              Applied
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'saved' ? (
          /* Saved Jobs View */
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                  sync
                </span>
                <p style={{ marginTop: '16px', fontWeight: 600 }}>Loading saved jobs...</p>
              </div>
            ) : error ? (
              <div className="shadow-neo" style={{ background: '#fee2e2', border: '4px solid #000000', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#dc2626' }}>{error}</p>
                <button
                  onClick={fetchSavedJobs}
                  className="shadow-neo-sm btn-hover"
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: '#ffffff',
                    border: '2px solid #000000',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="shadow-neo" style={{ background: '#ffffff', border: '4px solid #000000', padding: '48px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#D8B4FE' }}>
                  bookmark_border
                </span>
                <h3 style={{ marginTop: '24px', fontSize: '1.5rem' }}>No saved jobs yet</h3>
                <p style={{ marginTop: '12px', color: '#6b7280' }}>Start exploring and save jobs you're interested in!</p>
                <button
                  onClick={() => navigate('/discover')}
                  className="shadow-neo btn-hover"
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    background: '#D8B4FE',
                    border: '3px solid #000000',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer'
                  }}
                >
                  Discover Jobs
                </button>
              </div>
            ) : (
              <div
                className="jobs-grid"
                style={{ display: "grid", gap: "16px" }}
              >
                {savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="card-hover shadow-neo"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "4px solid #000000",
                      padding: "16px",
                      position: "relative",
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/job?id=${job.job_id}`)}
                  >
                    {/* Delete Button */}
                    <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                      <button
                        className="icon-btn icon-btn-delete shadow-neo-sm btn-hover"
                        title="Remove from saved"
                        style={{ width: "32px", height: "32px", backgroundColor: "#ffffff" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove from saved logic
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          delete_outline
                        </span>
                      </button>
                    </div>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: job.job?.company_logo ? 'transparent' : '#D8B4FE',
                          border: "2px solid #000000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {job.job?.company_logo ? (
                          <img src={job.job.company_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: "1.5rem", fontWeight: 900, fontFamily: "'Syne', sans-serif" }}>
                            {(job.job?.company || 'J').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 style={{ fontSize: "1.25rem", lineHeight: "1.2", fontFamily: "'Syne', sans-serif", marginBottom: "4px" }}>
                          {job.job?.title || 'Job Title'}
                        </h4>
                        <p style={{ color: "#4b5563", fontWeight: 700, fontSize: "0.875rem" }}>
                          {job.job?.company || 'Company'}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span className="tag">{job.job?.location || 'Location'}</span>
                      {job.match_score && (
                        <span className="tag-match">
                          <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>bolt</span>
                          {Math.round(job.match_score)}% Match
                        </span>
                      )}
                    </div>

                    {job.notes && (
                      <div style={{ marginTop: '12px', padding: '8px', background: '#f9fafb', border: '1px solid #000000', fontSize: '0.75rem' }}>
                        <span style={{ fontWeight: 700 }}>Note:</span> {job.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Applied Jobs Kanban View */
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>sync</span>
                <p style={{ marginTop: '16px', fontWeight: 600 }}>Loading applications...</p>
              </div>
            ) : error ? (
              <div className="shadow-neo" style={{ background: '#fee2e2', border: '4px solid #000000', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#dc2626' }}>{error}</p>
                <button
                  onClick={fetchApplications}
                  className="shadow-neo-sm btn-hover"
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    background: '#ffffff',
                    border: '2px solid #000000',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="shadow-neo" style={{ background: '#ffffff', border: '4px solid #000000', padding: '48px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#D8B4FE' }}>
                  send_and_archive
                </span>
                <h3 style={{ marginTop: '24px', fontSize: '1.5rem' }}>No applications yet</h3>
                <p style={{ marginTop: '12px', color: '#6b7280' }}>Start applying to jobs and track your progress here!</p>
                <button
                  onClick={() => navigate('/discover')}
                  className="shadow-neo btn-hover"
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    background: '#D8B4FE',
                    border: '3px solid #000000',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer'
                  }}
                >
                  Find Jobs to Apply
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
                {COLUMN_ORDER.map(columnId => {
                  const column = columns[columnId];
                  const columnApps = column.cardIds.map(cardId => {
                    const index = parseInt(cardId.split('-')[1]);
                    return applications[index];
                  }).filter(Boolean);

                  return (
                    <div key={columnId} className="kanban-column shadow-neo">
                      <div
                        className="kanban-column-header"
                        style={{ backgroundColor: column.badgeBg, color: column.badgeColor }}
                      >
                        <span style={{ fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{column.title}</span>
                        <span className="kanban-badge" style={{ backgroundColor: column.badgeBg, color: column.badgeColor }}>
                          {columnApps.length}
                        </span>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                        {columnApps.map((app) => (
                          <div key={app.id} className="kanban-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  backgroundColor: '#D8B4FE',
                                  border: '2px solid #000000',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.875rem',
                                  flexShrink: 0
                                }}
                              >
                                {(app.job?.company || 'J').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {app.job?.title || 'Job Title'}
                                </h5>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{app.job?.company || 'Company'}</p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                              <span className="tag" style={{ fontSize: '0.625rem', padding: '2px 6px' }}>{app.job?.location || 'Remote'}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <select
                                className="status-select"
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                style={{ flex: 1 }}
                              >
                                <option value="applied">Applied</option>
                                <option value="viewed">Viewed</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offered">Offered</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                              </select>
                              <button
                                onClick={() => handleDeleteApplication(app.id)}
                                className="icon-btn icon-btn-delete"
                                style={{ width: '28px', height: '28px' }}
                                title="Delete application"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                              </button>
                            </div>

                            {app.applied_at && (
                              <p style={{ fontSize: '0.625rem', color: '#9ca3af', marginTop: '8px' }}>
                                Applied: {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
