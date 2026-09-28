// src/components/GlobalLoader.jsx
// Full-screen loading overlay shown while any API request is in flight.
// Picks a random quote each time it appears.

import { useEffect, useState } from "react";
import { subscribeLoading } from "../contexts/loadingStore.js";
import "./GlobalLoader.css";

const QUOTES = [
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Your career is a marathon, not a sprint.", author: "Unknown" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
];

export default function GlobalLoader() {
  const [visible, setVisible] = useState(false);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    return subscribeLoading((v) => {
      setVisible(v);
      if (v) {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="global-loader" role="status" aria-live="polite">
      <div className="loader-cup">
        <span className="loader-steam s1" />
        <span className="loader-steam s2" />
        <span className="loader-steam s3" />
        <div className="loader-coffee" />
      </div>
      {quote && (
        <div className="loader-quote">
          <p>"{quote.text}"</p>
          <span>— {quote.author}</span>
        </div>
      )}
    </div>
  );
}