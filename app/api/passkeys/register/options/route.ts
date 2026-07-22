import { NextResponse } from "next/server"

function randomBase64Url(bytes: number): string {
  const arr = new Uint8Array(bytes)
  // Node's global crypto is available in Next.js route handlers.
  crypto.getRandomValues(arr)
  let str = ""
  for (const b of arr) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// Returns WebAuthn PublicKeyCredentialCreationOptions with base64url-encoded
// ArrayBuffer fields (challenge, user.id). The client must decode them before
// passing to navigator.credentials.create().
export async function POST(request: Request) {
  const url = new URL(request.url)
  const rpId = url.hostname // "localhost" in dev

  const options = {
    challenge: randomBase64Url(32),
    rp: {
      id: rpId,
      name: "Linear",
    },
    user: {
      id: randomBase64Url(16),
      name: "theta.computer01@gmail.com",
      displayName: "Theta Computer",
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
    timeout: 60_000,
    attestation: "none",
  }

  return NextResponse.json(options)
}
