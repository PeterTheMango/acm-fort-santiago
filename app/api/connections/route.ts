import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listConnections, removeConnection } from "@/lib/firebase/user-manager";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const items = await listConnections(userId);
  return NextResponse.json(items);
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const otherId = searchParams.get("otherId");
  if (!otherId) return NextResponse.json({ error: "otherId required" }, { status: 400 });
  await removeConnection(userId, otherId);
  return NextResponse.json({ success: true });
}

