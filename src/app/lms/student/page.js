import { redirect } from "next/navigation";

export default function StudentRootPage() {
  redirect("/lms/student/dashboard");
}
