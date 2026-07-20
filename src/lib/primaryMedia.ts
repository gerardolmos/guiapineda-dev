export type PrimaryMedia =
    | {
          url?: string | null;
      }
    | {
          url?: string | null;
      }[]
    | null
    | undefined;

export function getPrimaryMediaUrl(media: PrimaryMedia): string | null {
    const primaryMedia = Array.isArray(media) ? media[0] : media;
    const url = primaryMedia?.url?.trim();

    return url || null;
}
