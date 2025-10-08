import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/firebase/user-manager";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		
		// Get or create user in Firebase
		const user = await getOrCreateUser(userId);
		return NextResponse.json(user);
	} catch (e) {
		return NextResponse.json({ error: "Failed to fetch current user" }, { status: 500 });
	}
}
