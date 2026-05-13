import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const tutorial = await prisma.tutorial.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        content: body.content,
        isPublished: body.isPublished
      }
    });

    await recordAuditLog({
      session,
      action: "UPDATE_TUTORIAL",
      targetType: "TUTORIAL",
      targetId: tutorial.id,
      targetName: tutorial.title,
      details: { category: tutorial.category, isPublished: tutorial.isPublished }
    });

    return NextResponse.json(tutorial);
  } catch (error) {
    console.error("[TUTORIAL_PUT]", error);
    return NextResponse.json({ error: "Failed to update tutorial" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const tutorial = await prisma.tutorial.delete({
      where: { id }
    });

    await recordAuditLog({
      session,
      action: "DELETE_TUTORIAL",
      targetType: "TUTORIAL",
      targetId: id,
      targetName: tutorial.title
    });

    return NextResponse.json({ message: "Tutorial deleted" });
  } catch (error) {
    console.error("[TUTORIAL_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete tutorial" }, { status: 500 });
  }
}
