import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";
import UserTable from "@/modules/auth/table";
import { StudentLoginTable } from "./modules/auth-student/table";
import { User } from "@supabase/supabase-js";
import { JWTPayload, jwtVerify } from "jose";

const SIGN_IN_URL = "/sign-in";
const REFRESH_API_URL = "/api/auth/refresh";
const JWT_SECRET = process.env.JWT_SECRET!;
const secret = new TextEncoder().encode(JWT_SECRET);

async function refreshTokens() {
  const refreshResponse = await fetch(
    `http://localhost:3000${REFRESH_API_URL}`,
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

async function handleUserAuth(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  let user = null;

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      return { authenticated: false, user: null };
    }

    user = data.user;
  } else if (!accessToken && refreshToken) {
    const tokens = await refreshTokens();
    if (!tokens) {
      return { authenticated: false, user: null };
    }
    user = tokens.user;
  } else {
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user };
}

async function handleStudentAuth(req: NextRequest) {
  const studentToken = req.cookies.get("student_access_token")?.value;

  if (!studentToken) {
    return { authenticated: false, student: null };
  }

  try {
    const { payload } = await jwtVerify(studentToken, secret);

    if (!payload || typeof payload !== "object") {
      return { authenticated: false, student: null };
    }

    const studentLoginTable = new StudentLoginTable();
    const sessionValid = await studentLoginTable.validateSession(studentToken);

    if (!sessionValid) {
      return { authenticated: false, student: null };
    }
    return { authenticated: true, student: payload };
  } catch {
    return { authenticated: false, student: null };
  }
}

export async function middleware(req: NextRequest) {
  try {
    const hasStudentToken = req.cookies.has("student_access_token");

    let userAuthResult: { authenticated: boolean; user: User | null } = {
      authenticated: false,
      user: null,
    };
    let studentAuthResult: {
      authenticated: boolean;
      student: null | JWTPayload;
    } = { authenticated: false, student: null };

    if (hasStudentToken) {
      studentAuthResult = await handleStudentAuth(req);
    }

    if (!studentAuthResult.authenticated) {
      userAuthResult = await handleUserAuth(req);
    }

    if (!studentAuthResult.authenticated && !userAuthResult.authenticated) {
      // Limpiar cookies de sesión inválidas
      const response = NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("student_access_token", "", {
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Headers para rutas API autenticadas como usuario
    if (
      userAuthResult.authenticated &&
      req.nextUrl.pathname.startsWith("/app/api")
    ) {
      const userTable = new UserTable();
      const userData = await userTable.getByUuid(
        userAuthResult?.user?.id ?? ""
      );

      if (!userData) {
        return NextResponse.redirect(new URL(SIGN_IN_URL, req.url));
      }
      const userString = JSON.stringify(userData);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user", userString);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
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
    "/((?!api/auth/register|api/auth/login|api/auth/refresh|api/forgot-password|api/auth/reset-password|sign-in|api/auth-student|api/decrypt-student|api/diploma/by-voucher-code|api/diamond|api/certification-params|api/feedback|forgot-password|reset-password|_next/static|_next/image|public|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
