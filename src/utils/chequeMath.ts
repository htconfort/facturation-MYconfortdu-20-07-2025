/**
 * 🧮 Utilitaires mathématiques pour les chèques "ronds" (sans centimes)
 * Algorithme pour calculer des montants de chèques sans virgule
 */

export interface ChequeRond {
  montant: number;
  description: string;
}

export interface SuggestionAcompte {
  pourcentage: number;
  montant: number;
  resteApayer: number;
  description: string;
}

/**
 * Calcule une répartition en chèques "ronds" (sans centimes)
 * @param montantTotal - Montant total à répartir
 * @param nombreCheques - Nombre de chèques souhaité (max 10)
 * @returns Tableau de chèques avec montants ronds
 */
export function calculerChequesRonds(
  montantTotal: number,
  nombreCheques: number
): ChequeRond[] {
  if (nombreCheques <= 0 || nombreCheques > 10) {
    throw new Error('Le nombre de chèques doit être entre 1 et 10');
  }

  const montantParCheque = Math.floor(montantTotal / nombreCheques);
  const reste = montantTotal - montantParCheque * nombreCheques;

  const cheques: ChequeRond[] = [];

  // Distribuer le montant de base
  for (let i = 0; i < nombreCheques; i++) {
    cheques.push({
      montant: montantParCheque,
      description: `Chèque ${i + 1}/${nombreCheques}`,
    });
  }

  // Distribuer le reste sur les premiers chèques (arrondi à l'euro supérieur)
  for (let i = 0; i < reste && i < nombreCheques; i++) {
    cheques[i].montant += 1;
  }

  return cheques;
}

/**
 * Suggère des acomptes "magiques" qui donnent des chèques ronds
 * @param montantTotal - Montant total de la facture
 * @param nombreCheques - Nombre de chèques pour le reste
 * @returns Suggestions d'acomptes optimisées
 */
export function suggererAcomptesMagiques(
  montantTotal: number,
  nombreCheques: number = 3
): SuggestionAcompte[] {
  const suggestions: SuggestionAcompte[] = [];

  // Suggestions de pourcentages courants
  const pourcentages = [20, 25, 30, 40, 50];

  for (const pct of pourcentages) {
    const acompte = Math.round((montantTotal * pct) / 100);
    const reste = montantTotal - acompte;
    const montantParCheque = Math.floor(reste / nombreCheques);
    const modulo = reste % nombreCheques;

    // Privilégier les répartitions avec peu ou pas de modulo

    suggestions.push({
      pourcentage: pct,
      montant: acompte,
      resteApayer: reste,
      description: `${pct}% d'acompte (${acompte}€) + ${nombreCheques} chèques de ${montantParCheque}€${modulo > 0 ? ` (+${modulo}€ à répartir)` : ''}`,
    });
  }

  // Trier par qualité (moins de modulo = mieux)
  return suggestions.sort((a, b) => {
    const moduloA = a.resteApayer % nombreCheques;
    const moduloB = b.resteApayer % nombreCheques;
    return moduloA - moduloB;
  });
}

/**
 * Vérifie si un montant peut être divisé en chèques ronds
 * @param montant - Montant à vérifier
 * @param nombreCheques - Nombre de chèques
 * @returns true si la division donne des montants entiers
 */
export function peutDiviserEnChequesRonds(
  montant: number,
  nombreCheques: number
): boolean {
  return montant % nombreCheques === 0;
}

/**
 * Optimise un acompte pour avoir des chèques ronds
 * @param montantTotal - Montant total
 * @param acompteInitial - Acompte de départ
 * @param nombreCheques - Nombre de chèques pour le reste
 * @returns Acompte optimisé
 */
export function optimiserAcomptePourChequesRonds(
  montantTotal: number,
  acompteInitial: number,
  nombreCheques: number
): number {
  const resteInitial = montantTotal - acompteInitial;
  const modulo = resteInitial % nombreCheques;

  if (modulo === 0) {
    return acompteInitial; // Déjà optimal
  }

  // Ajuster l'acompte pour éliminer le modulo
  return acompteInitial + modulo;
}

/**
 * Fonctions attendues par StepPaiement (compatibilité avec l'ancienne version)
 */

/**
 * Calcule des acomptes "amis des chèques" qui donnent des montants ronds
 * @param totalTTC - Montant total TTC
 * @param nombreCheques - Nombre de chèques pour le solde
 * @returns Suggestions d'acomptes optimisées
 */
export interface ChequeSuggestion {
  deposit: number;
  nCheques: number;
  perCheque: number;
  percentage: number;
  description: string;
}

/**
 * Génère des suggestions d'acomptes optimisées pour les chèques ronds
 * @param totalTTC - Montant total TTC
 * @param nombreCheques - Nombre de chèques pour le reste à payer
 * @returns Suggestions avec acompte, nombre de chèques et montant par chèque (toujours entiers)
 */
export function chequeFriendlyDeposits(
  totalTTC: number,
  nombreCheques: number
): ChequeSuggestion[] {
  const suggestions: ChequeSuggestion[] = [];

  // Suggestions de pourcentages courants
  const pourcentages = [0, 10, 20, 25, 30, 40, 50];

  for (const pct of pourcentages) {
    // Calculer l'acompte initial
    const acompteInitial = Math.round((totalTTC * pct) / 100);
    const resteInitial = totalTTC - acompteInitial;

    // Calculer le montant par chèque entier (sans virgule)
    const montantParChequeEntier = Math.round(resteInitial / nombreCheques);

    // Recalculer l'acompte pour que les chèques soient exactement entiers
    const totalDesChequesEntiers = montantParChequeEntier * nombreCheques;
    const acompteAjuste = totalTTC - totalDesChequesEntiers;

    // Vérifier que les montants sont cohérents et positifs
    if (
      montantParChequeEntier > 0 &&
      acompteAjuste >= 0 &&
      acompteAjuste <= totalTTC
    ) {
      const pourcentageReel = (acompteAjuste / totalTTC) * 100;

      suggestions.push({
        deposit: acompteAjuste,
        nCheques: nombreCheques,
        perCheque: montantParChequeEntier,
        percentage: Math.round(pourcentageReel),
        description: `${Math.round(pourcentageReel)}% d'acompte (${acompteAjuste}€) + ${nombreCheques} chèques de ${montantParChequeEntier}€`,
      });
    }
  }

  // Ajouter quelques suggestions optimisées supplémentaires pour garantir des chèques ronds
  for (let montantCheque = 50; montantCheque <= 500; montantCheque += 50) {
    const totalCheques = montantCheque * nombreCheques;
    if (totalCheques < totalTTC) {
      const acompte = totalTTC - totalCheques;
      const pourcentage = (acompte / totalTTC) * 100;

      if (pourcentage >= 0 && pourcentage <= 80) {
        // Limiter à 80% d'acompte max
        suggestions.push({
          deposit: acompte,
          nCheques: nombreCheques,
          perCheque: montantCheque,
          percentage: Math.round(pourcentage),
          description: `${Math.round(pourcentage)}% d'acompte (${acompte}€) + ${nombreCheques} chèques de ${montantCheque}€`,
        });
      }
    }
  }

  // Trier par montant d'acompte et supprimer les doublons
  const uniqueSuggestions = suggestions
    .filter(
      (suggestion, index, self) =>
        index ===
        self.findIndex(
          s =>
            s.deposit === suggestion.deposit &&
            s.perCheque === suggestion.perCheque
        )
    )
    .sort((a, b) => a.deposit - b.deposit);

  return uniqueSuggestions.slice(0, 8); // Maximum 8 suggestions
}

/**
 * Convertit des pourcentages en montants cibles
 * @param totalTTC - Montant total TTC
 * @param percentages - Pourcentages à convertir
 * @returns Montants correspondants
 */
export function targetsFromPercents(totalTTC: number, percentages: number[]) {
  return percentages.map(pct => ({
    percentage: pct,
    amount: Math.round((totalTTC * pct) / 100),
    label: `${pct}%`,
  }));
}
