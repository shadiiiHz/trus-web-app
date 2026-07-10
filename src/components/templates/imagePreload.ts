/**
 * Preloads and decodes a list of image URLs so they're actually ready to
 * paint the instant they're swapped into the DOM — not just requested.
 * `img.decode()` resolves only once the browser has fully decoded the
 * image, which is what prevents old content from lingering on screen
 * while new content is still streaming in.
 *
 * Individual failures (broken url, decode error) are swallowed so one bad
 * image can't block the rest of the batch from resolving.
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      const img = new Image();
      img.src = url;
      return img.decode
        ? img.decode().catch(() => undefined)
        : Promise.resolve(undefined);
    }),
  );
}

/** Resolves after `ms` milliseconds — used as a safety cap alongside preloading. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
