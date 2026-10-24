/**
 * Flat isometric drawing: boxes and faces as SVG markup, in brand colours.
 *
 * The camera and the palettes are those of the vision system
 * (src/lib/visionScene.ts), so that every isometric scene on the site looks
 * like part of the same world.
 */

export const color = {
  marine: 'var(--color-marine)',
  marine70: 'var(--color-marine-70)',
  marine45: 'var(--color-marine-45)',
  marine15: 'var(--color-marine-15)',
  hellblau: 'var(--color-hellblau)',
  nebel: 'var(--color-nebel)',
  weiss: 'var(--color-weiss)',
  orange: 'var(--color-orange)',
  orangeLight: 'var(--color-orange-light)',
};

/** Fills for the three visible faces of a box. */
export interface Palette {
  top: string;
  /** The face looking to the lower left (constant y). */
  left: string;
  /** The face looking to the lower right (constant x). */
  right: string;
}

export const light: Palette = { top: color.weiss, left: color.hellblau, right: color.marine15 };
export const dark: Palette = { top: color.marine45, left: color.marine70, right: color.marine };
export const steel: Palette = { top: color.marine15, left: color.marine45, right: color.marine70 };
export const belt: Palette = { top: color.marine, left: color.marine, right: color.marine };
export const flagged: Palette = { top: color.orangeLight, left: color.orange, right: color.orange };

export type Point = [x: number, y: number, z: number];
/** Maps 2D coordinates on a face to a point in the scene. */
export type Plane = (u: number, v: number) => Point;

export const COS = Math.cos(Math.PI / 6);

/** Isometric projection: x runs to the lower right, y to the lower left, z up. */
export function projectXY([x, y, z]: Point): [x: number, y: number] {
  return [(x - y) * COS, (x + y) * 0.5 - z];
}

export const project = (point: Point) =>
  projectXY(point)
    .map((n) => n.toFixed(1))
    .join(',');

export interface Paint {
  fill?: string;
  stroke?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  /** Further attributes, written out as they are. */
  attrs?: string;
}

function attributes({ fill = 'none', stroke, width = 0.6, opacity, dash, attrs }: Paint) {
  // A hairline in the fill colour closes the seams between neighbouring faces.
  const line = stroke ?? (fill === 'none' ? undefined : fill);
  return [
    `fill="${fill}"`,
    line && `stroke="${line}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`,
    opacity !== undefined && `opacity="${opacity}"`,
    dash && `stroke-dasharray="${dash}"`,
    attrs,
  ]
    .filter(Boolean)
    .join(' ');
}

export const polygon = (points: Point[], paint: Paint) =>
  `<polygon points="${points.map(project).join(' ')}" ${attributes(paint)}/>`;

export const polyline = (points: Point[], paint: Paint) =>
  `<polyline points="${points.map(project).join(' ')}" ${attributes(paint)}/>`;

export function box(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  palette: Palette,
) {
  const [x1, y1, z1] = [x + w, y + d, z + h];
  return [
    polygon([[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]], { fill: palette.left }),
    polygon([[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]], { fill: palette.right }),
    polygon([[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]], { fill: palette.top }),
  ].join('');
}

/** A face at constant y; u runs right, v up. */
export const leftFace = (x: number, y: number, z: number): Plane => (u, v) => [x + u, y, z + v];
/** A face at constant x, starting at its left edge `y`; u runs right, v up. */
export const rightFace = (x: number, y: number, z: number): Plane => (u, v) => [x, y - u, z + v];
/** A horizontal face at height z. */
export const floor = (x: number, y: number, z: number): Plane => (u, v) => [x + u, y + v, z];

export const rect = (plane: Plane, u: number, v: number, w: number, h: number, paint: Paint) =>
  polygon([plane(u, v), plane(u + w, v), plane(u + w, v + h), plane(u, v + h)], paint);

const escape = (text: string) =>
  text.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char]!);

/** Upright text, anchored at a point in the scene. */
export function label(point: Point, text: string, attrs = '') {
  const [x, y] = projectXY(point);
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${attrs}>${escape(text)}</text>`;
}
