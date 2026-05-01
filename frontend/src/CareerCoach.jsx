import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./components/MessageBubble";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'

export default function CareerCoach() {
  // Placeholder check
  if (!FEATURES.careerCoach) {
    return <ComingSoon pageName="Career Coach" description="Chat with your AI career coach" />
  }

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { sessionId, title }
  const [isDeleting, setIsDeleting] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // On mount: restore session and load sidebar
  useEffect(() => {
    const savedSessionId = localStorage.getItem("lume_session_id");
    if (savedSessionId) {
      setActiveSessionId(savedSessionId);
      loadChatHistory(savedSessionId);
    }
    fetchAllSessions();
    // Auto focus input
    inputRef.current?.focus();
    // Set page title
    document.title = "Lume — Career Intelligence | JobFor";
  }, []);

  // Persist session_id to localStorage whenever it changes
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("lume_session_id", activeSessionId);
    }
  }, [activeSessionId]);


  // Fetch all sessions for sidebar
  const fetchAllSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const token = localStorage.getItem('auth_token');
      if (token) {
        const res = await fetch('http://localhost:8000/api/v1/coach/sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load specific chat history
  const loadChatHistory = async (sessionId) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Backend returns session with messages array
        const res = await fetch(`http://localhost:8000/api/v1/coach/sessions/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const session = await res.json();
          // Backend returns session with messages array
          const messages = session.messages || [];
          const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: msg.id,
            alreadyDisplayed: true // Mark history as already displayed
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // On initial page load with no messages — stay at top
  useEffect(() => {
    if (messages.length === 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);


  const sendMessage = async (text) => {
    const userText = (typeof text === 'string' ? text : input).trim();
    if (!userText || loading) return;
    setInput("");
    inputRef.current?.focus();

    const userMsg = { role: "user", content: userText, alreadyDisplayed: true };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      
      const res = await fetch("http://localhost:8000/api/v1/coach/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          content: userText,
          session_id: activeSessionId
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error response:", errorText);
        throw new Error(`API error: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      const reply = data.response || "Sorry, I couldn't process that. Please try again.";

      // Save the session_id returned by backend
      const returnedSessionId = data.session_id;
      
      if (!activeSessionId) {
        // This was a new session — save it
        setActiveSessionId(returnedSessionId);
        localStorage.setItem("lume_session_id", returnedSessionId);
        
        // Refresh sidebar to show new session
        await fetchAllSessions();
      }

      // Add assistant message with typing animation enabled
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          alreadyDisplayed: false // Will animate
        },
      ]);
      
      // Refresh sessions after each message to update metadata
      await fetchAllSessions();
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: error.message.includes("Authentication") ? "Please log in to use the Career Coach." : `Connection error: ${error.message}. Check console for details.`,
          alreadyDisplayed: true // Error messages show instantly
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mark message as displayed after typing animation completes
  const handleAnimationComplete = (messageIndex) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[messageIndex]) {
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          alreadyDisplayed: true
        };
      }
      return newMessages;
    });
  };

  // Scroll to bottom during typing animation
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = async () => {
    // Save current session to sidebar BEFORE clearing
    if (activeSessionId && messages.length > 0) {
      await fetchAllSessions();
    }
    
    // Clear current chat state
    setMessages([]);
    
    // Clear active session
    setActiveSessionId(null);
    localStorage.removeItem("lume_session_id");
    inputRef.current?.focus();
  };

  const handleSelectSession = async (sessionId) => {
    if (sessionId === activeSessionId) return;
    
    // Save reference to current session in sidebar
    if (activeSessionId && messages.length > 0) {
      await fetchAllSessions();
    }
    
    // Switch to selected session
    setActiveSessionId(sessionId);
    localStorage.setItem("lume_session_id", sessionId);
    setMessages([]);
    
    // Load that session's history
    await loadChatHistory(sessionId);
    inputRef.current?.focus();
  };

  const handleDeleteSession = async (sessionId, event) => {
    event.stopPropagation(); // Prevent triggering session selection
    
    // Find session title for confirmation
    const session = sessions.find(s => s.session_uuid === sessionId);
    setDeleteConfirm({
      sessionId,
      title: session?.title || "New Conversation"
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    const sessionIdToDelete = deleteConfirm.sessionId;
    setDeleteConfirm(null); // Close modal immediately
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const res = await fetch(`http://localhost:8000/api/v1/coach/sessions/${sessionIdToDelete}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete session");
      }
      
      // If deleted session was active, clear it
      if (activeSessionId === sessionIdToDelete) {
        setActiveSessionId(null);
        localStorage.removeItem("lume_session_id");
        setMessages([]);
      }
      
      // Refresh sessions list
      await fetchAllSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="lume-page-container"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      <style>{`
        .lume-page-container {
          display: flex;
          height: 100%;
          min-height: 0;
          min-width: 0;
          overflow: hidden;
          background: #ffffff;
        }

        .lume-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #f5f5f0;
          color: #111827;
          border-right: 2px solid #000000;
          flex-shrink: 0;
          overflow: hidden;
          min-height: 0;
        }

        .sidebar-header {
          padding: 12px;
          flex-shrink: 0;
          border-bottom: 2px solid #000000;
        }

        .new-chat-btn {
          width: 100%;
          padding: 10px 16px;
          background: #1A4D2E;
          color: white;
          border: 2px solid #000000;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }

        .new-chat-btn:hover {
          background: #D8B4FE;
          color: #000000;
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .sessions-list {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 8px;
        }

        .sessions-list::-webkit-scrollbar {
          width: 4px;
        }
        .sessions-list::-webkit-scrollbar-thumb {
          background: #1A4D2E;
          border-radius: 4px;
        }

        .session-item {
          padding: 8px 10px;
          border-radius: 0;
          cursor: pointer;
          margin-bottom: 2px;
          transition: all 0.15s ease;
          border: 2px solid transparent;
        }

        .session-item:hover {
          background: #D8B4FE;
          border-color: #000000;
        }

        .session-item.active {
          background: #D8B4FE;
          border-color: #000000;
        }

        .session-title {
          font-size: 13px;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 600;
        }

        .session-time {
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
        }

        .delete-session-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.15s ease;
          opacity: 0;
        }

        .session-item:hover .delete-session-btn {
          opacity: 1;
        }

        .delete-session-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .delete-modal {
          background: #ffffff;
          border: 2px solid #000000;
          box-shadow: 4px 4px 0px 0px #000000;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          font-family: 'Space Grotesk', sans-serif;
        }

        .delete-modal h3 {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
          font-family: 'Syne', sans-serif;
        }

        .delete-modal p {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }

        .delete-modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .delete-modal-btn {
          padding: 10px 20px;
          border: 2px solid #000000;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }

        .delete-modal-btn.cancel {
          background: #ffffff;
          color: #111827;
        }

        .delete-modal-btn.cancel:hover {
          background: #f3f4f6;
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .delete-modal-btn.confirm {
          background: #dc2626;
          color: white;
        }

        .delete-modal-btn.confirm:hover {
          background: #b91c1c;
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .lume-chat-area {
          flex: 1;
          min-width: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
        }

        .lume-chat-header {
          padding: 12px 16px;
          border-bottom: 2px solid #000000;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          background: #ffffff;
        }

        .lume-chat-header h3 {
          font-size: 16px;
          font-weight: 900;
          color: #1A4D2E;
          margin: 0;
          text-transform: uppercase;
          font-family: 'Syne', sans-serif;
        }

        .lume-messages-container {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .lume-messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .lume-messages-container::-webkit-scrollbar-thumb {
          background: #D8B4FE;
          border-radius: 4px;
        }

        .lume-input-area {
          padding: 12px 16px;
          border-top: 2px solid #000000;
          flex-shrink: 0;
          background: #ffffff;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .lume-input-area input {
          flex: 1;
          padding: 10px 16px;
          border: 2px solid #000000;
          border-radius: 0;
          font-size: 14px;
          outline: none;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 500;
        }

        .lume-input-area input:focus {
          border-color: #D8B4FE;
          box-shadow: 2px 2px 0px 0px #D8B4FE;
        }

        .lume-input-area button {
          padding: 10px 20px;
          background: #1A4D2E;
          color: white;
          border: 2px solid #000000;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }

        .lume-input-area button:hover {
          background: #D8B4FE;
          color: #000000;
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .lume-input-area button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .welcome-container {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .welcome-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 900;
          color: #1A4D2E;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-family: 'Syne', sans-serif;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 32px;
          max-width: 400px;
          line-height: 1.5;
        }

        .suggested-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          max-width: 500px;
        }

        .suggested-prompt-btn {
          padding: 8px 16px;
          background: #f5f5f0;
          border: 2px solid #000000;
          border-radius: 0;
          font-size: 13px;
          color: #111827;
          cursor: pointer;
          transition: all 0.15s ease;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
        }

        .suggested-prompt-btn:hover {
          background: #D8B4FE;
          border-color: #000000;
          color: #000000;
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .message {
          max-width: 70%;
          padding: 10px 14px;
          margin-bottom: 8px;
          border-radius: 0;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: 'Space Grotesk', sans-serif;
        }

        .message.user {
          background: #1A4D2E;
          color: white;
          margin-left: auto;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px 0px #000000;
        }

        .message.assistant {
          background: #f5f5f0;
          color: #111827;
          margin-right: auto;
          border: 2px solid #000000;
          box-shadow: 2px 2px 0px 0px #000000;
          position: relative;
        }

        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1.2em;
          background: #1A4D2E;
          margin-left: 2px;
          animation: blink 0.7s infinite;
          vertical-align: text-bottom;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .skip-typing-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #1A4D2E;
          color: white;
          border: 2px solid #000000;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }

        .skip-typing-btn:hover {
          background: #D8B4FE;
          color: #000000;
          transform: scale(1.05);
        }

        .thinking-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }

        .thinking-indicator .dot {
          width: 8px;
          height: 8px;
          background: #1A4D2E;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .thinking-indicator .dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .thinking-indicator .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* SIDEBAR */}
      <div className="lume-sidebar hidden lg:flex">
        <div className="sidebar-header">
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
            Lume AI Coach
          </div>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <span>+</span> New Chat
          </button>
        </div>
        <div className="sessions-list">
          {isLoadingSessions ? (
            <div style={{ padding: "12px", fontSize: "12px", color: "#6b7280" }}>Lume is thinking...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: "12px", fontSize: "12px", color: "#6b7280" }}>No chats yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.session_uuid}
                className={`session-item ${
                  activeSessionId === session.session_uuid ? "active" : ""
                }`}
                onClick={() => handleSelectSession(session.session_uuid)}
                style={{ position: "relative" }}
              >
                <div className="session-title">
                  {session.title || "New Conversation"}
                </div>
                <div className="session-time">
                  {formatRelativeTime(session.last_active)}
                </div>
                <button
                  className="delete-session-btn"
                  onClick={(e) => handleDeleteSession(session.session_uuid, e)}
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="lume-chat-area">
        <div className="lume-chat-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="48" height="48" viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" role="img">
              <defs>
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&amp;display=swap');
                </style>
              </defs>
              <circle cx="16" cy="24" r="7" fill="none" stroke="#0F172A" stroke-width="2.2"/>
              <circle cx="16" cy="24" r="2" fill="#0F172A"/>
              <line x1="21" y1="19" x2="33" y2="7" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
              <line x1="23" y1="22" x2="35" y2="15" stroke="#0F172A" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
              <line x1="19" y1="17" x2="26" y2="5" stroke="#0F172A" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
              <text x="48" y="28" font-family="Inter, Poppins, system-ui, sans-serif" font-weight="600" font-size="24" letter-spacing="1.2" fill="#0F172A">Lume</text>
            </svg>
            Lume AI Coach
          </h3>
        </div>

        <div
          className="lume-messages-container"
          ref={messagesContainerRef}
        >
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-icon">
                <svg width="128" height="128" viewBox="0 0 180 40" xmlns="http://www.w3.org/2000/svg" role="img">
                  <defs>
                    <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&amp;display=swap');
                    </style>
                  </defs>
                  <circle cx="16" cy="24" r="7" fill="none" stroke="#0F172A" stroke-width="2.2"/>
                  <circle cx="16" cy="24" r="2" fill="#0F172A"/>
                  <line x1="21" y1="19" x2="33" y2="7" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round"/>
                  <line x1="23" y1="22" x2="35" y2="15" stroke="#0F172A" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
                  <line x1="19" y1="17" x2="26" y2="5" stroke="#0F172A" stroke-width="1.4" stroke-linecap="round" opacity="0.5"/>
                  <text x="48" y="28" font-family="Inter, Poppins, system-ui, sans-serif" font-weight="600" font-size="24" letter-spacing="1.2" fill="#0F172A">Lume</text>
                </svg>
              </div>
              <div className="welcome-title">Hi, I'm Lume </div>
              <div className="welcome-subtitle">
                I'm here to illuminate your career path.
              </div>
              <div className="welcome-subtitle" style={{ fontSize: "13px", marginTop: "12px" }}>
                Ask me anything about your career.<br/>
                I already know your skills and gaps.
              </div>
              <div className="suggested-prompts">
                <button
                  className="suggested-prompt-btn"
                  onClick={() => sendMessage("Review my skills and career fit")}
                >
                  📊 Review my skills
                </button>
                <button
                  className="suggested-prompt-btn"
                  onClick={() => sendMessage("Help me prepare for interviews")}
                >
                  🎯 Interview prep
                </button>
                <button
                  className="suggested-prompt-btn"
                  onClick={() => sendMessage("What jobs match my profile?")}
                >
                  💼 Job matches
                </button>
                <button
                  className="suggested-prompt-btn"
                  onClick={() => sendMessage("Help me improve my resume")}
                >
                  📝 Resume tips
                </button>
                <button
                  className="suggested-prompt-btn"
                  onClick={() => sendMessage("Why was I rejected?")}
                >
                  💡 Why was I rejected?
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  message={msg}
                  isLatest={i === messages.length - 1}
                  onAnimationComplete={() => handleAnimationComplete(i)}
                  onScrollToBottom={scrollToBottom}
                />
              ))}
              {loading && (
                <div className="message assistant thinking-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6b7280" }}>Lume is analyzing...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <div className="lume-input-area">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lume anything about your career..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? "●●●" : "Send"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Chat?</h3>
            <p>
              Are you sure you want to delete "{deleteConfirm.title}"? 
              This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button className="delete-modal-btn cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-modal-btn confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
