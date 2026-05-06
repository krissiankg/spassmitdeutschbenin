import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { recipientAdminId: session.user.id },
          { 
            AND: [
              { recipientAdminId: null },
              { recipientCandidateId: null }
            ]
          }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json(notifications);
  } catch (err) {
    return NextResponse.json({ error: "Error fetching notifications" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Mark all as read for this admin
    await prisma.notification.updateMany({
      where: { 
        recipientAdminId: session.user.id,
        isRead: false 
      },
      data: { isRead: true }
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}
