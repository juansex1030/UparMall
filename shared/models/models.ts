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
  slug?: string;
  categories?: string[];
  heroSlides?: HeroSlide[];
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
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: { [variantName: string]: VariantOption };
}
