import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

async function walk(dir) {
  const files = await readdir(dir);

  return (
    await Promise.all(
      files.flatMap(async (file) => {
        const fullFile = path.resolve(dir, file);
        const fileStat = await stat(fullFile);

        if (fileStat.isDirectory()) {
          return walk(fullFile);
        }

        if (fileStat.isFile()) {
          return [fullFile];
        }

        return [];
      })
    )
  ).flat();
}

const files = await walk("src/client");

for (const file of files) {
  console.info("fixing imports in %s", file);
  const content = await readFile(file, "utf-8");

  const fixed = content.replace(/from "(\.\.?\/.+?)"/g, (_, rel) => {
    const fileDir = path.dirname(file);

    if (files.includes(path.resolve(fileDir, `${rel}/index.ts`))) {
      const replace = `${rel}/index.js`;
      return `from "${replace}"`;
    }

    if (files.includes(path.resolve(fileDir, `${rel}.ts`))) {
      const replace = `${rel}.js`;
      return `from "${replace}"`;
    }

    throw new Error(`Unresolved import '${rel}' from '${file}':`);
  });

  await writeFile(file, fixed, "utf-8");
}
