import { createContext, useContext, useState, useCallback } from "react";

const AIScoreContext = createContext(null);

export function AIScoreProvider({ children }) {
  const [aiScore, setAIScore] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const updateAIScore = useCallback((score) => {
    setAIScore(score);
    setLastUpdated(new Date().toISOString());
  }, []);

  const clearAIScore = useCallback(() => {
    setAIScore(null);
    setLastUpdated(null);
  }, []);

  const value = {
    aiScore,
    lastUpdated,
    updateAIScore,
    clearAIScore,
  };

  return (
    <AIScoreContext.Provider value={value}>
      {children}
    </AIScoreContext.Provider>
  );
}

export function useAIScore() {
  const context = useContext(AIScoreContext);
  if (!context) {
    throw new Error("useAIScore must be used within AIScoreProvider");
  }
  return context;
}
