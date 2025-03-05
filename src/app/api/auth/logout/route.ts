import AuthController from "@/modules/auth/controller";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return await AuthController.logOut(req);
}
