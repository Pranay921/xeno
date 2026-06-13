import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    /*
     * Match all dashboard routes except auth-related ones, landing page, and static assets.
     */
    "/dashboard/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/segments/:path*",
    "/ai-segment-builder/:path*",
    "/ai-campaign-assistant/:path*",
    "/campaigns/:path*",
  ],
};
