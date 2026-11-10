import type { AdminProduct, ProductAvailability } from "./product-admin";

export interface ProductFormValues {
  name: string;
  brand: string;
  category: string;
  price: string;
  currency: string;
  stock: string;
  availability: ProductAvailability;
  badge: string;
  description: string;
  sortOrder: string;
  active: boolean;
  colors: string[];
  specs: Array<{ key: string; value: string }>;
}

export const CATEGORY_OPTIONS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "luxury", label: "Luxury" },
  { value: "unisex", label: "Unisex" },
  { value: "accessories", label: "Accessories" },
];

export function emptyProductFormValues(): ProductFormValues {
  return {
    name: "",
    brand: "",
    category: "luxury",
    price: "",
    currency: "DA",
    stock: "1",
    availability: "available",
    badge: "",
    description: "",
    sortOrder: "100",
    active: true,
    colors: [],
    specs: [],
  };
}

export function valuesFromProduct(product: AdminProduct): ProductFormValues {
  return {
    name: product.name,
    brand: product.brand ?? "",
    category: product.category || "luxury",
    price: String(product.price ?? ""),
    currency: product.currency || "DA",
    stock: product.stock === null || product.stock === undefined ? "" : String(product.stock),
    availability: product.availability,
    badge: product.badge ?? "",
    description: product.description ?? "",
    sortOrder: String(product.sort_order ?? 100),
    active: product.active,
    colors: [...(product.colors ?? [])],
    specs: Object.entries(product.specs ?? {}).map(([key, value]) => ({ key, value })),
  };
}

export function payloadFromValues(values: ProductFormValues) {
  const specs: Record<string, string> = {};
  for (const row of values.specs) {
    const key = row.key.trim();
    const value = row.value.trim();
    if (key && value) specs[key] = value;
  }

  const price = Number(values.price);
  const stock = values.stock.trim() === "" ? null : Number(values.stock);
  const sortOrder =
    values.sortOrder.trim() === "" ? 100 : Number(values.sortOrder);

  return {
    name: values.name.trim(),
    brand: values.brand.trim() || null,
    category: values.category.trim() || "luxury",
    price: Number.isFinite(price) ? price : 0,
    currency: values.currency.trim() || "DA",
    stock: stock !== null && Number.isFinite(stock) ? stock : null,
    availability: values.availability,
    badge: values.badge.trim() || null,
    description: values.description.trim() || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 100,
    active: values.active,
    colors: values.colors,
    specs,
  };
}
