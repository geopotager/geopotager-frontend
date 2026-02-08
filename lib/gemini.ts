
import { VarietySuggestion, RotationSuggestion } from '../types';
import { CLIMATES, VARIETIES_DB, ROTATION_RULES, GARDEN_TIPS } from '../mockData';
import { CULTURES } from '../constants';

// --- SYSTEME EXPERT LOCAL (Sans appel API) ---

// Détermine le climat approximatif basé sur une string (très basique pour l'exemple)
export const getClimate = (location: string): 'oceanic' | 'mediterranean' | 'continental' | 'mountain' => {
  if(!location) return 'oceanic';
  for (const [key, value] of Object.entries(CLIMATES)) {
    if (location.toLowerCase().includes(key.toLowerCase())) return value as any;
  }
  return 'oceanic'; // Défaut
};

export const getVarietiesForLocation = async (cultureName: string, location: string): Promise<VarietySuggestion[]> => {
  // Simulation de délai asynchrone (optionnel, pour l'UX fluide)
  await new Promise(resolve => setTimeout(resolve, 50));

  const climate = getClimate(location);
  
  // Recherche dans la DB
  // Mapping intelligent des noms (ex: 'Tomates' -> 'Tomates')
  let dbKey = Object.keys(VARIETIES_DB).find(k => k.toLowerCase() === cultureName.toLowerCase());
  
  // Fallback si non trouvé direct, essayer par catégorie générique
  if (!dbKey) {
      if(cultureName.toLowerCase().includes('laitue') || cultureName.toLowerCase().includes('salade')) dbKey = 'Salades';
      else if(cultureName.toLowerCase().includes('courge')) dbKey = 'Courges';
      else if(cultureName.toLowerCase().includes('haricot')) dbKey = 'Haricots';
  }

  if (dbKey) {
      const varietiesByCulture = VARIETIES_DB[dbKey];
      // Essayer le climat spécifique, sinon 'all', sinon le premier dispo
      const varieties = varietiesByCulture[climate] || varietiesByCulture['all'] || Object.values(varietiesByCulture)[0];
      if (varieties && varieties.length > 0) return varieties;
  }

  // Fallback ultime générique
  return [
    { name: "Variété Locale", description: "Privilégiez les semences paysannes de votre région." },
    { name: "Variété Rustique", description: "Plus résistante aux maladies." }
  ];
};

export const getNextRotationSuggestions = async (currentCultureName: string, location: string): Promise<RotationSuggestion[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));

  // Trouver la catégorie de la culture actuelle
  const culture = CULTURES.find(c => c.name === currentCultureName);
  const category = culture ? culture.category : 'Feuilles'; // Fallback

  const suggestions = ROTATION_RULES[category] || ROTATION_RULES['Feuilles'];
  
  return suggestions;
};

export const getGardenAnalysis = async (gardenData: any): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 100));

  const plotCount = gardenData.plots ? gardenData.plots.length : 0;
  // Aléatoire déterministe basé sur la longueur pour varier un peu sans random pur
  const tipIndex = plotCount % GARDEN_TIPS.length;
  const tip = GARDEN_TIPS[tipIndex];

  let analysis = "";
  if (plotCount === 0) {
      analysis = "Commencez par ajouter des parcelles (potager, serre, poulailler) via le menu.";
  } else if (plotCount < 3) {
    analysis = "Bon début ! Vous avez encore de l'espace pour diversifier vos cultures.";
  } else {
    analysis = "Votre plan est bien rempli. Pensez maintenant aux rotations.";
  }

  return `${analysis} Conseil : ${tip}`;
};

// Le géocodage reste simulé localement
export const geocodeAddress = async (address: string) => {
  // Mock simple : France par défaut
  return { lat: 46.603354, lng: 1.888334 }; 
};
