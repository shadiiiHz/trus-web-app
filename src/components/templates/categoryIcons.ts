import type { FC } from "react";
import { Gavel, Scissors, Dumbbell, Home, type LucideIcon } from "lucide-react";
import {
  AllIcon,
  RestaurantIcon,
  ClinicIcon,
  type IconProps,
} from "@/components/templates/CategoryIconGlyphs";

export type { IconProps };

export const CATEGORY_ICONS: Record<string, LucideIcon | FC<IconProps>> = {
  all: AllIcon,
  lawyers: Gavel,
  restaurant: RestaurantIcon,
  clinics: ClinicIcon,
  barbershops: Scissors,
  fitness: Dumbbell,
  realEstate: Home,
};
