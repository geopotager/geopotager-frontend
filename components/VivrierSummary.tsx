import React from "react";
import { Plot } from "../types";
import { CULTURES } from "../constants";
import { calculateNeeds, countExistingPlants } from "../lib/plantCalculations";
import { convertYieldToKg } from "../lib/yieldToKg";

interface Props {
  plots: Plot[];
  config: any;
}

const VivrierSummary: React.FC<Props> = ({ plots, config }) => {

  let totalProduction = 0;
  let totalNeeded = 0;
  let totalSurfaceNeeded = 0;

  const cultivatedSurface = plots.reduce(
    (sum, p) => sum + (p.width * p.height),
    0
  );

  const terrainSurface =
    (config.terrainWidth || 0) *
    (config.terrainHeight || 0);

  CULTURES.forEach(culture => {

    const plants = countExistingPlants(plots, culture.id);

    const { neededPlants } = calculateNeeds(
      culture.id,
      config.peopleCount,
      config.sufficiencyTarget
    );

    if (!culture.yield) return;

    const yieldAmount = culture.yield.amount || 0;
    const yieldUnit = culture.yield.unit || "";

    const yieldKg = convertYieldToKg(
      yieldAmount,
      yieldUnit,
      culture.averageWeightKg
    );

    const surfacePerPlant =
      (culture.spacingCm?.betweenPlants || 0) / 100 *
      (culture.spacingCm?.betweenRows || 0) / 100;

    const usedSurface = plants * surfacePerPlant;
    const neededSurface = neededPlants * surfacePerPlant;

    /* -------------------------
       PRODUCTION ACTUELLE
    ------------------------- */

    if (yieldUnit.includes("plant")) {

      totalProduction += plants * yieldKg;

    } else if (yieldUnit.includes("m²")) {

      totalProduction += usedSurface * yieldKg;

    }

    /* -------------------------
       OBJECTIF ALIMENTAIRE
    ------------------------- */

    if (yieldUnit.includes("plant")) {

      totalNeeded += neededPlants * yieldKg;

    } else if (yieldUnit.includes("m²")) {

      totalNeeded += neededSurface * yieldKg;

    }

    /* -------------------------
       SURFACE NECESSAIRE
    ------------------------- */

    totalSurfaceNeeded += neededSurface;

  });

  const missing =
    Math.max(0, totalNeeded - totalProduction);

  const coverage =
    totalNeeded > 0
      ? Math.round((totalProduction / totalNeeded) * 100)
      : 0;

  const missingSurface =
    Math.max(0, totalSurfaceNeeded - cultivatedSurface);

  const terrainOccupation =
    terrainSurface > 0
      ? Math.round((cultivatedSurface / terrainSurface) * 100)
      : 0;

  return (

    <section className="vivrier-page break-after-page bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

      <h2 className="text-3xl font-black mb-10 uppercase">
        Synthèse Vivrière
      </h2>

      <div className="grid grid-cols-2 gap-8 text-center">

        <div className="border-2 border-black p-6">
          <div className="text-4xl font-black text-emerald-600">
            {coverage} %
          </div>
          <div className="text-sm font-bold uppercase mt-2">
            Autosuffisance
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <div className="text-4xl font-black text-orange-600">
            {Math.round(totalProduction)} kg
          </div>
          <div className="text-sm font-bold uppercase mt-2">
            Production actuelle
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <div className="text-4xl font-black">
            {Math.round(totalNeeded)} kg
          </div>
          <div className="text-sm font-bold uppercase mt-2">
            Objectif alimentaire
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <div className="text-4xl font-black text-red-600">
            {Math.round(missing)} kg
          </div>
          <div className="text-sm font-bold uppercase mt-2">
            Manque estimé
          </div>
        </div>

      </div>

      <div className="mt-10 border-t-2 border-black pt-6 text-sm font-mono space-y-1">

        <div className="flex justify-between">
          <span>Surface cultivée</span>
          <span>{cultivatedSurface.toFixed(2)} m²</span>
        </div>

        <div className="flex justify-between">
          <span>Surface terrain</span>
          <span>{terrainSurface} m²</span>
        </div>

        <div className="flex justify-between">
          <span>Surface nécessaire autosuffisance</span>
          <span>{totalSurfaceNeeded.toFixed(2)} m²</span>
        </div>

        <div className="flex justify-between font-black text-red-600">
          <span>Surface manquante</span>
          <span>{missingSurface.toFixed(2)} m²</span>
        </div>

        <div className="flex justify-between font-black pt-2 border-t border-black">
          <span>Occupation du terrain</span>
          <span>{terrainOccupation} %</span>
        </div>

      </div>

    </section>

  );
};

export default VivrierSummary;