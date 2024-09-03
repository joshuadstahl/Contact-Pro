import { NextResponse } from "next/server"

export const GET = function() {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}