export interface CategoryTabItem {
  id:    string
  label: string
}

export interface CategoryTabsProps {
  categories:     readonly CategoryTabItem[]
  activeCategory: string
  onChange:       (category: string) => void
}

/**
 * Horizontal tab row for template categories.
 *
 * Plain-text tabs separated by thin vertical dividers.
 * Active tab:   bold, purple (#5B2BB9).
 * Inactive tab: regular weight, dark text.
 */
export function CategoryTabs({ categories, activeCategory, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Template categories"
      style={{
        display:         'flex',
        flexWrap:        'wrap',
        alignItems:      'center',
        justifyContent:  'center',
      }}
    >
      {categories.map((cat, i) => {
        const isActive = cat.id === activeCategory
        return (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center' }}>
            <button
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.id)}
              style={{
                padding:     0,
                border:      'none',
                background:  'transparent',
                cursor:      'pointer',
                fontFamily:  'var(--font-body)',
                fontSize:    '16px',
                fontWeight:  isActive ? 700 : 400,
                color:       isActive ? '#5B2BB9' : '#000000',
                transition:  'color 0.22s ease, font-weight 0.22s ease',
                outline:     'none',
                WebkitTapHighlightColor: 'transparent',
                whiteSpace:  'nowrap',
              }}
            >
              {cat.label}
            </button>

            {i < categories.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  width:      '1px',
                  height:     '33px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  margin:     '0 18px',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryTabs
