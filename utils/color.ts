const getRandomPastelColor = () => {
  const maxHue = 360;
  const hue = Math.floor(Math.random() * maxHue);
  return `hsl(${hue}, 70%, 80%)`;
};

/** Deterministic color from a string (for avatar backgrounds). */
export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + hash * 31;
    hash = Math.imul(hash, 1); // keep 32-bit int behavior if needed
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/** Dimmer variant of the deterministic color (for avatar backgrounds). */
export function dimColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + hash * 31;
    hash = Math.imul(hash, 1);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 20%)`;
}

export { getRandomPastelColor };
