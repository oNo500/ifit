/* AUTO-GENERATED from ../../schema by scripts/codegen.ts -- do not edit. Regenerate: bun run codegen */

export interface Profiles {
  layers?: {
    [k: string]: ProfileLayer;
  };
  profiles: {
    [k: string]: Profile;
  };
}
export interface ProfileLayer {
  description?: string;
  rules: string[];
}
export interface Profile {
  description?: string;
  layers?: string[];
  rules?: string[];
}
