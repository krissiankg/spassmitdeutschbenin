# 🇩🇪 Spass mit Deutsch Benin - Plateforme de Gestion d'Examens (SMD v1)

Bienvenue sur le dépôt de la plateforme officielle de gestion des examens ÖSD du centre **Spass mit Deutsch Benin**. 

Cette application Next.js 14 permet de centraliser l'inscription des candidats, la saisie des notes, la publication des résultats et le suivi comptable du centre.

- **Site Principal** : [www.spassmitdeutschbenin.com](https://www.spassmitdeutschbenin.com/)
- **Plateforme (SMD v1)** : [platform.spassmitdeutschbenin.com](https://platform.spassmitdeutschbenin.com/)

---

## 🚀 Fonctionnalités Clés

### 📝 Candidats & Inscriptions
- **Préinscription en ligne** : Formulaire dynamique avec calcul du prix en temps réel ("Panier d'examen").
- **Import Massif** : Inscription de centaines de candidats via import de fichiers Excel standardisés.
- **Identifiants uniques** : Génération automatique de Matricules et Codes de Consultation secrets.

### 📊 Gestion des Examens
- **Sessions & Niveaux** : Organisation par dates et types (A1, A2, B1, B2).
- **Saisie de Notes** : Interface optimisée pour la saisie manuelle ou l'import Excel des scores par module (Hören, Lesen, Schreiben, Sprechen).
- **Publication automatique** : Distribution par email des codes d'accès et ouverture du portail de consultation dès la publication officielle.

### 💰 Comptabilité & Suivi
- **Validation des paiements** : Traitement des acomptes (statut partiel) et des soldes complets.
- **Reçus PDF** : Génération et téléchargement de reçus officiels infalsifiables.
- **Configuration des Tarifs** : Gestion flexible des prix par module et par pack.

### 🛡️ Administration & Sécurité
- **RBAC (Role-Based Access Control)** : Accès restreints selon les rôles (Super Admin, Secrétaire, Comptable).
- **Journal d'Audit** : Traçabilité totale de toutes les modifications sensibles (notes, paiements, suppressions).
- **Form Builder** : Possibilité d'ajouter des champs personnalisés au formulaire d'inscription sans coder.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 14+](https://nextjs.org/) (App Router)
- **Base de données** : [PostgreSQL](https://www.postgresql.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentification** : [NextAuth.js](https://next-auth.js.org/)
- **Design & UI** : [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Emails** : [Nodemailer](https://nodemailer.com/) (SMTP)
- **PDF** : [jspdf](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-autotable)

---

## ⚙️ Configuration & Installation

### 1. Cloner le projet
```bash
git clone https://github.com/krissiank/spassmitdeutschbenin.git
cd spassmitdeutschbenin
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine (voir `.env.example`) :
```env
DATABASE_URL="votre_url_postgresql"
NEXTAUTH_SECRET="votre_secret_aleatoire"
NEXTAUTH_URL="https://platform.spassmitdeutschbenin.com"

SMTP_HOST="votre_serveur_mail"
SMTP_PORT="465"
SMTP_USER="votre_utilisateur"
SMTP_PASS="votre_mot_de_passe"
```

### 4. Initialiser la base de données
```bash
npx prisma generate
npx prisma db push
```

### 5. Lancer en local
```bash
npm run dev
```

---

## 📐 Déploiement sur Vercel

Le projet est entièrement optimisé pour un déploiement sur **Vercel** :

1. Reliez votre dépôt GitHub à un nouveau projet Vercel.
2. Ajoutez toutes les variables d'environnement du fichier `.env` dans les paramètres de Vercel.
3. Configurez une intégration avec votre base de données PostgreSQL (ex: Supabase, Neon ou Vercel Postgres).
4. Le build s'exécutera automatiquement à chaque `push` sur la branche principale.

---

## 🤝 Contribution

Développé avec ❤️ par **Guelichweb**. 
Pour toute assistance technique, contactez l'équipe via [offre.guelichweb.online](https://offre.guelichweb.online/).

*SMD version 1.0.0*
