import "i18next";
import { resources } from "./src/utils/i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["pt-BR"];
  }
}
