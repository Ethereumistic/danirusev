import React from 'react';

/**
 * A reusable TikTok icon component.
 * It uses the SVG path you provided but is adapted to work with Tailwind CSS.
 * @param {object} props - The component props.
 * @param {string} [props.className] - Tailwind classes for styling (e.g., 'h-6 w-6').
 */
const TikTokIcon = ({ className }: { className?: string }) => {
  return (
<svg xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512"
    fill="currentColor" // Uses currentColor to inherit color from parent CSS
    className={className} // Apply className for sizing and other styles
    aria-hidden="true"
    role="img"
    >
<path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
</svg>
  );
};

export default TikTokIcon;
