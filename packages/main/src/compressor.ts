import { dialog, ipcMain } from "electron";

import { IPC_CHANNEL } from "@shared/constants";

export function initCompressorInfra() {
  ipcMain.handle(IPC_CHANNEL.mShowOpenDialog, async (e, type: "dir" | "files") => {
    if (type === "dir") {
      return await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
    } else {
      return await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Image", extensions: ["png", "jpg", "jpeg"] }],
      });
    }
  });
}
