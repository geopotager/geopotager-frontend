import React from "react";
import { Plot } from "../types";
import { CULTURES } from "../constants";
import { countExistingPlants } from "../lib/plantCalculations";

interface Props {
  plots: Plot[];
}

const VivrierFoodProduction: React.FC<Props> = ({ plots }) => {

  const rows = CULTURES.map(culture => {

    const plants = countExistingPlants(plots, culture.id);

    if (plants === 0) return null;

    const production =
      culture.yield?.amount && culture.yield?.unit
        ? plants * culture.yield.amount
        : null;

    return {
      name: culture.name,
      plants,
      unit: culture.yield?.unit ?? "",
      production
    };

  }).filter(Boolean);

  const totalKg = rows.reduce((acc: number, row: any) => {
    if (row.unit.includes("kg")) return acc + row.production;
    return acc;
  }, 0);

  return (

    <section className="vivrier-page bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

      <h2 className="text-3xl font-black mb-8 uppercase">
        Production vivrière estimée
      </h2>

      <table className="w-full border-2 border-black text-left">

        <thead className="bg-[#DDD4CD] border-b-2 border-black">
          <tr>
            <th className="p-3 border-r-2 border-black">Culture</th>
            <th className="p-3 border-r-2 border-black">Plants</th>
            <th className="p-3 border-r-2 border-black">Production estimée</th>
          </tr>
        </thead>

        <tbody>

          {rows.map((row: any, i) => (

            <tr key={i} className="border-b border-black">

              <td className="p-3 border-r border-black font-black">
                {row.name}
              </td>

              <td className="p-3 border-r border-black">
                {row.plants}
              </td>

              <td className="p-3">
                {row.production
                  ? `${Math.round(row.production)} ${row.unit}`
                  : "—"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      <div className="mt-8 text-xl font-black">
        Production alimentaire estimée : {Math.round(totalKg)} kg / an
      </div>

    </section>

  );
};

export default VivrierFoodProduction;