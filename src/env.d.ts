/// <reference types="astro/client" />

declare module "*.svg?react" {
  import type { ComponentType, SVGProps } from "react";

  const component: ComponentType<SVGProps<SVGSVGElement>>;
  export default component;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
