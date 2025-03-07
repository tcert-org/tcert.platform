import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

export async function POST(req: NextRequest) {
  const { encryptedUser } = await req.json();

  if (!encryptedUser) {
    return NextResponse.json(
      { message: "Missing encrypted user data" },
      { status: 400 }
    );
  }

  try {
    const bytes = CryptoJS.AES.decrypt(
      encryptedUser,
      process.env.SUPABASE_JWT_SECRET!
    );
    const decryptedUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    return NextResponse.json({ user: decryptedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error decrypting user data", error: error.message },
      { status: 500 }
    );
  }
}
