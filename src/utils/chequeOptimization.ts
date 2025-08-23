/**
 * Service d'optimisation pour les chèques sans centimes
 * Calcule automatiquement l'acompte optimal pour avoir des chèques avec des montants entiers
 */

export interface ChequeOptimization {
  acompte: number;
  montantCheque: number;
  nbCheques: number;
  totalTTC: number;
  economieTemps: string;
}

/**
 * Propose un acompte optimal pour que tous les chèques soient à un montant entier (sans centimes)
 * avec un acompte minimum de 15% du total
 * @param totalTTC Montant total TTC de la facture
 * @param nbCheques Nombre de chèques souhaité
 * @returns Proposition d'optimisation avec acompte et montant par chèque
 */
export function proposerAcomptePourChequesRonds(
  totalTTC: number,
  nbCheques: number
): ChequeOptimization {
  if (nbCheques <= 0 || totalTTC <= 0) {
    return {
      acompte: 0,
      montantCheque: 0,
      nbCheques: 0,
      totalTTC,
      economieTemps: '❌ Configuration invalide',
    };
  }

  // Calcul du montant de chèque rond (sans centimes)
  const montantCheque = Math.floor(totalTTC / nbCheques);

  // L'acompte = le reste qui ne rentre pas dans la division entière
  let acompte = totalTTC - montantCheque * nbCheques;

  // ✨ NOUVEAU : Acompte minimum de 15% du total
  const acompteMinimum = Math.ceil(totalTTC * 0.15); // 15% minimum

  // Si l'acompte calculé est inférieur à 15%, on ajuste
  if (acompte < acompteMinimum) {
    acompte = acompteMinimum;
    // Recalculer le montant par chèque avec le nouvel acompte
    const montantRestant = totalTTC - acompte;
    const nouveauMontantCheque = Math.floor(montantRestant / nbCheques);

    // Vérifier si on peut avoir des chèques ronds avec cet acompte
    const resteAvecNouvelAcompte =
      montantRestant - nouveauMontantCheque * nbCheques;

    if (resteAvecNouvelAcompte > 0) {
      // Ajuster l'acompte pour absorber le reste
      acompte = acompte + resteAvecNouvelAcompte;
    }

    // Message d'économie de temps avec acompte minimum
    const economieTemps = `✨ ${nbCheques} chèques de ${nouveauMontantCheque}€ pile + acompte 15% minimum (${Math.round((acompte / totalTTC) * 100)}%)`;

    return {
      acompte: Math.round(acompte * 100) / 100,
      montantCheque: nouveauMontantCheque,
      nbCheques,
      totalTTC,
      economieTemps,
    };
  }

  // Message d'économie de temps standard
  const economieTemps =
    acompte > 0
      ? `✨ ${nbCheques} chèques de ${montantCheque}€ pile (gain de temps énorme !)`
      : `🎯 Déjà optimal ! ${nbCheques} chèques de ${montantCheque}€ exactement`;

  return {
    acompte: Math.round(acompte * 100) / 100, // Arrondi à 2 décimales
    montantCheque,
    nbCheques,
    totalTTC,
    economieTemps,
  };
}

/**
 * Formate un message explicatif pour l'utilisateur
 * @param optimization Résultat de l'optimisation
 * @returns Message formaté pour l'interface
 */
export function formatMessageOptimisation(
  optimization: ChequeOptimization
): string {
  if (optimization.nbCheques <= 0) {
    return '';
  }

  const { acompte, montantCheque, nbCheques, totalTTC } = optimization;

  if (acompte === 0) {
    return `🎯 Parfait ! ${nbCheques} chèques de ${montantCheque}€ exactement = ${totalTTC}€`;
  }

  return `💡 Suggestion optimale : Acompte de ${acompte}€ + ${nbCheques} chèques de ${montantCheque}€ chacun = ${totalTTC}€ total`;
}

/**
 * Calcule le gain de temps estimé en évitant l'écriture des centimes
 * @param nbCheques Nombre de chèques
 * @param avecCentimes Si les chèques auraient eu des centimes sans optimisation
 * @returns Message de gain de temps
 */
export function calculerGainTemps(
  nbCheques: number,
  avecCentimes: boolean
): string {
  if (!avecCentimes || nbCheques <= 0) {
    return '';
  }

  const secondesEconomisees = nbCheques * 8; // ~8 secondes économisées par chèque sans centimes
  const minutesEconomisees = Math.round((secondesEconomisees / 60) * 10) / 10;

  if (minutesEconomisees < 1) {
    return `⏱️ Gain estimé : ${secondesEconomisees}s d'écriture économisées`;
  }

  return `⏱️ Gain estimé : ~${minutesEconomisees} min d'écriture économisées (${nbCheques} chèques sans centimes)`;
}

/**
 * Vérifie si l'optimisation est bénéfique (évite réellement des centimes)
 * @param totalTTC Montant total
 * @param nbCheques Nombre de chèques
 * @returns True si l'optimisation évite des centimes
 */
export function optimisationBenefique(
  totalTTC: number,
  nbCheques: number
): boolean {
  if (nbCheques <= 0) return false;

  const montantSansOptimisation = totalTTC / nbCheques;
  const aCentimes = montantSansOptimisation % 1 !== 0;

  return aCentimes;
}

/**
 * Exemples d'utilisation pour la documentation
 */
export const exemples = {
  exemple1: {
    totalTTC: 1840,
    nbCheques: 9,
    resultat: proposerAcomptePourChequesRonds(1840, 9),
    // => { acompte: 276, montantCheque: 173, nbCheques: 9 } (15% minimum)
  },
  exemple2: {
    totalTTC: 1500,
    nbCheques: 10,
    resultat: proposerAcomptePourChequesRonds(1500, 10),
    // => { acompte: 225, montantCheque: 127, nbCheques: 10 } (15% minimum)
  },
  exemple3: {
    totalTTC: 2157.89,
    nbCheques: 8,
    resultat: proposerAcomptePourChequesRonds(2157.89, 8),
    // => { acompte: 323.68, montantCheque: 229, nbCheques: 8 } (15% minimum)
  },
  exemple4: {
    totalTTC: 1737,
    nbCheques: 10,
    resultat: proposerAcomptePourChequesRonds(1737, 10),
    // => { acompte: 261 (15%), montantCheque: 147, nbCheques: 10 }
    // Au lieu de 10% (173€), on a 15% minimum (261€) + 10 chèques de 147€
  },
};
