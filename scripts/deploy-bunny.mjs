#!/usr/bin/env node
/**
 * Deploy dist/ to a Bunny Storage zone, then purge the pull zone cache.
 *
 * Written as a plain script rather than a third-party GitHub Action so the
 * deployment path has no dependencies we don't control (DECISIONS.md §8).
 *
 * Required environment:
 *   BUNNY_STORAGE_ZONE      storage zone name
 *   BUNNY_STORAGE_PASSWORD  storage zone password (NOT the account API key)
 *   BUNNY_STORAGE_ENDPOINT  e.g. storage.bunnycdn.com (region-specific)
 *   BUNNY_PULL_ZONE_ID      numeric id of the pull zone to purge
 *   BUNNY_API_KEY           account API key, used only for the purge call
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const CONCURRENCY = 8;

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const STORAGE_ZONE = required('BUNNY_STORAGE_ZONE');
const STORAGE_PASSWORD = required('BUNNY_STORAGE_PASSWORD');
const STORAGE_ENDPOINT = process.env.BUNNY_STORAGE_ENDPOINT ?? 'storage.bunnycdn.com';
const PULL_ZONE_ID = process.env.BUNNY_PULL_ZONE_ID;
const API_KEY = process.env.BUNNY_API_KEY;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

async function upload(file) {
  // Storage paths always use forward slashes, regardless of host OS.
  const remote = relative(DIST, file).split(sep).join('/');
  const url = `https://${STORAGE_ENDPOINT}/${STORAGE_ZONE}/${remote}`;

  const body = await readFile(file);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: STORAGE_PASSWORD,
      'Content-Type': 'application/octet-stream',
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status} ${res.statusText}): ${remote}`);
  }
  return remote;
}

async function main() {
  try {
    const info = await stat(DIST);
    if (!info.isDirectory()) throw new Error();
  } catch {
    console.error(`No ${DIST}/ directory — run the build first.`);
    process.exit(1);
  }

  const files = [];
  for await (const file of walk(DIST)) files.push(file);
  console.log(`Uploading ${files.length} files to storage zone "${STORAGE_ZONE}" …`);

  let done = 0;
  const queue = [...files];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const file = queue.pop();
      if (!file) break;
      await upload(file);
      done += 1;
      if (done % 25 === 0 || done === files.length) {
        console.log(`  ${done}/${files.length}`);
      }
    }
  });

  await Promise.all(workers);
  console.log('Upload complete.');

  // Purge, so visitors get the new build instead of the cached old one.
  if (!PULL_ZONE_ID || !API_KEY) {
    console.warn(
      'BUNNY_PULL_ZONE_ID or BUNNY_API_KEY not set — skipping cache purge.\n' +
        'The new files are uploaded but the CDN will keep serving the old ones ' +
        'until its cache expires.',
    );
    return;
  }

  const purge = await fetch(
    `https://api.bunny.net/pullzone/${PULL_ZONE_ID}/purgeCache`,
    { method: 'POST', headers: { AccessKey: API_KEY } },
  );

  if (!purge.ok) {
    throw new Error(`Cache purge failed: ${purge.status} ${purge.statusText}`);
  }
  console.log('Cache purged.');
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
