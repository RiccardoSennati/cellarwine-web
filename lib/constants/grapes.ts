// Lista uvaggi (vitigni) internazionali

export const GRAPES = [
  // Italia
  "Sangiovese",
  "Nebbiolo",
  "Barbera",
  "Dolcetto",
  "Aglianico",
  "Nero d'Avola",
  "Corvina",
  "Corvinone",
  "Rondinella",
  "Molinara",
  "Montepulciano",
  "Primitivo",
  "Negroamaro",
  "Glera",
  "Trebbiano",
  "Verdicchio",
  "Pinot Grigio",
  "Vermentino",
  "Fiano",
  "Grechetto",
  "Garganega",
  "Cortese",
  "Moscato",
  "Malvasia",
  "Cannonau",
  "Cannonau",
  "Carignano",
  
  // Francia
  "Pinot Noir",
  "Gamay",
  "Syrah",
  "Grenache",
  "Mourvèdre",
  "Carignan",
  "Cinsault",
  "Cabernet Sauvignon",
  "Cabernet Franc",
  "Merlot",
  "Malbec",
  "Petit Verdot",
  "Carménère",
  "Chardonnay",
  "Sauvignon Blanc",
  "Chenin Blanc",
  "Viognier",
  "Marsanne",
  "Roussanne",
  "Gewürztraminer",
  "Riesling",
  "Pinot Blanc",
  "Pinot Gris",
  "Sémillon",
  "Muscat",
  
  // Spagna
  "Tempranillo",
  "Garnacha",
  "Monastrell",
  "Bobal",
  "Graciano",
  "Mazuelo",
  "Albariño",
  "Verdejo",
  "Xarel·lo",
  "Macabeo",
  "Parellada",
  
  // Germania/Austria
  "Riesling",
  "Müller-Thurgau",
  "Silvaner",
  "Gewürztraminer",
  "Grüner Veltliner",
  
  // Portogallo
  "Touriga Nacional",
  "Touriga Franca",
  "Tinta Roriz",
  "Baga",
  "Trincadeira",
  
  // Internazionali/Nuovo Mondo
  "Zinfandel",
  "Pinotage",
  "Shiraz",
  "Carmenère",
  "Malbec",
  "Torrontés",
  "Sémillon",
  "Colombard",
  
  // Altri
  "Cabernet Sauvignon",
  "Merlot",
  "Syrah/Shiraz",
  "Chardonnay",
  "Sauvignon Blanc",
  "Pinot Noir",
  "Riesling",
  "Gewürztraminer",
] as const;

// Rimuovi duplicati e ordina
export const UNIQUE_GRAPES = Array.from(new Set(GRAPES)).sort() as readonly string[];

export type GrapeName = typeof UNIQUE_GRAPES[number];

