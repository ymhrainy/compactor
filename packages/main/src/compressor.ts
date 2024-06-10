import { dialog, ipcMain } from "electron";

import { IPC_CHANNEL } from "@shared/constants";

export function initCompressorInfra() {
  ipcMain.handle(IPC_CHANNEL.mShowOpenDialog, async () => {
    return await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
  });
}
