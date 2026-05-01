import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'

// ─── AI Data ────────────────────────────────────────────────────────────────
const topPicks = [
  { id: 1, match: "98% MATCH", matchBg: "#D8B4FE", matchColor: "#000000", bg: "#D8B4FE", title: "Senior UX Architect", company: "Acme Corp" },
  { id: 2, match: "94% MATCH", matchBg: "#1A4D2E", matchColor: "#ffffff", bg: "#ffffff", title: "Lead Product Designer", company: "Growth Div" }
];

// ─── Kanban Data ────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  columns: {
    applied: { id: "applied", title: "Applied", badgeBg: "#000000", badgeColor: "#ffffff", op: 1, cardIds: ["card-1"] },
    interviewing: { id: "interviewing", title: "Interviewing", badgeBg: "#1A4D2E", badgeColor: "#ffffff", op: 1, cardIds: ["card-4"] },
    offered: { id: "offered", title: "Offered", badgeBg: "#D8B4FE", badgeColor: "#000000", op: 1, cardIds: ["card-6"] }
  },
  columnOrder: ["applied", "interviewing", "offered"],
  cards: {
    "card-1": { id: "card-1", role: "Product Designer", company: "Atlassian", time: "2d ago", bg: "#dbeafe", darkNode: false },
    "card-4": { id: "card-4", role: "Senior Designer", company: "Airbnb", time: "Tmrw", bg: "#ffffff", darkNode: true },
    "card-6": { id: "card-6", role: "Design Lead", company: "Google", time: "Offer", bg: "#fef9c3", darkNode: false }
  }
};

function RadialProgress({ percent = 85 }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * percent) / 100;

  return (
    <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto" }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1A4D2E" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="square" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{percent}%</span>
      </div>
    </div>
  );
}

export default function MergedDashboard() {
  // Placeholder check
  if (!FEATURES.dashboard) {
    return <ComingSoon pageName="Dashboard" description="Overview of your job search activity" />
  }

  useEffect(() => {
    document.title = "Dashboard — JobFor";
  }, []);

  const [data, setData] = useState(INITIAL_DATA);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];
    if (startColumn === finishColumn) {
      const newCardIds = Array.from(startColumn.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);
      const newColumn = { ...startColumn, cardIds: newCardIds };
      setData({ ...data, columns: { ...data.columns, [newColumn.id]: newColumn } });
      return;
    }
    const startCardIds = Array.from(startColumn.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = { ...startColumn, cardIds: startCardIds };
    const finishCardIds = Array.from(finishColumn.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, cardIds: finishCardIds };
    setData({ ...data, columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        
        .bento-card {
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px 0px #000000;
          padding: 24px;
          transition: transform 0.15s ease;
        }
        .bento-card:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px 0px #000000;
        }
        .bento-dark { background: #1A4D2E; color: #ffffff; }
        .bento-primary { background: #D8B4FE; color: #000000; }
        h1, h2, h3, h4 { font-family: 'Syne', sans-serif; font-weight: 800; text-transform: uppercase; }
        p, span, div { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "40px 24px" }}>
        
        <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "3rem", letterSpacing: "-0.05em", margin: 0 }}>Command Center</h1>
            <p style={{ fontWeight: 600, color: "#666", marginTop: "8px" }}>Your AI-powered career dashboard.</p>
          </div>
          <div style={{ backgroundColor: "#1A4D2E", color: "#fff", padding: "8px 16px", border: "2px solid #000", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined">auto_awesome</span> AI Active
          </div>
        </header>

        {/* BENTO GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px" }}>
          
          {/* STATS WIDGET (Span 4) */}
          <div className="bento-card bento-primary" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Active Applications</h3>
            <p style={{ fontSize: "4rem", fontWeight: 800, margin: "16px 0", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>14</p>
            <div style={{ display: "flex", gap: "16px", fontSize: "0.875rem", fontWeight: 700 }}>
              <span>2 Interviews</span> • <span>1 Offer</span>
            </div>
          </div>

          {/* AI TOP MATCH (Span 4) */}
          <div className="bento-card" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#1A4D2E", display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined">radar</span> Top AI Match
              </h3>
              <RadialProgress percent={98} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.5rem", margin: "16px 0 4px 0" }}>Senior UX Architect</h4>
              <p style={{ margin: 0, fontWeight: 700, color: "#666" }}>Acme Corp • Remote</p>
            </div>
          </div>

          {/* NEW AI ALERTS (Span 4) */}
          <div className="bento-card bento-dark" style={{ gridColumn: "span 4" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", color: "#D8B4FE" }}>AI Insights</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span className="material-symbols-outlined" style={{ color: "#D8B4FE" }}>trending_up</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Your profile views increased by 24% this week.</span>
              </li>
              <li style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span className="material-symbols-outlined" style={{ color: "#fca5a5" }}>warning</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Missing 'TypeScript' skill for 3 saved jobs.</span>
              </li>
            </ul>
          </div>

          {/* KANBAN BOARD (Span 12) */}
          <div className="bento-card" style={{ gridColumn: "span 12", overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: "1.5rem" }}>Pipeline</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={{ display: "flex", gap: "24px", minWidth: "900px" }}>
                {data.columnOrder.map((columnId) => {
                  const column = data.columns[columnId];
                  const cards = column.cardIds.map((cardId) => data.cards[cardId]);

                  return (
                    <div key={column.id} style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontWeight: 700, textTransform: "uppercase" }}>
                        {column.title}
                        <span style={{ backgroundColor: column.badgeBg, color: column.badgeColor, padding: "2px 8px", fontSize: "0.75rem" }}>
                          {cards.length}
                        </span>
                      </div>
                      
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                              minHeight: "200px",
                              backgroundColor: snapshot.isDraggingOver ? "#f3f4f6" : "rgba(249,250,251,0.5)",
                              border: "2px dashed #d1d5db",
                              padding: "12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "12px"
                            }}
                          >
                            {cards.map((card, index) => (
                              <Draggable key={card.id} draggableId={card.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      backgroundColor: card.darkNode ? "#1A4D2E" : "#ffffff",
                                      color: card.darkNode ? "#ffffff" : "#000000",
                                      border: "2px solid #000000",
                                      boxShadow: "2px 2px 0px 0px #000000",
                                      padding: "16px",
                                    }}
                                  >
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "1rem" }}>{card.role}</h4>
                                    <p style={{ margin: "0", fontSize: "0.875rem", opacity: 0.8 }}>{card.company}</p>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </div>

        </div>
      </main>
    </>
  );
}
