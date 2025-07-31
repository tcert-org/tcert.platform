import { NextRequest } from "next/server";
import ParamsController from "@/modules/params/controller";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (id) {
    return ParamsController.getById(Number(id));
  }

  return ParamsController.getAll();
}

export async function PUT(req: NextRequest) {
  return ParamsController.update(req);
}
