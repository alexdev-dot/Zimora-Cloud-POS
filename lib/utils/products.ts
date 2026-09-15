import type { Product } from "@/types";

export const STOCK_STATUS_META = {
  in_stock: { label: "In Stock", color: "success" },
  low_stock: { label: "Low Stock", color: "warning" },
  out_of_stock: { label: "Out of Stock", color: "danger" },
};

export function stockStatusOf(product: Product): keyof typeof STOCK_STATUS_META {
  if (product.stock === 0) return "out_of_stock";
  if (product.stock <= product.minStock) return "low_stock";
  return "in_stock";
}

export function productById(id: string, products: Product[]): Product | undefined {
  return products.find((p) => p.id === id);
}
