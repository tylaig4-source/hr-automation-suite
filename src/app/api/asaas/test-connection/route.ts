import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { testConnection } from "@/lib/asaas";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can test connection
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connected = await testConnection();

    if (connected) {
      return NextResponse.json({
        success: true,
        message: "Connection to Asaas API successful",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to connect to Asaas API. Check your API key." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error testing Asaas connection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connection test failed" },
      { status: 500 }
    );
  }
}

