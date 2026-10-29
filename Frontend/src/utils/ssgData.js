const snapshot = () => globalThis.__SSG_POSTS__ || globalThis.window?.__SSG_POSTS__ || [];
export const initialPosts = () => snapshot();
export const initialPost = slug => snapshot().find(p => p.slug === slug) || null;
