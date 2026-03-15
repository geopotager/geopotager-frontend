import { GardenConfig } from "../types";
import { Plot } from "../types";

export function computeCultivableSurface(config: GardenConfig) {

    const bed = config.bedWidth || 1.2;
    const path = config.pathWidth || 0.4;

    const moduleWidth = bed + path;

    const bands = Math.floor(config.terrainWidth / moduleWidth);

    const cultivableWidth = bands * bed;

    const cultivableSurface =
        cultivableWidth * config.terrainHeight;

    return {
        bands,
        cultivableWidth: Number(cultivableWidth.toFixed(2)),
        cultivableSurface: Number(cultivableSurface.toFixed(2))
    };
}

export function generateBeds(config: GardenConfig): Plot[] {

  const bed = config.bedWidth || 1.2;
  const path = config.pathWidth || 0.4;

  const moduleWidth = bed + path;

  const bands = Math.floor(config.terrainWidth / moduleWidth);

  const beds: Plot[] = [];

  for (let i = 0; i < bands; i++) {

    const x = i * moduleWidth;

    beds.push({
      id: crypto.randomUUID(),
      name: `Planche ${i + 1}`,
      type: "culture",
      shape: "rect",

      x: x,
      y: 0,

      width: bed,
      height: config.terrainHeight,

      rotation: 0,
      opacity: 0.5,
      exposure: "Soleil",

      color: "#A3D977"
    });

  }

  return beds;
}