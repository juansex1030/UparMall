export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  isCombo?: boolean;
  comboItems?: { productId: number; quantity: number }[];
  manageStock?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
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
  businessName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  whatsappNumber: string;
  welcomeMessage: string;
  description?: string;
  storeId: string;
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
  allowDigitalTransfers?: boolean;
  digitalTransferDetails?: string;
  digitalAccounts?: DigitalAccount[];
}

export interface DigitalAccount {
  bank: 'nequi' | 'daviplata' | 'breb' | 'bancolombia' | 'otro';
  number: string;
  name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: { [variantName: string]: VariantOption };
}
