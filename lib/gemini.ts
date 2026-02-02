
import { GoogleGenAI, Type } from "@google/genai";

// --- Mock Data pour le fallback en cas d'erreur de quota (429) ---
const MOCK_VARIETIES = [
  { name: "Variété Rustique Locale", description: "Variété ancienne adaptée à la plupart des climats, résistante aux maladies courantes." },
  { name: "Variété Précoce", description: "Idéale pour les récoltes rapides avant les gelées ou les fortes chaleurs." },
  { name: "Variété de Conservation", description: "Peau épaisse, idéale pour le stockage hivernal." }
];

const MOCK_ROTATIONS = [
  { cultureName: "Haricots ou Pois", reason: "Fixe l'azote dans le sol pour régénérer la terre après une culture gourmande.", timing: "Printemps suivant" },
  { cultureName: "Laitues d'hiver", reason: "Couverture du sol légère, n'épuise pas les réserves.", timing: "Automne" },
  { cultureName: "Engrais Vert (Moutarde)", reason: "Structure le sol et évite le lessivage des nutriments.", timing: "Fin d'été" }
];

export const getVarietiesForLocation = async (cultureName: string, location: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Agis comme un expert maraîcher. Je suis situé à : ${location}.
    Pour la culture : "${cultureName}", suggère-moi 5 variétés spécifiquement adaptées à mon climat local (rusticité, résistance, précocité).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nom de la variété" },
              description: { type: Type.STRING, description: "Court descriptif technique" },
            },
            required: ["name", "description"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("API Quota exceeded or Error in getVarietiesForLocation, using mock data.", e);
    // Fallback pour ne pas bloquer l'UI
    return MOCK_VARIETIES.map(v => ({...v, name: `${v.name} (${cultureName})`}));
  }
};

export const getNextRotationSuggestions = async (currentCultureName: string, location: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Je suis à ${location}. Je cultive actuellement "${currentCultureName}".
    Quelles sont les 3 meilleures cultures à planter APRÈS celle-ci (saison suivante) en respectant la rotation des cultures et le climat ?`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cultureName: { type: Type.STRING, description: "Nom générique" },
              reason: { type: Type.STRING, description: "Pourquoi c'est bon pour le sol" },
              timing: { type: Type.STRING, description: "Quand planter (mois)" },
            },
            required: ["cultureName", "reason", "timing"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("API Quota exceeded or Error in getNextRotationSuggestions, using mock data.", e);
    return MOCK_ROTATIONS;
  }
};

export const getGardenAnalysis = async (gardenData: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyse la configuration de mon potager : ${JSON.stringify(gardenData)}. 
      Considère l'objectif d'autosuffisance. Donne-moi 3 conseils stratégiques pour optimiser le rendement.`,
    });
    return response.text;
  } catch (e) {
    console.warn("API Error in getGardenAnalysis", e);
    return "L'analyse IA est momentanément indisponible (Quota atteint). Concentrez-vous sur la densité de plantation et la rotation des cultures pour optimiser votre rendement.";
  }
};

export const geocodeAddress = async (address: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Donne-moi les coordonnées précises (latitude et longitude) pour l'adresse suivante : "${address}". Réponds UNIQUEMENT au format JSON : {"lat": number, "lng": number}`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    
    const text = response.text || "{}";
    const match = text.match(/\{.*\}/s);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {
    console.error("Geocoding parsing error or Quota limit", e);
    // Pas de mock facile pour le géocodage sans API map, on retourne null
  }
  return null;
};
