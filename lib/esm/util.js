export const ASSET_SEP = "~";
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
export const assetPath = (path) => path.substring(path.indexOf(ASSET_SEP) + 1);
export const assetSource = (path) => path.substring(0, path.indexOf(ASSET_SEP));
