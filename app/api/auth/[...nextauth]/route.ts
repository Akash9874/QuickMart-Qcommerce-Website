import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";

// Export the handler functions directly instead of creating a variable
export const { GET, POST } = NextAuth(authOptions); 