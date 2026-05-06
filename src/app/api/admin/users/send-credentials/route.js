import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { sendAdminCredentialsEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.userType !== "ADMIN" || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: userId }
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // On ne peut pas envoyer le mot de passe actuel car il est hashé.
    // L'email contiendra une note expliquant cela, ou le super admin peut changer le mot de passe avant.
    const success = await sendAdminCredentialsEmail(admin);

    if (success) {
      return NextResponse.json({ success: true, message: "Emails envoyés avec succès" });
    } else {
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }

  } catch (error) {
    console.error("API send-credentials error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
