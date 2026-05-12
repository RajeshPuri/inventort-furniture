export type Role = 'admin' | 'artisan' | 'showroom';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Material {
  id: string;
  name: string;
  unit: 'sq ft' | 'kg' | 'm' | 'pcs';
  stockLevel: number;
  costPerUnit: number;
  updatedAt: string;
}

export interface RecipeItem {
  materialId: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  recipe: RecipeItem[];
  laborBuffer: number;
  stockLevel: number;
  price: number;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'cutting' | 'assembly' | 'finished';

export interface ProductionOrder {
  id: string;
  productId: string;
  quantity: number;
  status: OrderStatus;
  artisanId?: string;
  estimatedCompletion: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending';
  createdAt: string;
}
