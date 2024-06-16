import type { ImageType } from "./image";

export type Dir = string;
export type Filepath = string;
export type Timestamp = number;
export type Quality = number;

type CompressTaskSourceTypeDir = "dir";
type CompressTaskSourceTypeFiles = "files";
export type CompressTaskSourceType = CompressTaskSourceTypeDir | CompressTaskSourceTypeFiles;

export type CompressProgress = {
  total: number;
  finished: number;
  progress: number;
};

export type OnProgress = (progress: CompressProgress) => void;

export type CompressTaskOptions = {
  onProgress?: OnProgress;
};

export type CompressImageOptions = {
  quality: Quality;
};

export type CompressTaskFile = {
  imageType: ImageType;
  input: Filepath;
  output: Filepath;
  options: CompressImageOptions;
};

type CompressTaskSourceDir = {
  kind: CompressTaskSourceTypeDir;
  dir: Dir;
};

type CompressTaskSourceFiles = {
  kind: CompressTaskSourceTypeFiles;
  filepaths: Filepath[];
};

export type CompressTaskSource = CompressTaskSourceDir | CompressTaskSourceFiles;

export type CompressTaskPreviewFile = Pick<CompressTaskFile, "imageType" | "input">;

export type CompressTaskPreview = {
  source: CompressTaskSource;
  previewFiles: CompressTaskPreviewFile[];
  outDir: Dir;
};

export type CompressTask = {
  source: CompressTaskSource;
  files: CompressTaskFile[];
  startAt: Timestamp;
  options: CompressTaskOptions;
};
