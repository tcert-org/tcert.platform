import { NextRequest, NextResponse } from "next/server";
import { LoginUserType, RegisterUserType } from "./middleware";
import { ApiResponse } from "@/lib/types";
import AuthService from "./service";
import { UserRowType } from "./table";

export default class AuthController {
  static async createUser(
    data: RegisterUserType
  ): Promise<NextResponse<ApiResponse<{ user: UserRowType }>>> {
    try {
      const { user, session } = await AuthService.createUser(data);

      const response = NextResponse.json({ statusCode: 201, data: { user } });

      response.cookies.set("access_token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60,
        path: "/",
      });

      response.cookies.set("refresh_token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      return response;
    } catch (error: any) {
      return NextResponse.json(error);
    }
  }
  static async loginUser(
    data: LoginUserType
  ): Promise<NextResponse<ApiResponse<{ user: UserRowType }>>> {
    try {
      const { user, session } = await AuthService.loginUser(data);

      const response = NextResponse.json({ statusCode: 200, data: { user } });

      response.cookies.set("access_token", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60,
        path: "/",
      });

      response.cookies.set("refresh_token", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      return response;
    } catch (error: any) {
      return NextResponse.json(error);
    }
  }
  static async refreshSession(
    req: NextRequest
  ): Promise<NextResponse<ApiResponse<boolean>>> {
    try {
      const refreshToken = req.cookies.get("refresh_token")?.value;

      if (!refreshToken) {
        return NextResponse.json({
          statusCode: 401,
          error: "No authentication provided",
          data: false,
        });
      }

      const result = await AuthService.refreshSession(refreshToken);

      const response = NextResponse.json({ statusCode: 200, data: true });

      response.cookies.set("access_token", result.accessToken || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 8 * 60 * 60,
        path: "/",
      });

      response.cookies.set("refresh_token", result.refreshToken || "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      return response;
    } catch (error: any) {
      return NextResponse.json(error);
    }
  }

  static async logOut(
    req: NextRequest
  ): Promise<NextResponse<ApiResponse<boolean>>> {
    try {
      const accessToken = req.cookies.get("access_token")?.value;

      if (!accessToken) {
        throw {
          statusCode: 401,
          error: "Access token not found",
        };
      }

      const result = await AuthService.logOut(accessToken);

      const response = NextResponse.json(result);

      response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
      });

      response.cookies.set("refresh_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
      });

      return response;
    } catch (error: any) {
      return NextResponse.json(
        {
          statusCode: error?.statusCode ?? 500,
          error: error?.error ?? `unexpected server error: ${error}`,
        },
        { status: error?.statusCode ?? 500 }
      );
    }
  }
}
