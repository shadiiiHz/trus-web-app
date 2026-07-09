import { motion, AnimatePresence } from 'framer-motion'

export interface CategoryTabsProps {
  categories:     readonly string[]
  activeCategory: string
  onChange:       (category: string) => void
}

/**
 * Horizontal tab row for template categories.
 *
 * Active tab:   white background, black text, layout-animated pill.
 * Inactive tab: transparent background, white text, #FFFFFF4D border.
 *
 * The white active pill is a shared layout element (`layoutId="tab-pill"`)
 * so it slides smoothly between tabs on click.
 */
export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Template categories"
      style={{
        display:         'flex',
        flexWrap:        'wrap',
        gap:             '10px',
        justifyContent:  'center',
      }}
    >
      {categories.map((cat) => {
        const isActive = cat === activeCategory
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            style={{
              position:        'relative',
              padding:         '9px 20px',
              borderRadius:    999,
              border:          isActive ? '1px solid transparent' : '1px solid rgba(0, 0, 0, 0.3)',
              background:      'transparent',
              cursor:          'pointer',
              fontFamily:      'var(--font-body)',
              fontSize:        '14px',
              fontWeight:      isActive ? 600 : 400,
              color:           isActive ? '#FFFFFF' : '#0D0D0D',
              transition:      'color 0.22s ease, font-weight 0.22s ease',
              outline:         'none',
              WebkitTapHighlightColor: 'transparent',
              overflow:        'hidden',
            }}
          >
            {/* Animated white pill background */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  key="pill"
                  style={{
                    position:     'absolute',
                    inset:        0,
                    borderRadius: 999,
                    background:   '#0D0D0D',
                    zIndex:       0,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </AnimatePresence>

            <span style={{ position: 'relative', zIndex: 1 }}>{cat}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryTabs
