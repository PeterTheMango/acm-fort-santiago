import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listIncomingRequests, sendConnectionRequest, acceptConnectionRequest, denyConnectionRequest } from "@/lib/firebase/user-manager";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const items = await listIncomingRequests(userId);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { toUserId } = await request.json();
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });
  if (toUserId === userId) return NextResponse.json({ error: "cannot connect to self" }, { status: 400 });
  await sendConnectionRequest(userId, toUserId);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { fromUserId, action } = await request.json();
  if (!fromUserId || !action) return NextResponse.json({ error: "fromUserId and action required" }, { status: 400 });
  if (action === "accept") {
    await acceptConnectionRequest(userId, fromUserId);
  } else if (action === "deny") {
    await denyConnectionRequest(userId, fromUserId);
  } else {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const toUserId = searchParams.get("toUserId");
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });
  // Cancel outgoing request: remove doc from recipient's requests
  const { doc, deleteDoc } = await import("firebase/firestore");
  const { db } = await import("@/firebase");
  await deleteDoc(doc(db, `users/${toUserId}/connectionRequests`, userId));
  return NextResponse.json({ success: true });
}
