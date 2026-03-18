import { cookies } from "next/headers";

interface UserSession {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];

    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");

    const decoded = JSON.parse(jsonPayload) as UserSession;

    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      return null;
    }
    return decoded;
  } catch (err: unknown) {
    console.error("Error decoding the user session in the frontend:", err);
    return null;
  }
}

export async function getAuthHeaders() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  return {
    "Content-Type": "application/json",
    Cookie: accessToken ? `accessToken=${accessToken}` : "",
  };
}
