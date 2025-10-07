"use client"

import { useEffect } from "react"

export default function StoreUserId({ userId }: { userId: string }) {
	useEffect(() => {
		try {
			localStorage.setItem("acm_user_id", userId)
		} catch {}
	}, [userId])
	return null
}


