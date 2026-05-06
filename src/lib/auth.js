import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export { authOptions };
export const getAuthSession = () => getServerSession(authOptions);

