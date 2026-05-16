import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name ? file.name.split('.').pop() : 'png';
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "messages");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/messages/${filename}`;

    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      type: file.type
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}

