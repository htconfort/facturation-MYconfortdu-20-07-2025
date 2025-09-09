/**
 * Détection version iOS pour patch compatibilité iPad
 * Bug Safari/iPadOS 18.4.1 vs 18.5 - touch events / canvas repaint
 */

export const getIOSVersion = (): number | null => {
  // Renvoie un nombre style 18.4, 18.5, etc. ou null si inconnu
  const ua = navigator.userAgent;
  const m = ua.match(/OS (\d+)_(\d+)(?:_(\d+))?/);
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2] || 0);
  return Number(`${major}.${minor}`);
};

export const isIOSLegacy = (): boolean => {
  const version = getIOSVersion();
  return version !== null && version < 18.5;
};

export const getIOSDebugInfo = () => {
  const version = getIOSVersion();
  const isLegacy = isIOSLegacy();
  const ua = navigator.userAgent;
  
  return {
    version,
    isLegacy,
    userAgent: ua,
    needsCompat: isLegacy,
    devicePixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
  };
};
