/**
 * Bunny Edge Script — clean URL rewriting (DECISIONS.md §6).
 *
 * WHY THIS EXISTS
 * ---------------
 * We build with `build.format: 'file'`, so the storage zone contains
 * `leistungen.html`, not `leistungen/index.html`. Bunny Storage serves exact paths
 * and will not resolve `/leistungen` to `leistungen.html` on its own, so without
 * this script every page would 404.
 *
 * It also enforces a single canonical URL per page by 301-redirecting the two
 * alternative spellings — trailing slash and explicit `.html` — to the clean form.
 * Without that, three URLs serve identical content and Google treats it as
 * duplicate content.
 *
 * ⚠️ UNVERIFIED AGAINST THE LIVE PLATFORM.
 * This is the single riskiest assumption in the stack (see DECISIONS.md "Open
 * items"). Bunny's plain Edge Rules have no pattern-based path rewrite, so this
 * goes through Edge Scripting instead. Deploy it to a throwaway pull zone and
 * confirm the SDK surface below matches the current Bunny API BEFORE building more
 * pages on the assumption that it works.
 *
 * If it turns out not to work, the fallback is switching to
 * `build.format: 'directory'` and accepting trailing slashes.
 */

import * as BunnySDK from 'https://esm.sh/@bunny.net/edgescript-sdk@0.11.2';

/** Paths that must be served verbatim, never rewritten. */
const PASSTHROUGH = /^\/(_astro|admin|uploads)\//;

/** Anything with a file extension is a real asset request. */
const HAS_EXTENSION = /\.[a-zA-Z0-9]+$/;

function redirect(to, status = 301) {
  return new Response(null, { status, headers: { Location: to } });
}

BunnySDK.net.http.servePullZone().onOriginRequest((ctx) => {
  const url = new URL(ctx.request.url);
  const { pathname } = url;

  if (PASSTHROUGH.test(pathname)) return ctx.request;

  // /leistungen.html -> /leistungen
  if (pathname.endsWith('.html')) {
    url.pathname = pathname.replace(/(?:\/index)?\.html$/, '') || '/';
    return redirect(url.toString());
  }

  // /leistungen/ -> /leistungen  (root is left alone)
  if (pathname !== '/' && pathname.endsWith('/')) {
    url.pathname = pathname.replace(/\/+$/, '');
    return redirect(url.toString());
  }

  // The root maps to index.html.
  if (pathname === '/') {
    url.pathname = '/index.html';
    ctx.request = new Request(url.toString(), ctx.request);
    return ctx.request;
  }

  // Clean page URL -> the actual file in storage. This is the whole point.
  if (!HAS_EXTENSION.test(pathname)) {
    url.pathname = `${pathname}.html`;
    ctx.request = new Request(url.toString(), ctx.request);
  }

  return ctx.request;
});
