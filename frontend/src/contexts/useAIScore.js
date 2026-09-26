import { useContext } from "react";
import { AIScoreContext } from "./aiScoreStore.js";

export function useAIScore() {
  const context = useContext(AIScoreContext);
  if (!context) {
    throw new Error("useAIScore must be used within AIScoreProvider");
  }
  return context;
}
