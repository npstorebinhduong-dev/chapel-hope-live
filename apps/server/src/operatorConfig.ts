import fs from "node:fs";
import path from "node:path";
import {
  defaultProduction,
  defaultSource,
  productionSchema,
  sourceConfigSchema,
  type ProductionSettings,
  type SourceConfig,
} from "../../../packages/shared/src/production.ts";
export function operatorConfig(file?: string) {
  let production = defaultProduction(),
    source: SourceConfig = {
      mode: "mock",
      endpoint: defaultSource().endpoint,
      mapping: {},
    };
  if (file && fs.existsSync(file)) {
    const d = JSON.parse(fs.readFileSync(file, "utf8"));
    production = productionSchema.parse(d.production);
    source = sourceConfigSchema.parse({ ...d.source, mode: "mock" });
  }
  return {
    production,
    source,
    save(p: ProductionSettings, s: SourceConfig) {
      if (!file) return;
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(
        file + ".tmp",
        JSON.stringify(
          { production: p, source: { ...s, mode: "mock" } },
          null,
          2,
        ),
      );
      fs.renameSync(file + ".tmp", file);
    },
  };
}
