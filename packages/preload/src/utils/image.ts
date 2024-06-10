import path from "node:path";
import fsPromises from "node:fs/promises";

import sharp from "sharp";

type CompressImageResult = {
  //
};

function compressOneJpg(sourceFilepath: string, outDir = ""): Promise<CompressImageResult> {
  const filename = path.basename(sourceFilepath);
  const baseDir = outDir || path.dirname(sourceFilepath);
  const newFileName = filename
    .replace(".jpg", ".compressed.jpg")
    .replace(".jpeg", ".compressed.jpeg");
  const destFilepath = path.join(baseDir, newFileName);
  return new Promise((resolve, reject) => {
    sharp(sourceFilepath)
      .jpeg({
        quality: 85,
      })
      .withMetadata({ density: 300 })
      .toFile(destFilepath, (err: unknown) => {
        if (err) {
          console.error("sharp to file error: ", err, "dest:", destFilepath);
          reject(err);
        } else {
          resolve({});
        }
      });
  });
}

export type CompressProgress = {
  total: number;
  finished: number;
  progress: number;
};

export async function compressDir(dirPath: string) {
  const files = await fsPromises.readdir(dirPath);
  const outDir = path.resolve(dirPath, "compressed");
  await fsPromises.mkdir(outDir, { recursive: true });
  for (const name of files) {
    if (name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg")) {
      const fp = path.join(dirPath, name);
      await compressOneJpg(fp, outDir);
    }
  }
}
