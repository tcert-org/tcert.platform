import { supabase } from "@/lib/database/conection";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  const filters: Record<string, string | null> = {
    code: searchParams.get("code"),
    email: searchParams.get("email"),
    used: searchParams.get("used"),
    "student.fullname": searchParams.get("student"),
    "certification.name": searchParams.get("certification"),
    "status.name": searchParams.get("status"),
  };

  const allowedSortFields = [
    "id",
    "code",
    "email",
    "used",
    "created_at",
    "student.fullname",
    "certification.name",
    "status.name",
  ];
  let orderBy = searchParams.get("orderBy") || "created_at";
  const orderDir = searchParams.get("orderDir") === "ASC" ? true : false;

  if (!allowedSortFields.includes(orderBy)) {
    orderBy = "created_at";
  }

  let query = supabase.from("vouchers").select(
    `
      id, code, email, used, created_at,
      student:students(fullname),
      certification:certifications(name),
      status:voucher_statuses(name)
      `,
    { count: "exact" }
  );

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null) {
      if (key === "used") {
        query = query.eq(key, value === "true");
      } else {
        query = query.ilike(key, `%${value}%`);
      }
    }
  });

  query = query.order(orderBy, { ascending: orderDir });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData = data.map((voucher) => ({
    ...voucher,
    student: voucher.student?.length ? voucher.student[0] : null,
    certification: voucher.certification?.length
      ? voucher.certification[0]
      : null,
    status: voucher.status?.length ? voucher.status[0] : null,
  }));

  return NextResponse.json({
    data: formattedData,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
