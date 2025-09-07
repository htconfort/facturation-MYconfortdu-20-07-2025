// =============================================
// Utilitaire UUID temporaire
// En attendant l'installation de la vraie librairie uuid
// =============================================

/**
 * Génère un UUID v4 simple (version temporaire)
 * À remplacer par la vraie librairie uuid une fois npm installé
 */
export function v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export par défaut pour compatibilité
export default { v4 };
