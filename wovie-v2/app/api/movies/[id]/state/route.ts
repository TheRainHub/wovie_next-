import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorite: false, watchlists: [] });
    }

    const resolvedParams = await params;
    const movieId = parseInt(resolvedParams.id);
    const userId = session.user.id;

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    // Run queries in parallel
    const [favorite, userWatchlists] = await Promise.all([
      prisma.favorite.findUnique({
        where: { userId_movieId: { userId, movieId } },
      }),
      prisma.watchlist.findMany({
        where: { userId },
        include: {
          items: {
            where: { movieId },
          },
        },
        orderBy: { createdAt: 'desc' }
      }),
    ]);

    const watchlists = userWatchlists.map(list => ({
      id: list.id,
      name: list.name,
      contains: list.items.length > 0,
    }));

    return NextResponse.json({
      isFavorite: !!favorite,
      watchlists,
    });
  } catch (error) {
    console.error("Error fetching movie state:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
