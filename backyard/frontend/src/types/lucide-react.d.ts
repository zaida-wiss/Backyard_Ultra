declare module "lucide-react" {
  import type { SVGProps } from "react";

  export type LucideIcon = (props: SVGProps<SVGSVGElement> & { size?: number | string }) => JSX.Element;

  export const CalendarPlus: LucideIcon;
  export const LogOut: LucideIcon;
  export const MapPin: LucideIcon;
  export const Trophy: LucideIcon;
  export const UserLock: LucideIcon;
}
