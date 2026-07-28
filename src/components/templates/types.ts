export interface DesignTemplate {
  id: number;
  image: string;
  title?: string;
  /** Live site to open in a new tab on click. Empty/undefined = not clickable. */
  link?: string;
}
