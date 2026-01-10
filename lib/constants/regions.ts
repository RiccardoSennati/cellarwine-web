// Regioni per paese

export const ITALIAN_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige",
  "Umbria",
  "Valle d'Aosta",
  "Veneto",
] as const;

export const FRENCH_REGIONS = [
  "Champagne",
  "Bourgogne",
  "Bordeaux",
  "Alsace",
  "Loire",
  "Rhône",
  "Provence",
  "Languedoc-Roussillon",
  "Jura",
  "Savoie",
  "Sud-Ouest",
  "Beaujolais",
] as const;

export const USA_REGIONS = [
  "California",
  "Napa Valley",
] as const;

export const COUNTRIES = [
  { value: "italia", label: "Italia" },
  { value: "francia", label: "Francia" },
  { value: "germania", label: "Germania" },
  { value: "austria", label: "Austria" },
  { value: "usa", label: "USA" },
  { value: "argentina", label: "Argentina" },
  { value: "resto-del-mondo", label: "Resto del Mondo" },
] as const;

export type CountryValue = typeof COUNTRIES[number]["value"];

export function getRegionsForCountry(country: CountryValue | null | undefined): string[] {
  switch (country) {
    case "italia":
      return [...ITALIAN_REGIONS];
    case "francia":
      return [...FRENCH_REGIONS];
    case "usa":
      return [...USA_REGIONS];
    case "germania":
    case "austria":
    case "argentina":
      return []; // Nessuna regione disponibile
    case "resto-del-mondo":
      return []; // Input libero invece di select
    default:
      return [];
  }
}

export function hasRegionSelect(country: CountryValue | null | undefined): boolean {
  return country === "italia" || country === "francia" || country === "usa";
}

export function hasRegionInput(country: CountryValue | null | undefined): boolean {
  return country === "resto-del-mondo";
}

