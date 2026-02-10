
import { CULTURES } from '../constants';
import { Plot } from '../types';

/**
 * Calcule le besoin théorique en nombre de plants pour atteindre l'objectif d'autosuffisance.
 * Prend en compte le nombre de successions possibles par an.
 */
export const calculateNeeds = (
  cultureId: string, 
  peopleCount: number, 
  sufficiencyPercentage: number
) => {
  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return { neededPlants: 0, neededArea: 0, plantsPerSuccession: 0 };

  // Besoin TOTAL annuel en plants = (Besoins/Pers * Nb Pers * % Objectif)
  const totalAnnualPlants = Math.ceil(culture.plantsPerPerson * peopleCount * (sufficiencyPercentage / 100));
  
  // Si on peut faire plusieurs récoltes (ex: 3 fois des épinards), on divise le besoin spatial par 3.
  // On a besoin de "X places au jardin" mais on récoltera "X * successions" plantes au total.
  const plantsPerSuccession = Math.ceil(totalAnnualPlants / (culture.successions || 1));

  // Estimation surface (m²) basée sur l'occupation SIMULTANÉE au jardin
  const plantAreaM2 = (culture.spacingCm.betweenPlants * culture.spacingCm.betweenRows) / 10000;
  const neededArea = Number((plantsPerSuccession * plantAreaM2).toFixed(1));

  return { neededPlants: totalAnnualPlants, neededArea, plantsPerSuccession };
};

/**
 * Compte le nombre de plants réellement présents sur le plan (récursif pour les serres).
 * Multiplie par le nombre de successions pour obtenir le rendement annuel potentiel.
 */
export const countExistingPlants = (plots: Plot[], cultureId: string): number => {
  let slotsCount = 0; // Nombre d'emplacements physiques au sol
  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return 0;

  const traverse = (plotList: Plot[]) => {
    plotList.forEach(p => {
      // Cas 1: Parcelle de culture directe
      if (p.type === 'culture' && p.plantedCultureId === cultureId) {
         let rows, perRow;
         if (p.rowOrientation === 'vertical') {
             rows = Math.floor((p.width * 100) / culture.spacingCm.betweenRows);
             perRow = Math.floor((p.height * 100) / culture.spacingCm.betweenPlants);
         } else { 
             rows = Math.floor((p.height * 100) / culture.spacingCm.betweenRows);
             perRow = Math.floor((p.width * 100) / culture.spacingCm.betweenPlants);
         }
         slotsCount += Math.max(0, rows * perRow);
      }
      // Cas 2: Serre contenant des sous-parcelles
      if (p.type === 'greenhouse' && p.subPlots) {
        traverse(p.subPlots);
      }
    });
  };
  
  traverse(plots);
  
  // Le nombre total de plantes produites par an = emplacements * successions
  return slotsCount * (culture.successions || 1);
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
    // EXCLUSION : Arbres Fruitiers et Petits Fruits ne sont pas proposés dans le calcul auto
    if (culture.category === 'Arbres Fruitiers' || culture.category === 'Petits Fruits') return;

    const { neededPlants } = calculateNeeds(culture.id, peopleCount, sufficiencyTarget);
    const currentAnnualProduction = countExistingPlants(plots, culture.id);
    const missingAnnual = neededPlants - currentAnnualProduction;

    if (missingAnnual > 0) {
      // Pour combler le manque annuel, combien d'emplacements au sol faut-il ajouter ?
      const missingSlots = Math.ceil(missingAnnual / (culture.successions || 1));

      // Calculer la surface nécessaire pour ces emplacements
      const areaPerPlantM2 = (culture.spacingCm.betweenRows * culture.spacingCm.betweenPlants) / 10000;
      const requiredArea = missingSlots * areaPerPlantM2;
      
      // Suggérer un bloc standard
      const blockWidth = 1.2; 
      const blockHeight = Math.max(1, Math.ceil((requiredArea / blockWidth) * 10) / 10);

      suggestions.push({
        cultureId: culture.id,
        missingPlants: missingAnnual, // On affiche le manque total annuel
        suggestedWidth: blockWidth,
        suggestedHeight: blockHeight,
        reason: `Manque ${missingAnnual} plants/an (${missingSlots} places au sol).`,
        selected: true 
      });
    }
  });

  return suggestions;
};
