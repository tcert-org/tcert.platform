import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/conection";

// GET - Obtener todos los feedbacks (API Pública)
export async function GET() {
  try {
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
      .order("rating", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("[GET_FEEDBACK_ERROR]", error.message);
      return NextResponse.json(
        { error: "Error al obtener los feedbacks" },
        { status: 500 }
      );
    }

    // Calcular estadísticas generales
    const ratings = data?.map((feedback) => feedback.rating) || [];
    const averageRating =
      ratings.length > 0
        ? Math.round(
            (ratings.reduce((sum, rating) => sum + rating, 0) /
              ratings.length) *
              10
          ) / 10
        : 0;

    // Estadísticas por certificación
    const certificationStats =
      data?.reduce((acc, feedback) => {
        const certId = feedback.certification_id;
        if (!acc[certId]) {
          acc[certId] = {
            certification_id: certId,
            total_reviews: 0,
            average_rating: 0,
            ratings: [],
          };
        }
        acc[certId].total_reviews++;
        acc[certId].ratings.push(feedback.rating);
        return acc;
      }, {} as Record<number, any>) || {};

    // Calcular promedio por certificación
    Object.values(certificationStats).forEach((cert: any) => {
      cert.average_rating =
        Math.round(
          (cert.ratings.reduce(
            (sum: number, rating: number) => sum + rating,
            0
          ) /
            cert.ratings.length) *
            10
        ) / 10;
      delete cert.ratings; // Remover array temporal
    });

    return NextResponse.json(
      {
        success: true,
        data: data || [],
        count: data?.length || 0,
        overall_stats: {
          total_reviews: data?.length || 0,
          average_rating: averageRating,
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
        certification_stats: Object.values(certificationStats),
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
    console.error("[FEEDBACK_API_ERROR]", error);
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
