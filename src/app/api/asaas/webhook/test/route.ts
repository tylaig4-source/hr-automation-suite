import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can test webhook
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simply return success to confirm the endpoint is working
    return NextResponse.json({
      success: true,
      message: "Webhook endpoint is responding correctly",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    return NextResponse.json(
      { error: "Webhook test failed" },
      { status: 500 }
    );
  }
}

