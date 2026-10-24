/**
 * Placeholder artwork for the exploded vision system (VisionSystem.astro).
 *
 * Draws each part of the system as flat isometric boxes and returns them as
 * stacked layers on one shared canvas. Each layer names the part it belongs to
 * and how far it travels when the system comes apart.
 *
 * This whole file is a stand-in. Final artwork replaces a layer's `svg` with an
 * image rendered on the same canvas (same size, same camera, transparent
 * ground) — the component only needs `part`, `dx` and `dy` to animate it.
 */
import { FIRST, SLOTS, productPose, type ProductState } from './visionBelt';

export const PARTS = ['process', 'lighting', 'camera', 'compute', 'application', 'interface'] as const;
export type Part = (typeof PARTS)[number];

export interface Layer {
  part: Part;
  /** SVG markup, drawn in canvas coordinates. */
  svg: string;
  /** Travel when fully apart, in canvas units. */
  dx: number;
  dy: number;
}

/** Canvas: large enough for the scene both assembled and apart. */
export const CANVAS = { x: -130, y: -375, width: 870, height: 1040 };

const color = {
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
interface Palette {
  top: string;
  /** The face looking to the lower left (constant y). */
  left: string;
  /** The face looking to the lower right (constant x). */
  right: string;
}

const light: Palette = { top: color.weiss, left: color.hellblau, right: color.marine15 };
const dark: Palette = { top: color.marine45, left: color.marine70, right: color.marine };
const steel: Palette = { top: color.marine15, left: color.marine45, right: color.marine70 };
const belt: Palette = { top: color.marine, left: color.marine, right: color.marine };
const flagged: Palette = { top: color.orangeLight, left: color.orange, right: color.orange };

type Point = [x: number, y: number, z: number];
/** Maps 2D coordinates on a face to a point in the scene. */
type Plane = (u: number, v: number) => Point;

const COS = Math.cos(Math.PI / 6);

/** Isometric projection: x runs to the lower right, y to the lower left, z up. */
function project([x, y, z]: Point) {
  return `${((x - y) * COS).toFixed(1)},${((x + y) * 0.5 - z).toFixed(1)}`;
}

interface Paint {
  fill?: string;
  stroke?: string;
  width?: number;
  opacity?: number;
  dash?: string;
  /** Lets the component restyle the shape while its part is singled out. */
  class?: string;
}

function attributes({ fill = 'none', stroke, width = 0.6, opacity, dash, class: name }: Paint) {
  // A hairline in the fill colour closes the seams between neighbouring faces.
  const line = stroke ?? (fill === 'none' ? undefined : fill);
  return [
    name && `class="${name}"`,
    `fill="${fill}"`,
    line && `stroke="${line}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`,
    opacity !== undefined && `opacity="${opacity}"`,
    dash && `stroke-dasharray="${dash}"`,
  ]
    .filter(Boolean)
    .join(' ');
}

const polygon = (points: Point[], paint: Paint) =>
  `<polygon points="${points.map(project).join(' ')}" ${attributes(paint)}/>`;

const polyline = (points: Point[], paint: Paint) =>
  `<polyline points="${points.map(project).join(' ')}" ${attributes(paint)}/>`;

function box(x: number, y: number, z: number, w: number, d: number, h: number, palette: Palette) {
  const [x1, y1, z1] = [x + w, y + d, z + h];
  return [
    polygon([[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]], { fill: palette.left }),
    polygon([[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]], { fill: palette.right }),
    polygon([[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]], { fill: palette.top }),
  ].join('');
}

/** A face at constant y; u runs right, v up. */
const leftFace = (x: number, y: number, z: number): Plane => (u, v) => [x + u, y, z + v];
/** A face at constant x, starting at its left edge `y`; u runs right, v up. */
const rightFace = (x: number, y: number, z: number): Plane => (u, v) => [x, y - u, z + v];
/** A horizontal face at height z. */
const floor = (x: number, y: number, z: number): Plane => (u, v) => [x + u, y + v, z];

const rect = (plane: Plane, u: number, v: number, w: number, h: number, paint: Paint) =>
  polygon([plane(u, v), plane(u + w, v), plane(u + w, v + h), plane(u, v + h)], paint);

/* --- The parts ----------------------------------------------------------- */

const BELT_TOP = 87;

function conveyor() {
  const legs = [4, 112].flatMap((y) => [20, 526].map((x) => box(x, y, 0, 14, 14, 70, steel)));
  return [...legs, box(0, 0, 70, 560, 130, 14, light), box(8, 12, 84, 544, 106, 3, belt)].join('');
}

/** One product in each of its three looks; the script shows the one that applies. */
function product(state: ProductState) {
  const body = box(FIRST, 43, BELT_TOP, 44, 44, 30, state === 'found' ? flagged : light);
  const top = floor(FIRST, 43, BELT_TOP + 30);
  const base = floor(FIRST, 43, BELT_TOP);
  if (state === 'ok') return body;
  if (state === 'defect') return body + rect(top, 20, 8, 16, 22, { fill: color.marine70 });
  return rect(base, -9, -9, 62, 62, { stroke: color.orange, width: 2 }) + body;
}

/**
 * The products, drawn where they rest. Each is a group the script moves along
 * the belt; see productPose().
 */
function products() {
  const states: ProductState[] = ['ok', 'defect', 'found'];
  return Array.from({ length: SLOTS }, (_, slot) => {
    const pose = productPose(slot, 0);
    const looks = states.map(
      (state) =>
        `<g data-look="${state}"${state === pose.state ? '' : ' style="display:none"'}>${product(state)}</g>`,
    );
    return `<g data-vision-product style="transform:translate(${pose.x.toFixed(1)}px,${pose.y.toFixed(1)}px);opacity:${pose.opacity}">${looks.join('')}</g>`;
  }).join('');
}

/** The stands behind the belt that carry the lights and the camera. */
const lightPost = (x: number) => box(x + 6, -22, 0, 8, 8, 172, steel);
const cameraMast = () => box(276, -34, 0, 8, 8, 262, steel);

/** One light bar and the light it throws onto the belt. */
function lightBar(x: number, beamTo: number) {
  const inner = beamTo > x ? x + 20 : x;
  const beam = polygon(
    [[inner, 5, 172], [inner, 125, 172], [beamTo, 115, BELT_TOP], [beamTo, 15, BELT_TOP]],
    { fill: color.weiss, opacity: 0.4, class: 'beam' },
  );
  return [
    beam,
    box(x, -22, 172, 20, 147, 10, light),
    rect(leftFace(x, 125, 172), 0, 0, 20, 3, { fill: color.orangeLight }),
  ].join('');
}

function camera() {
  const lens: Point = [280, 65, 187];
  const field: Point[] = [[225, 15, BELT_TOP], [335, 15, BELT_TOP], [335, 115, BELT_TOP], [225, 115, BELT_TOP]];
  const sight: Paint = { stroke: color.orange, width: 1.2, dash: '4 4' };
  return [
    ...field.map((corner) => polyline([lens, corner], { ...sight, opacity: 0.7 })),
    polygon(field, sight),
    box(270, 55, 187, 20, 20, 18, steel),
    box(260, 45, 205, 40, 40, 40, dark),
    rect(leftFace(260, 85, 205), 6, 29, 5, 5, { fill: color.orange }),
    box(276, 61, 245, 8, 8, 10, steel),
    box(276, -34, 255, 8, 103, 7, steel),
  ].join('');
}

function compute() {
  const front = leftFace(250, 310, 0);
  const side = rightFace(330, 310, 0);
  const vents = [22, 32, 42, 52].map((v) =>
    polyline([front(12, v), front(68, v)], { stroke: color.hellblau, width: 1.5, opacity: 0.5 }),
  );

  // The model: a small network drawn on the side of the unit.
  const columns = [
    { u: 14, nodes: [35, 55, 75] },
    { u: 35, nodes: [25, 45, 65, 85] },
    { u: 56, nodes: [45, 65] },
  ];
  const edges = columns.slice(1).flatMap((column, index) =>
    columns[index].nodes.flatMap((from) =>
      column.nodes.map((to) =>
        polyline([side(columns[index].u, from), side(column.u, to)], {
          stroke: color.hellblau,
          width: 0.8,
          opacity: 0.45,
        }),
      ),
    ),
  );
  const nodes = columns.flatMap(({ u, nodes }, column) =>
    nodes.map((v, row) =>
      rect(side, u - 3, v - 3, 6, 6, { fill: column === 2 && row === 0 ? color.orange : color.weiss }),
    ),
  );

  return [
    box(250, 240, 0, 80, 70, 110, dark),
    ...vents,
    rect(front, 60, 92, 6, 6, { fill: color.orange }),
    ...edges,
    ...nodes,
  ].join('');
}

/**
 * The application reports back to the line: a signal runs from the computer to
 * a pusher behind the belt, which moves a flagged product into the bin in front.
 */
function rejectPusher() {
  const signal: Point[] = [[330, 275, 0], [417, 275, 0], [417, -25, 0], [417, -25, BELT_TOP]];
  return [
    polyline(signal, { stroke: color.orange, width: 1.6, dash: '5 4' }),
    box(412, -30, 0, 10, 10, BELT_TOP, steel),
    box(398, -40, BELT_TOP, 40, 34, 24, dark),
    rect(leftFace(398, -6, BELT_TOP), 6, 14, 5, 5, { fill: color.orange }),
    box(414, -6, BELT_TOP + 6, 8, 6, 8, steel),
  ].join('');
}

function rejectBin() {
  return [
    box(440, 140, 0, 70, 65, 55, steel),
    rect(floor(440, 140, 55), 6, 6, 58, 53, { fill: color.marine }),
  ].join('');
}

/** The screen people at the line work with: live image, findings, the shift so far. */
function operatorInterface() {
  const screen = rightFace(680, 110, 170);
  const findings = [0, 1, 2, 3, 4].flatMap((row) => {
    const v = 106 - row * 15;
    return [
      rect(screen, 108, v, 9, 9, { fill: row === 1 ? color.orange : color.hellblau }),
      rect(screen, 122, v + 3, row % 2 ? 42 : 54, 3, { fill: color.marine15 }),
    ];
  });
  const shift = Array.from({ length: 20 }, (_, index) =>
    rect(screen, 13 + index * 8.2, 13, 5, index === 6 || index === 15 ? 14 : 8, {
      fill: index === 6 || index === 15 ? color.orange : color.hellblau,
    }),
  );

  return [
    box(676, 11, 0, 8, 8, 170, steel),
    box(672, -80, 170, 8, 190, 130, dark),
    rect(screen, 7, 7, 176, 116, { fill: color.weiss }),
    rect(screen, 13, 36, 86, 80, { fill: color.nebel }),
    rect(screen, 38, 56, 36, 36, { fill: color.hellblau }),
    rect(screen, 31, 49, 50, 50, { stroke: color.orange, width: 2 }),
    ...findings,
    ...shift,
  ].join('');
}

/** Back to front. Parts that reach around the belt appear more than once. */
export const layers: Layer[] = [
  { part: 'lighting', svg: lightPost(212) + lightPost(328), dx: 0, dy: -60 },
  { part: 'camera', svg: cameraMast(), dx: 0, dy: -170 },
  { part: 'application', svg: rejectPusher(), dx: 0, dy: 170 },
  { part: 'process', svg: conveyor(), dx: 0, dy: 60 },
  { part: 'process', svg: products(), dx: 0, dy: 60 },
  { part: 'lighting', svg: lightBar(212, 250), dx: 0, dy: -60 },
  { part: 'camera', svg: camera(), dx: 0, dy: -170 },
  { part: 'lighting', svg: lightBar(328, 310), dx: 0, dy: -60 },
  { part: 'application', svg: rejectBin(), dx: 0, dy: 170 },
  { part: 'compute', svg: compute(), dx: 0, dy: 170 },
  { part: 'interface', svg: operatorInterface(), dx: 20, dy: -110 },
];

/**
 * Where each part's name tag sits while the part is singled out: a point just
 * above it on the canvas, travelling with it.
 */
export const tags: Record<Part, { x: number; y: number; dx: number; dy: number }> = {
  process: { x: -60, y: -92, dx: 0, dy: 60 },
  lighting: { x: 84, y: -22, dx: 0, dy: -60 },
  camera: { x: 265, y: -148, dx: 0, dy: -170 },
  compute: { x: 9, y: 125, dx: 0, dy: 170 },
  application: { x: 380, y: 58, dx: 0, dy: 170 },
  interface: { x: 600, y: -8, dx: 20, dy: -110 },
};
