import React from 'react';

const NEO_SHADOW = "4px 4px 0px 0px #000000";
const NEO_SHADOW_SM = "2px 2px 0px 0px #000000";

export default function NeoButton({ children, className = "", style = {}, size = "regular", onClick }) {
  const baseClass = "font-bold border-2 border-black transition-all hover:translate-x-[2px] hover:translate-y-[2px]";
  const shadowStyle = size === "small" ? { boxShadow: NEO_SHADOW_SM, ...style } : { boxShadow: NEO_SHADOW, ...style };
  
  return (
    <button className={`${baseClass} ${className}`} style={shadowStyle} onClick={onClick}>
      {children}
    </button>
  );
}
