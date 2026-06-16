export type Wallpaper = {
    id: string;
    imageUrl: string;
    filename: string;
    category: string;
};

export type WallpaperWithDetails = Wallpaper & {
    width: number;
    height: number;
    aspectRatio: string;
}