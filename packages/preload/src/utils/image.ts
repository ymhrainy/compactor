import sharp from "sharp";

import type { CompressTask, CompressTaskFile } from "@shared/types";

function compressImageJpeg(file: CompressTaskFile): Promise<CompressTaskFile> {
  const { input, output, options } = file;
  return new Promise((resolve, reject) => {
    sharp(input)
      .jpeg({
        quality: options.quality,
      })
      .withMetadata({ density: 300 })
      .toFile(output, (err: unknown) => {
        if (err) {
          console.error("sharp to file error: ", err, "dest:", output);
          reject(err);
        } else {
          resolve(file);
        }
      });
  });
}

function compressImagePng(file: CompressTaskFile): Promise<CompressTaskFile> {
  const { input, output, options } = file;
  return new Promise((resolve, reject) => {
    sharp(input)
      .png({
        quality: options.quality,
      })
      .toFile(output, (err: unknown) => {
        if (err) {
          console.error("sharp to file error: ", err, "dest:", output);
          reject(err);
        } else {
          resolve(file);
        }
      });
  });
}

export async function compressImage(compressFile: CompressTaskFile) {
  const { imageType } = compressFile;
  if (imageType === "jpg") {
    await compressImageJpeg(compressFile);
  } else if (imageType === "png") {
    await compressImagePng(compressFile);
  }
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
