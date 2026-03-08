import React from "react";
import { GardenConfig, Plot } from "../types";
import AutosufficiencyTab from "./AutosufficiencyTab";

interface Props {
  config: GardenConfig;
  plots: Plot[];
  onClose: () => void;
}

const VivrierPrintLayout: React.FC<Props> = ({ config, plots, onClose }) => {
  return (
    <div className="min-h-screen bg-white text-black p-8 print:p-0">

      {/* Barre contrôle écran uniquement */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-2xl font-black">Aperçu Impression</h1>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 border-2 border-black px-6 py-2 font-black"
          >
            Lancer Impression
          </button>
          <button
            onClick={onClose}
            className="bg-white border-2 border-black px-6 py-2 font-black"
          >
            Retour
          </button>
        </div>
      </div>

      {/* Contenu print */}
      <div className="max-w-5xl mx-auto print:max-w-none">

        <AutosufficiencyTab
          config={config}
          onConfigChange={() => {}}
          plots={plots}
        />

      </div>
    </div>
  );
};

export default VivrierPrintLayout;