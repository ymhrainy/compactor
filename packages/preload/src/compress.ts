import { type OpenDialogReturnValue, ipcRenderer } from "electron";

import { compressDir } from "./utils/image";

import { IPC_CHANNEL } from "@shared/constants";

async function waitForUserSelectedPaths(): Promise<OpenDialogReturnValue> {
  return await ipcRenderer.invoke(IPC_CHANNEL.mShowOpenDialog);
}

export async function selectDirAndCompressImages() {
  const { canceled, filePaths } = await waitForUserSelectedPaths();
  if (!canceled) {
    for (const fp of filePaths) {
      await compressDir(fp);
    }
  }
}
