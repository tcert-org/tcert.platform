import { NextRequest } from "next/server";
import PartnerMiddleware from "@/modules/partners/middleware";
import PartnerController from "@/modules/partners/controller";

export async function POST(req: NextRequest) {
  return PartnerMiddleware.validatePost(req, PartnerController.create);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    return PartnerController.getById(Number(id));
  }

  return PartnerController.getAll();
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) {
    return Response.json(
      {
        statusCode: 400,
        data: null,
        error: "Missing or invalid ID parameter.",
      },
      { status: 400 }
    );
  }

  return PartnerMiddleware.validatePut(req, id, PartnerController.update);
}
