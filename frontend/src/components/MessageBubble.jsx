import { useEffect, useRef } from "react";
import { useTypingEffect } from "../hooks/useTypingEffect";

/**
 * MessageBubble component that renders chat messages with optional typing animation
 * @param {Object} props
 * @param {Object} props.message - Message object with role, content, alreadyDisplayed
 * @param {boolean} props.isLatest - Whether this is the latest message
 * @param {Function} props.onAnimationComplete - Callback when typing animation completes
 * @param {Function} props.onScrollToBottom - Callback to scroll to bottom during typing
 */
export function MessageBubble({ message, isLatest, onAnimationComplete, onScrollToBottom }) {
  const { role, content, alreadyDisplayed = false } = message;
  const messageRef = useRef(null);

  // User messages render instantly
  if (role === "user") {
    return (
      <div className="message user">
        {content}
      </div>
    );
  }

  // Assistant messages
  const shouldAnimate = isLatest && !alreadyDisplayed && content;
  const { displayedText, isTyping, isComplete, skipToEnd } = useTypingEffect(
    content,
    shouldAnimate,
    25 // 25ms per word
  );

  // Notify parent when animation completes
  useEffect(() => {
    if (isComplete && shouldAnimate && onAnimationComplete) {
      onAnimationComplete();
    }
  }, [isComplete, shouldAnimate, onAnimationComplete]);

  // Auto-scroll during typing
  useEffect(() => {
    if (isTyping && onScrollToBottom) {
      onScrollToBottom();
    }
  }, [displayedText, isTyping, onScrollToBottom]);

  const textToShow = shouldAnimate ? displayedText : content;

  return (
    <div className="message assistant" ref={messageRef}>
      {textToShow}
      {isTyping && <span className="typing-cursor">|</span>}
      {isTyping && (
        <button 
          className="skip-typing-btn"
          onClick={skipToEnd}
          title="Skip animation"
        >
          Skip
        </button>
      )}
    </div>
  );
}
