
import { CULTURES } from '../constants';
import { Plot } from '../types';

/**
 * Calcule le besoin théorique en nombre de plants pour atteindre l'objectif d'autosuffisance.
 */
export const calculateNeeds = (
  cultureId: string, 
  peopleCount: number, 
  sufficiencyPercentage: number
) => {
  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return { neededPlants: 0, neededArea: 0 };

  // Formule : Besoins/Pers * Nb Pers * % Objectif
  const neededPlants = Math.ceil(culture.plantsPerPerson * peopleCount * (sufficiencyPercentage / 100));
  
  // Estimation surface (m²) : (Inter-plant cm * Inter-rang cm) / 10000 * nb plants
  const plantAreaM2 = (culture.spacingCm.betweenPlants * culture.spacingCm.betweenRows) / 10000;
  const neededArea = Number((neededPlants * plantAreaM2).toFixed(1));

  return { neededPlants, neededArea };
};

/**
 * Compte le nombre de plants réellement présents sur le plan (récursif pour les serres).
 */
export const countExistingPlants = (plots: Plot[], cultureId: string): number => {
  let count = 0;
  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return 0;

  const traverse = (plotList: Plot[]) => {
    plotList.forEach(p => {
      // Cas 1: Parcelle de culture directe
      if (p.type === 'culture' && p.plantedCultureId === cultureId) {
         const rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
         const perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
         count += Math.max(0, rows * perRow);
      }
      // Cas 2: Serre contenant des sous-parcelles
      if (p.type === 'greenhouse' && p.subPlots) {
        traverse(p.subPlots);
      }
    });
  };
  
  traverse(plots);
  return count;
};

/**
 * Génère la liste des suggestions pour combler le manque.
 */
export const generateMissingSuggestions = (plots: Plot[], peopleCount: number, sufficiencyTarget: number) => {
  const suggestions: Array<{
    cultureId: string;
    missingPlants: number;
    suggestedWidth: number;
    suggestedHeight: number;
    reason: string;
    selected: boolean;
  }> = [];

  CULTURES.forEach(culture => {
    const { neededPlants } = calculateNeeds(culture.id, peopleCount, sufficiencyTarget);
    const currentPlants = countExistingPlants(plots, culture.id);
    const missing = neededPlants - currentPlants;

    if (missing > 0) {
      // Calculer la surface nécessaire pour le manque
      const areaPerPlantM2 = (culture.spacingCm.betweenRows * culture.spacingCm.betweenPlants) / 10000;
      const requiredArea = missing * areaPerPlantM2;
      
      // Suggérer un bloc standard (ex: 1.2m de large = planche standard)
      const blockWidth = 1.2; 
      // Hauteur nécessaire pour caser la surface
      const blockHeight = Math.max(1, Math.ceil((requiredArea / blockWidth) * 10) / 10);

      suggestions.push({
        cultureId: culture.id,
        missingPlants: missing,
        suggestedWidth: blockWidth,
        suggestedHeight: blockHeight,
        reason: `Manque ${missing} plants pour l'objectif.`,
        selected: true // Par défaut sélectionné pour placement
      });
    }
  });

  return suggestions;
};
