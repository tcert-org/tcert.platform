import { NextRequest } from "next/server";
import RoleMiddleware from "@/modules/roles/middleware";
import RoleController from "@/modules/roles/controller";

export async function POST(req: NextRequest) {
  return RoleMiddleware.validatePost(req, RoleController.create);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    return RoleController.getById(Number(id));
  }

  return RoleController.getAll();
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

  return RoleMiddleware.validatePut(req, id, RoleController.update);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) {
    return Response.json(
      {
        statusCode: 400,
        success: false,
        data: null,
        error: "Missing or invalid ID parameter.",
      },
      { status: 400 }
    );
  }

  return RoleController.deleteRole(id);
}
