import { createElement, type ReactNode } from 'react'
import { ServiceIcon } from './ServiceIcon'
import { ICON_MARKUP } from './serviceIcons'
import { SERVICE_PATHS } from '@/config/serviceDetails.config'

export const SERVICE_ICON_MAP: Record<string, ReactNode> = Object.fromEntries(
  Object.keys(ICON_MARKUP).map((id) => [id, createElement(ServiceIcon, { key: id, id })]),
)

/** Service cards that have a dedicated detail page, by card id. */
export const SERVICE_LINKS: Record<string, string> = {
  'business-growth': SERVICE_PATHS.growth,
  youtube: SERVICE_PATHS.youtube,
  'lead-email': SERVICE_PATHS.email,
  multilingual: SERVICE_PATHS.multilingual,
  seo: SERVICE_PATHS.seo,
  'web-design': SERVICE_PATHS.webDesign,
  branding: SERVICE_PATHS.brand,
  'social-media': SERVICE_PATHS.social,
}
