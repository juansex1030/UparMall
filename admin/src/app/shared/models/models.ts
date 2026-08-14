export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  // Gestión de Stock
  manageStock?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  // Combos
  isCombo?: boolean;
  comboItems?: any[];
  isPinned?: boolean;
}

export interface ProductSpecification {
  key: string;   // Ej: "Memoria RAM"
  value: string; // Ej: "8GB"
}

export interface ProductVariant {
  name: string; // Ej: "Tamaño", "Extras"
  options: VariantOption[];
}

export interface VariantOption {
  label: string; // Ej: "Grande", "Rojo"
  price: number; // Ej: 5000, 2000
  imageUrl?: string; // Foto específica para esta variante
  isAvailable?: boolean; // Si hay stock o no
}

export interface HeroSlide {
  url: string;
  title?: string;
  subtitle?: string;
}

export interface BusinessDay {
  day: string;
  open: string;
  close: string;
  enabled: boolean;
}

export interface Settings {
  id: number;
  storeId: string;
  store_type?: 'RETAIL' | 'RESTAURANT';
  businessName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  whatsappNumber: string;
  welcomeMessage: string;
  description?: string;
  slug?: string;
  categories?: string[];
  heroSlides?: HeroSlide[];
  businessHours?: BusinessDay[];
  // Visual & Brand Configuration
  fontFamily?: string;
  navbarStyle?: 'glass' | 'solid' | 'minimal';
  cardStyle?: 'flat' | 'elevated' | 'glass';
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
  };
  backgroundImageUrl?: string;
  deliveryFee?: number;
  hasDelivery: boolean;
  allowCashOnDelivery: boolean;
  address?: string;
  nit?: string;
  guaranteeTerms?: string;
  enableCombos?: boolean;
  allowDigitalTransfers?: boolean;
  digitalTransferDetails?: string;
  digitalAccounts?: DigitalAccount[];
}

export interface DigitalAccount {
  bank: 'nequi' | 'daviplata' | 'breb' | 'bancolombia' | 'otro';
  number: string;
  name: string;
}

export interface OrderItem {
  id: string | number;
  order_id: string | number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  options?: any;
  notes?: string;
}

export interface Order {
  id: number;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total: number;
  payment_method: string;
  notes?: string;
  status: 'open' | 'pendiente' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado' | 'pagado' | 'completed';
  created_at: string;
  updated_at: string;
  table_id?: string;
  waiter_id?: string;
  OrderItems?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: { [variantName: string]: VariantOption };
}

export interface Table {
  id: string;
  store_id: string;
  name: string;
  status: 'free' | 'occupied' | 'pending_payment';
  current_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  store_id: string;
  name: string;
  role: 'WAITER' | 'KITCHEN' | 'ADMIN';
  pin_code: string;
  created_at: string;
  updated_at: string;
}
