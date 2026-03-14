import { Plot, GardenConfig } from "../types";
import { CULTURES } from "../constants";

export interface CultureReport {
  id: string;
  name: string;
  surface: number;
  plants: number;
  production: number;
  needs: number;
  missing: number;
  planning: any;
}

export interface VivrierReport {
  general: {
    people: number;
    targetAutosufficiency: number;
    surfaceTerrain: number;
    surfaceCultivee: number;
    plotCount: number;
  };

  diagnostic: {
    totalProduction: number;
    totalNeeds: number;
    autosufficiency: number;
  };

  cultures: CultureReport[];
}

export function buildVivrierReport(
  plots: Plot[],
  config: GardenConfig
): VivrierReport {

  const cultivatedPlots = plots.filter(
    p => p.type === "culture" && p.plantedCultureId
  );

  const surfaceCultivee = cultivatedPlots.reduce(
    (acc, p) => acc + (p.width * p.height),
    0
  );

  const surfaceTerrain =
    config.terrainWidth * config.terrainHeight;

  const culturesReport: CultureReport[] = CULTURES.map(culture => {

    const plotsOfCulture =
      cultivatedPlots.filter(
        p => p.plantedCultureId === culture.id
      );

    const surface = plotsOfCulture.reduce(
      (acc, p) => acc + (p.width * p.height),
      0
    );

    let plants = 0;

    plotsOfCulture.forEach(p => {

      const plantSpacing =
        (culture.spacingCm.betweenPlants / 100) *
        (culture.spacingCm.betweenRows / 100);

      const plantsInPlot =
        Math.floor((p.width * p.height) / plantSpacing);

      plants += plantsInPlot;

    });

    let production = 0;

    if (culture.yield.unit.includes("kg/plant")) {
      production = plants * culture.yield.amount;
    }

    if (culture.yield.unit.includes("kg/m²")) {
      production = surface * culture.yield.amount;
    }

    const neededPlants =
      culture.plantsPerPerson *
      config.peopleCount *
      (config.sufficiencyTarget / 100);

    let needs = 0;

    if (culture.yield.unit.includes("kg/plant")) {
      needs = neededPlants * culture.yield.amount;
    }

    const missing = Math.max(0, needs - production);

    return {
      id: culture.id,
      name: culture.name,
      surface,
      plants,
      production,
      needs,
      missing,
      planning: culture.planning
    };

  }).filter(c => c.surface > 0);

  const totalProduction =
    culturesReport.reduce(
      (acc, c) => acc + c.production,
      0
    );

  const totalNeeds =
    culturesReport.reduce(
      (acc, c) => acc + c.needs,
      0
    );

  const autosufficiency =
    totalNeeds === 0
      ? 0
      : Math.round((totalProduction / totalNeeds) * 100);

  return {

    general: {
      people: config.peopleCount,
      targetAutosufficiency: config.sufficiencyTarget,
      surfaceTerrain,
      surfaceCultivee,
      plotCount: cultivatedPlots.length
    },

    diagnostic: {
      totalProduction,
      totalNeeds,
      autosufficiency
    },

    cultures: culturesReport
  };
}