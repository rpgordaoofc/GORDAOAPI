import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("rpg_session");
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/`);
}
