import fsPromises from "node:fs/promises";
import path from "node:path";

import { type OpenDialogReturnValue, ipcRenderer } from "electron";

import { execCompressTask } from "./utils/image";

import { IPC_CHANNEL } from "@shared/constants";
import type {
  CompressTaskFile,
  CompressTaskSource,
  CompressTaskSourceType,
  Dir,
  Filepath,
  ImageType,
  OnProgress,
  Quality,
} from "@shared/types";

export async function waitForUserToChooseSource(
  sourceType: CompressTaskSourceType,
): Promise<CompressTaskSource> {
  if (sourceType === "dir") {
    return await waitForUserToChooseDir();
  } else {
    return waitForUserToChooseFiles();
  }
}

export async function prepareCompressTaskFromSource(
  source: CompressTaskSource,
  quality: Quality,
): Promise<CompressTaskFile[]> {
  if (source.kind === "dir") {
    return await prepareCompressTaskFromDir(source.dir, quality);
  } else {
    return await prepareCompressTaskFromFiles(source.filepaths, quality);
  }
}

export async function confirmCompressImages(
  source: CompressTaskSource,
  files: CompressTaskFile[],
  onProgress?: OnProgress,
) {
  await execCompressTask({
    source,
    files,
    options: { onProgress },
    startAt: Date.now(),
  });
}

async function waitForUserToChooseDir(): Promise<CompressTaskSource> {
  const result: OpenDialogReturnValue = await ipcRenderer.invoke(
    IPC_CHANNEL.mShowOpenDialog,
    "dir",
  );
  return { dir: result.filePaths[0], kind: "dir" };
}

async function waitForUserToChooseFiles(): Promise<CompressTaskSource> {
  const result: OpenDialogReturnValue = await ipcRenderer.invoke(
    IPC_CHANNEL.mShowOpenDialog,
    "files",
  );
  return { kind: "files", filepaths: result.filePaths };
}

async function prepareCompressTaskFromFiles(
  files: Filepath[],
  quality: Quality,
): Promise<CompressTaskFile[]> {
  const result: CompressTaskFile[] = [];
  for (const fp of files) {
    let imageType: ImageType;
    if (fp.toLowerCase().endsWith(".jpg") || fp.toLowerCase().endsWith(".jpeg")) {
      imageType = "jpg";
    } else if (fp.toLowerCase().endsWith(".png")) {
      imageType = "png";
    } else {
      continue;
    }
    const dir = path.dirname(fp);
    const filename = path.basename(fp);
    const outDir = path.resolve(dir, "compressed");
    if (imageType) {
      const output = path.join(outDir, filename);
      result.push({
        input: fp,
        output,
        imageType,
        options: {
          quality,
        },
      });
    }
  }
  return result;
}

async function prepareCompressTaskFromDir(dir: Dir, quality: Quality): Promise<CompressTaskFile[]> {
  const files = await fsPromises.readdir(dir);
  const outDir = path.resolve(dir, "compressed");
  await fsPromises.mkdir(outDir, { recursive: true });
  const result: CompressTaskFile[] = [];
  for (const name of files) {
    let imageType: ImageType;
    if (name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg")) {
      imageType = "jpg";
    } else if (name.toLowerCase().endsWith(".png")) {
      imageType = "png";
    } else {
      continue;
    }
    if (imageType) {
      const input = path.join(dir, name);
      const output = path.join(outDir, name);
      result.push({
        input,
        output,
        imageType,
        options: {
          quality,
        },
      });
    }
  }
  return result;
}
