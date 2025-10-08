import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
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
		} catch (e) {
			return NextResponse.json({ error: "Failed to fetch current user" }, { status: 500 });
		}
	}
	
	// Otherwise fetch specific user by ID
	try {
		const user = await getUser(userId);
		if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json(user);
	} catch (e) {
		return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId, ...data } = (await request.json()) as any;
		if (!userId) {
			return NextResponse.json({ error: "userId required" }, { status: 400 });
		}
		const user = await createUser(userId, data);
		return NextResponse.json(user, { status: 201 });
	} catch (e) {
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
    try {
        const { userId, ...data } = (await request.json()) as any;
        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }
        await updateUser(userId, data);
        // Mark setup complete in Clerk metadata so middleware stops redirecting
        try {
            await clerkClient.users.updateUser(userId, {
                publicMetadata: { setupUser: true },
            } as any);
        } catch (e) {
            // Non-fatal: profile update succeeded; middleware may still redirect until next request
        }
        const res = NextResponse.json({ success: true });
        // Also set a short-lived cookie to bypass the setup gate immediately
        res.cookies.set("setup_user", "1", { path: "/", maxAge: 60 * 5, sameSite: "lax" });
        return res;
    } catch (e) {
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
	} catch (e) {
		return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
	}
}


