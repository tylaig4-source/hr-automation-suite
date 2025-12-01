import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { shouldSuggestUpgrade } from "@/lib/upgrade-suggestion";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const suggestion = await shouldSuggestUpgrade(session.user.companyId);

    if (!suggestion) {
      return NextResponse.json({
        shouldSuggest: false,
      });
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Erro ao buscar sugestão de upgrade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

