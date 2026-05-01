import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'
const INITIAL_DATA = {
  columns: {
    applied: { id: "applied", title: "Applied", badgeBg: "#000000", badgeColor: "#ffffff", op: 1, cardIds: ["card-1", "card-2"] },
    viewed: { id: "viewed", title: "Viewed", badgeBg: "#000000", badgeColor: "#ffffff", op: 1, cardIds: ["card-3"] },
    interviewing: { id: "interviewing", title: "Interviewing", badgeBg: "#1A4D2E", badgeColor: "#ffffff", op: 1, cardIds: ["card-4", "card-5"] },
    offered: { id: "offered", title: "Offered", badgeBg: "#D8B4FE", badgeColor: "#000000", op: 1, cardIds: ["card-6"] },
    closed: { id: "closed", title: "Closed", badgeBg: "#9ca3af", badgeColor: "#ffffff", op: 0.6, cardIds: ["card-7"] }
  },
  columnOrder: ["applied", "viewed", "interviewing", "offered", "closed"],
  cards: {
    "card-1": {
      id: "card-1",
      role: "Product Designer",
      company: "Atlassian • Remote",
      time: "2 days ago",
      initial: "A",
      bg: "#dbeafe",
      icon: "schedule",
      status: "Awaiting Response",
      darkNode: false
    },
    "card-2": {
      id: "card-2",
      role: "Frontend Engineer",
      company: "Spotify • New York",
      time: "4 days ago",
      initial: "S",
      bg: "#dcfce7",
      icon: "done_all",
      status: "Applied",
      darkNode: false
    },
    "card-3": {
      id: "card-3",
      role: "Visual Designer",
      company: "Framer • Amsterdam",
      time: "Viewed Today",
      timeBg: "#D8B4FE",
      initial: "F",
      bg: "#f3e8ff",
      icon: "visibility",
      status: "Reviewing Resume",
      iconColor: "#7c3aed",
      darkNode: false
    },
    "card-4": {
      id: "card-4",
      role: "Senior Designer",
      company: "Airbnb • Remote",
      time: "Tomorrow",
      timeBg: "#D8B4FE",
      initial: "A",
      bg: "#ffffff",
      icon: "event",
      status: "Technical Round",
      darkNode: true
    },
    "card-5": {
      id: "card-5",
      role: "Product Lead",
      company: "Canva • Sydney",
      time: "Passed",
      initial: "C",
      bg: "#fee2e2",
      icon: "thumb_up",
      status: "Feedback: Strong",
      iconColor: "#1A4D2E",
      darkNode: false
    },
    "card-6": {
      id: "card-6",
      role: "Design Lead",
      company: "Google • Zurich",
      time: "New Offer",
      timeBg: "#D8B4FE",
      initial: "G",
      bg: "#fef9c3",
      icon: "celebration",
      status: "₹180k - Negotiating",
      iconColor: "#1A4D2E",
      darkNode: false,
      outline: "4px solid rgba(216,180,254,0.3)"
    },
    "card-7": {
      id: "card-7",
      role: "UI Designer",
      company: "Meta • Remote",
      time: "Closed",
      timeBg: "#000000",
      timeColor: "#ffffff",
      initial: "M",
      bg: "#e5e7eb",
      icon: "",
      status: "",
      darkNode: false,
      isClosed: true
    }
  }
};

export default function JobForDashboard() {
  // Placeholder check
  if (!FEATURES.appliedJobs) {
    return <ComingSoon pageName="Applied Jobs" description="Track your job applications" />
  }

  useEffect(() => {
    document.title = "Applied Jobs — JobFor";
  }, []);

  const [data, setData] = useState(INITIAL_DATA);
  const navigate = useNavigate();

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    if (startColumn === finishColumn) {
      const newCardIds = Array.from(startColumn.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, cardIds: newCardIds };
      setData({
        ...data,
        columns: { ...data.columns, [newColumn.id]: newColumn }
      });
      return;
    }

    const startCardIds = Array.from(startColumn.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = { ...startColumn, cardIds: startCardIds };

    const finishCardIds = Array.from(finishColumn.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishColumn, cardIds: finishCardIds };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    });
  };

  const removeCard = (cardId, columnId) => {
    // Remove from column array
    const column = data.columns[columnId];
    const newCardIds = column.cardIds.filter(id => id !== cardId);
    
    // Remove from state entirely
    const newCards = { ...data.cards };
    delete newCards[cardId];

    setData({
      ...data,
      columns: {
        ...data.columns,
        [column.id]: { ...column, cardIds: newCardIds }
      },
      cards: newCards
    });
  };

  // Helper to calculate total numbers dynamically based on state
  const totalCards = Object.keys(data.cards).length;
  const appliedCount = data.columns.applied.cardIds.length + data.columns.viewed.cardIds.length;
  const interviewCount = data.columns.interviewing.cardIds.length;
  const offeredCount = data.columns.offered.cardIds.length;

  return (
    <>
      {/* Google Fonts & Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #ffffff;
          color: #000000;
          margin: 0;
        }

        h1, h2, h3, h4, h5 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
        }

        .kanban-column {
          min-height: calc(100vh - 450px);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-size: 24px;
          line-height: 1;
        }

        .shadow-neo {
          box-shadow: 4px 4px 0px 0px #000000;
        }

        .shadow-neo-sm {
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .hover-lift {
          transition: transform 0.15s ease;
          cursor: grab;
        }

        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>

      {/* Main */}
      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "32px 24px" }}>
        
        <div className="main-layout" style={{ display: "flex", gap: "48px", marginTop: "32px" }}>
          
          {/* Main Content Area */}
          <div style={{ flex: 1, minWidth: 0 }}>

        {/* Stats + Funnel */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "32px", marginBottom: "48px" }}>
          <div style={{ gridColumn: "span 8", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div className="shadow-neo" style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", margin: 0 }}>Total</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "4px", fontFamily: "'Syne', sans-serif" }}>{totalCards}</p>
            </div>
            <div className="shadow-neo" style={{ backgroundColor: "#D8B4FE", border: "2px solid #000000", padding: "16px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#000000", margin: 0 }}>Applied</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "4px", fontFamily: "'Syne', sans-serif" }}>{appliedCount}</p>
            </div>
            <div className="shadow-neo" style={{ backgroundColor: "#1A4D2E", border: "2px solid #000000", padding: "16px", color: "#ffffff" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#bbf7d0", margin: 0 }}>Interview</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "4px", fontFamily: "'Syne', sans-serif" }}>{interviewCount}</p>
            </div>
            <div className="shadow-neo" style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#6b7280", margin: 0 }}>Offered</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "4px", color: "#1A4D2E", fontFamily: "'Syne', sans-serif" }}>{offeredCount}</p>
            </div>
          </div>

          {/* Funnel Widget */}
          <div className="shadow-neo" style={{ gridColumn: "span 4", backgroundColor: "#ffffff", border: "4px solid #000000", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "1.25rem", textTransform: "uppercase", letterSpacing: "-0.025em", margin: 0 }}>Application Funnel</h3>
              <span style={{ backgroundColor: "#dcfce7", color: "#1A4D2E", padding: "4px 12px", border: "2px solid #1A4D2E", fontSize: "0.75rem", fontWeight: 700 }}>62% RESPONSE</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ height: "16px", width: "100%", backgroundColor: "#f3f4f6", border: "2px solid #000000" }}>
                <div style={{ height: "100%", width: "85%", backgroundColor: "#1A4D2E", borderRight: "2px solid #000000" }} />
              </div>
              <div style={{ height: "16px", width: "100%", backgroundColor: "#f3f4f6", border: "2px solid #000000" }}>
                <div style={{ height: "100%", width: "25%", backgroundColor: "#D8B4FE", borderRight: "2px solid #000000" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div style={{ overflowX: "auto", paddingBottom: "32px" }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div style={{ display: "flex", gap: "24px", minWidth: "1200px" }}>
              
              {data.columnOrder.map((columnId) => {
                const column = data.columns[columnId];
                const cards = column.cardIds.map((cardId) => data.cards[cardId]);

                return (
                  <div key={column.id} style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "0 8px" }}>
                      <h4 style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                        {column.title}{" "}
                        <span style={{ backgroundColor: column.badgeBg, color: column.badgeColor, fontSize: "0.75rem", padding: "2px 8px" }}>
                          {cards.length}
                        </span>
                      </h4>
                      <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <span className="material-symbols-outlined" style={{ color: "#9ca3af" }}>more_horiz</span>
                      </button>
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="kanban-column"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            backgroundColor: snapshot.isDraggingOver ? "rgba(235, 235, 235, 0.8)" : "rgba(249,250,251,0.5)",
                            border: "2px dashed #d1d5db",
                            padding: "12px",
                            opacity: column.op,
                            filter: column.gray ? "grayscale(100%)" : "none",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          {cards.map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="shadow-neo-sm hover-lift"
                                  style={{
                                    ...provided.draggableProps.style,
                                    backgroundColor: card.darkNode ? "#1A4D2E" : (card.isClosed ? "#f3f4f6" : "#ffffff"),
                                    color: card.darkNode ? "#ffffff" : "#000000",
                                    border: "2px solid #000000",
                                    padding: "16px",
                                    outline: card.outline || "none",
                                    position: "relative"
                                  }}
                                >
                                  {/* Remove Button added to each card */}
                                  <button
                                    onClick={() => removeCard(card.id, column.id)}
                                    style={{
                                      position: "absolute",
                                      top: "8px",
                                      right: "8px",
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: 0,
                                      display: "flex"
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px", color: card.darkNode ? "#bbf7d0" : "#9ca3af" }}>close</span>
                                  </button>

                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", paddingRight: "20px" }}>
                                    <div style={{ width: "40px", height: "40px", backgroundColor: card.darkNode ? "#ffffff" : card.bg, border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000000" }}>
                                      {card.initial}
                                    </div>
                                    <span style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", backgroundColor: card.timeBg || "#f3f4f6", color: card.timeColor || "#000000", padding: "4px 8px", border: "1px solid #000000" }}>
                                      {card.time}
                                    </span>
                                  </div>
                                  <h5 style={{ fontWeight: 700, fontSize: "1.125rem", lineHeight: "1.2", marginBottom: "4px", marginTop: 0 }}>
                                    {card.role}
                                  </h5>
                                  <p style={{ fontSize: "0.875rem", color: card.darkNode ? "#bbf7d0" : "#4b5563", fontWeight: 500, margin: "0 0 12px 0" }}>
                                    {card.company}
                                  </p>

                                  {!card.isClosed && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: card.darkNode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.1)", color: card.iconColor || (card.darkNode ? "#ffffff" : "inherit") }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{card.icon}</span>
                                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.025em" }}>
                                        {card.status}
                                      </span>
                                    </div>
                                  )}
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
        </div> {/* End Main Content Area */}
          
        </div>
      </main>
    </>
  );
}
