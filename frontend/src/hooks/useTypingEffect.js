import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook for word-by-word typing animation
 * @param {string} fullText - The complete text to animate
 * @param {boolean} enabled - Whether typing effect is enabled
 * @param {number} speed - Speed in ms per word (default: 25ms)
 * @returns {Object} { displayedText, isTyping, isComplete, skipToEnd }
 */
export function useTypingEffect(fullText, enabled = true, speed = 25) {
  const shouldAnimate = Boolean(enabled && fullText);

  const [displayedText, setDisplayedText] = useState(
    shouldAnimate ? "" : fullText || ""
  );
  const [isTyping, setIsTyping] = useState(shouldAnimate);
  const [isComplete, setIsComplete] = useState(!shouldAnimate);

  const timerRef = useRef(null);
  const wordsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const skipRequestedRef = useRef(false);

  // Adjust state during render when the animation target changes, so the
  // effect below only has to drive the timer.
  const animKey = shouldAnimate ? `${speed}::${fullText}` : null;
  const [prevKey, setPrevKey] = useState(animKey);
  if (animKey !== prevKey) {
    setPrevKey(animKey);
    setDisplayedText(shouldAnimate ? "" : fullText || "");
    setIsTyping(shouldAnimate);
    setIsComplete(!shouldAnimate);
  }

  const skipToEnd = useCallback(() => {
    skipRequestedRef.current = true;
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    wordsRef.current = fullText.split(" ");
    currentIndexRef.current = 0;
    skipRequestedRef.current = false;

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
  }, [fullText, shouldAnimate, speed]);

  return { displayedText, isTyping, isComplete, skipToEnd };
}
