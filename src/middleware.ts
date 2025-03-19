import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";
import UserTable from "@/modules/auth/table";

const SIGN_IN_URL = "/sign-in";
const REFRESH_API_URL = "/api/auth/refresh";
const CRITICAL_ROUTES = ["/simulators", "/exams"];

async function refreshTokens(req: NextRequest) {
  const refreshResponse = await fetch(
    `${req.nextUrl.origin}${REFRESH_API_URL}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!refreshResponse.ok) {
    return null;
  }

  const { access_token: newAccessToken, refresh_token: newRefreshToken } =
    await refreshResponse.json();

  const { data, error } = await supabase.auth.setSession({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  });

  if (error) {
    return null;
  }

  return { newAccessToken, newRefreshToken, user: data.user };
}

export async function middleware(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    let user = null;

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      }

      user = data.user;
    } else if (!accessToken && refreshToken) {
      const tokens = await refreshTokens(req);
      if (!tokens) {
        return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      }
      user = tokens.user;
    } else {
      return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
    }

    console.log("req.nextUrl.pathname: ", req.nextUrl.pathname);
    if (user && req.nextUrl.pathname.startsWith("/app/api")) {
      const userTable = new UserTable();
      const userData = await userTable.getByUuid(user.id);

      console.log("Middleware - Datos obtenidos del usuario: ", userData);

      if (!userData) {
        return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      }

      const userString = JSON.stringify(userData);

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user", userString);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;
    }

    if (
      CRITICAL_ROUTES.some((route) => req.nextUrl.pathname.startsWith(route))
    ) {
      const tokens = await refreshTokens(req);
      if (!tokens) {
        return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      }
    }

    return NextResponse.next();
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    "/((?!api/auth/register|api/auth/login|api/auth/refresh|sign-in|_next/static|_next/image|public|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
