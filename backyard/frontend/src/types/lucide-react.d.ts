declare module "lucide-react" {
  import type { SVGProps } from "react";

  export type LucideIcon = (props: SVGProps<SVGSVGElement> & { size?: number | string }) => JSX.Element;

  export const Building2: LucideIcon;
  export const CalendarPlus: LucideIcon;
  export const Check: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Lock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Settings: LucideIcon;
  export const Timer: LucideIcon;
  export const Trophy: LucideIcon;
  export const User: LucideIcon;
  export const UserLock: LucideIcon;
}
