// src/modules/membership/controller.ts
import { NextRequest, NextResponse } from "next/server";
import MembershipTable from "./table";

const membershipTable = new MembershipTable();

const MembershipController = {
    async update(req: NextRequest) {
      const body = await req.json();
      const { id, count_from, count_up, price } = body;
  
      if (!id || count_from == null || count_up == null || price == null) {
        return NextResponse.json(
          { error: "Faltan campos obligatorios." },
          { status: 400 }
        );
      }
  
      try {
        const updated = await membershipTable.updateMembership(
          id,
          count_from,
          count_up,
          price
        );
  
        return NextResponse.json({
          message: "Membresía actualizada correctamente",
          data: updated,
        });
      } catch (error: any) {
        console.error("Error al actualizar membresía:", error);
        return NextResponse.json(
          { error: error.message ?? "Error interno del servidor" },
          { status: 500 }
        );
      }
    },
  
    async getAll() {
      try {
        const data = await membershipTable.getAllMemberships();
        return NextResponse.json({ data });
      } catch (error: any) {
        console.error("Error al obtener membresías:", error);
        return NextResponse.json(
          { error: error.message ?? "Error al obtener membresías" },
          { status: 500 }
        );
      }
    },
  };
  
  export default MembershipController;
