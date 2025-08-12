import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Admin API test endpoint called");

    return NextResponse.json({
      success: true,
      message: "Admin API is working!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in admin test API:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
