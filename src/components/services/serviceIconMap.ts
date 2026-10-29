import { createElement, type ReactNode } from 'react'
import { ServiceIcon } from './ServiceIcon'
import { ICON_MARKUP } from './serviceIcons'
import { serviceDetailPath } from '@/config/serviceDetails.config'

export const SERVICE_ICON_MAP: Record<string, ReactNode> = Object.fromEntries(
  Object.keys(ICON_MARKUP).map((id) => [id, createElement(ServiceIcon, { key: id, id })]),
)

/** Service cards that have a dedicated detail page, by card id. */
export const SERVICE_LINKS: Record<string, string> = {
  'business-growth': serviceDetailPath('business-growth-intelligence-solver'),
  multilingual: serviceDetailPath('multilingual-localized-growth-strategy'),
  seo: serviceDetailPath('seo-content-optimization'),
  'web-design': serviceDetailPath('web-design-development'),
  branding: serviceDetailPath('brand-identity-logo-design'),
  'social-media': serviceDetailPath('social-media-content-creation-publishing'),
}
