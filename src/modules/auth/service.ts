import { supabase } from "@/lib/database/conection";
import { LoginUserType, RegisterUserType } from "./middleware";
import UserTable, { UserRowType } from "./table";
import { createClient, Session } from "@supabase/supabase-js";
import { ApiResponse } from "@/lib/types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const userTable = new UserTable();

export default class AuthService {
  static async createUser(
    data: RegisterUserType
  ): Promise<{ user: UserRowType; session: Session }> {
    const { email, password, role_id } = data;

    try {
      const repeatedUser = await userTable.findByEmail(email);
      if (repeatedUser !== null) {
        throw {
          statusCode: 400,
          message: `User already exists with this email: ${email}`,
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData?.user?.id || !authData.session) {
        throw {
          message: `Error creating user in Supabase Auth: ${authError?.message}`,
        };
      }

      const createdUser = await userTable.insert({ email, role_id });
      if (createdUser === null) {
        throw {
          message: "Error creating user in database",
        };
      }

      return {
        user: createdUser,
        session: authData.session,
      };
    } catch (error: any) {
      throw {
        statusCode: error?.statusCode ?? 500,
        error: error?.message ?? `Unexpected error: ${error}`,
      };
    }
  }
  static async loginUser(
    data: LoginUserType
  ): Promise<{ user: UserRowType; session: Session }> {
    const { email, password } = data;

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData?.user?.id || !authData.session) {
        throw {
          message: `Error login user: ${authError?.message}`,
          statusCode: 401,
        };
      }
      const user = await userTable.findByEmail(email);
      if (!user) {
        throw {
          message: "User not found in database",
          statusCode: 404,
        };
      }

      return {
        user,
        session: authData.session,
      };
    } catch (error: any) {
      throw {
        statusCode: error?.statusCode ?? 500,
        error: error?.message ?? `Unexpected error: ${error}`,
      };
    }
  }
  static async refreshSession(refreshToken: string) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return { message: "Invalid refresh token", statusCode: 401 };
      }

      return {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error: any) {
      throw {
        statusCode: error?.statusCode ?? 500,
        error: error?.message ?? `Unexpected error: ${error}`,
      };
    }
  }
  static async logOut(accessToken: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

      if (error) {
        throw {
          statusCode: 500,
          error: `Error deleting session: ${error.message}`,
        };
      }

      return {
        statusCode: 200,
        data: true,
      };
    } catch (error: any) {
      throw {
        statusCode: error?.statusCode ?? 500,
        error: error?.error ?? `unexpected server error: ${error}`,
      };
    }
  }
}
