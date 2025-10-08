import { NextRequest, NextResponse } from "next/server";
import {
	getUser,
	createUser,
	updateUser,
	deleteUser,
	getCurrentUser,
} from "@/lib/firebase/user-manager";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");

	// If no userId provided, return current authenticated user
	if (!userId) {
		try {
			const user = await getCurrentUser();
			if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
			return NextResponse.json(user);
		} catch (error) {
			console.error("Failed to fetch current user:", error);
			return NextResponse.json({ error: "Failed to fetch current user" }, { status: 500 });
		}
	}

	// Otherwise fetch specific user by ID
	try {
		const user = await getUser(userId);
		if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(user);
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json() as { userId?: string; [key: string]: unknown };
		const { userId, ...data } = body;
		if (!userId) {
			return NextResponse.json({ error: "userId required" }, { status: 400 });
		}
		const user = await createUser(userId, data);
		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		console.error("Failed to create user:", error);
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json() as { userId?: string; [key: string]: unknown };
        const { userId, ...data } = body;
        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }
        // Set userSetup to true when profile is saved
        await updateUser(userId, { ...data, userSetup: true });

        // Set cache cookie to avoid repeated database checks
        const res = NextResponse.json({ success: true });
        res.cookies.set("user_setup_complete", "true", {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            sameSite: "lax",
            httpOnly: true,
        });
        return res;
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const userId = searchParams.get("userId");
	if (!userId) {
		return NextResponse.json({ error: "userId required" }, { status: 400 });
	}
	try {
		await deleteUser(userId);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Failed to delete user:", error);
		return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
	}
}


