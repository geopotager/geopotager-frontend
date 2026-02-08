
import { VarietySuggestion, RotationSuggestion } from './types';

// --- CLIMATS & AJUSTEMENTS ---
export const CLIMATES: Record<string, 'oceanic' | 'mediterranean' | 'continental' | 'mountain' | 'cold_continental'> = {
  'Sarthe': 'oceanic',
  'Bretagne': 'oceanic',
  'Normandie': 'oceanic',
  'Paris': 'oceanic',
  'Nord': 'oceanic',
  'Lille': 'oceanic',
  'Hauts-de-France': 'oceanic',
  'Lyon': 'continental',
  'Alsace': 'continental',
  'Lorraine': 'continental',
  'Marseille': 'mediterranean',
  'Nice': 'mediterranean',
  'Montpellier': 'mediterranean',
  'Toulouse': 'mediterranean', // Tendance chaude
  'Bordeaux': 'oceanic',
  'Alpes': 'mountain',
  'Pyrénées': 'mountain',
  'Massif Central': 'mountain',
  'Quebec': 'cold_continental',
  'Montreal': 'cold_continental',
  'Canada': 'cold_continental'
};

export const CLIMATE_ADJUSTMENTS = {
  oceanic: { waterMultiplier: 1.0, description: "Climat tempéré, arrosage standard." },
  mediterranean: { waterMultiplier: 1.8, description: "Été sec et chaud, arrosage crucial." },
  continental: { waterMultiplier: 1.3, description: "Été chaud, surveiller l'évaporation." },
  mountain: { waterMultiplier: 1.1, description: "Variable selon altitude et exposition." },
  cold_continental: { waterMultiplier: 1.0, description: "Saison courte, sol souvent humide au printemps." }
};

// --- BASE DE DONNÉES VARIÉTÉS ---
export const VARIETIES_DB: Record<string, Record<string, VarietySuggestion[]>> = {
  'Tomates': {
    'oceanic': [
      { name: 'Marmande', description: 'Précoce, tolère bien les étés frais et humides.' },
      { name: 'Stupice', description: 'Ultra-précoce, idéale pour saisons courtes.' }
    ],
    'mediterranean': [
      { name: 'San Marzano', description: 'La référence pour les sauces, adore le soleil.' },
      { name: 'Cœur de Bœuf', description: 'Grosse et charnue, saveur incomparable.' }
    ],
    'cold_continental': [
      { name: 'Sub-Arctic', description: 'Extrêmement précoce pour étés courts (Québec).' },
      { name: 'Manitoba', description: 'Vigoureuse pour le nord.' }
    ]
  },
  'Pommes de Terre': {
    'oceanic': [
      { name: 'Charlotte', description: 'Valeur sûre, chair ferme.' }
    ],
    'cold_continental': [
      { name: 'Kennebec', description: 'Rustique et productive.' },
      { name: 'Yukon Gold', description: 'Chair jaune, polyvalente.' }
    ]
  },
  'Maïs Doux': {
    'cold_continental': [
      { name: 'Peaches & Cream', description: 'Bicolore, maturité rapide.' }
    ]
  }
};

// --- RÈGLES DE ROTATION ---
export const ROTATION_RULES: Record<string, RotationSuggestion[]> = {
  'Tubercules': [ // Après PDT
    { cultureName: 'Haricots', reason: 'Rechargent le sol en azote après les pommes de terre gourmandes.', timing: 'Printemps suivant' },
    { cultureName: 'Pois', reason: 'Culture d\'hiver/printemps pour couvrir le sol.', timing: 'Automne / Printemps' }
  ],
  'Fruits': [ // Après Tomates, Courges
    { cultureName: 'Carottes', reason: 'Les racines iront chercher les nutriments en profondeur.', timing: 'Printemps suivant' },
    { cultureName: 'Oignons', reason: 'Ne demandent pas d\'azote frais.', timing: 'Printemps suivant' }
  ],
  'Feuilles': [ // Après Salades, Choux
    { cultureName: 'Tomates', reason: 'Si le sol a été bien amendé en compost.', timing: 'Printemps suivant' },
    { cultureName: 'Pommes de Terre', reason: 'Nettoient le sol après les choux.', timing: 'Printemps suivant' }
  ],
  'Légumineuses': [ // Après Haricots, Pois
    { cultureName: 'Choux', reason: 'Gros consommateurs d\'azote, ils adoreront la place.', timing: 'Été / Automne' },
    { cultureName: 'Courges', reason: 'Bénéficient de la richesse du sol.', timing: 'Printemps suivant' }
  ],
  'Racines': [ // Après Carottes, Betteraves
    { cultureName: 'Légumineuses', reason: 'Pour aérer la terre parfois tassée lors de la récolte.', timing: 'Printemps suivant' },
    { cultureName: 'Poireaux', reason: 'Classique rotation inversée.', timing: 'Été' }
  ],
  'Céréales': [
    { cultureName: 'Légumineuses', reason: 'Pour régénérer l\'azote consommé par les céréales.', timing: 'Printemps suivant' },
    { cultureName: 'Engrais Vert', reason: 'Trèfle incarnat pour couvrir le sol.', timing: 'Après moisson' }
  ]
};

// --- CONSEILS JARDIN ---
export const GARDEN_TIPS = [
  "Paillez vos cultures (paille, foin, tontes) : cela réduit l'arrosage de 50% et nourrit le sol.",
  "Associez les œillets d'Inde aux tomates pour repousser les nématodes du sol.",
  "Au Québec, attendez la fin des risques de gel (souvent fin mai) pour planter les légumes fruits.",
  "En climat méditerranéen, l'ombrage est aussi important que le soleil : utilisez des voiles d'ombrage en juillet/août.",
  "Arrosez toujours le soir en été, le matin au printemps/automne.",
  "Ne laissez jamais le sol nu : semez de la phacélie ou de la moutarde en engrais vert.",
  "Taillez les gourmands des tomates pour avoir de plus gros fruits.",
  "Buttez les pommes de terre et les haricots pour renforcer leur enracinement."
];
