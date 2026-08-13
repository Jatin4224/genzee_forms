/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * Proxy the API through this app's own origin.
   *
   * The auth cookie is set by the API, which is deployed on a different site
   * (up.railway.app vs vercel.app - both are public suffixes, so browsers treat
   * them as entirely unrelated). That makes the cookie third-party, and Safari,
   * every browser on iOS, Brave, and any incognito window refuse to store it.
   * Sign-in appears to succeed, the next request arrives with no cookie, and the
   * guard bounces the visitor back to /login.
   *
   * Routing /trpc through here means the browser only ever talks to the web
   * domain, so Set-Cookie comes back from an origin it already trusts and the
   * cookie is first-party everywhere. Vercel forwards the request to the API
   * server-side, where third-party cookie policy does not apply.
   *
   * Unset locally: the web app talks to localhost:8000 directly, which is
   * same-site already, so no proxy is needed.
   */
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN;

    if (!apiOrigin) return [];

    return [
      {
        source: "/trpc/:path*",
        destination: `${apiOrigin.replace(/\/+$/, "")}/trpc/:path*`,
      },
    ];
  },
};

export default nextConfig;
