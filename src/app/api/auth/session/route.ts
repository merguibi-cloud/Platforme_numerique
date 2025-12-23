import { NextResponse } from "next/server";
import { getSessionUserWithRole } from "@/lib/auth-role";

export async function GET() {
  try {
    const result = await getSessionUserWithRole();

    if (!result.success) {
      const status = result.error === "Non authentifié" ? 401 : 403;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

