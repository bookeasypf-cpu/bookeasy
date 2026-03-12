import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireMerchant() {
  const user = await requireAuth();
  if (user.role !== "MERCHANT") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
