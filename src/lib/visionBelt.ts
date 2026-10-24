/**
 * Where a product on the conveyor of the vision system sits, and what it looks
 * like, for a given amount of belt travel.
 *
 * Shared by the scene (src/lib/visionScene.ts), which draws the resting state,
 * and the script in VisionSystem.astro, which moves the belt while scrolling.
 * Kept free of the artwork so the script does not bundle it.
 *
 * Every fifth product is different. It looks it from the start, is marked as
 * found once it enters the camera's field, and is pushed off the belt at the
 * reject station.
 */

/** Products drawn at once: the ones on the belt plus one entering. */
export const SLOTS = 6;
/** Distance between two products along the belt, in scene units. */
export const SPACING = 110;
/** Where the first product rests along the belt. */
export const FIRST = 40;

const EVERY = 5;
/** Along the belt: where the camera's field begins and the pusher sits. */
const FIELD = 236;
const REJECT = 395;
const REJECT_LENGTH = 60;
/** How far the pusher moves a product off the belt, and how far it then falls. */
const PUSH = 95;
const DROP = 40;

const COS = Math.cos(Math.PI / 6);
const clamp = (value: number) => Math.min(1, Math.max(0, value));

export type ProductState = 'ok' | 'defect' | 'found';

export interface ProductPose {
  /** Offset from the resting position of the first product, in canvas units. */
  x: number;
  y: number;
  opacity: number;
  state: ProductState;
}

/** `travel` counts product spacings the belt has moved; it only ever grows. */
export function productPose(slot: number, travel: number): ProductPose {
  const steps = Math.floor(travel);
  const step = travel - steps;
  const along = SPACING * (slot - 1 + step);
  const position = FIRST + along;

  // Slots are reused as the belt moves on; the product in one keeps its identity.
  const product = slot - steps;
  const different = (((product - 3) % EVERY) + EVERY) % EVERY === 0;

  // The first slot fades in at the start of the belt, the last out at its end.
  let opacity = 1;
  if (slot === 0) opacity = clamp((step - 0.5) / 0.5);
  if (slot === SLOTS - 1) opacity = 1 - clamp(step / 0.4);

  let side = 0;
  let drop = 0;
  const found = different && position >= FIELD;
  if (found) {
    const pushed = clamp((position - REJECT) / REJECT_LENGTH);
    side = pushed * PUSH;
    drop = clamp((pushed - 0.6) / 0.4) * DROP;
    opacity *= 1 - clamp((pushed - 0.7) / 0.3);
  }

  return {
    x: (along - side) * COS,
    y: (along + side) / 2 + drop,
    opacity,
    state: found ? 'found' : different ? 'defect' : 'ok',
  };
}
