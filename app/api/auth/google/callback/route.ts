import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/registrar?error=no_code`);

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;

    // Troca code por token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    // Pega info do usuário
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    // Salva sessão em cookie
    const session = JSON.stringify({
      name: user.name,
      email: user.email,
      image: user.picture,
      provider: "google",
    });

    const cookieStore = await cookies();
    cookieStore.set("rpg_session", Buffer.from(session).toString("base64"), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cliente`);
  } catch (e) {
    console.error("Google OAuth error:", e);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/registrar?error=oauth_failed`);
  }
}
