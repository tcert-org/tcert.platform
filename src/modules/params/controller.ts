import { NextRequest, NextResponse } from "next/server";
import ParamsTable from "./table";

const paramsTable = new ParamsTable();

const ParamsController = {
  async update(req: NextRequest) {
    try {
      const body = await req.json();
      const { id, value } = body;

      if (!id || value === null || value === undefined) {
        return NextResponse.json(
          { error: "Faltan campos obligatorios (id, value)." },
          { status: 400 }
        );
      }

      const updated = await paramsTable.updateParamValueById(id, value);

      return NextResponse.json({
        message: "Parámetro actualizado correctamente.",
        data: updated,
      });
    } catch (error: any) {
      console.error("Error al actualizar parámetros:", error);
      return NextResponse.json(
        { error: error.message ?? "Error interno del servidor." },
        { status: 500 }
      );
    }
  },
  async getById(id: number) {
    try {
      const data = await paramsTable.getParamById(id);
      return NextResponse.json({ data });
    } catch (error: any) {
      console.error("Error al obtener el parámetro:", error);
      return NextResponse.json(
        { error: error.message ?? "Error al obtener parámetro." },
        { status: 500 }
      );
    }
  },
  
  async getAll() {
    try {
      const data = await paramsTable.getAllParams();
      return NextResponse.json({ data });
    } catch (error: any) {
      console.error("Error al obtener parámetros:", error);
      return NextResponse.json(
        { error: error.message ?? "Error al obtener parámetros." },
        { status: 500 }
      );
    }
  },
};



export default ParamsController;
