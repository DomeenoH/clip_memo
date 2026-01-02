
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    // Re-verify token (simple check, ideally reuse logic from auth.js or shared middleware)
    // To keep it clean, we'll do a basic check or just check if the user "knows" the password hash indirectly?
    // Actually, `auth.js` verifies the token content. We should ideally verify it here.
    // For now, let's assume if the client sends a token, we verified it in the frontend gate.
    // BUT backend must verify. We will duplicate verification logic for robustness or import it if possible? 
    // Importing in Pages Functions can be tricky without a build step.
    // We will duplicate the critical verification step: HMAC check.

    // HOWEVER, we need the stored hash.
    const storedHash = env.AUTH_PASSWORD_HASH;
    if (!storedHash) return new Response("Config Error", { status: 500 });

    if (!await verifyToken(token, storedHash)) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Key Strategy: Single global key for now as per plan
    const notes = await env.NOTES_STORE.get("global_notes");

    return new Response(notes || "[]", {
        headers: { "Content-Type": "application/json" }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json(); // { token, notes }
    const { token, notes } = body;

    const storedHash = env.AUTH_PASSWORD_HASH;
    if (!await verifyToken(token, storedHash)) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Basic validation
    if (!Array.isArray(notes)) {
        return new Response("Invalid data", { status: 400 });
    }

    await env.NOTES_STORE.put("global_notes", JSON.stringify(notes));

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}

// Helper to verify token (duplicated from auth.js logic essentially)
async function verifyToken(token, storedHash) {
    if (!token || !storedHash) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [timestamp, signature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(storedHash),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const expectedBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(timestamp));
    const expectedArray = Array.from(new Uint8Array(expectedBuffer));
    const expectedHex = expectedArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return signature === expectedHex;
}
