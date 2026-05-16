"use server"

import { UserService } from "@/services/user.service";
import { encrypt, hashPassword, comparePassword, setSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signupAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signupSchema.safeParse({ name, email, password });

  if (!validatedFields.success) {
    return { error: "Invalid fields provided." };
  }

  try {
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      return { error: "User with this email already exists." };
    }

    const hashedPassword = await hashPassword(password);
    const user = await UserService.createUser({
      name,
      email,
      password: hashedPassword,
      avatar: `https://avatar.vercel.sh/${email}.png`,
    });

    const token = await encrypt({ userId: user.id, email: user.email });
    await setSession(token);

    return { success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, geminiApiKey: user.geminiApiKey } };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { error: "Invalid email or password." };
  }

  try {
    const user = await UserService.findByEmail(email);
    if (!user) {
      return { error: "Invalid credentials." };
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return { error: "Invalid credentials." };
    }

    const token = await encrypt({ userId: user.id, email: user.email });
    await setSession(token);

    return { success: true, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, geminiApiKey: user.geminiApiKey } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Failed to sign in. Please try again." };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
