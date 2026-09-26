import { useState, useCallback } from "react";
import { AIScoreContext } from "./aiScoreStore.js";

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
