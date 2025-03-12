import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export function GET(req: NextRequest) {
    // Expects only alphanumeric characters
    const nonce = crypto.randomUUID().replace(/-/g, "");

    // The nonce should be stored somewhere that is not tamperable by the client
    // Optionally you can HMAC the nonce with a secret key stored in your environment
    cookies().set("siwe", nonce, { secure: true });
    return NextResponse.json({ nonce });
}
