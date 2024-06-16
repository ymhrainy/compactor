export const IMAGE_TYPE = {
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  avif: "avif",
  tiff: "tiff",
} as const;

export const CHOOSE_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "tiff"];

export const COMPRESS_IMAGE_TYPES = [
  IMAGE_TYPE.jpeg,
  IMAGE_TYPE.png,
  IMAGE_TYPE.webp,
  IMAGE_TYPE.avif,
  IMAGE_TYPE.tiff,
];

export type ImageType = (typeof IMAGE_TYPE)[keyof typeof IMAGE_TYPE];
