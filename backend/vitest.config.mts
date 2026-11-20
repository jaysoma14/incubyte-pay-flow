import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

export default {
  resolve: {
    extensions: [".ts", ".mts", ".js", ".mjs", ".json"],
  },
  plugins: [{
    name: "resolve-prisma-generated-typescript",
    enforce: "pre",
    resolveId(source: string, importer?: string) {
      if (importer?.includes("/src/generated/prisma/")) {
        if (source.startsWith("./") && source.endsWith(".js")) {
          const typescriptSource = resolve(dirname(importer), `${source.slice(0, -3)}.ts`);
          if (existsSync(typescriptSource)) {
            return typescriptSource;
          }
        }
        return null;
      }

      if (importer?.includes("/src/") && source.startsWith(".")) {
        const generatedSource = resolve(dirname(importer), source);
        if (
          generatedSource.includes("/src/generated/prisma/") &&
          existsSync(`${generatedSource}.ts`)
        ) {
          return `${generatedSource}.ts`;
        }
      }

      return null;
    },
  }],
  test: {
    include: ["src/**/*.test.ts"],
  },
};
