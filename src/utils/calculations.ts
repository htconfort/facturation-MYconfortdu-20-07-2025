export const formatCurrency = (amount: number): string => {
  // Vérifier que amount est un nombre valide
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0,00 €';
  }
  
  return Number(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Alias pour compatibilité avec votre fonction
export const formatEuro = (amount: number): string => {
  // Vérifier que amount est un nombre valide
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0,00 €';
  }
  
  return Number(amount).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const calculateHT = (ttcPrice: number, taxRate: number): number => {
  return ttcPrice / (1 + (taxRate / 100));
};

export const calculateTTC = (htPrice: number, taxRate: number): number => {
  return htPrice * (1 + (taxRate / 100));
};

export const calculateProductTotal = (
  quantity: number,
  priceTTC: number,
  discount: number,
  discountType: 'percent' | 'fixed'
): number => {
  let productTotal = priceTTC * quantity;
  
  if (discount > 0) {
    if (discountType === 'percent') {
      productTotal -= productTotal * (discount / 100);
    } else {
      productTotal -= discount * quantity;
    }
  }
  
  return Math.max(0, productTotal);
};

// 🔢 Cache global pour éviter la génération multiple
let sessionInvoiceNumbers = new Map<string, string>();
let lastGeneratedTimestamp = 0;

export const generateInvoiceNumber = (sessionId?: string): string => {
  const now = Date.now();
  const year = new Date().getFullYear();
  
  // Si un sessionId est fourni, vérifier le cache de session
  if (sessionId && sessionInvoiceNumbers.has(sessionId)) {
    const cachedNumber = sessionInvoiceNumbers.get(sessionId)!;
    console.log(`🔒 Réutilisation numéro de session [${sessionId}]: ${cachedNumber}`);
    return cachedNumber;
  }
  
  // Protection temporelle renforcée (5 secondes entre les générations)
  if (!sessionId && (now - lastGeneratedTimestamp) < 5000) {
    console.log('⚠️ Génération bloquée - trop rapide après la précédente');
    // Retourner le prochain numéro sans l'incrémenter
    return getNextInvoiceNumber();
  }
  
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    const newNumber = `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    
    // ✅ ATOMIC: Sauvegarder seulement si c'est une vraie génération
    localStorage.setItem('lastInvoiceNumber', newNumber);
    lastGeneratedTimestamp = now;
    
    // Sauvegarder dans le cache de session si ID fourni
    if (sessionId) {
      sessionInvoiceNumbers.set(sessionId, newNumber);
    }
    
    console.log(`🔢 Génération facture [${sessionId || 'direct'}]: ${lastInvoiceNumber} → ${newNumber}`);
    return newNumber;
  } catch (error) {
    // Fallback if parsing fails - Start with 001
    const fallbackNumber = `${year}-001`;
    localStorage.setItem('lastInvoiceNumber', fallbackNumber);
    lastGeneratedTimestamp = now;
    
    if (sessionId) {
      sessionInvoiceNumbers.set(sessionId, fallbackNumber);
    }
    
    console.log(`🔢 Fallback génération facture [${sessionId || 'direct'}]: ${fallbackNumber}`);
    return fallbackNumber;
  }
};

// 🔄 Fonction utilitaire pour reset la numérotation
export const resetInvoiceNumbering = (startNumber: number = 0): string => {
  const year = new Date().getFullYear();
  const resetValue = `${year}-${String(startNumber).padStart(3, '0')}`;
  localStorage.setItem('lastInvoiceNumber', resetValue);
  
  // Nettoyer le cache de session
  sessionInvoiceNumbers.clear();
  lastGeneratedTimestamp = 0;
  
  console.log(`🔄 Numérotation reset à: ${resetValue} et cache nettoyé`);
  return resetValue;
};

// 🧹 Nettoyer le cache de session (utilitaire de debug)
export const clearSessionCache = (): void => {
  sessionInvoiceNumbers.clear();
  lastGeneratedTimestamp = 0;
  console.log('🧹 Cache de session nettoyé');
};

// 🔍 Fonction pour voir le prochain numéro sans le générer
export const getNextInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    return `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (error) {
    return `${year}-001`;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};

// Fonctions utilitaires supplémentaires pour le formatage français
export const formatNumber = (value: number, decimals: number = 2): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return Number(value).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return Number(value).toLocaleString('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
