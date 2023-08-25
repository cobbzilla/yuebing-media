import { basename, shaLevels } from "mobiletto-orm";

export const fileExtWithDot = (path?: string) => {
    if (!path || path.length === 0) return "";
    const lastDot = path.lastIndexOf(".");
    return lastDot === -1 || lastDot === path.length - 1 ? "" : path.substring(lastDot);
};

export const fileExtWithoutDot = (path?: string) => {
    if (!path || path.length === 0) return "";
    const lastDot = path.lastIndexOf(".");
    return lastDot === -1 || lastDot === path.length - 1 ? "" : path.substring(lastDot + 1);
};

// source paths
export const ASSET_SEP = "~";

export const assetPath = (path: string) => path.substring(path.indexOf(ASSET_SEP) + 1);
export const assetSource = (path: string) => path.substring(0, path.indexOf(ASSET_SEP));

// destination paths
const ASSET_PATH_PREFIX = "ybAssets";
const ASSET_SHA_LEVELS = 3;

export const destinationProfilePath = (sourceAsset: string, media: string, profile: string): string =>
    `${ASSET_PATH_PREFIX}/${shaLevels(sourceAsset, ASSET_SHA_LEVELS)}/${basename(sourceAsset)}/${media}/${profile}`;

export const destinationPath = (sourceAsset: string, media: string, profile: string, filename: string): string =>
    `${destinationProfilePath(sourceAsset, media, profile)}/${basename(filename)}`;
