import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(req: NextRequest) {
  const { encryptedStudent } = await req.json();

  if (!encryptedStudent) {
    return NextResponse.json(
      { message: "Missing encrypted student data" },
      { status: 400 }
    );
  }

  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedStudent,
      process.env.SUPABASE_JWT_SECRET!
    );
    const decryptedStudent = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    return NextResponse.json({ student: decryptedStudent }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error decrypting student data", error: error.message },
      { status: 500 }
    );
  }
}
