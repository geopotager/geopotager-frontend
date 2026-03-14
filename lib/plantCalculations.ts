import { CULTURES } from '../constants';
import { Plot } from '../types';

/**
 * Calcule le besoin théorique en nombre de plants pour atteindre l'objectif d'autosuffisance.
 * Les successions permettent de produire plusieurs fois sur le même emplacement.
 */
export const calculateNeeds = (
  cultureId: string,
  peopleCount: number,
  sufficiencyPercentage: number
) => {
  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return { neededPlants: 0, neededArea: 0, plantsPerSuccession: 0 };

  const successions = culture.successions || 1;

  // besoin annuel total en plants
  const totalAnnualPlants = Math.ceil(
    culture.plantsPerPerson *
    peopleCount *
    (sufficiencyPercentage / 100)
  );

  // nombre de plants simultanés au jardin
  const plantsPerSuccession = Math.ceil(totalAnnualPlants / successions);

  const plantAreaM2 =
    (culture.spacingCm.betweenPlants * culture.spacingCm.betweenRows) / 10000;

  const neededArea = Number((plantsPerSuccession * plantAreaM2).toFixed(1));

  return {
    neededPlants: totalAnnualPlants,
    neededArea,
    plantsPerSuccession
  };
};


/**
 * Compte les plants présents dans le jardin et calcule la production annuelle.
 */
export const countExistingPlants = (plots: Plot[], cultureId: string): number => {

  let slotsCount = 0;

  const culture = CULTURES.find(c => c.id === cultureId);
  if (!culture) return 0;

  const spacingRows = culture.spacingCm?.betweenRows || 0;
  const spacingPlants = culture.spacingCm?.betweenPlants || 0;

  if (spacingRows === 0 || spacingPlants === 0) return 0;

  const traverse = (plotList: Plot[]) => {

    plotList.forEach(p => {

      // parcelle classique
      if (p.type === 'culture' && p.plantedCultureId === cultureId) {

        let rows = 0;
        let perRow = 0;

        if (p.rowOrientation === 'vertical') {

          rows = Math.floor((p.width * 100) / spacingRows);
          perRow = Math.floor((p.height * 100) / spacingPlants);

        } else {

          rows = Math.floor((p.height * 100) / spacingRows);
          perRow = Math.floor((p.width * 100) / spacingPlants);

        }

        slotsCount += Math.max(0, rows * perRow);

      }

      // serre
      if (p.type === 'greenhouse' && p.subPlots) {
        traverse(p.subPlots);
      }

    });

  };

  traverse(plots);

  // production annuelle = emplacements × successions
  const successions = culture.successions || 1;

  return slotsCount * successions;
};


/**
 * Génère les suggestions de cultures manquantes.
 */
export const generateMissingSuggestions = (
  plots: Plot[],
  peopleCount: number,
  sufficiencyTarget: number
) => {

  const suggestions: Array<{
    cultureId: string;
    missingPlants: number;
    suggestedWidth: number;
    suggestedHeight: number;
    reason: string;
    selected: boolean;
  }> = [];

  CULTURES.forEach(culture => {

    // on exclut les arbres et petits fruits
    if (
      culture.category === 'Arbres Fruitiers' ||
      culture.category === 'Petits Fruits'
    ) return;

    const { neededPlants } = calculateNeeds(
      culture.id,
      peopleCount,
      sufficiencyTarget
    );

    const currentProduction = countExistingPlants(plots, culture.id);

    const missingAnnual = neededPlants - currentProduction;

    if (missingAnnual > 0) {

      const successions = culture.successions || 1;

      const missingSlots = Math.ceil(missingAnnual / successions);

      const areaPerPlantM2 =
        (culture.spacingCm.betweenRows * culture.spacingCm.betweenPlants) / 10000;

      const requiredArea = missingSlots * areaPerPlantM2;

      const blockWidth = 1.2;
      const blockHeight = Math.max(
        1,
        Math.ceil((requiredArea / blockWidth) * 10) / 10
      );

      suggestions.push({
        cultureId: culture.id,
        missingPlants: missingAnnual,
        suggestedWidth: blockWidth,
        suggestedHeight: blockHeight,
        reason: `Manque ${missingAnnual} plants/an (${missingSlots} places au sol).`,
        selected: true
      });

    }

  });

  return suggestions;
};