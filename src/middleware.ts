import { auth } from "@/auth"

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|static|manifest.json|robots.txt).*)"],
}

export default auth((req) => {
    let path = req.nextUrl.pathname;
    if (!req.auth && path !== "/login" && path !== "/") {
      const newUrl = new URL("/login", req.nextUrl.origin)
      return Response.redirect(newUrl)
    }
    else if (req.auth && path === "/login") {
        const newUrl = new URL("/app", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }
  })