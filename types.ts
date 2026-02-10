
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type PlotType = 'culture' | 'building' | 'tree' | 'pond' | 'water_tank' | 'greenhouse' | 'coop' | 'beehive' | 'path';
export type ShapeType = 'rect' | 'circle';
export type CultureCategory = 'Racines' | 'Fruits' | 'Feuilles' | 'Légumineuses' | 'Tubercules' | 'Bulbes' | 'Aromatiques' | 'Petits Fruits' | 'Céréales' | 'Fleurs' | 'Arbres Fruitiers' | 'Perenne';

export interface Disease {
  name: string;
  solution: string;
}

export interface Planning {
  sowing: Month[];
  planting: Month[];
  harvest: Month[];
  maintenance: Month[];
}

export interface WateringInfo {
  frequency: string; // ex: "2x / semaine"
  volumePerPlant: number; // en Litres par arrosage
}

export interface YieldInfo {
  amount: number; // Quantité numérique
  unit: string; // ex: "kg/m²" ou "kg/plant"
  description: string; // ex: "3 à 5 kg par pied"
}

export interface Variety {
  name: string;
  image?: string;
  description: string;
  advantage: string;
  yieldBoost?: string; // ex: "+20%"
  waterNeedLevel: 1 | 2 | 3; // 1 faible, 3 élevé
}

export interface Culture {
  id: string;
  name: string;
  category: CultureCategory;
  varieties: Variety[];
  description: string;
  image: string;
  exposure: 'Soleil' | 'Mi-ombre' | 'Ombre';
  waterNeeds: 'Faible' | 'Moyen' | 'Élevé';
  watering: WateringInfo;
  yield: YieldInfo;
  maintenanceTips: string;
  growingMethods: string; 
  soilCoverage: string; 
  associations: string[]; 
  diseases: Disease[];
  plantsPerPerson: number;
  spacingCm: {
    betweenPlants: number;
    betweenRows: number;
  };
  planning: Planning;
  rotations: CultureCategory[];
  successions: number; // Nombre de fois que la culture peut être faite sur une saison (ex: radis = 4, tomates = 1)
}

export interface Plot {
  id: string;
  name: string;
  type: PlotType;
  shape: ShapeType;
  x: number; // en mètres
  y: number; // en mètres
  width: number; // en mètres
  height: number; // en mètres
  rotation?: number; // en degrés (0-360)
  color?: string; // code hex ou classe
  opacity?: number; // 0 à 1
  exposure: 'Soleil' | 'Mi-ombre' | 'Ombre';
  plantedCultureId?: string;
  selectedVariety?: string; // Garde le nom de la variété sélectionnée
  customImage?: string;
  rowOrientation?: 'horizontal' | 'vertical'; // Orientation for culture rows
  // Spécifique Serre
  subPlots?: Plot[]; // Pour le plan intérieur de la serre
  // Spécifique Poulailler
  chickenCount?: number;
}

export interface GardenConfig {
  peopleCount: 1 | 2 | 3 | 4;
  sufficiencyTarget: number;
  terrainWidth: number; // mètres
  terrainHeight: number; // mètres
  address?: string;
  lat?: number;
  lng?: number;
  backgroundImage?: string;
  backgroundScale: number;
  backgroundX: number;
  backgroundY: number;
  backgroundOpacity: number;
  backgroundRotation?: number; 
}

export interface PlotSuggestion {
  cultureId: string;
  missingPlants: number;
  suggestedWidth: number;
  suggestedHeight: number;
  reason: string;
  selected?: boolean; // Pour l'UI de sélection multiple
}

export interface VarietySuggestion {
  name: string;
  description: string;
}

export interface RotationSuggestion {
  cultureName: string;
  reason: string;
  timing: string;
}
