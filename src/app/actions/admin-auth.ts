"use server";

export async function validateAdminPassword(password: string) {
  // In a real production environment, this would check against process.env.ADMIN_PASSWORD
  // For this elite environment, we use the specified master password
  const masterPassword = process.env.ADMIN_PASSWORD || "elite_admin_2025";

  if (password === masterPassword) {
    return { success: true };
  }

  return { success: false, error: "Invalid master password" };
}
