import { IPC_CHANNEL } from "@shared/constants";
import { ipcRenderer } from "electron";
/**
 * @module preload
 */
export * from "./compress";

export { sha256sum } from "./node-crypto";
export { versions } from "./versions";

export function showItemInFolder(path: string) {
    ipcRenderer.send(IPC_CHANNEL.mShowItemInFolder, path);
}
