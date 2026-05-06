import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.userType !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { recipientCandidateId: session.user.id },
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
    if (!session || session.user.userType !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Mark all as read for this student
    await prisma.notification.updateMany({
      where: { 
        recipientCandidateId: session.user.id,
        isRead: false 
      },
      data: { isRead: true }
    });
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}
