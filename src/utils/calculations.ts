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
  return ttcPrice / (1 + taxRate / 100);
};

export const calculateTTC = (htPrice: number, taxRate: number): number => {
  return htPrice * (1 + taxRate / 100);
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

// Cache et debounce pour la génération
let lastGeneratedTimestamp = 0;
let pendingTimer: any = null;
const sessionInvoiceNumbers = new Map<string, string>();

/**
 * Génère un nouveau numéro de facture avec debounce intelligent
 */
export function generateInvoiceNumber(sessionId?: string, onReady?: (num: string) => void): string {
  const year = new Date().getFullYear();
  const now = Date.now();

  const doGeneration = (): string => {
    lastGeneratedTimestamp = Date.now();
    const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}000`;
    
    try {
      // Extraire le numéro depuis le format YYYYNNN
      const yearFromStorage = lastInvoiceNumber.substring(0, 4);
      const numberFromStorage = lastInvoiceNumber.substring(4);
      
      // Si l'année a changé, recommencer à 1
      if (yearFromStorage !== year.toString()) {
        const newNumber = `${year}001`;
        localStorage.setItem('lastInvoiceNumber', newNumber);
        console.log(`🔢 Nouvelle année détectée: ${yearFromStorage} → ${year}, nouveau numéro: ${newNumber}`);
        onReady?.(newNumber);
        return newNumber;
      }
      
      const lastNumber = parseInt(numberFromStorage) || 0;
      const newNumber = `${year}${String(lastNumber + 1).padStart(3, '0')}`;

      // ✅ ATOMIC: Sauvegarder seulement si c'est une vraie génération
      localStorage.setItem('lastInvoiceNumber', newNumber);

      // Sauvegarder dans le cache de session si ID fourni
      if (sessionId) {
        sessionInvoiceNumbers.set(sessionId, newNumber);
      }

      console.log(`🔢 Génération facture [${sessionId || 'direct'}]: ${lastInvoiceNumber} → ${newNumber}`);
      onReady?.(newNumber);
      return newNumber;
    } catch (error) {
      console.error('Erreur lors de la génération du numéro de facture:', error);
      const fallback = getNextInvoiceNumber();
      onReady?.(fallback);
      return fallback;
    }
  };

  // Vérifier le cache de session d'abord
  if (sessionId && sessionInvoiceNumbers.has(sessionId)) {
    const cachedNumber = sessionInvoiceNumbers.get(sessionId)!;
    console.log(`📋 Numéro de facture trouvé dans le cache: ${cachedNumber}`);
    onReady?.(cachedNumber);
    return cachedNumber;
  }

  // Protection temporelle avec debounce doux (800ms)
  if (!sessionId && now - lastGeneratedTimestamp < 800) {
    console.log('⚠️ Génération retardée - anti-spam actif');
    clearTimeout(pendingTimer);
    pendingTimer = setTimeout(() => doGeneration(), 850);
    // Retourner le prochain numéro sans l'incrémenter pour l'aperçu
    return getNextInvoiceNumber();
  }

  return doGeneration();
}

// 🔍 Fonction pour voir le prochain numéro sans le générer
export const getNextInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const lastInvoiceNumber =
    localStorage.getItem('lastInvoiceNumber') || `${year}000`;

  try {
    // Extraire le numéro depuis le format YYYYNNN
    const yearFromStorage = lastInvoiceNumber.substring(0, 4);
    const numberFromStorage = lastInvoiceNumber.substring(4);
    
    // Si l'année a changé, recommencer à 1
    if (yearFromStorage !== year.toString()) {
      return `${year}001`;
    }
    
    const lastNumber = parseInt(numberFromStorage) || 0;
    return `${year}${String(lastNumber + 1).padStart(3, '0')}`;
  } catch (_error) {
    return `${year}001`;
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
    return cleaned.replace(
      /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1 $2 $3 $4 $5'
    );
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
