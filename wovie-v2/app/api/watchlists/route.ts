import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Watchlist name is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const watchlist = await prisma.watchlist.create({
      data: {
        name: name.trim(),
        userId,
      },
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error creating watchlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
