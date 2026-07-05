import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/registrar?error=no_code`);

  try {
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/discord/callback`;

    // Troca code por token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access token");

    // Pega info do usuário
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userRes.json();

    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    const session = JSON.stringify({
      name: user.global_name || user.username,
      email: user.email,
      image: avatar,
      provider: "discord",
    });

    const cookieStore = await cookies();
    cookieStore.set("rpg_session", Buffer.from(session).toString("base64"), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/cliente`);
  } catch (e) {
    console.error("Discord OAuth error:", e);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/registrar?error=oauth_failed`);
  }
}
