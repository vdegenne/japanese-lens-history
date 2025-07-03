/* vite only */
export const DEV = import.meta.env.DEV;

export const availablePages = ['viewer', 'search'] as const;

true as AllValuesPresent<Page, typeof availablePages>;
