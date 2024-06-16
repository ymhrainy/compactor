import fsPromises from "node:fs/promises";
import path from "node:path";

import { type OpenDialogReturnValue, ipcRenderer } from "electron";

import { execCompressTask } from "./utils/image";

import { IPC_CHANNEL } from "@shared/constants";
import {
  type CompressTask,
  type CompressTaskFile,
  type CompressTaskPreview,
  type CompressTaskPreviewFile,
  type CompressTaskSource,
  type CompressTaskSourceType,
  type Dir,
  type Filepath,
  type OnProgress,
  type Quality,
} from "@shared/types";
import { IMAGE_TYPE, type ImageType } from "@shared/image";

export async function waitForUserToChooseSource(
  sourceType: CompressTaskSourceType,
): Promise<CompressTaskPreview | null> {
  let source;
  if (sourceType === "dir") {
    source = await waitForUserToChooseDir();
  } else {
    source = await waitForUserToChooseFiles();
  }
  return source ? prepareCompressTaskFromSource(source) : null;
}

export async function confirmCompressImages(
  preview: CompressTaskPreview,
  quality: Quality,
  onProgress?: OnProgress,
) {
  const files = await previewFilesToCompressTaskFiles(
    preview.previewFiles,
    preview.outDir,
    quality,
  );
  const task: CompressTask = {
    source: preview.source,
    files,
    options: { onProgress },
    startAt: Date.now(),
  };
  await execCompressTask(task);
  return { task };
}

async function previewFilesToCompressTaskFiles(
  previewFiles: CompressTaskPreviewFile[],
  outDir: Dir,
  quality: Quality,
): Promise<CompressTaskFile[]> {
  const taskFiles: CompressTaskFile[] = [];
  await fsPromises.mkdir(outDir, { recursive: true });
  for (const f of previewFiles) {
    const filename = path.basename(f.input);
    const output = path.join(outDir, filename);
    taskFiles.push({
      ...f,
      output,
      options: {
        quality,
      },
    });
  }
  return taskFiles;
}

async function prepareCompressTaskFromSource(
  source: CompressTaskSource,
): Promise<CompressTaskPreview> {
  let previewFiles;
  if (source.kind === "dir") {
    previewFiles = await prepareCompressTaskFromDir(source.dir);
  } else {
    previewFiles = prepareCompressTaskFromFiles(source.filepaths);
  }
  const outDir = getDefaultOutDirFromSource(source);
  return {
    source,
    outDir,
    previewFiles,
  };
}

function getDefaultOutDirFromSource(source: CompressTaskSource): Dir {
  if (source.kind === "dir") {
    return path.join(source.dir, "compressed");
  } else {
    const firstFilepath = source.filepaths[0];
    const baseDir = path.dirname(firstFilepath);
    return path.join(baseDir, "compressed");
  }
}

async function waitForUserToChooseDir(): Promise<CompressTaskSource | null> {
  const result: OpenDialogReturnValue = await ipcRenderer.invoke(
    IPC_CHANNEL.mShowOpenDialog,
    "dir",
  );
  if (result.canceled) return null;
  return { dir: result.filePaths[0], kind: "dir" };
}

async function waitForUserToChooseFiles(): Promise<CompressTaskSource | null> {
  const result: OpenDialogReturnValue = await ipcRenderer.invoke(
    IPC_CHANNEL.mShowOpenDialog,
    "files",
  );
  if (result.canceled) return null;
  return { kind: "files", filepaths: result.filePaths };
}

function createPreviewFileFromFilepath(fp: Filepath): CompressTaskPreviewFile | null {
  let imageType: ImageType | undefined = undefined;
  const lowerFilename = path.basename(fp).toLowerCase();
  if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
    imageType = IMAGE_TYPE.jpeg;
  } else if (lowerFilename.endsWith(".png")) {
    imageType = IMAGE_TYPE.png;
  } else if (lowerFilename.endsWith(".webp")) {
    imageType = IMAGE_TYPE.webp;
  } else if (lowerFilename.endsWith(".avif")) {
    imageType = IMAGE_TYPE.avif;
  } else if (lowerFilename.endsWith(".tiff")) {
    imageType = IMAGE_TYPE.tiff;
  }
  return imageType ? { imageType, input: fp } : null;
}

function prepareCompressTaskFromFiles(files: Filepath[]): CompressTaskPreviewFile[] {
  return files
    .map(createPreviewFileFromFilepath)
    .filter((pf) => pf !== null) as CompressTaskPreviewFile[];
}

async function prepareCompressTaskFromDir(dir: Dir): Promise<CompressTaskPreviewFile[]> {
  const filenames = await fsPromises.readdir(dir);
  const filepaths: Filepath[] = [];
  for (const name of filenames) {
    const input = path.join(dir, name);
    filepaths.push(input);
  }
  return prepareCompressTaskFromFiles(filepaths);
}
