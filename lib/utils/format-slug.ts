export const formatSlug =
    (fallback: string) =>
        ({ data, operation, value }: any) => {
            if (typeof value === 'string') {
                return value
                    .replace(/ /g, '-')
                    .replace(/[^\w-]+/g, '')
                    .toLowerCase()
            }

            if (operation === 'create' || !data?.slug) {
                const fallbackData = data?.[fallback] || data?.[fallback]

                if (fallbackData && typeof fallbackData === 'string') {
                    return fallbackData
                        .replace(/ /g, '-')
                        .replace(/[^\w-]+/g, '')
                        .toLowerCase()
                }
            }

            return value
        }
