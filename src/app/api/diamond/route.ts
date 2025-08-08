import { NextRequest } from "next/server";
import DiamondController from "@/modules/diamonds/controller";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    return DiamondController.getById(Number(id));
  }

  return DiamondController.getAll();
}
