import { ApiResponse } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RegisterUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    }),
  role_id: z
    .number()
    .int()
    .positive({ message: "role_id must be a valid positive integer" }),
  company_name: z.string().optional(), 
  contact_number: z.string().optional(),
  logo_url: z.string().url({ message: "Invalid logo URL format" }).optional().or(z.literal("")),
  page_url: z.string().url({ message: "Invalid page URL format" }).optional().or(z.literal("")),
});

export const LoginUserSchema = RegisterUserSchema.omit({ role_id: true, company_name: true, contact_number: true, logo_url: true, page_url: true });

export type RegisterUserType = z.infer<typeof RegisterUserSchema>;
export type LoginUserType = z.infer<typeof LoginUserSchema>;

export default class UserMiddleware {
  static async validateRegister(
    req: NextRequest,
    next: (data: RegisterUserType) => Promise<NextResponse>
  ) {
    try {
      const body = await req.json();
      const validatedData = RegisterUserSchema.parse(body) as RegisterUserType;
      return await next(validatedData);
    } catch (error) {
      return NextResponse.json(
        {
          statusCode: 400,
          data: null,
          error: `Invalid request data: ${error}`,
        },
        { status: 400 }
      );
    }
  }

  static async validateLogin(
    req: NextRequest,
    next: (
      data: LoginUserType
    ) => Promise<
      | NextResponse<ApiResponse<null>>
      | NextResponse<ApiResponse<{ user: string }>>
    >
  ): Promise<
    | NextResponse<ApiResponse<null>>
    | NextResponse<ApiResponse<{ user: string }>>
  > {
    try {
      const body = await req.json();
      const validatedData = LoginUserSchema.parse(body) as LoginUserType;
      return await next(validatedData);
    } catch (error) {
      return NextResponse.json({
        statusCode: 400,
        data: null,
        error: `Invalid request data: ${error}`,
      });
    }
  }
}
