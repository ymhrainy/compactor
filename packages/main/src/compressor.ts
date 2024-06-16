import { dialog, ipcMain } from "electron";

import { IPC_CHANNEL } from "@shared/constants";
import { CHOOSE_FILE_EXTENSIONS } from "@shared/image";

export function initCompressorInfra() {
  ipcMain.handle(IPC_CHANNEL.mShowOpenDialog, async (e, type: "dir" | "files") => {
    if (type === "dir") {
      return await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
    } else {
      return await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Image", extensions: CHOOSE_FILE_EXTENSIONS }],
      });
    }
  });
}
