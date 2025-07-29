import { NextResponse } from "next/server";
import { MembershipAssignmentService } from "./service";

export default class MembershipAssignmentController {
  static async runAssignment() {
    try {
      const service = new MembershipAssignmentService();
      const result = await service.assignMembershipsToPartners();

      return NextResponse.json({ status: 200, ...result });
    } catch (error) {
      console.error("Error asignando membresías:", error);
      return NextResponse.json(
        { status: 500, message: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    }
  }
}
