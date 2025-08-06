// src/app/api/membership/route.ts
import { NextRequest } from "next/server";
import MembershipController from "@/modules/membership/controller";
import MembershipAssignmentController from "@/modules/membership/assignment/controller";

export async function POST(req: NextRequest) {
  return await MembershipAssignmentController.runAssignment();
}
export async function GET() {
    return MembershipController.getAll();
  }

export async function PUT(req: NextRequest) {
  return MembershipController.update(req);
}
