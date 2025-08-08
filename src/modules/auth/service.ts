import { supabase } from "@/lib/database/conection";
import { LoginUserType, RegisterUserType } from "./middleware";
import UserTable, { UserRowType } from "./table";
import { Session } from "@supabase/supabase-js";
import { ApiResponse } from "@/lib/types";
import CryptoJS from "crypto-js";

const userTable = new UserTable();

export default class AuthService {
  static async createUser(
    data: RegisterUserType
  ): Promise<{ user: UserRowType; session: Session | null }> {
    const {
      email,
      password,
      role_id,
      company_name,
      contact_number,
      logo_url,
      page_url,
    } = data;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role_id,
            company_name,
            contact_number,
            logo_url,
            page_url,
          },
        },
      });

      if (authError || !authData?.user?.id) {
        throw {
          message: `Error creating user in Supabase Auth: ${authError?.message}`,
        };
      }

      const createdUser = await userTable.insert({
        email,
        role_id,
        user_uuid: authData.user.id,
        company_name,
        contact_number,
        logo_url,
        page_url,
      });

      if (createdUser === null) {
        throw {
          message: "Error creating user in database",
        };
      }

      return {
        user: createdUser,
        session: authData?.session,
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
  ): Promise<{ user: string; session: Session }> {
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
      const user = await userTable.getByUuid(authData.user.id);
      if (!user) {
        throw {
          message: "User not found in database",
          statusCode: 404,
        };
      }
      const encryptedUser: string = CryptoJS.AES.encrypt(
        JSON.stringify(user),
        process.env.SUPABASE_JWT_SECRET!
      ).toString();

      return {
        user: encryptedUser,
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
      const { error } = await supabase.auth.admin.signOut(accessToken);

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
