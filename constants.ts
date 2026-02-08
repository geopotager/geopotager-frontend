
import { Culture, Plot, CultureCategory } from './types';

export const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
export const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const CATEGORY_COLORS: Record<CultureCategory, string> = {
  'Fruits': 'bg-red-400',
  'Racines': 'bg-yellow-400',
  'Feuilles': 'bg-lime-400',
  'Légumineuses': 'bg-green-400',
  'Tubercules': 'bg-purple-500 text-white',
  'Bulbes': 'bg-fuchsia-400',
  'Aromatiques': 'bg-cyan-400',
  'Petits Fruits': 'bg-pink-400',
  'Céréales': 'bg-amber-400',
  'Fleurs': 'bg-indigo-400',
  'Arbres Fruitiers': 'bg-green-700 text-white',
  'Perenne': 'bg-gray-500 text-white'
};

export const CULTURES: Culture[] = [
  // --- CÉRÉALES ---
  {
    id: 'ble',
    name: 'Blé d\'Hiver',
    category: 'Céréales',
    varieties: [
      { name: 'Rouge de Bordeaux', description: 'Blé ancien panifiable.', advantage: 'Paille haute, étouffe les herbes', waterNeedLevel: 1 },
      { name: 'Petit Épeautre', description: 'Faible gluten, rustique.', advantage: 'Très digest', waterNeedLevel: 1 }
    ],
    description: 'Base de l\'alimentation (pain, farine). Culture longue.',
    image: 'https://www.themealdb.com/images/ingredients/Flour.png',
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Pluie naturelle', volumePerPlant: 0 },
    yield: { amount: 0.5, unit: 'kg/m²', description: 'Nécessite une surface conséquente.' },
    maintenanceTips: 'Semis à la volée en octobre. Faucher en juillet quand l\'épi est sec.',
    growingMethods: 'Semis dense.',
    soilCoverage: 'Couvre-sol total.',
    associations: ['Trèfle', 'Fèves'],
    plantsPerPerson: 200, 
    spacingCm: { betweenPlants: 2, betweenRows: 15 },
    rotations: ['Légumineuses', 'Racines'],
    diseases: [{ name: 'Rouille', solution: 'Purin de prêle.' }],
    planning: { sowing: [10, 11], planting: [], maintenance: [], harvest: [7] }
  },
  {
    id: 'mais',
    name: 'Maïs Doux',
    category: 'Céréales',
    varieties: [
      { name: 'Golden Bantam', description: 'Jaune classique, sucré.', advantage: 'Hâtif', waterNeedLevel: 3 },
      { name: 'Fraise', description: 'Grains rouges pour popcorn.', advantage: 'Décoratif et bon', waterNeedLevel: 2 }
    ],
    description: 'Céréale d\'été gourmande en eau et azote.',
    image: 'https://www.themealdb.com/images/ingredients/Corn.png',
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 2 },
    yield: { amount: 2, unit: 'épis/plant', description: 'Récolte échelonnée.' },
    maintenanceTips: 'Buttez les pieds quand ils font 30cm. Associez aux haricots (Milpa).',
    growingMethods: 'En bloc (pas en ligne seule) pour la pollinisation.',
    soilCoverage: 'Ombre le sol.',
    associations: ['Haricots', 'Courges', 'Tournesol'],
    plantsPerPerson: 10,
    spacingCm: { betweenPlants: 30, betweenRows: 70 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Pyrales', solution: 'Trichogrammes.' }],
    planning: { sowing: [4, 5], planting: [5, 6], maintenance: [6, 7], harvest: [8, 9, 10] }
  },
  {
    id: 'orge',
    name: 'Orge',
    category: 'Céréales',
    varieties: [
      { name: 'Escourgeon', description: 'Orge d\'hiver.', advantage: 'Cycle court', waterNeedLevel: 1 }
    ],
    description: 'Céréale rustique, utilisable en grain ou farine.',
    image: 'https://www.themealdb.com/images/ingredients/Barley.png',
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Pluie naturelle', volumePerPlant: 0 },
    yield: { amount: 0.4, unit: 'kg/m²', description: 'Moins exigeant que le blé.' },
    maintenanceTips: 'Attention aux oiseaux au semis (filet). Roulage au printemps.',
    growingMethods: 'Semis à la volée.',
    soilCoverage: 'Dense.',
    associations: ['Pois'],
    plantsPerPerson: 150,
    spacingCm: { betweenPlants: 2, betweenRows: 15 },
    rotations: ['Légumineuses'],
    diseases: [],
    planning: { sowing: [2, 3, 9, 10], planting: [], maintenance: [], harvest: [6, 7] }
  },

  // --- FAMILLE DES CHOUX ---
  {
    id: 'brocoli',
    name: 'Brocoli',
    category: 'Feuilles',
    varieties: [
      { name: 'Calabrais', description: 'Pomme verte classique.', advantage: 'Productif', waterNeedLevel: 2 },
      { name: 'Romanesco', description: 'Pomme géométrique vert clair.', advantage: 'Décoratif et doux', waterNeedLevel: 2 },
      { name: 'Brocoli à Jets', description: 'Petites têtes violettes.', advantage: 'Récolte précoce printemps', waterNeedLevel: 2 }
    ],
    description: 'Délicieux et riche en vitamines. Récolte avant floraison.',
    image: 'https://www.themealdb.com/images/ingredients/Broccoli.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 1 },
    yield: { amount: 0.5, unit: 'kg/plant', description: 'Coupez la tête principale, des rejets repousseront.' },
    maintenanceTips: 'Maintenir le sol humide. Paillage indispensable. Protéger des piérides avec un filet.',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Large.',
    associations: ['Céleri', 'Pommes de terre', 'Aromatiques'],
    plantsPerPerson: 4,
    spacingCm: { betweenPlants: 50, betweenRows: 60 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Piéride', solution: 'Filet anti-insectes.' }, { name: 'Hernie', solution: 'Rotation.' }],
    planning: { sowing: [3, 4, 5, 6], planting: [5, 6, 7], maintenance: [6, 7, 8], harvest: [8, 9, 10, 11] }
  },
  {
    id: 'chou_fleur',
    name: 'Chou-Fleur',
    category: 'Feuilles',
    varieties: [
      { name: 'Merveille de toutes saisons', description: 'Pomme blanche dense.', advantage: 'Rustique', waterNeedLevel: 3 },
      { name: 'Violet de Sicile', description: 'Pomme violette qui verdit à la cuisson.', advantage: 'Saveur fine', waterNeedLevel: 3 }
    ],
    description: 'Exigeant mais gratifiant.',
    image: 'https://www.themealdb.com/images/ingredients/Cauliflower.png',
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '3x / semaine', volumePerPlant: 2 },
    yield: { amount: 1, unit: 'kg/plant', description: 'Une seule récolte par plant.' },
    maintenanceTips: 'Couvrez la pomme avec les feuilles pour qu\'elle reste blanche.',
    growingMethods: 'Repiquage en sol riche.',
    soilCoverage: 'Large.',
    associations: ['Haricots', 'Tomates', 'Céleri'],
    plantsPerPerson: 3,
    spacingCm: { betweenPlants: 60, betweenRows: 70 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Hernie du chou', solution: 'Rotation longue (5 ans) et chaulage.' }],
    planning: { sowing: [3, 4, 5], planting: [5, 6, 7], maintenance: [6, 7, 8], harvest: [9, 10, 11] }
  },
  {
    id: 'chou_kale',
    name: 'Chou Kale',
    category: 'Feuilles',
    varieties: [
      { name: 'Nero di Toscana', description: 'Feuilles sombres gaufrées.', advantage: 'Esthétique et goût', waterNeedLevel: 2 },
      { name: 'Westland Winter', description: 'Frisé vert.', advantage: 'Ultra résistant au froid', waterNeedLevel: 2 }
    ],
    description: 'Le super-aliment, se récolte tout l\'hiver.',
    image: 'https://www.themealdb.com/images/ingredients/Kale.png', 
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 1, unit: 'kg/plant', description: 'Récolte feuille à feuille tout l\'hiver.' },
    maintenanceTips: 'Plus il gèle, meilleur il est (plus sucré).',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Haute.',
    associations: ['Betteraves', 'Oignons'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 50, betweenRows: 50 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Pucerons cendrés', solution: 'Savon noir.' }],
    planning: { sowing: [4, 5, 6], planting: [6, 7], maintenance: [8, 9], harvest: [10, 11, 12, 1, 2, 3] }
  },
  {
    id: 'chou_rave',
    name: 'Chou-Rave',
    category: 'Feuilles', // Botaniquement, mais mangé comme racine
    varieties: [
      { name: 'Blanc de Vienne', description: 'Boule vert pâle.', advantage: 'Hâtif et tendre', waterNeedLevel: 2 },
      { name: 'Blaro', description: 'Boule violette.', advantage: 'Ne devient pas fibreux', waterNeedLevel: 2 }
    ],
    description: 'Légume ancien délicieux cru ou cuit.',
    image: 'https://www.themealdb.com/images/ingredients/Cabbage.png', // Fallback visual
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 0.3, unit: 'kg/plant', description: 'Récolter jeune (taille balle de tennis).' },
    maintenanceTips: 'Croissance rapide. Ne pas laisser grossir trop sinon il devient fibreux.',
    growingMethods: 'Semis direct ou repiquage.',
    soilCoverage: 'Moyenne.',
    associations: ['Betteraves', 'Salades'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 25, betweenRows: 30 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Altise', solution: 'Maintenir sol humide.' }],
    planning: { sowing: [3, 4, 5, 6], planting: [4, 5, 6, 7], maintenance: [5, 6, 7, 8], harvest: [6, 7, 8, 9, 10] }
  },
  {
    id: 'chou_cabus',
    name: 'Chou Cabus (Pommé)',
    category: 'Feuilles',
    varieties: [
      { name: 'Cœur de Bœuf', description: 'Pomme pointue.', advantage: 'Tendre et précoce', waterNeedLevel: 2 },
      { name: 'Tête de Pierre', description: 'Pomme ronde très dure.', advantage: 'Longue conservation', waterNeedLevel: 2 },
      { name: 'Rouge', description: 'Pomme rouge serrée.', advantage: 'Se mange cru ou cuit', waterNeedLevel: 2 }
    ],
    description: 'Le chou classique pour potées et choucroute.',
    image: 'https://www.themealdb.com/images/ingredients/Cabbage.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 2 },
    yield: { amount: 1.5, unit: 'kg/plant', description: 'Une grosse pomme.' },
    maintenanceTips: 'Maintenir frais pour éviter l\'éclatement de la pomme.',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Moyenne.',
    associations: ['Céleri', 'Trèfle blanc'],
    plantsPerPerson: 3,
    spacingCm: { betweenPlants: 50, betweenRows: 50 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Piéride', solution: 'Ramasser les chenilles.' }],
    planning: { sowing: [2, 3, 4], planting: [4, 5, 6], maintenance: [6, 7], harvest: [8, 9, 10, 11] }
  },

  // --- AUTRES FEUILLES & RACINES ---
  {
    id: 'epinards',
    name: 'Épinards',
    category: 'Feuilles',
    varieties: [
      { name: 'Géant d\'Hiver', description: 'Grandes feuilles larges.', advantage: 'Très résistant au froid', waterNeedLevel: 2 },
      { name: 'Matador', description: 'Feuilles foncées.', advantage: 'Lente montée à graine', waterNeedLevel: 2 },
      { name: 'Monstrueux de Viroflay', description: 'Très grandes feuilles.', advantage: 'Productif', waterNeedLevel: 2 }
    ],
    description: 'Riche en fer, culture rapide de mi-saison.',
    image: 'https://www.themealdb.com/images/ingredients/Spinach.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 1.5, unit: 'kg/m²', description: 'Plusieurs coupes possibles.' },
    maintenanceTips: 'Arrosez régulièrement pour éviter la montée en graines. Récoltez feuille à feuille.',
    growingMethods: 'Semis en ligne ou à la volée.',
    soilCoverage: 'Bonne.',
    associations: ['Fraises', 'Choux', 'Haricots'],
    plantsPerPerson: 15,
    spacingCm: { betweenPlants: 10, betweenRows: 25 },
    rotations: ['Racines'],
    diseases: [{ name: 'Mildiou', solution: 'Espacer les plants.' }],
    planning: { sowing: [2, 3, 4, 8, 9, 10], planting: [], maintenance: [3, 4, 9, 10], harvest: [4, 5, 10, 11, 12] }
  },
  {
    id: 'blettes',
    name: 'Blettes (Poirée)',
    category: 'Feuilles',
    varieties: [
      { name: 'Carde Blanche', description: 'Cotes larges et blanches.', advantage: 'Classique et productive', waterNeedLevel: 2 },
      { name: 'À couper', description: 'Petites feuilles (épinard perpétuel).', advantage: 'Repousse vite', waterNeedLevel: 2 },
      { name: 'Bright Lights', description: 'Tiges multicolores (jaune, rouge, rose).', advantage: 'Très décoratif', waterNeedLevel: 2 }
    ],
    description: 'Légume 2 en 1 : côtes (tiges) et feuilles se mangent.',
    image: 'https://www.themealdb.com/images/ingredients/Spinach.png', // Visuel proche
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 3, unit: 'kg/plant', description: 'Production continue.' },
    maintenanceTips: 'Paillez le pied pour garder l\'humidité. Coupez les hampes florales.',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Large.',
    associations: ['Carottes', 'Navets', 'Radis'],
    plantsPerPerson: 3,
    spacingCm: { betweenPlants: 40, betweenRows: 50 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Cercosporiose', solution: 'Couper feuilles atteintes.' }],
    planning: { sowing: [3, 4, 5], planting: [5, 6], maintenance: [6, 7, 8], harvest: [6, 7, 8, 9, 10, 11] }
  },
  {
    id: 'betterave',
    name: 'Betterave',
    category: 'Racines',
    varieties: [
      { name: 'D\'Egypte', description: 'Racine plate et hâtive.', advantage: 'Récolte rapide', waterNeedLevel: 2 },
      { name: 'Crapaudine', description: 'Peau rugueuse, chair très sucrée.', advantage: 'Goût exceptionnel', waterNeedLevel: 2 },
      { name: 'Chioggia', description: 'Chair striée rose et blanc.', advantage: 'Décoratif', waterNeedLevel: 2 }
    ],
    description: 'Racine douce et feuilles comestibles.',
    image: 'https://www.themealdb.com/images/ingredients/Beetroot.png', // Placeholder (n'existe pas toujours, fallback textuel)
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Facile à cultiver.' },
    maintenanceTips: 'Eclaircir les semis (chaque graine donne 3-4 plants). Pailler en été.',
    growingMethods: 'Semis direct ou en motte.',
    soilCoverage: 'Moyenne.',
    associations: ['Oignons', 'Haricots', 'Laitues'],
    plantsPerPerson: 10,
    spacingCm: { betweenPlants: 10, betweenRows: 30 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Cercosporiose', solution: 'Eviter l\'humidité sur les feuilles.' }],
    planning: { sowing: [4, 5, 6], planting: [], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] }
  },
  {
    id: 'mache',
    name: 'Mâche',
    category: 'Feuilles',
    varieties: [
      { name: 'Verte de Cambrai', description: 'Petite rosette.', advantage: 'Très résistante au froid', waterNeedLevel: 1 },
      { name: 'Coquille de Louviers', description: 'Feuilles incurvées.', advantage: 'Saveur douce', waterNeedLevel: 1 }
    ],
    description: 'La salade d\'hiver par excellence.',
    image: 'https://www.themealdb.com/images/ingredients/Basil.png', 
    exposure: 'Ombre', 
    waterNeeds: 'Faible',
    watering: { frequency: 'Au semis', volumePerPlant: 0.1 },
    yield: { amount: 0.5, unit: 'kg/m²', description: 'Léger mais précieux en hiver.' },
    maintenanceTips: 'Tassez bien le sol avant le semis ("plomber"). Ne pas enterrer les graines.',
    growingMethods: 'Semis à la volée.',
    soilCoverage: 'Tapis vert.',
    associations: ['Poireaux', 'Choux d\'hiver'],
    plantsPerPerson: 30, 
    spacingCm: { betweenPlants: 5, betweenRows: 15 },
    rotations: ['Racines'],
    diseases: [{ name: 'Oïdium', solution: 'Aérer.' }],
    planning: { sowing: [8, 9, 10], planting: [], maintenance: [10, 11], harvest: [11, 12, 1, 2] }
  },
  {
    id: 'roquette',
    name: 'Roquette',
    category: 'Feuilles',
    varieties: [
      { name: 'Cultivée', description: 'Feuilles larges.', advantage: 'Douce', waterNeedLevel: 2 },
      { name: 'Sauvage', description: 'Feuilles découpées.', advantage: 'Goût poivré fort', waterNeedLevel: 1 }
    ],
    description: 'Pousse très vite, goût poivré.',
    image: 'https://www.themealdb.com/images/ingredients/Basil.png', // Visuel proche
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: '1x / semaine', volumePerPlant: 0.2 },
    yield: { amount: 1, unit: 'kg/m²', description: 'Plusieurs coupes.' },
    maintenanceTips: 'Semez peu mais souvent pour éviter la montée en graines.',
    growingMethods: 'Semis direct.',
    soilCoverage: 'Faible.',
    associations: ['Tomates', 'Carottes'],
    plantsPerPerson: 10,
    spacingCm: { betweenPlants: 5, betweenRows: 20 },
    rotations: ['Racines'],
    diseases: [{ name: 'Altise', solution: 'Voile anti-insectes.' }],
    planning: { sowing: [3, 4, 5, 6, 8, 9], planting: [], maintenance: [4, 5, 6], harvest: [4, 5, 6, 7, 9, 10] }
  },
  {
    id: 'mesclun',
    name: 'Mesclun',
    category: 'Feuilles',
    varieties: [
      { name: 'Provençal', description: 'Mélange traditionnel.', advantage: 'Diversité', waterNeedLevel: 2 },
      { name: 'Asiatique', description: 'Mizuna, Moutarde...', advantage: 'Piquant', waterNeedLevel: 2 }
    ],
    description: 'Mélange de jeunes pousses à couper.',
    image: 'https://www.themealdb.com/images/ingredients/Lettuce.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.3 },
    yield: { amount: 1, unit: 'kg/m²', description: 'Repousse après coupe.' },
    maintenanceTips: 'Coupez aux ciseaux à 3cm du sol pour que ça repousse.',
    growingMethods: 'Semis à la volée.',
    soilCoverage: 'Dense.',
    associations: ['Radis'],
    plantsPerPerson: 15,
    spacingCm: { betweenPlants: 2, betweenRows: 15 },
    rotations: ['Racines'],
    diseases: [{ name: 'Fonte des semis', solution: 'Ne pas trop arroser.' }],
    planning: { sowing: [3, 4, 5, 8, 9], planting: [], maintenance: [4, 5, 9], harvest: [4, 5, 6, 9, 10] }
  },
  {
    id: 'chou_chinois',
    name: 'Chou Chinois (Pe-Tsai)',
    category: 'Feuilles',
    varieties: [
      { name: 'Granaat', description: 'Pomme haute et serrée.', advantage: 'Croissance rapide automne', waterNeedLevel: 2 }
    ],
    description: 'Chou tendre pour salades ou woks.',
    image: 'https://www.themealdb.com/images/ingredients/Cabbage.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 1 },
    yield: { amount: 1, unit: 'kg/plant', description: 'Volumineux.' },
    maintenanceTips: 'Craint la chaleur et la montée en graine. Semez après le 15 juillet obligatoirement.',
    growingMethods: 'Semis direct ou repiquage jeune.',
    soilCoverage: 'Large.',
    associations: ['Céleri', 'Aromatiques'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 30, betweenRows: 40 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Altise', solution: 'Maintenir humide, paillage.' }],
    planning: { sowing: [7, 8], planting: [8], maintenance: [9], harvest: [10, 11] }
  },
  {
    id: 'salades',
    name: 'Salades',
    category: 'Feuilles',
    varieties: [
      { name: 'Batavia', description: 'Croquante.', advantage: 'Résistante', waterNeedLevel: 2 },
      { name: 'Feuille de Chêne', description: 'Tendre.', advantage: 'Repousse', waterNeedLevel: 2 },
      { name: 'Romaine', description: 'Haute et croquante.', advantage: 'Idéal Caesar', waterNeedLevel: 2 },
      { name: 'Laitue Pommée', description: 'Coeur tendre.', advantage: 'Classique', waterNeedLevel: 2 }
    ],
    description: 'Rapide et facile.',
    image: 'https://www.themealdb.com/images/ingredients/Lettuce.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: 'Tous les 2 jours', volumePerPlant: 0.5 },
    yield: { amount: 0.3, unit: 'kg/plant', description: 'Rapide.' },
    maintenanceTips: 'Attention limaces. Semez tous les 15 jours pour une récolte continue.',
    growingMethods: 'Semis échelonnés.',
    soilCoverage: 'Moyenne.',
    associations: ['Radis', 'Pois', 'Fraises'],
    plantsPerPerson: 12,
    spacingCm: { betweenPlants: 25, betweenRows: 30 },
    rotations: ['Racines'],
    diseases: [{ name: 'Limaces', solution: 'Cendre ou Ferramol.' }],
    planning: { sowing: [3, 4, 5, 6, 7, 8], planting: [4, 5, 6, 7, 8, 9], maintenance: [5, 6, 7, 8, 9], harvest: [5, 6, 7, 8, 9, 10] }
  },

  // --- LÉGUMES OUBLIÉS ---
  {
    id: 'panais',
    name: 'Panais',
    category: 'Racines',
    varieties: [
      { name: 'Demi-long de Guernesey', description: 'Racine blanche sucrée.', advantage: 'Très résistant au froid', waterNeedLevel: 2 }
    ],
    description: 'Cousin de la carotte, goût noisette, se récolte tout l\'hiver.',
    image: 'https://www.themealdb.com/images/ingredients/Parsnip.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Grosses racines nourrissantes.' },
    maintenanceTips: 'La graine est capricieuse, gardez le sol humide au semis (3 semaines). Eclaircir à 15cm.',
    growingMethods: 'Semis direct obligatoire.',
    soilCoverage: 'Feuillage dense.',
    associations: ['Oignons', 'Laitues'],
    plantsPerPerson: 15,
    spacingCm: { betweenPlants: 15, betweenRows: 35 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Mouche de la carotte', solution: 'Filet.' }],
    planning: { sowing: [3, 4, 5], planting: [], maintenance: [6, 7, 8], harvest: [10, 11, 12, 1, 2] }
  },
  {
    id: 'patisson',
    name: 'Pâtisson',
    category: 'Fruits',
    varieties: [
      { name: 'Blanc', description: 'Goût d\'artichaut.', advantage: 'Buissonnant (non coureur)', waterNeedLevel: 2 },
      { name: 'Orange', description: 'Plus sucré.', advantage: 'Décoratif', waterNeedLevel: 2 }
    ],
    description: 'Courge d\'été en forme de soucoupe volante.',
    image: 'https://www.themealdb.com/images/ingredients/Zucchini.png', 
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 4 },
    yield: { amount: 10, unit: 'fruits/plant', description: 'Récolter jeune.' },
    maintenanceTips: 'Ne mouillez pas les feuilles (Oïdium). Pailler le sol.',
    growingMethods: 'Sur compost.',
    soilCoverage: 'Moyenne (buissonnant).',
    associations: ['Maïs', 'Haricots'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 80, betweenRows: 100 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Oïdium', solution: 'Lait/Bicarbonate.' }],
    planning: { sowing: [4, 5], planting: [5], maintenance: [6, 7], harvest: [7, 8, 9] }
  },
  {
    id: 'rhubarbe',
    name: 'Rhubarbe',
    category: 'Perenne',
    varieties: [
      { name: 'Victoria', description: 'Tiges vertes et rouges.', advantage: 'Vigoureuse', waterNeedLevel: 3 },
      { name: 'Red Champagne', description: 'Tiges très rouges.', advantage: 'Plus douce', waterNeedLevel: 3 }
    ],
    description: 'Plante vivace, revient tous les ans. Seules les tiges se mangent.',
    image: 'https://www.themealdb.com/images/ingredients/Rhubarb.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Élevé',
    watering: { frequency: '1x / semaine', volumePerPlant: 5 },
    yield: { amount: 3, unit: 'kg/plant', description: 'Dès la 2ème année.' },
    maintenanceTips: 'Apportez beaucoup de compost chaque printemps. Ne pas récolter la 1ère année.',
    growingMethods: 'Plantation d\'éclats de souche.',
    soilCoverage: 'Enorme envergure.',
    associations: ['Fraises', 'Choux'],
    plantsPerPerson: 1,
    spacingCm: { betweenPlants: 100, betweenRows: 100 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [3, 4, 10], maintenance: [4, 5, 6], harvest: [5, 6, 9] }
  },

  // --- ARBRES & PERENNES ---
  {
    id: 'artichaut',
    name: 'Artichaut',
    category: 'Perenne',
    varieties: [
      { name: 'Gros Vert de Laon', description: 'Tête large et charnue.', advantage: 'Rustique au froid', waterNeedLevel: 2 },
      { name: 'Violet de Provence', description: 'Petits artichauts violets.', advantage: 'Tendre, se mange cru', waterNeedLevel: 2 }
    ],
    description: 'Légume fleur majestueux, reste en place 3-4 ans.',
    image: 'https://www.themealdb.com/images/ingredients/Artichoke.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 5 },
    yield: { amount: 8, unit: 'têtes/pied', description: 'Production adulte (an 2).' },
    maintenanceTips: 'Paillez le pied en hiver (craint le gel). Coupez les tiges au sol après récolte.',
    growingMethods: 'Plantation d\'oeilletons.',
    soilCoverage: 'Large envergure.',
    associations: ['Fèves', 'Pois', 'Oignons', 'Laitues'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 100, betweenRows: 100 },
    rotations: ['Perenne'],
    diseases: [{ name: 'Pucerons', solution: 'Savon noir.' }],
    planning: { sowing: [], planting: [3, 4, 9, 10], maintenance: [4, 5, 6], harvest: [5, 6, 7, 9, 10] }
  },
  {
    id: 'cerisier',
    name: 'Cerisiers',
    category: 'Arbres Fruitiers',
    varieties: [
      { name: 'Burlat', description: 'Grosse, rouge foncé.', advantage: 'Précoce (évite les vers)', waterNeedLevel: 2 },
      { name: 'Napoléon', description: 'Jaune et rose, chair ferme.', advantage: 'Bigarreau tardif', waterNeedLevel: 2 },
      { name: 'Montmorency', description: 'Griotte acide.', advantage: 'Pour conserves/eau de vie', waterNeedLevel: 2 }
    ],
    description: 'Le premier plaisir sucré de l\'année.',
    image: 'https://www.themealdb.com/images/ingredients/Cherries.png',
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Rarement', volumePerPlant: 0 },
    yield: { amount: 30, unit: 'kg/arbre', description: 'Dépend des oiseaux !' },
    maintenanceTips: 'Taille légère après récolte en été (pas en hiver, risque de gomme).',
    growingMethods: 'Plein vent.',
    soilCoverage: 'Enherbé.',
    associations: ['Fraises', 'Ail'],
    plantsPerPerson: 0.5,
    spacingCm: { betweenPlants: 500, betweenRows: 500 },
    rotations: ['Perenne'],
    diseases: [{ name: 'Mouche de la cerise', solution: 'Variétés précoces ou pièges.' }],
    planning: { sowing: [], planting: [11, 12, 1, 2, 3], maintenance: [6, 7], harvest: [5, 6, 7] }
  },

  // --- LÉGUMINEUSES & CLASSIQUES ---
  {
    id: 'haricots',
    name: 'Haricots',
    category: 'Légumineuses',
    varieties: [
      { name: 'Contender', description: 'Nain, gousse charnue.', advantage: 'Très précoce et productif', waterNeedLevel: 2 },
      { name: 'Coco de Paimpol', description: 'À écosser (grains).', advantage: 'Se congèle ou se sèche', waterNeedLevel: 2 },
      { name: 'Fortex', description: 'À rames (grimpant).', advantage: 'Gousses très longues (25cm)', yieldBoost: '+50%', waterNeedLevel: 2 },
      { name: 'Beurre de Rocquencourt', description: 'Jaune doré, fin.', advantage: 'Goût fin, productif', waterNeedLevel: 2 }
    ],
    description: 'Enrichit le sol en azote. Délicieux frais ou sec.',
    image: 'https://www.themealdb.com/images/ingredients/Green%20Beans.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 1.5, unit: 'kg/m²', description: 'Plus productif en variétés à rames.' },
    maintenanceTips: 'Récoltez tous les 2 jours pour stimuler la floraison. Buttez les pieds.',
    growingMethods: 'Semis en "poquets".',
    soilCoverage: 'Régénère le sol.',
    associations: ['Pommes de Terre', 'Carottes', 'Choux', 'Courges', 'Sarriette', 'Fraises'],
    plantsPerPerson: 20,
    spacingCm: { betweenPlants: 10, betweenRows: 40 },
    rotations: ['Feuilles', 'Racines', 'Fruits'],
    diseases: [{ name: 'Anthracnose', solution: 'Rotation.' }],
    planning: { sowing: [5, 6, 7], planting: [], maintenance: [6, 7, 8], harvest: [7, 8, 9] }
  },
  {
    id: 'pois',
    name: 'Petits Pois',
    category: 'Légumineuses',
    varieties: [
      { name: 'Petit Provençal', description: 'Nain, grains ronds.', advantage: 'Hâtif pour le printemps', waterNeedLevel: 2 },
      { name: 'Merveille de Kelvedon', description: 'Nain, grains ridés.', advantage: 'Très sucré', waterNeedLevel: 2 },
      { name: 'Mangetout', description: 'Se mange avec la cosse.', advantage: 'Pas d\'écossage !', waterNeedLevel: 2 }
    ],
    description: 'Sucre naturel exceptionnel.',
    image: 'https://www.themealdb.com/images/ingredients/Peas.png',
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 0.8, unit: 'kg/m²', description: 'Env. 400g par pied pour les rames.' },
    maintenanceTips: 'Installez rames ou grillage dès le semis. Maintenir sol frais.',
    growingMethods: 'Culture de temps frais.',
    soilCoverage: 'Fixe l\'azote.',
    associations: ['Carottes', 'Navets', 'Radis', 'Pommes de Terre', 'Céleri'],
    plantsPerPerson: 25,
    spacingCm: { betweenPlants: 5, betweenRows: 50 },
    rotations: ['Feuilles', 'Racines'],
    diseases: [{ name: 'Oïdium', solution: 'Éviter arrosage feuillage.' }],
    planning: { sowing: [2, 3, 4, 10, 11], planting: [], maintenance: [3, 4, 5], harvest: [5, 6] }
  },
  {
    id: 'pdt',
    name: 'Pommes de Terre',
    category: 'Tubercules',
    varieties: [
      { name: 'Charlotte', description: 'Chair ferme.', advantage: 'Polyvalente', waterNeedLevel: 2 },
      { name: 'Bintje', description: 'Chair farineuse.', advantage: 'Idéale frites', yieldBoost: '+15%', waterNeedLevel: 2 },
      { name: 'Ratte', description: 'Goût noisette.', advantage: 'Gastronomique', waterNeedLevel: 2 },
      { name: 'Vitelotte', description: 'Violette.', advantage: 'Originalité', waterNeedLevel: 2 }
    ],
    description: 'Base de l\'autonomie.',
    image: 'https://www.themealdb.com/images/ingredients/Potatoes.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / 10 jours', volumePerPlant: 3 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Env. 1kg par plant.' },
    maintenanceTips: 'Buttage essentiel quand la plante fait 20cm. Ne jamais arroser le feuillage (Mildiou).',
    growingMethods: 'Rangs buttés.',
    soilCoverage: 'Dense.',
    associations: ['Haricots', 'Pois', 'Choux', 'Lin'],
    plantsPerPerson: 25,
    spacingCm: { betweenPlants: 40, betweenRows: 65 },
    rotations: ['Légumineuses', 'Fruits'],
    diseases: [{ name: 'Mildiou', solution: 'Bouillie bordelaise.' }],
    planning: { sowing: [], planting: [3, 4, 5], maintenance: [4, 5, 6], harvest: [7, 8, 9] }
  },
  {
    id: 'carottes',
    name: 'Carottes',
    category: 'Racines',
    varieties: [
      { name: 'Nantaise', description: 'Demi-longue.', advantage: 'Récolte d\'été', waterNeedLevel: 2 },
      { name: 'De Colmar', description: 'Cœur rouge.', advantage: 'Conservation', yieldBoost: '+10%', waterNeedLevel: 2 }
    ],
    description: 'Indispensable et vitaminée.',
    image: 'https://www.themealdb.com/images/ingredients/Carrots.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 2.5, unit: 'kg/m²', description: 'Dépend du sol.' },
    maintenanceTips: 'Éclaircissage crucial (ne laisser qu\'un plant tous les 5cm). Désherbage minutieux.',
    growingMethods: 'Semis sable.',
    soilCoverage: 'Moyenne.',
    associations: ['Poireaux', 'Oignons'],
    plantsPerPerson: 50,
    spacingCm: { betweenPlants: 5, betweenRows: 25 },
    rotations: ['Légumineuses', 'Feuilles'],
    diseases: [{ name: 'Mouche', solution: 'Filet.' }],
    planning: { sowing: [3, 4, 5, 6], planting: [], maintenance: [5, 6, 7], harvest: [7, 8, 9, 10, 11] }
  },
  {
    id: 'tomates',
    name: 'Tomates',
    category: 'Fruits',
    varieties: [
      { name: 'Cœur de Bœuf', description: 'Grosse charnue.', advantage: 'Goût', waterNeedLevel: 3 },
      { name: 'Noire de Crimée', description: 'Sombre.', advantage: 'Douceur', waterNeedLevel: 3 },
      { name: 'Roma', description: 'Allongée.', advantage: 'Sauce', waterNeedLevel: 2 },
      { name: 'Cerise', description: 'Petite.', advantage: 'Apéro', waterNeedLevel: 2 }
    ],
    description: 'La reine du potager.',
    image: 'https://www.themealdb.com/images/ingredients/Tomato.png',
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 4 },
    yield: { amount: 3, unit: 'kg/plant', description: 'Variable selon chaleur.' },
    maintenanceTips: 'Taille des gourmands (sauf cerises). Tuteurage solide. Arrosage au pied uniquement.',
    growingMethods: 'Tuteurage.',
    soilCoverage: 'Faible au sol.',
    associations: ['Basilic', 'Œillet d\'Inde'],
    plantsPerPerson: 6,
    spacingCm: { betweenPlants: 60, betweenRows: 80 },
    rotations: ['Racines'],
    diseases: [{ name: 'Mildiou', solution: 'Abri.' }],
    planning: { sowing: [2, 3], planting: [5, 6], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] }
  },
  {
    id: 'courges',
    name: 'Courges',
    category: 'Fruits',
    varieties: [
      { name: 'Potimarron', description: 'Goût châtaigne.', advantage: 'Goût', waterNeedLevel: 2 },
      { name: 'Butternut', description: 'Douce.', advantage: 'Conservation', waterNeedLevel: 2 }
    ],
    description: 'Coureuse d\'hiver.',
    image: 'https://www.themealdb.com/images/ingredients/Pumpkin.png',
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 8 },
    yield: { amount: 4, unit: 'fruits/plant', description: 'Lourd.' },
    maintenanceTips: 'Paillage riche. Pincer la tige après 4-5 fruits pour les faire grossir.',
    growingMethods: 'Sur compost.',
    soilCoverage: 'Totale.',
    associations: ['Maïs', 'Haricots'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 120, betweenRows: 150 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Oïdium', solution: 'Lait.' }],
    planning: { sowing: [4, 5], planting: [5], maintenance: [6, 7, 8, 9], harvest: [9, 10, 11] }
  },
  {
    id: 'fleurs_comestibles',
    name: 'Fleurs Comestibles',
    category: 'Fleurs',
    varieties: [
      { name: 'Capucine', description: 'Poivrée.', advantage: 'Piège pucerons', waterNeedLevel: 2 },
      { name: 'Bourrache', description: 'Goût huître.', advantage: 'Pollinisateurs', waterNeedLevel: 1 }
    ],
    description: 'Décoratives et utiles.',
    image: 'https://www.themealdb.com/images/ingredients/Saffron.png',
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: '1x / 2 semaines', volumePerPlant: 0.2 },
    yield: { amount: 0.1, unit: 'kg/m²', description: 'Léger.' },
    maintenanceTips: 'Laissez monter en graine pour qu\'elles se ressèment seules.',
    growingMethods: 'Bordures.',
    soilCoverage: 'Variable.',
    associations: ['Tout'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 20, betweenRows: 20 },
    rotations: ['Fleurs'],
    diseases: [],
    planning: { sowing: [3, 4, 5], planting: [4, 5], maintenance: [6, 7], harvest: [6, 7, 8, 9] }
  }
];

export const INITIAL_PLOTS: Plot[] = [
  { id: '1', name: 'Planche Principale', type: 'culture', shape: 'rect', x: 2, y: 2, width: 5, height: 1.2, rotation: 0, opacity: 1, exposure: 'Soleil', plantedCultureId: 'tomates', selectedVariety: 'Cœur de Bœuf' },
  { id: '2', name: 'Zone Racines', type: 'culture', shape: 'rect', x: 2, y: 4, width: 4, height: 2, rotation: 0, opacity: 1, exposure: 'Soleil', plantedCultureId: 'pdt', selectedVariety: 'Charlotte' },
  { id: '3', name: 'Grand Chêne', type: 'tree', shape: 'circle', x: 10, y: 2, width: 3, height: 3, rotation: 0, opacity: 0.8, exposure: 'Soleil' },
  { id: '4', name: 'Poulailler', type: 'coop', shape: 'rect', x: 12, y: 7, width: 2, height: 1.5, rotation: 0, opacity: 1, exposure: 'Mi-ombre', chickenCount: 3 },
  { id: '5', name: 'Citerne Pluie', type: 'water_tank', shape: 'circle', x: 13, y: 6, width: 1, height: 1, rotation: 0, opacity: 1, exposure: 'Ombre' },
  { id: '6', name: 'Serre Verre', type: 'greenhouse', shape: 'rect', x: 1, y: 7, width: 4, height: 3, rotation: 0, opacity: 0.9, exposure: 'Soleil', subPlots: [] }
];
