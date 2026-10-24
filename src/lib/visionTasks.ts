/** The vision tasks TaskScene.astro can draw; items name one as their `part`. */
export const READINGS = ['classify', 'detect', 'inspect', 'monitor', 'guide'] as const;
export type Reading = (typeof READINGS)[number];
