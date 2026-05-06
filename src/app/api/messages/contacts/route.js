import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const userId = session.user.id;
  const userType = session.user.userType;

  try {
    // 1. Récupérer les admins
    const adminWhere = { id: { not: userId } };
    if (search) {
      adminWhere.name = { contains: search, mode: 'insensitive' };
    }
    
    const admins = await prisma.admin.findMany({
      where: adminWhere,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' }
    });

    const formattedAdmins = admins.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role === "SUPER_ADMIN" ? "Super Administrateur" : a.role === "ACCOUNTANT" ? "Comptable" : "Secrétaire",
      userType: "ADMIN"
    }));

    // 2. Récupérer les étudiants
    let studentWhere = {
      id: { not: userId }
    };

    // Si c'est un étudiant qui cherche, on restreint aux comptes actifs (avec password)
    if (userType === "STUDENT") {
      studentWhere.lmsPassword = { not: null };
      
      if (search) {
        studentWhere.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      } else {
        // Un étudiant ne voit que ses amis acceptés par défaut
        studentWhere.OR = [
          { receivedFriendRequests: { some: { senderId: userId, status: "ACCEPTED" } } },
          { sentFriendRequests: { some: { receiverId: userId, status: "ACCEPTED" } } }
        ];
      }
    } else {
      // Pour les ADMINS : On voit tous les étudiants si une recherche est faite
      if (search) {
        studentWhere.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
    }

    const students = await prisma.candidate.findMany({
      where: studentWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        level: true,
        receivedFriendRequests: {
          where: { senderId: userId },
          select: { status: true }
        },
        sentFriendRequests: {
          where: { receiverId: userId },
          select: { status: true }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    const formattedStudents = students.map(s => {
      const sent = s.receivedFriendRequests[0]?.status;
      const received = s.sentFriendRequests[0]?.status;
      
      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        email: s.email,
        role: `Étudiant (${s.level})`,
        userType: "STUDENT",
        friendStatus: sent || received || null,
        isFriend: sent === "ACCEPTED" || received === "ACCEPTED"
      };
    });

    return NextResponse.json([...formattedAdmins, ...formattedStudents]);
  } catch (error) {
    console.error("Fetch contacts error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
