
import { Culture, Plot, CultureCategory } from './types';

export const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
export const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const CATEGORY_COLORS: Record<CultureCategory, string> = {
  'Fruits': 'bg-red-400',
  'Racines': 'bg-yellow-400',
  'Feuilles': 'bg-lime-400',
  'Légumineuses': 'bg-green-400',
  'Tubercules': 'bg-purple-400',
  'Bulbes': 'bg-fuchsia-400',
  'Aromatiques': 'bg-cyan-400',
  'Petits Fruits': 'bg-pink-400',
  'Céréales': 'bg-amber-400',
  'Fleurs': 'bg-indigo-400',
  'Arbres Fruitiers': 'bg-orange-700 text-white',
  'Perenne': 'bg-emerald-800 text-white'
};

// URL placeholder 3D
const ICON_BASE = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis";
const MS_EMOJI_BASE = "https://em-content.zobj.net/source/microsoft-teams/337";

export const CULTURES: Culture[] = [
  // --- FRUITS LÉGUMES ---
  {
    id: 'tomates',
    name: 'Tomates',
    category: 'Fruits',
    varieties: [
      { name: 'Cœur de Bœuf', description: 'Grosse charnue.', advantage: 'Goût incomparable', yieldBoost: '', waterNeedLevel: 3 },
      { name: 'Noire de Crimée', description: 'Sombre, douce.', advantage: 'Peu acide', waterNeedLevel: 3 },
      { name: 'Roma', description: 'Allongée, chair ferme.', advantage: 'Idéale pour coulis', waterNeedLevel: 2 },
      { name: 'Cerise', description: 'Petite et sucrée.', advantage: 'Apéro, productive', waterNeedLevel: 2 }
    ],
    description: 'La reine du potager. Indispensable en été.',
    image: `${ICON_BASE}/Food/Tomato.png`,
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 4 },
    yield: { amount: 3, unit: 'kg/plant', description: 'Variable selon chaleur.' },
    maintenanceTips: 'Taille des gourmands (sauf cerises). Tuteurage solide. Arrosage au pied uniquement.',
    growingMethods: 'Tuteurage.',
    soilCoverage: 'Faible au sol.',
    associations: ['Basilic', 'Œillet d\'Inde', 'Carottes'],
    plantsPerPerson: 15, 
    spacingCm: { betweenPlants: 60, betweenRows: 80 },
    rotations: ['Racines'],
    diseases: [{ name: 'Mildiou', solution: 'Abri, purin de prêle.' }],
    planning: { sowing: [2, 3], planting: [5, 6], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] },
    successions: 1
  },
  {
    id: 'courgettes',
    name: 'Courgettes',
    category: 'Fruits',
    varieties: [
      { name: 'Noire de Milan', description: 'Verte foncée classique.', advantage: 'Non coureuse', waterNeedLevel: 3 },
      { name: 'Jaune Goldrush', description: 'Jaune vif.', advantage: 'Saveur fine', waterNeedLevel: 3 }
    ],
    description: 'Productive et facile, idéale débutants.',
    image: `${ICON_BASE}/Food/Cucumber.png`, // Visuel proche
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 5 },
    yield: { amount: 10, unit: 'fruits/plant', description: 'Production abondante.' },
    maintenanceTips: 'Ne pas mouiller les feuilles. Récolter jeune pour plus de goût.',
    growingMethods: 'Plant isolé.',
    soilCoverage: 'Large.',
    associations: ['Maïs', 'Haricots', 'Capucines'],
    plantsPerPerson: 3,
    spacingCm: { betweenPlants: 80, betweenRows: 100 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Oïdium', solution: 'Lait dilué.' }],
    planning: { sowing: [4, 5], planting: [5, 6], maintenance: [6, 7], harvest: [7, 8, 9, 10] },
    successions: 2
  },
  {
    id: 'aubergines',
    name: 'Aubergines',
    category: 'Fruits',
    varieties: [
      { name: 'Black Beauty', description: 'Grosse violette.', advantage: 'Classique', waterNeedLevel: 3 },
      { name: 'De Barbentane', description: 'Allongée.', advantage: 'Hâtive', waterNeedLevel: 3 }
    ],
    description: 'Légume du soleil, demande de la chaleur.',
    image: `${ICON_BASE}/Food/Eggplant.png`,
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 4 },
    yield: { amount: 6, unit: 'fruits/plant', description: 'Besoin de chaleur.' },
    maintenanceTips: 'Pincer la tige principale.',
    growingMethods: 'Tuteurage.',
    soilCoverage: 'Moyenne.',
    associations: ['Haricots', 'Piment'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 60, betweenRows: 80 },
    rotations: ['Racines'],
    diseases: [{ name: 'Doryphore', solution: 'Ramassage manuel.' }],
    planning: { sowing: [2, 3], planting: [5, 6], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] },
    successions: 1
  },
  {
    id: 'poivrons',
    name: 'Poivrons',
    category: 'Fruits',
    varieties: [
      { name: 'Yolo Wonder', description: 'Gros carré.', advantage: 'Charnu', waterNeedLevel: 3 },
      { name: 'Doux des Landes', description: 'Allongé fin.', advantage: 'Rapide', waterNeedLevel: 2 }
    ],
    description: 'Doux ou piquant, indispensable pour la ratatouille.',
    image: `${ICON_BASE}/Food/Bell%20Pepper.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 3 },
    yield: { amount: 8, unit: 'fruits/plant', description: 'Colorés à maturité.' },
    maintenanceTips: 'Tuteurer si chargé.',
    growingMethods: 'Plant.',
    soilCoverage: 'Faible.',
    associations: ['Aubergines', 'Tomates'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 50, betweenRows: 70 },
    rotations: ['Racines'],
    diseases: [],
    planning: { sowing: [2, 3], planting: [5, 6], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] },
    successions: 1
  },
  {
    id: 'courges',
    name: 'Courges',
    category: 'Fruits',
    varieties: [
      { name: 'Potimarron', description: 'Goût châtaigne.', advantage: 'Conservation', waterNeedLevel: 2 },
      { name: 'Butternut', description: 'Chair tendre.', advantage: 'Douceur', waterNeedLevel: 2 },
      { name: 'Musquée', description: 'Très grosse.', advantage: 'Rendement', waterNeedLevel: 3 }
    ],
    description: 'Coureuse d\'hiver, se conserve plusieurs mois.',
    image: `https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Jack-O-Lantern.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 8 },
    yield: { amount: 4, unit: 'fruits/plant', description: 'Lourd.' },
    maintenanceTips: 'Paillage riche. Pincer la tige.',
    growingMethods: 'Sur compost.',
    soilCoverage: 'Totale.',
    associations: ['Maïs', 'Haricots'],
    plantsPerPerson: 4,
    spacingCm: { betweenPlants: 120, betweenRows: 150 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Oïdium', solution: 'Lait/Bicarbonate.' }],
    planning: { sowing: [4, 5], planting: [5], maintenance: [6, 7, 8, 9], harvest: [9, 10, 11] },
    successions: 1
  },
  {
    id: 'patisson',
    name: 'Pâtisson',
    category: 'Fruits',
    varieties: [
      { name: 'Blanc', description: 'Goût d\'artichaut.', advantage: 'Buissonnant', waterNeedLevel: 2 }
    ],
    description: 'Courge d\'été en forme de soucoupe volante.',
    image: 'https://em-content.zobj.net/source/microsoft-teams/337/flying-saucer_1f6f8.png', 
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 4 },
    yield: { amount: 10, unit: 'fruits/plant', description: 'Récolter jeune.' },
    maintenanceTips: 'Ne mouillez pas les feuilles.',
    growingMethods: 'Sur compost.',
    soilCoverage: 'Moyenne.',
    associations: ['Maïs', 'Haricots'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 80, betweenRows: 100 },
    rotations: ['Légumineuses'],
    diseases: [],
    planning: { sowing: [4, 5], planting: [5], maintenance: [6, 7], harvest: [7, 8, 9] },
    successions: 1
  },

  // --- RACINES ---
  {
    id: 'carottes',
    name: 'Carottes',
    category: 'Racines',
    varieties: [
      { name: 'Nantaise', description: 'Demi-longue.', advantage: 'Goût sucré', waterNeedLevel: 2 },
      { name: 'De Colmar', description: 'Cœur rouge.', advantage: 'Conservation', yieldBoost: '+10%', waterNeedLevel: 2 }
    ],
    description: 'Indispensable et vitaminée.',
    image: `${ICON_BASE}/Food/Carrot.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 2.5, unit: 'kg/m²', description: 'Dépend de la finesse du sol.' },
    maintenanceTips: 'Éclaircissage crucial. Sol meuble.',
    growingMethods: 'Semis sable.',
    soilCoverage: 'Moyenne.',
    associations: ['Poireaux', 'Oignons', 'Radis'],
    plantsPerPerson: 300,
    spacingCm: { betweenPlants: 5, betweenRows: 25 },
    rotations: ['Légumineuses', 'Feuilles'],
    diseases: [{ name: 'Mouche', solution: 'Filet.' }],
    planning: { sowing: [3, 4, 5, 6], planting: [], maintenance: [5, 6, 7], harvest: [7, 8, 9, 10, 11] },
    successions: 2
  },
  {
    id: 'radis',
    name: 'Radis',
    category: 'Racines',
    varieties: [
      { name: 'De 18 Jours', description: 'Ultra rapide.', advantage: 'Croquant', waterNeedLevel: 2 },
      { name: 'Noir d\'Hiver', description: 'Gros et piquant.', advantage: 'Conservation', waterNeedLevel: 2 }
    ],
    description: 'Culture rapide pour boucher les trous.',
    image: `https://em-content.zobj.net/source/microsoft-teams/337/carrot_1f955.png`, // Placeholder
    exposure: 'Mi-ombre',
    waterNeeds: 'Élevé',
    watering: { frequency: 'Tous les jours', volumePerPlant: 0.1 },
    yield: { amount: 1, unit: 'bottes/m²', description: 'Rapide.' },
    maintenanceTips: 'Arrosage régulier pour éviter le piquant.',
    growingMethods: 'Semis volée.',
    soilCoverage: 'Faible.',
    associations: ['Carottes', 'Salades'],
    plantsPerPerson: 50,
    spacingCm: { betweenPlants: 5, betweenRows: 15 },
    rotations: ['Feuilles'],
    diseases: [{ name: 'Altise', solution: 'Maintenir humide.' }],
    planning: { sowing: [3, 4, 5, 6, 9], planting: [], maintenance: [3, 4, 5, 6, 9], harvest: [4, 5, 6, 7, 10] },
    successions: 4
  },
  {
    id: 'betterave',
    name: 'Betterave',
    category: 'Racines',
    varieties: [
      { name: 'D\'Egypte', description: 'Racine plate.', advantage: 'Hâtive', waterNeedLevel: 2 },
      { name: 'Crapaudine', description: 'Allongée rugueuse.', advantage: 'Saveur sucrée', waterNeedLevel: 2 }
    ],
    description: 'Racine douce et feuilles comestibles.',
    image: `https://em-content.zobj.net/source/microsoft-teams/337/beetle_1fab2.png`, 
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Facile à cultiver.' },
    maintenanceTips: 'Eclaircir les semis.',
    growingMethods: 'Semis direct.',
    soilCoverage: 'Moyenne.',
    associations: ['Oignons', 'Haricots'],
    plantsPerPerson: 40,
    spacingCm: { betweenPlants: 10, betweenRows: 30 },
    rotations: ['Légumineuses'],
    diseases: [],
    planning: { sowing: [4, 5, 6], planting: [], maintenance: [6, 7, 8], harvest: [7, 8, 9, 10] },
    successions: 2
  },

  // --- TUBERCULES ---
  {
    id: 'pdt',
    name: 'P. de Terre',
    category: 'Tubercules',
    varieties: [
      { name: 'Charlotte', description: 'Chair ferme.', advantage: 'Tenue cuisson', waterNeedLevel: 2 },
      { name: 'Bintje', description: 'Chair farineuse.', advantage: 'Idéale frites', yieldBoost: '+15%', waterNeedLevel: 2 },
      { name: 'Ratte', description: 'Petite et fine.', advantage: 'Gastronomique', waterNeedLevel: 2 }
    ],
    description: 'La base calorique de l\'autonomie.',
    image: `${ICON_BASE}/Food/Potato.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / 10 jours', volumePerPlant: 3 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Env. 1kg par plant.' },
    maintenanceTips: 'Buttage essentiel. Ne jamais arroser le feuillage.',
    growingMethods: 'Rangs buttés.',
    soilCoverage: 'Dense.',
    associations: ['Haricots', 'Pois', 'Choux'],
    plantsPerPerson: 120,
    spacingCm: { betweenPlants: 40, betweenRows: 65 },
    rotations: ['Légumineuses', 'Fruits'],
    diseases: [{ name: 'Mildiou', solution: 'Bouillie bordelaise.' }],
    planning: { sowing: [], planting: [3, 4, 5], maintenance: [4, 5, 6], harvest: [7, 8, 9] },
    successions: 1
  },

  // --- BULBES ---
  {
    id: 'oignons',
    name: 'Oignons',
    category: 'Bulbes',
    varieties: [
      { name: 'Stuttgart', description: 'Jaune classique.', advantage: 'Conservation', waterNeedLevel: 1 },
      { name: 'Rouge de Florence', description: 'Allongé doux.', advantage: 'Salades', waterNeedLevel: 1 }
    ],
    description: 'Indispensable en cuisine, longue conservation.',
    image: `${ICON_BASE}/Food/Onion.png`,
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Jamais sauf sécheresse', volumePerPlant: 0.1 },
    yield: { amount: 4, unit: 'kg/m²', description: 'Séchage important.' },
    maintenanceTips: 'Désherbage minutieux. Pas de fumure fraîche.',
    growingMethods: 'Bulbilles.',
    soilCoverage: 'Faible.',
    associations: ['Carottes', 'Betteraves', 'Fraises'],
    plantsPerPerson: 80,
    spacingCm: { betweenPlants: 10, betweenRows: 25 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Mouche', solution: 'Carottes à côté.' }],
    planning: { sowing: [2, 3], planting: [3, 4], maintenance: [5, 6], harvest: [7, 8] },
    successions: 1
  },
  {
    id: 'ail',
    name: 'Ail',
    category: 'Bulbes',
    varieties: [
      { name: 'Violet', description: 'Hâtif.', advantage: 'Goût fort', waterNeedLevel: 1 },
      { name: 'Blanc', description: 'Tardif.', advantage: 'Conservation', waterNeedLevel: 1 }
    ],
    description: 'Santé et goût. Se plante souvent en automne ou fin d\'hiver.',
    image: `${ICON_BASE}/Food/Garlic.png`,
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Jamais', volumePerPlant: 0 },
    yield: { amount: 1, unit: 'tête/plant', description: 'Fiable.' },
    maintenanceTips: 'Sol drainé impératif.',
    growingMethods: 'Caïeux.',
    soilCoverage: 'Faible.',
    associations: ['Fraises', 'Carottes'],
    plantsPerPerson: 30,
    spacingCm: { betweenPlants: 12, betweenRows: 25 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Rouille', solution: 'Rotation.' }],
    planning: { sowing: [], planting: [10, 11, 2, 3], maintenance: [4, 5], harvest: [6, 7] },
    successions: 1
  },

  // --- FEUILLES ---
  {
    id: 'salades',
    name: 'Salades',
    category: 'Feuilles',
    varieties: [
      { name: 'Batavia', description: 'Croquante.', advantage: 'Résistante chaleur', waterNeedLevel: 2 },
      { name: 'Feuille de Chêne', description: 'Tendre.', advantage: 'Repousse', waterNeedLevel: 2 },
      { name: 'Mâche', description: 'Hiver.', advantage: 'Froid', waterNeedLevel: 1 }
    ],
    description: 'Rapide et facile toute l\'année.',
    image: `${ICON_BASE}/Food/Leafy%20Green.png`,
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: 'Tous les 2 jours', volumePerPlant: 0.5 },
    yield: { amount: 0.3, unit: 'kg/plant', description: 'Rotation rapide.' },
    maintenanceTips: 'Attention aux limaces. Semis échelonnés.',
    growingMethods: 'Semis/Repiquage.',
    soilCoverage: 'Moyenne.',
    associations: ['Radis', 'Pois', 'Fraises'],
    plantsPerPerson: 150,
    spacingCm: { betweenPlants: 25, betweenRows: 30 },
    rotations: ['Racines'],
    diseases: [{ name: 'Limaces', solution: 'Ferramol.' }],
    planning: { sowing: [3, 4, 5, 6, 7, 8], planting: [4, 5, 6, 7, 8, 9], maintenance: [5, 6, 7, 8, 9], harvest: [5, 6, 7, 8, 9, 10] },
    successions: 4 
  },
  {
    id: 'epinards',
    name: 'Épinards',
    category: 'Feuilles',
    varieties: [
      { name: 'Géant d\'Hiver', description: 'Grandes feuilles.', advantage: 'Rustique', waterNeedLevel: 2 }
    ],
    description: 'Riche en fer, culture de mi-saison.',
    image: `${ICON_BASE}/Food/Leafy%20Green.png`, 
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 1.5, unit: 'kg/m²', description: 'Plusieurs coupes.' },
    maintenanceTips: 'Arrosage régulier.',
    growingMethods: 'Lignes.',
    soilCoverage: 'Bonne.',
    associations: ['Fraises', 'Choux'],
    plantsPerPerson: 50,
    spacingCm: { betweenPlants: 10, betweenRows: 25 },
    rotations: ['Racines'],
    diseases: [],
    planning: { sowing: [2, 3, 4, 8, 9], planting: [], maintenance: [3, 4, 9], harvest: [4, 5, 10, 11] },
    successions: 2
  },
  {
    id: 'choux',
    name: 'Choux',
    category: 'Feuilles',
    varieties: [
      { name: 'Cabus', description: 'Pomme lisse.', advantage: 'Choucroute', waterNeedLevel: 2 },
      { name: 'Kale', description: 'Frisé.', advantage: 'Hiver', waterNeedLevel: 2 },
      { name: 'Brocoli', description: 'Fleurs.', advantage: 'Rapide', waterNeedLevel: 2 }
    ],
    description: 'Famille exigeante mais nourrissante.',
    image: `${ICON_BASE}/Food/Broccoli.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 2 },
    yield: { amount: 1, unit: 'kg/plant', description: 'Variable.' },
    maintenanceTips: 'Sol riche. Protéger des piérides.',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Large.',
    associations: ['Céleri', 'Tomates'],
    plantsPerPerson: 15,
    spacingCm: { betweenPlants: 50, betweenRows: 60 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Piéride', solution: 'Filet.' }],
    planning: { sowing: [3, 4, 5], planting: [5, 6], maintenance: [6, 7, 8], harvest: [8, 9, 10, 11, 12] },
    successions: 1
  },
  {
    id: 'choux_bruxelles',
    name: 'Choux de Bruxelles',
    category: 'Feuilles',
    varieties: [
      { name: 'Sanda', description: 'Tardif.', advantage: 'Résistant froid', waterNeedLevel: 2 }
    ],
    description: 'Récolte d\'hiver le long de la tige.',
    image: `${MS_EMOJI_BASE}/leafy-green_1f96c.png`, 
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 2 },
    yield: { amount: 0.5, unit: 'kg/plant', description: 'Sur la tige.' },
    maintenanceTips: 'Tuteurer et butter. Récolter après les gelées.',
    growingMethods: 'Repiquage.',
    soilCoverage: 'Moyenne.',
    associations: ['Tomates', 'Betteraves'],
    plantsPerPerson: 10,
    spacingCm: { betweenPlants: 60, betweenRows: 70 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Pucerons', solution: 'Savon noir.' }],
    planning: { sowing: [3, 4, 5], planting: [5, 6], maintenance: [7, 8, 9, 10], harvest: [11, 12, 1, 2] },
    successions: 1
  },
  {
    id: 'poireaux',
    name: 'Poireaux',
    category: 'Feuilles',
    varieties: [
      { name: 'Bleu de Solaise', description: 'Hiver.', advantage: 'Rustique', waterNeedLevel: 2 },
      { name: 'Gros Jaune', description: 'Automne.', advantage: 'Gros', waterNeedLevel: 2 }
    ],
    description: 'Légume d\'hiver par excellence.',
    image: `${MS_EMOJI_BASE}/leek_1f9c5.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 3, unit: 'kg/m²', description: 'Longue culture.' },
    maintenanceTips: 'Buttez pour blanchir le fût.',
    growingMethods: 'Repiquage profond.',
    soilCoverage: 'Faible.',
    associations: ['Carottes', 'Fraises'],
    plantsPerPerson: 60,
    spacingCm: { betweenPlants: 15, betweenRows: 30 },
    rotations: ['Légumineuses'],
    diseases: [{ name: 'Teigne', solution: 'Filet/Voile.' }],
    planning: { sowing: [2, 3, 4], planting: [5, 6, 7], maintenance: [8, 9, 10], harvest: [11, 12, 1, 2] },
    successions: 1
  },

  // --- LÉGUMINEUSES ---
  {
    id: 'haricots',
    name: 'Haricots',
    category: 'Légumineuses',
    varieties: [
      { name: 'Contender', description: 'Nain.', advantage: 'Précoce', waterNeedLevel: 2 },
      { name: 'Fortex', description: 'Rames.', advantage: 'Longue récolte', waterNeedLevel: 2 }
    ],
    description: 'Azote pour le sol, protéines pour vous.',
    image: `${ICON_BASE}/Food/Peanuts.png`, 
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 1.5, unit: 'kg/m²', description: 'Plus productif en rames.' },
    maintenanceTips: 'Buttez les pieds.',
    growingMethods: 'Poquets.',
    soilCoverage: 'Régénère le sol.',
    associations: ['Pommes de Terre', 'Carottes'],
    plantsPerPerson: 60,
    spacingCm: { betweenPlants: 10, betweenRows: 40 },
    rotations: ['Feuilles', 'Racines'],
    diseases: [],
    planning: { sowing: [5, 6, 7], planting: [], maintenance: [6, 7, 8], harvest: [7, 8, 9] },
    successions: 2
  },
  {
    id: 'pois',
    name: 'Petits Pois',
    category: 'Légumineuses',
    varieties: [
      { name: 'Petit Provençal', description: 'Nain hâtif.', advantage: 'Sucré', waterNeedLevel: 2 },
      { name: 'Téléphone', description: 'Rames.', advantage: 'Productif', waterNeedLevel: 2 }
    ],
    description: 'Délice du printemps.',
    image: `${ICON_BASE}/Food/Pea%20Pod.png`, 
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 1 },
    yield: { amount: 1, unit: 'kg/m²', description: 'Frais.' },
    maintenanceTips: 'Tuteurer même les nains.',
    growingMethods: 'Lignes.',
    soilCoverage: 'Moyenne.',
    associations: ['Carottes', 'Navets'],
    plantsPerPerson: 50,
    spacingCm: { betweenPlants: 5, betweenRows: 40 },
    rotations: ['Feuilles'],
    diseases: [],
    planning: { sowing: [2, 3, 4], planting: [], maintenance: [4, 5], harvest: [5, 6] },
    successions: 1
  },

  // --- PÉRENNES (PERENNES) ---
  {
    id: 'artichaut',
    name: 'Artichaut',
    category: 'Perenne',
    varieties: [
      { name: 'Violet de Provence', description: 'Petits violets.', advantage: 'Tendre', waterNeedLevel: 2 },
      { name: 'Camus de Bretagne', description: 'Gros vert.', advantage: 'Charnu', waterNeedLevel: 2 }
    ],
    description: 'Culture perpétuelle, demande de la place.',
    image: `${ICON_BASE}/Food/Broccoli.png`, // Visuel approchant
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 5 },
    yield: { amount: 5, unit: 'têtes/plant', description: 'Dès la 2ème année.' },
    maintenanceTips: 'Protéger la souche en hiver.',
    growingMethods: 'Plant isolé.',
    soilCoverage: 'Large.',
    associations: ['Fèves', 'Pois'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 100, betweenRows: 120 },
    rotations: ['Perenne'],
    diseases: [{ name: 'Pucerons', solution: 'Savon noir.' }],
    planning: { sowing: [], planting: [3, 4, 9], maintenance: [4, 5], harvest: [5, 6, 7] },
    successions: 1
  },
  {
    id: 'rhubarbe',
    name: 'Rhubarbe',
    category: 'Perenne',
    varieties: [
      { name: 'Victoria', description: 'Tiges vertes/rouges.', advantage: 'Vigoureuse', waterNeedLevel: 2 }
    ],
    description: 'Indestructible une fois installée. Attention feuilles toxiques.',
    image: `https://em-content.zobj.net/source/microsoft-teams/337/leafy-green_1f96c.png`, 
    exposure: 'Mi-ombre',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 5 },
    yield: { amount: 3, unit: 'kg/plant', description: 'Abondant.' },
    maintenanceTips: 'Apport compost annuel.',
    growingMethods: 'Plant isolé.',
    soilCoverage: 'Large.',
    associations: ['Fraises'],
    plantsPerPerson: 1,
    spacingCm: { betweenPlants: 100, betweenRows: 100 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [3, 4, 10], maintenance: [4, 5], harvest: [5, 6, 9] },
    successions: 1
  },
  {
    id: 'asperge',
    name: 'Asperges',
    category: 'Perenne',
    varieties: [
      { name: 'Argenteuil', description: 'Hâtive.', advantage: 'Fine', waterNeedLevel: 2 }
    ],
    description: 'Investissement sur 10 ans. Demande un sol sableux.',
    image: `https://em-content.zobj.net/source/microsoft-teams/337/baguette-bread_1f956.png`, // Placeholder form
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Rarement', volumePerPlant: 1 },
    yield: { amount: 0.5, unit: 'kg/m²', description: 'Patience nécessaire.' },
    maintenanceTips: 'Ne rien récolter les 2 premières années.',
    growingMethods: 'Griffes.',
    soilCoverage: 'Moyenne.',
    associations: ['Persil', 'Tomates'],
    plantsPerPerson: 10,
    spacingCm: { betweenPlants: 40, betweenRows: 150 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [3, 4], maintenance: [5, 6], harvest: [4, 5, 6] },
    successions: 1
  },

  // --- PETITS FRUITS ---
  {
    id: 'fraise',
    name: 'Fraises',
    category: 'Petits Fruits',
    varieties: [
      { name: 'Gariguette', description: 'Non remontante.', advantage: 'Goût', waterNeedLevel: 2 },
      { name: 'Mara des Bois', description: 'Remontante.', advantage: 'Productive', waterNeedLevel: 2 }
    ],
    description: 'Le bonbon du jardin. Couvre-sol efficace.',
    image: `${ICON_BASE}/Food/Strawberry.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.2 },
    yield: { amount: 0.5, unit: 'kg/plant', description: 'Gourmandise.' },
    maintenanceTips: 'Couper les stolons. Pailler.',
    growingMethods: 'Buttes ou bordures.',
    soilCoverage: 'Dense.',
    associations: ['Poireaux', 'Oignons', 'Epinards'],
    plantsPerPerson: 20,
    spacingCm: { betweenPlants: 30, betweenRows: 40 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [3, 4, 8, 9], maintenance: [4, 5], harvest: [5, 6, 7, 8, 9] },
    successions: 1
  },
  {
    id: 'framboise',
    name: 'Framboises',
    category: 'Petits Fruits',
    varieties: [
      { name: 'Heritage', description: 'Remontante.', advantage: 'Automne', waterNeedLevel: 2 },
      { name: 'Malling Promise', description: 'Non remontante.', advantage: 'Gros fruits', waterNeedLevel: 2 }
    ],
    description: 'Haies fruitières gourmandes.',
    image: `https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Olive.png`, // Placeholder red
    exposure: 'Mi-ombre',
    waterNeeds: 'Moyen',
    watering: { frequency: '1x / semaine', volumePerPlant: 2 },
    yield: { amount: 1, unit: 'kg/m linéaire', description: 'S\'étend vite.' },
    maintenanceTips: 'Tailler le bois mort en hiver.',
    growingMethods: 'Palissage.',
    soilCoverage: 'Verticale.',
    associations: ['Myosotis'],
    plantsPerPerson: 5,
    spacingCm: { betweenPlants: 50, betweenRows: 150 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [11, 12, 1, 2], maintenance: [2, 3], harvest: [6, 7, 8, 9] },
    successions: 1
  },

  // --- AROMATIQUES ---
  {
    id: 'basilic',
    name: 'Basilic',
    category: 'Aromatiques',
    varieties: [{ name: 'Grand Vert', description: 'Classique.', advantage: 'Pesto', waterNeedLevel: 3 }],
    description: 'Compagnon idéal des tomates.',
    image: `${ICON_BASE}/Food/Leafy%20Green.png`,
    exposure: 'Soleil',
    waterNeeds: 'Élevé',
    watering: { frequency: '3x / semaine', volumePerPlant: 0.2 },
    yield: { amount: 0.2, unit: 'kg/plant', description: 'Couper fleurs.' },
    maintenanceTips: 'Ne pas mouiller feuillage.',
    growingMethods: 'Pot ou terre.',
    soilCoverage: 'Faible.',
    associations: ['Tomates', 'Poivrons'],
    plantsPerPerson: 2,
    spacingCm: { betweenPlants: 20, betweenRows: 20 },
    rotations: ['Aromatiques'],
    diseases: [],
    planning: { sowing: [3, 4], planting: [5, 6], maintenance: [6, 7], harvest: [6, 7, 8, 9] },
    successions: 2
  },
  {
    id: 'menthe',
    name: 'Menthe',
    category: 'Aromatiques',
    varieties: [{ name: 'Marocaine', description: 'Thé.', advantage: 'Parfum', waterNeedLevel: 3 }],
    description: 'Envahissante, à contenir.',
    image: `${ICON_BASE}/Food/Leafy%20Green.png`,
    exposure: 'Mi-ombre',
    waterNeeds: 'Élevé',
    watering: { frequency: '2x / semaine', volumePerPlant: 0.5 },
    yield: { amount: 1, unit: 'kg/m²', description: 'Infini.' },
    maintenanceTips: 'Planter en pot enterré.',
    growingMethods: 'Rhizomes.',
    soilCoverage: 'Totale.',
    associations: ['Choux'],
    plantsPerPerson: 1,
    spacingCm: { betweenPlants: 40, betweenRows: 40 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [3, 4, 5], maintenance: [], harvest: [5, 6, 7, 8, 9, 10] },
    successions: 1
  },

  // --- ARBRES ---
  {
    id: 'pommier',
    name: 'Pommier',
    category: 'Arbres Fruitiers',
    varieties: [{ name: 'Reine des Reinettes', description: 'Chair fine.', advantage: 'Pollinisateur', waterNeedLevel: 2 }],
    description: 'L\'arbre fruitier de base.',
    image: `${ICON_BASE}/Food/Red%20Apple.png`,
    exposure: 'Soleil',
    waterNeeds: 'Faible',
    watering: { frequency: 'Jeunes années', volumePerPlant: 10 },
    yield: { amount: 40, unit: 'kg/arbre', description: 'Adulte.' },
    maintenanceTips: 'Taille hivernale.',
    growingMethods: 'Plein vent.',
    soilCoverage: 'Enherbé.',
    associations: ['Narcisses'],
    plantsPerPerson: 0.5,
    spacingCm: { betweenPlants: 400, betweenRows: 400 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [11, 12, 1], maintenance: [2], harvest: [9, 10] },
    successions: 1
  },
  {
    id: 'poirier',
    name: 'Poirier',
    category: 'Arbres Fruitiers',
    varieties: [{ name: 'Conférence', description: 'Fondante.', advantage: 'Rustique', waterNeedLevel: 2 }],
    description: 'Délicat et savoureux.',
    image: `${ICON_BASE}/Food/Pear.png`,
    exposure: 'Soleil',
    waterNeeds: 'Moyen',
    watering: { frequency: 'Jeunes années', volumePerPlant: 10 },
    yield: { amount: 30, unit: 'kg/arbre', description: 'Adulte.' },
    maintenanceTips: 'Taille douce.',
    growingMethods: 'Palissé.',
    soilCoverage: 'Enherbé.',
    associations: ['Ail'],
    plantsPerPerson: 0.5,
    spacingCm: { betweenPlants: 300, betweenRows: 300 },
    rotations: ['Perenne'],
    diseases: [],
    planning: { sowing: [], planting: [11, 12], maintenance: [2], harvest: [9, 10] },
    successions: 1
  }
];

export const INITIAL_PLOTS: Plot[] = [
  { id: '1', name: 'Tomates', type: 'culture', shape: 'rect', x: 2, y: 2, width: 5, height: 1.2, rotation: 0, opacity: 1, exposure: 'Soleil', plantedCultureId: 'tomates', selectedVariety: 'Cœur de Bœuf', rowOrientation: 'horizontal' },
  { id: '2', name: 'Pommes de Terre', type: 'culture', shape: 'rect', x: 2, y: 4, width: 4, height: 2, rotation: 0, opacity: 1, exposure: 'Soleil', plantedCultureId: 'pdt', selectedVariety: 'Charlotte', rowOrientation: 'vertical' },
  { id: '3', name: 'Grand Chêne', type: 'tree', shape: 'circle', x: 10, y: 2, width: 3, height: 3, rotation: 0, opacity: 0.8, exposure: 'Soleil' },
  { id: '4', name: 'Poulailler', type: 'coop', shape: 'rect', x: 12, y: 7, width: 2, height: 1.5, rotation: 0, opacity: 1, exposure: 'Mi-ombre', chickenCount: 3 },
  { id: '5', name: 'Citerne Pluie', type: 'water_tank', shape: 'circle', x: 13, y: 6, width: 1, height: 1, rotation: 0, opacity: 1, exposure: 'Ombre' },
  { id: '6', name: 'Serre', type: 'greenhouse', shape: 'rect', x: 1, y: 7, width: 4, height: 3, rotation: 0, opacity: 0.9, exposure: 'Soleil', subPlots: [] }
];
