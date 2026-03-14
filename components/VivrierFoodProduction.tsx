import React from "react";
import { Plot } from "../types";
import { CULTURES } from "../constants";
import { countExistingPlants, calculateNeeds } from "../lib/plantCalculations";

interface Props {
  plots: Plot[];
  config: any;
}

const VivrierFoodProduction: React.FC<Props> = ({ plots, config }) => {

  const rows = CULTURES.map(culture => {

    const plants = countExistingPlants(plots, culture.id);

    const { neededPlants } = calculateNeeds(
      culture.id,
      config.peopleCount,
      config.sufficiencyTarget
    );

    const usedSurface = plots
      .filter(p => p.plantedCultureId === culture.id)
      .reduce((sum, p) => sum + p.width * p.height, 0);

    const production =
      culture.yield?.amount && culture.yield?.unit
        ? plants * culture.yield.amount
        : 0;

    const productionNeeded =
      culture.yield?.amount && culture.yield?.unit
        ? neededPlants * culture.yield.amount
        : 0;

    const productionMissing = Math.max(0, productionNeeded - production);

    if (plants === 0 && neededPlants === 0) return null;

    return {
      name: culture.name,
      plants,
      neededPlants,
      usedSurface,
      production,
      productionNeeded,
      productionMissing,
      unit: culture.yield?.unit ?? ""
    };

  }).filter(Boolean);

  const totalProduction = rows.reduce((acc: number, row: any) => {
    if (row.unit.includes("kg")) return acc + row.production;
    return acc;
  }, 0);

  const totalMissing = rows.reduce((acc: number, row: any) => {
    if (row.unit.includes("kg")) return acc + row.productionMissing;
    return acc;
  }, 0);

  return (

    <section className="vivrier-page bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

      <h2 className="text-3xl font-black mb-8 uppercase">
        Production vivrière estimée
      </h2>

      <table className="w-full border-2 border-black text-left text-sm">

        <thead className="bg-[#DDD4CD] border-b-2 border-black">
          <tr>
            <th className="p-3 border-r-2 border-black">Culture</th>
            <th className="p-3 border-r-2 border-black text-center">Plants</th>
            <th className="p-3 border-r-2 border-black text-center">Surface</th>
            <th className="p-3 border-r-2 border-black text-center">Production</th>
            <th className="p-3 border-r-2 border-black text-center">Objectif</th>
            <th className="p-3 text-center">Manque</th>
          </tr>
        </thead>

        <tbody>

          {rows.map((row: any, i) => (

            <tr key={i} className="border-b border-black">

              <td className="p-3 border-r border-black font-black">
                {row.name}
              </td>

              <td className="p-3 border-r border-black text-center font-mono">
                {row.plants} / {row.neededPlants}
              </td>

              <td className="p-3 border-r border-black text-center font-mono">
                {row.usedSurface.toFixed(2)} m²
              </td>

              <td className="p-3 border-r border-black text-center text-orange-600 font-black">
                {Math.round(row.production)} {row.unit}
              </td>

              <td className="p-3 border-r border-black text-center font-mono">
                {Math.round(row.productionNeeded)} {row.unit}
              </td>

              <td className="p-3 text-center text-red-600 font-black">
                {Math.round(row.productionMissing)} {row.unit}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="mt-8 flex justify-between text-xl font-black">

        <div>
          Production actuelle : {Math.round(totalProduction)} kg / an
        </div>

        <div className="text-red-600">
          Manque estimé : {Math.round(totalMissing)} kg
        </div>

      </div>

    </section>
  );
};

export default VivrierFoodProduction;