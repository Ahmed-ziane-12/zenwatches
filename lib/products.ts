// Shared types and helpers. Safe to import from client and server code.
// Real products come from Supabase (see lib/watches.ts); the SVG drawings below are the fallback
// artwork for rows without an image_url, and the sample catalogue is only used in development.

export type ModelId = "dress" | "diver" | "chrono" | "field" | "cushion";
export type ColorwayId = "steelWhite" | "steelNavy" | "gold" | "black" | "green" | "rose" | "blueDiver";

export interface Colorway {
  label: string;
  case: string;
  bezel: string;
  dial: string;
  strap: string;
  mark: string;
  acc: string;
}

export interface Model {
  name: string;
  spec: string;
  price: number;
}

/** Which SVG drawing to use when a product has no photo. */
export interface Art {
  model: ModelId;
  cw: ColorwayId;
}

export interface Product {
  id: string;
  name: string;
  spec: string;
  price: number;
  /** Currency label shown after the price, e.g. "DA". */
  currency: string;
  colorLabel: string;
  imageUrl: string | null;
  art: Art;
}

/** Scroll settings for one hero column. `dur` is seconds per loop; `delay` offsets the start. */
export interface ColumnMotion {
  dir: "down" | "up";
  dur: number;
  delay: number;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  steelWhite: { label: "Steel, white dial",    case: "#cfd3d8", bezel: "#aab0b8", dial: "#f2efe7", strap: "#1c1c1f", mark: "#1c1c1f", acc: "#b3372c" },
  steelNavy:  { label: "Steel, navy dial",     case: "#cfd3d8", bezel: "#9aa1ab", dial: "#1d2f4a", strap: "#3b2a20", mark: "#f1efe8", acc: "#d9a441" },
  gold:       { label: "Gold, champagne dial", case: "#c9a24d", bezel: "#a8832f", dial: "#e8dcc0", strap: "#4a2f22", mark: "#3a2c14", acc: "#7a1f1f" },
  black:      { label: "Black, black dial",    case: "#3a3d42", bezel: "#1a1c1f", dial: "#0f1113", strap: "#202226", mark: "#e9e7df", acc: "#e46a2e" },
  green:      { label: "Steel, green dial",    case: "#c4c9c6", bezel: "#1e4a3a", dial: "#1f5a45", strap: "#1e2420", mark: "#efeee6", acc: "#e0b64a" },
  rose:       { label: "Rose, blush dial",     case: "#d7a58d", bezel: "#b98266", dial: "#efe3dc", strap: "#6b3b3b", mark: "#4a2c2a", acc: "#a8453d" },
  blueDiver:  { label: "Steel, blue dial",     case: "#b9c0c7", bezel: "#1c3f7a", dial: "#10285a", strap: "#aeb4bb", mark: "#f4f4ef", acc: "#f26a21" },
};

export const MODELS: Record<ModelId, Model> = {
  dress:   { name: "Calder 38",    spec: "38 mm · Automatic",     price: 42000 },
  diver:   { name: "Marlin 42",    spec: "42 mm · 300 m",         price: 69000 },
  chrono:  { name: "Tachy 40",     spec: "40 mm · Quartz chrono", price: 54000 },
  field:   { name: "Fieldpost 36", spec: "36 mm · Hand-wound",    price: 31000 },
  cushion: { name: "Quadra 34",    spec: "34 mm · Quartz",        price: 28000 },
};

export const COLUMN_COUNT = 3;
export const WATCHES_PER_COLUMN = 5;

// The three columns scroll down, up, down at different speeds so they never line up.
export const COLUMN_MOTION: ColumnMotion[] = [
  { dir: "down", dur: 46, delay: 0 },
  { dir: "up", dur: 38, delay: -9 },
  { dir: "down", dur: 52, delay: -21 },
];

/** Picks a stable drawing for a product id, so the same watch always gets the same artwork. */
export function artFor(id: string): Art {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const models = Object.keys(MODELS) as ModelId[];
  const colorways = Object.keys(COLORWAYS) as ColorwayId[];
  return { model: models[h % models.length], cw: colorways[Math.floor(h / models.length) % colorways.length] };
}

/** Deals products into columns of five. A short list repeats so every column is long enough to loop. */
export function buildColumns(products: Product[], columns = COLUMN_COUNT, perColumn = WATCHES_PER_COLUMN): Product[][] {
  if (products.length === 0) return [];
  return Array.from({ length: columns }, (_, c) =>
    Array.from({ length: perColumn }, (_, r) => products[(r * columns + c) % products.length]),
  );
}

const SAMPLE_ART: [ModelId, ColorwayId][] = [
  ["dress", "steelWhite"], ["diver", "black"], ["field", "green"], ["cushion", "gold"], ["chrono", "steelNavy"],
  ["cushion", "rose"], ["dress", "gold"], ["diver", "blueDiver"], ["field", "steelWhite"], ["chrono", "green"],
  ["field", "black"], ["chrono", "steelWhite"], ["dress", "steelNavy"], ["cushion", "green"], ["diver", "steelWhite"],
];

/** Fifteen made-up watches for working on the page before the database is connected or when it fails. */
export function sampleProducts(): Product[] {
  return SAMPLE_ART.map(([model, cw]) => ({
    id: `sample-${model}-${cw}`,
    name: MODELS[model].name,
    spec: MODELS[model].spec,
    price: MODELS[model].price,
    currency: "DA",
    colorLabel: COLORWAYS[cw].label,
    imageUrl: null,
    art: { model, cw },
  }));
}

/** 42000 -> "42,000 DA". */
export const formatPrice = (n: number, currency = "DA"): string => `${n.toLocaleString("en-US")} ${currency}`.trim();
