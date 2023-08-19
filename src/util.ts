export const ASSET_SEP = ">";

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

export const assetPath = (path: string) => path.substring(path.indexOf(ASSET_SEP));