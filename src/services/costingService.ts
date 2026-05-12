import { Material } from '../types';

/**
 * Service to calculate the total manufactured cost of a product.
 * Logic:
 * - Fetch all materials associated with a product recipe
 * - Calculate (Material Quantity * Current Material Price)
 * - Add a labor/overhead buffer
 */
export function calculateProductionCost(
  recipe: { materialId: string; quantity: number }[],
  materials: Material[],
  laborBuffer: number = 0.2
): { subtotal: number; overhead: number; total: number; breakdown: any[] } {
  let subtotal = 0;
  const breakdown: any[] = [];

  recipe.forEach((item) => {
    const material = materials.find((m) => m.id === item.materialId);
    if (!material) {
      throw new Error(`Material with ID ${item.materialId} not found`);
    }
    const cost = item.quantity * material.costPerUnit;
    subtotal += cost;
    breakdown.push({
      materialName: material.name,
      quantity: item.quantity,
      unit: material.unit,
      costPerUnit: material.costPerUnit,
      total: cost,
    });
  });

  const overhead = subtotal * laborBuffer;
  const total = subtotal + overhead;

  return {
    subtotal,
    overhead,
    total,
    breakdown,
  };
}
