/* AUTO-GENERATED from ../../schema by scripts/codegen.ts -- do not edit. Regenerate: bun run codegen */

export interface Catalog {
  generatedAt: string;
  rules: {
    [k: string]: CatalogRule;
  };
}
export interface CatalogRule {
  description: string;
  requires: string[];
  path: string;
  profiles: string[];
  preference: boolean;
}
