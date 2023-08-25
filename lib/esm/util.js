import { basename, shaLevels } from "mobiletto-orm";
export const fileExtWithDot = (path) => {
    if (!path || path.length === 0)
        return "";
    const lastDot = path.lastIndexOf(".");
    return lastDot === -1 || lastDot === path.length - 1 ? "" : path.substring(lastDot);
};
export const fileExtWithoutDot = (path) => {
    if (!path || path.length === 0)
        return "";
    const lastDot = path.lastIndexOf(".");
    return lastDot === -1 || lastDot === path.length - 1 ? "" : path.substring(lastDot + 1);
};
// source paths
export const ASSET_SEP = "~";
export const assetPath = (path) => path.substring(path.indexOf(ASSET_SEP) + 1);
export const assetSource = (path) => path.substring(0, path.indexOf(ASSET_SEP));
// destination paths
const ASSET_PATH_PREFIX = "ybAssets";
const ASSET_SHA_LEVELS = 3;
export const destinationProfilePath = (sourceAsset, media, profile) => `${ASSET_PATH_PREFIX}/${shaLevels(sourceAsset, ASSET_SHA_LEVELS)}/${basename(sourceAsset)}/${media}/${profile}`;
export const destinationPath = (sourceAsset, media, profile, filename) => `${destinationProfilePath(sourceAsset, media, profile)}/${basename(filename)}`;
