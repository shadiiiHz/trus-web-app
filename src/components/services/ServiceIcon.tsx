import { ICON_MARKUP } from './serviceIcons'

/** Service icon for an id, or null for an unknown id. */
export function ServiceIcon({ id }: { id: string }) {
  const markup = ICON_MARKUP[id]
  if (!markup) return null
  return (
    <svg
      width="43"
      height="43"
      viewBox="0 0 43 43"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}
