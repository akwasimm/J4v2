import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook for word-by-word typing animation
 * @param {string} fullText - The complete text to animate
 * @param {boolean} enabled - Whether typing effect is enabled
 * @param {number} speed - Speed in ms per word (default: 25ms)
 * @returns {Object} { displayedText, isTyping, isComplete, skipToEnd }
 */
export function useTypingEffect(fullText, enabled = true, speed = 25) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const timerRef = useRef(null);
  const wordsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const skipRequestedRef = useRef(false);

  const skipToEnd = useCallback(() => {
    skipRequestedRef.current = true;
  }, []);

  useEffect(() => {
    // If disabled or no text, show full text immediately
    if (!enabled || !fullText) {
      setDisplayedText(fullText || "");
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    // Reset state
    wordsRef.current = fullText.split(" ");
    currentIndexRef.current = 0;
    skipRequestedRef.current = false;
    setDisplayedText("");
    setIsTyping(true);
    setIsComplete(false);

    // Start typing animation
    const typeNextWord = () => {
      if (skipRequestedRef.current) {
        // Skip to end
        setDisplayedText(fullText);
        setIsTyping(false);
        setIsComplete(true);
        return;
      }

      if (currentIndexRef.current >= wordsRef.current.length) {
        // Animation complete
        setIsTyping(false);
        setIsComplete(true);
        return;
      }

      // Add next word
      const newText = wordsRef.current
        .slice(0, currentIndexRef.current + 1)
        .join(" ");
      setDisplayedText(newText);
      currentIndexRef.current++;

      // Schedule next word
      timerRef.current = setTimeout(typeNextWord, speed);
    };

    // Start animation
    timerRef.current = setTimeout(typeNextWord, speed);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [fullText, enabled, speed]);

  return { displayedText, isTyping, isComplete, skipToEnd };
}
