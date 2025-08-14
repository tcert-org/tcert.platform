import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

// GET - Obtener feedback por certificación específica (API Pública)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificationId: string }> }
) {
  try {
    const resolvedParams = await params;
    const certificationId = parseInt(resolvedParams.certificationId);

    if (isNaN(certificationId)) {
      return NextResponse.json(
        { error: "ID de certificación inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("feedback")
      .select(
        `
        id,
        certification_id,
        name,
        comment,
        rating,
        profession
      `
      )
      .eq("certification_id", certificationId)
      .order("rating", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("[GET_FEEDBACK_BY_CERTIFICATION_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al obtener los feedbacks" },
        { status: 500 }
      );
    }

    // Calcular promedio de rating
    const ratings = data?.map((feedback) => feedback.rating) || [];
    const averageRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length) *
              10
          ) / 10
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: data?.length || 0,
        certification_id: certificationId,
        average_rating: averageRating,
        stats: {
          total_reviews: data?.length || 0,
          five_stars: data?.filter((f) => f.rating === 5).length || 0,
          four_stars:
            data?.filter((f) => f.rating >= 4 && f.rating < 5).length || 0,
          three_stars:
            data?.filter((f) => f.rating >= 3 && f.rating < 4).length || 0,
          two_stars:
            data?.filter((f) => f.rating >= 2 && f.rating < 3).length || 0,
          one_star:
            data?.filter((f) => f.rating >= 1 && f.rating < 2).length || 0,
        },
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("[FEEDBACK_BY_CERTIFICATION_API_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// OPTIONS - Para CORS (API Pública)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
