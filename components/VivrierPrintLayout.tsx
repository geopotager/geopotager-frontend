import { buildVivrierReport } from "../lib/vivrierReport";
import React from "react";
import { GardenConfig, Plot } from "../types";
import AutosufficiencyTab from "./AutosufficiencyTab";
import GardenMap from "./GardenMap";
import VivrierFoodProduction from "./VivrierFoodProduction";
import VivrierSummary from "./VivrierSummary";

interface Props {
  config: GardenConfig;
  plots: Plot[];
  onClose: () => void;
}

const VivrierPrintLayout: React.FC<Props> = ({ config, plots, onClose }) => {

  const report = buildVivrierReport(plots, config);

  const today = new Date();

  return (
    <div className="min-h-screen bg-[#EFEBE9] text-[#3E2723] font-sans print:bg-white">

      {/* Barre contrôle écran */}
      <div className="flex justify-between items-center p-6 border-b-4 border-black bg-white print:hidden">
        <h1 className="text-2xl font-black">Aperçu Dossier Vivrier</h1>

        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="bg-emerald-500 border-2 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Lancer Impression
          </button>

          <button
            onClick={onClose}
            className="bg-white border-2 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8 print:p-0 print:max-w-none">

        {/* PAGE 1 — COUVERTURE */}
        <section className="vivrier-page bg-[#5D4037] text-white p-12 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">

          <div className="text-center space-y-8">

            <h1 className="text-6xl font-black tracking-tight">
              GÉOPOTAGER
            </h1>

            <p className="text-sm tracking-[0.3em] opacity-80">
              INTELLIGENCE VIVRIÈRE
            </p>

            <p className="text-xl font-mono tracking-[0.4em] bg-black px-6 py-2 inline-block">
              DOSSIER VIVRIER
            </p>

            <div className="pt-12 space-y-4 text-lg">

              <p>
                Foyer :
                <span className="font-black ml-2">
                  {report.general.people} personnes
                </span>
              </p>

              <p>
                Objectif autosuffisance :
                <span className="font-black ml-2">
                  {report.general.targetAutosufficiency} %
                </span>
              </p>

              <p>
                Surface terrain :
                <span className="font-black ml-2">
                  {report.general.surfaceTerrain.toFixed(0)} m²
                </span>
              </p>

              <p>
                Surface cultivée :
                <span className="font-black ml-2">
                  {report.general.surfaceCultivee.toFixed(0)} m²
                </span>
              </p>

              <p>
                Parcelles cultivées :
                <span className="font-black ml-2">
                  {report.general.plotCount}
                </span>
              </p>

              <p className="opacity-70 text-sm pt-4">
                Généré le {today.toLocaleDateString()}
              </p>

            </div>

          </div>
        </section>

        {/* PAGE 2 — PLAN DU JARDIN */}
        <section className="vivrier-page bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

          <h2 className="text-3xl font-black mb-8 uppercase">
            Plan du jardin
          </h2>

          <div className="border-2 border-black p-4 h-[520px]">

            <GardenMap
              plots={plots}
              onSelectPlot={() => { }}
              onUpdatePlot={() => { }}
              onAddPlot={() => { }}
              onConfigChange={() => { }}
              selectedPlotId={null}
              multiSelectedIds={[]}
              onMultiSelect={() => { }}
              config={config}
              isCalibrating={false}
              showSunPath={false}
              setIsDragging={() => { }}
              printMode={true}
            />

          </div>
        </section>

        {/* PAGE 3 — SYNTHÈSE VIVRIÈRE */}
        <section className="vivrier-page bg-white p-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

          <h2 className="text-3xl font-black mb-8 uppercase">
            Diagnostic vivrier
          </h2>

          <div className="grid grid-cols-3 gap-8 text-center">

            <div className="border-2 border-black p-6">
              <p className="text-sm opacity-60">Production estimée</p>
              <p className="text-4xl font-black">
                {Math.round(report.diagnostic.totalProduction)} kg
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <p className="text-sm opacity-60">Besoins alimentaires</p>
              <p className="text-4xl font-black">
                {Math.round(report.diagnostic.totalNeeds)} kg
              </p>
            </div>

            <div className="border-2 border-black p-6">
              <p className="text-sm opacity-60">Autosuffisance</p>
              <p className="text-4xl font-black">
                {report.diagnostic.autosufficiency} %
              </p>
            </div>

          </div>

          <div className="mt-10 text-lg leading-relaxed">

            <p>
              Le potager couvre actuellement environ
              <span className="font-black">
                {" "} {report.diagnostic.autosufficiency}% {" "}
              </span>
              des besoins alimentaires du foyer.
            </p>

            <p className="mt-4 opacity-70">
              Production estimée : {Math.round(report.diagnostic.totalProduction)} kg
              pour un besoin annuel de {Math.round(report.diagnostic.totalNeeds)} kg.
            </p>

          </div>

        </section>

        {/* PAGE 4 — PRODUCTION ALIMENTAIRE */}
        <section className="vivrier-page">
          <VivrierFoodProduction plots={plots} config={config} />
        </section>

      </div>
    </div>
  );
};

export default VivrierPrintLayout;