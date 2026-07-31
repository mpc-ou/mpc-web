import type React from "react";

export function FlagViIcon({ className = "h-4 w-4 rounded-xs shrink-0 inline-block" }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'>
      <rect fill='#DA251D' height='20' width='30' />
      <polygon fill='#FFFF00' points='15,4 16.5,8.5 21,8.5 17.5,11 19,15.5 15,13 11,15.5 12.5,11 9,8.5 13.5,8.5' />
    </svg>
  );
}

export function FlagEnIcon({ className = "h-4 w-4 rounded-xs shrink-0 inline-block" }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'>
      <clipPath id='flag-en-s'>
        <path d='M0,0 v30 h60 v-30 z' />
      </clipPath>
      <clipPath id='flag-en-t'>
        <path d='M0,0 L60,30 M60,0 L0,30' />
      </clipPath>
      <g clipPath='url(#flag-en-s)'>
        <path d='M0,0 v30 h60 v-30 z' fill='#012169' />
        <path d='M0,0 L60,30 M60,0 L0,30' stroke='#fff' strokeWidth='6' />
        <path d='M0,0 L60,30 M60,0 L0,30' stroke='#C8102E' strokeWidth='4' clipPath='url(#flag-en-t)' />
        <path d='M30,0 v30 M0,15 h60' stroke='#fff' strokeWidth='10' />
        <path d='M30,0 v30 M0,15 h60' stroke='#C8102E' strokeWidth='6' />
      </g>
    </svg>
  );
}
