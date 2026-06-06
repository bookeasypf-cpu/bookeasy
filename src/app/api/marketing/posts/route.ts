/**
 * CRUD basique pour le tracking des posts marketing publiés + KPIs.
 *
 * Protégé par ADMIN_API_KEY en header x-admin-key (timingSafeEqual).
 * Permet à Mara de consigner manuellement les KPIs après publication.
 *
 *  GET /api/marketing/posts                      — liste tous les posts
 *  POST /api/marketing/posts                     — créer un nouveau post
 *  PATCH /api/marketing/posts?id=xxx             — mettre à jour KPIs d'un post
 *  DELETE /api/marketing/posts?id=xxx            — supprimer un post
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidAdminKey } from "@/lib/admin-auth";

function checkAuth(req: NextRequest): boolean {
  return isValidAdminKey(req);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);

  const posts = await prisma.marketingPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      merchant: { select: { id: true, businessName: true, city: true, plan: true } },
    },
  });

  // Aggregate stats globales
  const totals = await prisma.marketingPost.aggregate({
    _sum: { reach: true, impressions: true, likes: true, comments: true, shares: true, saves: true, clicks: true, bookings: true, boostSpent: true },
    _count: { id: true },
  });

  // Par type
  const byType = await prisma.marketingPost.groupBy({
    by: ["type"],
    _count: { id: true },
    _sum: { reach: true, clicks: true, bookings: true },
  });

  return NextResponse.json({
    posts,
    stats: {
      totalPosts: totals._count.id,
      totalReach: totals._sum.reach ?? 0,
      totalImpressions: totals._sum.impressions ?? 0,
      totalLikes: totals._sum.likes ?? 0,
      totalComments: totals._sum.comments ?? 0,
      totalShares: totals._sum.shares ?? 0,
      totalSaves: totals._sum.saves ?? 0,
      totalClicks: totals._sum.clicks ?? 0,
      totalBookings: totals._sum.bookings ?? 0,
      totalBoostSpent: totals._sum.boostSpent ?? 0,
    },
    byType,
  });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    type, platforms, caption,
    merchantId, imageUrl, notes,
    publishedAt, scheduledFor,
    reach, impressions, likes, comments, shares, saves, clicks, bookings,
    boostBudget, boostSpent,
  } = body;

  if (!type || !platforms || !caption) {
    return NextResponse.json({ error: "type, platforms, caption required" }, { status: 400 });
  }

  const post = await prisma.marketingPost.create({
    data: {
      type,
      platforms,
      caption,
      merchantId: merchantId || null,
      imageUrl: imageUrl || null,
      notes: notes || null,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      reach: Number(reach) || 0,
      impressions: Number(impressions) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      clicks: Number(clicks) || 0,
      bookings: Number(bookings) || 0,
      boostBudget: boostBudget != null ? Number(boostBudget) : null,
      boostSpent: boostSpent != null ? Number(boostSpent) : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const body = await req.json();
  const updatable = ["reach", "impressions", "likes", "comments", "shares", "saves", "clicks", "bookings", "boostBudget", "boostSpent", "notes"] as const;
  const data: Record<string, unknown> = {};
  for (const k of updatable) {
    if (body[k] != null) {
      data[k] = k === "notes" ? body[k] : Number(body[k]);
    }
  }

  const post = await prisma.marketingPost.update({ where: { id }, data });
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await prisma.marketingPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
