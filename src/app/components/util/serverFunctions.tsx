'use server'
import { signIn, signOut, auth } from "@/auth";

export async function GoogleLogin() {
    'use server'
    await signIn("google", {redirectTo: "/app"})
}

export async function Logout() {
    'use server'
    await signOut({redirectTo: "/login"});
}

export async function getSession() {
    const session = await auth();
    return session;
}