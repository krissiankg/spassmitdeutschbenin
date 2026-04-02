import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { testSMTPSettings } from "@/lib/email";

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { email } = await req.json();
    const targetEmail = email || session.user.email;

    await testSMTPSettings(targetEmail);

    return NextResponse.json({ success: true, message: `Email de test envoyé à ${targetEmail}` });
  } catch (error) {
    console.error("Test SMTP Error:", error);
    return NextResponse.json({ 
      error: "Échec du test SMTP. Vérifiez vos variables d'environnement dans le fichier .env (HOST, PORT, USER, PASS).",
      details: error.message 
    }, { status: 500 });
  }
}
