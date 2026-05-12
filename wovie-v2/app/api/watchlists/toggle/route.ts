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

    const { movieId, watchlistId } = await request.json();
    if (!movieId || !watchlistId) {
      return NextResponse.json({ error: "Movie ID and Watchlist ID are required" }, { status: 400 });
    }

    const userId = session.user.id;

    // Verify the watchlist belongs to the user
    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!watchlist || watchlist.userId !== userId) {
      return NextResponse.json({ error: "Watchlist not found or unauthorized" }, { status: 403 });
    }

    // Check if item exists
    const existingItem = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_movieId: {
          watchlistId,
          movieId,
        },
      },
    });

    if (existingItem) {
      // Remove from list
      await prisma.watchlistItem.delete({
        where: {
          watchlistId_movieId: {
            watchlistId,
            movieId,
          },
        },
      });
      return NextResponse.json({ contains: false });
    } else {
      // Add to list
      await prisma.watchlistItem.create({
        data: {
          watchlistId,
          movieId,
        },
      });
      return NextResponse.json({ contains: true });
    }
  } catch (error) {
    console.error("Error toggling watchlist item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
