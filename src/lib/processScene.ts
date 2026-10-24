/**
 * The artwork of ProcessFlow.astro.
 *
 * `processScene` draws the isometric production line: a conveyor that turns
 * twice, so that it runs across the full width instead of diagonally out of
 * the picture, with one station on each stretch and a gauge on each station.
 * `processChart` draws the flat chart their data ends up in: quality over time.
 *
 * Both return SVG fragments. Everything the animation moves carries a
 * `data-flow-*` attribute; TRACK and `trackAt` describe the way of a piece
 * along the belt, for the markup and for the script alike.
 */
import {
  COS,
  belt,
  box,
  color,
  dark,
  flagged,
  floor,
  label,
  leftFace,
  light,
  polyline,
  projectXY,
  rect,
  rightFace,
  steel,
  type Palette,
  type Plane,
  type Point,
} from './iso';

export const SCENE = { x: -130, y: -262, width: 1410, height: 640 };
export const CHART = { width: 360, height: 250 };

/** The scene stands on white, so its light surfaces are a shade darker than `light`. */
const pale: Palette = { top: color.nebel, left: color.hellblau, right: color.marine15 };

const BELT_TOP = 87;
const ROOF_TOP = 220;
const LENGTH = 400;
const WIDTH = 130;
const PIECES = 16;

/**
 * A stretch of the line, with its own coordinates: `a` along the direction of
 * travel, `b` across the belt from its far edge to its near edge.
 */
interface Stretch {
  box(a: number, b: number, z: number, la: number, lb: number, h: number, palette: Palette): string;
  /** The face of a station's housing that looks onto the belt, starting at `a`. */
  face(a: number): Plane;
  point(a: number, b: number, z: number): Point;
}

/** Runs to the lower right. */
const alongX = (x: number, y: number): Stretch => ({
  box: (a, b, z, la, lb, h, palette) => box(x + a, y + b, z, la, lb, h, palette),
  face: (a) => leftFace(x + a, y, 0),
  point: (a, b, z) => [x + a, y + b, z],
});

/** Runs to the upper right. */
const awayAlongY = (x: number, y: number): Stretch => ({
  box: (a, b, z, la, lb, h, palette) => box(x + b, y - a - la, z, lb, la, h, palette),
  face: (a) => rightFace(x, y - a, 0),
  point: (a, b, z) => [x + b, y - a, z],
});

const STRETCHES = [
  alongX(0, 0),
  awayAlongY(LENGTH, 0),
  alongX(LENGTH + WIDTH, -LENGTH - WIDTH),
];

/** Where a station starts on its stretch. */
const STATION_AT = 140;

/** Each station's gauge: where the marker starts, and where the optimum is. */
const GAUGES = [
  { from: 38, to: 6 },
  { from: -40, to: -10 },
  { from: -30, to: 14 },
];

/* --- The way of a piece --------------------------------------------------- */

const centre = WIDTH / 2;
const lastY = -LENGTH - centre;
const corners: [x: number, y: number][] = [
  [22, centre],
  [LENGTH + centre, centre],
  [LENGTH + centre, lastY],
  [2 * LENGTH + WIDTH - 25, lastY],
];
const toScreen = ([x, y]: [number, number]) => projectXY([x, y, 0]);
const lengths = corners.slice(1).map(([x, y], i) => Math.abs(x - corners[i][0]) + Math.abs(y - corners[i][1]));
const end = lengths.reduce((sum, length) => sum + length, 0);
/** A piece is judged a little before the end of the belt. */
const exit = end - 55;

export const TRACK = {
  /** The corners of the way, on screen, and how far along the way each one is. */
  points: corners.map((corner, i) => ({
    at: lengths.slice(0, i).reduce((sum, length) => sum + length, 0),
    screen: toScreen(corner),
  })),
  exit,
  end,
  /** After this distance a piece starts again. Leaves room for scrap to drop. */
  cycle: exit + 95,
  /** Scrap is pushed sideways into the bin, then drops. */
  push: [-135 * COS, 67.5],
  drop: 57,
};

/** Screen position of a piece that has travelled `distance`. */
export function trackAt(distance: number): [x: number, y: number] {
  const points = TRACK.points;
  const found = points.findIndex((point) => point.at >= distance);
  const next = found < 0 ? points.length - 1 : Math.max(1, found);
  const [from, to] = [points[next - 1], points[next]];
  const t = Math.min(1, Math.max(0, (distance - from.at) / (to.at - from.at)));
  return [
    from.screen[0] + (to.screen[0] - from.screen[0]) * t,
    from.screen[1] + (to.screen[1] - from.screen[1]) * t,
  ];
}

/* --- The scene ------------------------------------------------------------ */

/** Two looks for one element; the animation shows the second by setting data-swap. */
const swappable = (main: string, swap: string) => `<g data-main>${main}</g><g data-alt>${swap}</g>`;

function legs() {
  const far = -LENGTH - WIDTH;
  const at: [x: number, y: number][] = [
    [404, far + 4], [512, far + 4], [700, far + 4], [900, far + 4],
    [700, far + 112], [900, far + 112],
    [404, -300], [512, -300], [404, -150], [512, -150],
    [20, 4], [250, 4], [20, 112], [250, 112], [404, 112], [512, 112],
  ];
  return at.map(([x, y]) => box(x, y, 0, 14, 14, 70, steel)).join('');
}

function conveyor() {
  const far = -LENGTH - WIDTH;
  const frame = (x: number, y: number, w: number, d: number) => box(x, y, 70, w, d, 14, pale);
  const surface = (x: number, y: number, w: number, d: number) => box(x, y, 84, w, d, 3, belt);
  return [
    // Back to front.
    frame(LENGTH, far, WIDTH, WIDTH),
    frame(LENGTH, -LENGTH, WIDTH, LENGTH),
    frame(LENGTH + WIDTH, far, LENGTH, WIDTH),
    frame(0, 0, LENGTH, WIDTH),
    frame(LENGTH, 0, WIDTH, WIDTH),
    surface(LENGTH + 12, far + 12, 106, LENGTH + WIDTH + 106),
    surface(LENGTH + 12, far + 12, LENGTH + 110, 106),
    surface(8, 12, LENGTH + 110, 106),
  ].join('');
}

function scrapBin() {
  const y = -LENGTH + 30;
  return box(825, y, 0, 65, 80, 46, dark) + rect(floor(825, y, 46), 6, 6, 53, 68, { fill: color.marine });
}

function pieces() {
  const cube = (palette: Palette) => box(-22, -22, BELT_TOP, 44, 44, 30, palette);
  return Array.from({ length: PIECES }, (_, index) => {
    const distance = (index * TRACK.cycle) / PIECES;
    const [x, y] = trackAt(distance);
    const opacity = distance > TRACK.end ? 0 : 1;
    return `<g data-flow-piece opacity="${opacity}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${swappable(cube(light), cube(steel))}</g>`;
  }).join('');
}

/**
 * A station is a portal over the belt: a housing behind it, two posts in front
 * and a roof, so the pieces stay visible on their way through. The housing is
 * drawn before the belt, the rest after it.
 */
function stationBack(index: number) {
  const stretch = STRETCHES[index];
  const face = stretch.face(STATION_AT);
  const vents = (u: number, v: number, w: number) =>
    [0, 11, 22].map((step) =>
      polyline([face(u, v + step), face(u + w, v + step)], { stroke: color.marine45, width: 2 }),
    );
  const display = (u: number, v: number, w: number, h: number) => [
    rect(face, u, v, w, h, { fill: color.marine }),
    rect(face, u + 6, v + h - 13, w * 0.5, 5, { fill: color.hellblau }),
    rect(face, u + 6, v + h - 24, w * 0.3, 5, { fill: color.marine45 }),
  ];
  const details = [
    [...display(18, 128, 50, 44), ...vents(78, 138, 26)],
    [...display(42, 124, 62, 50)],
    [...vents(18, 138, 30), ...display(58, 128, 46, 44)],
  ][index];
  return [stretch.box(STATION_AT, -34, 0, 120, 34, ROOF_TOP - 30, pale), ...details].join('');
}

function stationFront(index: number) {
  const { box } = STRETCHES[index];
  const a = STATION_AT;
  const posts = [a, a + 106].map((post) => box(post, 130, 0, 14, 14, ROOF_TOP - 30, pale));
  const roof = box(a, -34, ROOF_TOP - 30, 120, 178, 30, pale);
  const extras = [
    // Heat: two stacks on the roof.
    [box(a + 14, -10, ROOF_TOP, 22, 22, 36, steel), box(a + 14, 62, ROOF_TOP, 22, 22, 54, steel)],
    // Pressure: a press housing on the roof.
    [box(a + 8, 24, ROOF_TOP, 52, 62, 66, dark), box(a + 21, 42, ROOF_TOP + 66, 26, 26, 24, steel)],
    // Speed: a drive unit on the roof.
    [box(a + 10, 0, ROOF_TOP, 44, 110, 26, dark), box(a + 20, 110, ROOF_TOP, 24, 16, 16, steel)],
  ][index];
  return [...posts, roof, ...extras].join('');
}

/** A gauge on the roof: a marker on a pole, the optimal range marked on it. */
function gauge(index: number, text: string) {
  const { box, point } = STRETCHES[index];
  const { from, to } = GAUGES[index];
  const a = STATION_AT + 28;
  const mid = ROOF_TOP + 60;
  const marker = (palette: Palette) => box(a, 92, mid - 5, 22, 22, 10, palette);
  // Where this station's data sets off for the chart.
  const [sourceX, sourceY] = projectXY(point(a + 11, 103, mid));
  return [
    '<g data-flow-control>',
    box(a + 8, 100, ROOF_TOP, 6, 6, 120, steel),
    `<g data-flow-target>${box(a + 6, 98, mid + to - 15, 10, 10, 30, flagged)}</g>`,
    // Up in the scene is up on screen, so the marker simply slides vertically.
    `<g data-flow-knob data-from="${-from}" data-to="${-to}" transform="translate(0 ${-to})">${swappable(marker(flagged), marker(dark))}</g>`,
    label(point(a + 11, 103, ROOF_TOP + 144), text, 'class="flow-label" text-anchor="middle"'),
    '</g>',
    `<circle cx="${sourceX.toFixed(1)}" cy="${sourceY.toFixed(1)}" r="1" fill="none" data-flow-source/>`,
  ].join('');
}

export interface SceneLabels {
  /** One per station. */
  parameters: string[];
  scrap: string;
}

/**
 * Back to front. The line itself sits in `data-flow-line` groups, so that it
 * can step back while the gauges are the subject.
 */
export function processScene(labels: SceneLabels) {
  const stations = STRETCHES.map((_, index) => index);
  const line = (...parts: string[]) => `<g data-flow-line>${parts.join('')}</g>`;
  return [
    line(...stations.map(stationBack), legs(), conveyor(), scrapBin(), pieces()),
    label([857, -LENGTH + 150, 0], labels.scrap, 'class="flow-label" text-anchor="middle" data-flow-callout'),
    // The middle station stands furthest back.
    ...[1, 2, 0].map(
      (index) => line(stationFront(index)) + gauge(index, labels.parameters[index] ?? ''),
    ),
  ].join('');
}

/* --- The chart ------------------------------------------------------------ */

export interface ChartLabels {
  time: string;
  quality: string;
  tolerance: string;
}

/**
 * Quality over time, flat rather than isometric. Drawn in its end state: every
 * point inside a narrowed tolerance corridor. Each point also carries where it
 * was before (`data-rise`, and `data-out` if that was outside the corridor),
 * and each new limit how far it has moved in (`data-shift`).
 */
export function processChart(labels: ChartLabels) {
  const BASE = 210;
  const MID = 124;
  const [LEFT, RIGHT] = [36, 330];
  /** Half the corridor, before and after. */
  const [WIDE, NARROW] = [30, 15];

  // Seeded noise: every build draws the same series.
  const noise = (n: number) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x) - 0.5;
  };
  const series = Array.from({ length: 27 }, (_, i) => {
    const drift = Math.sin(i * 0.7);
    const before = noise(i + 1) * 140 + drift * 12;
    return { x: 52 + i * 10.2, before, after: noise(i + 1) * 18 + drift * 3 };
  });

  const stroke = (paint: string, width: number) =>
    `fill="none" stroke="${paint}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  const trace = (key: 'before' | 'after') =>
    series.map((point) => `${point.x.toFixed(1)},${(MID + point[key]).toFixed(1)}`).join(' ');
  const limit = (y: number, attrs: string) => `<path d="M${LEFT} ${y}H${RIGHT}" ${attrs}/>`;
  const text = 'class="flow-label flow-label-chart"';

  return [
    `<rect x="${LEFT}" y="${MID - NARROW}" width="${RIGHT - LEFT}" height="${NARROW * 2}" fill="${color.nebel}" data-flow-band data-scale="${WIDE / NARROW}"/>`,
    // The corridor as it was, for comparison.
    ...[-WIDE, WIDE].map((offset) => limit(MID + offset, `${stroke(color.marine45, 1.5)} stroke-dasharray="1 6"`)),
    `<text ${text} x="${RIGHT}" y="${MID - WIDE - 9}" text-anchor="end">${labels.tolerance}</text>`,
    `<path d="M${LEFT} 38V${BASE}H${RIGHT}" ${stroke(color.marine, 2)}/>`,
    `<text ${text} x="${RIGHT}" y="${BASE + 24}" text-anchor="end">${labels.time}</text>`,
    `<text ${text} transform="translate(24 ${BASE}) rotate(-90)">${labels.quality}</text>`,
    `<polyline points="${trace('before')}" ${stroke(color.hellblau, 1.5)} opacity="0" data-flow-before/>`,
    `<polyline points="${trace('after')}" ${stroke(color.marine45, 1.5)} data-flow-after/>`,
    ...series.map(
      (point, i) =>
        `<circle cx="${point.x.toFixed(1)}" cy="${(MID + point.after).toFixed(1)}" r="4" data-flow-dot data-station="${i % STRETCHES.length}" data-rise="${(point.before - point.after).toFixed(1)}"${Math.abs(point.before) > WIDE ? ' data-out' : ''}/>`,
    ),
    ...[-1, 1].map((side) =>
      limit(MID + side * NARROW, `${stroke(color.orange, 2.5)} data-flow-limit data-shift="${side * (WIDE - NARROW)}"`),
    ),
  ].join('');
}
