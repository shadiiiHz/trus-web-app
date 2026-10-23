import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  /** Absolute-path URL of the page, e.g. "/services/foo" (origin is added). */
  path: string;
}

function upsertMeta(selector: string, create: () => HTMLElement) {
  let el = document.head.querySelector<HTMLElement>(selector);
  const created = !el;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return { el, created };
}

/**
 * Sets per-page SEO tags (title, description, canonical, Open Graph) while the
 * page is mounted and restores the previous values on unmount — the app is a
 * client-rendered SPA with a single index.html, so there's no per-route head.
 */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const url = `${window.location.origin}${path}`;
    const prevTitle = document.title;
    document.title = title;

    const restore: Array<() => void> = [];
    const setAttr = (
      selector: string,
      create: () => HTMLElement,
      attr: string,
      value: string,
    ) => {
      const { el, created } = upsertMeta(selector, create);
      const prev = el.getAttribute(attr);
      el.setAttribute(attr, value);
      restore.push(() => {
        if (created) el.remove();
        else if (prev !== null) el.setAttribute(attr, prev);
      });
    };

    const meta = (key: "name" | "property", value: string) => () => {
      const m = document.createElement("meta");
      m.setAttribute(key, value);
      return m;
    };

    setAttr('meta[name="description"]', meta("name", "description"), "content", description);
    setAttr('meta[property="og:title"]', meta("property", "og:title"), "content", title);
    setAttr(
      'meta[property="og:description"]',
      meta("property", "og:description"),
      "content",
      description,
    );
    setAttr('meta[property="og:url"]', meta("property", "og:url"), "content", url);
    setAttr(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      },
      "href",
      url,
    );

    return () => {
      document.title = prevTitle;
      restore.forEach((fn) => fn());
    };
  }, [title, description, path]);
}
