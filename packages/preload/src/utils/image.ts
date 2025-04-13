import sharp from "sharp";

import { type CompressTask, type CompressTaskFile } from "@shared/types";
import { COMPRESS_IMAGE_TYPES } from "@shared/image";

function compressImage(compressFile: CompressTaskFile): Promise<CompressTaskFile> {
  const { input, output, options, imageType } = compressFile;
  const sharpObj = sharp(input);

  if (COMPRESS_IMAGE_TYPES.includes(imageType)) {
    sharpObj[imageType]({ quality: options.quality });
  }
  sharpObj.withMetadata();
  return new Promise((resolve, reject) => {
    sharpObj.toFile(output, (err: unknown) => {
      if (err) {
        console.error("sharp to file error: ", err, "dest:", output);
        reject(err);
      } else {
        resolve(compressFile);
      }
    });
  });
}

export async function execCompressTask(task: CompressTask) {
  const { files, options } = task;
  const { onProgress } = options;
  const total = files.length;
  let finished = 0;
  for (const file of files) {
    await compressImage(file);
    finished += 1;
    onProgress && onProgress({ total, finished, progress: finished / total });
  }
}
