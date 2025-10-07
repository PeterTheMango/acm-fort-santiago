import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { recommendConnections } from "@/lib/firebase/user-manager";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const ids = await recommendConnections(userId, 10);
  return NextResponse.json(ids);
}

