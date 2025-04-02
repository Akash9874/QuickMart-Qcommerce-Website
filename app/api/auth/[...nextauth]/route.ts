import NextAuth from "next-auth";
import { authOptions } from "./auth";

// Explicitly set the handler for better error handling
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 