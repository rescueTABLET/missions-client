import { readFile, writeFile } from "node:fs/promises";

const clientDir = "src/client";
const files = ["client.gen", "index", "sdk.gen", "types.gen"];

await Promise.all(
  files.map(async (file) => {
    const filename = `${clientDir}/${file}.ts`;
    console.info("fixing imports in %s", filename);
    const content = await readFile(filename, "utf-8");
    const fixed = content.replace(/from "\.\/(.*?)"\;/g, 'from "./$1.js";');
    await writeFile(filename, fixed, "utf-8");
  })
);
