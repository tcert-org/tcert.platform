import { NextRequest } from "next/server";
import UserMiddleware from "@/modules/auth/middleware";
import AuthController from "@/modules/auth/controller";

export async function POST(req: NextRequest) {
  return UserMiddleware.validateRegister(req, AuthController.createUser);
}
