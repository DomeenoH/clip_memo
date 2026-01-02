export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const password = body.password;

        if (!password) {
            return new Response(JSON.stringify({ error: "Password required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Get the stored password hash from environment variable
        let storedHash = env.AUTH_PASSWORD_HASH;
        if (!storedHash) {
            console.error("AUTH_PASSWORD_HASH environment variable not set");
            return new Response(JSON.stringify({ error: "Server configuration error" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Normalize stored hash
        storedHash = storedHash.trim().toLowerCase();

        // Compute SHA-256 hash of the provided password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Compare hashes
        if (hashHex !== storedHash) {
            console.log(`Auth failed. Computed: ${hashHex.substring(0, 6)}..., Stored: ${storedHash.substring(0, 6)}...`);
            return new Response(JSON.stringify({ error: "Invalid password" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Generate a token for device memory
        // Token = timestamp + "." + HMAC(timestamp, storedHash)
        const timestamp = Date.now().toString();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(storedHash),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(timestamp));
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");
        const token = `${timestamp}.${signatureHex}`;

        return new Response(JSON.stringify({ success: true, token }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        console.error("Auth error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// Verify token endpoint
export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return new Response(JSON.stringify({ valid: false }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const storedHash = env.AUTH_PASSWORD_HASH;
        if (!storedHash) {
            return new Response(JSON.stringify({ valid: false }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Parse token
        const parts = token.split(".");
        if (parts.length !== 2) {
            return new Response(JSON.stringify({ valid: false }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const [timestamp, signature] = parts;

        // Verify HMAC signature
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

        const valid = signature === expectedHex;

        return new Response(JSON.stringify({ valid }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ valid: false }), {
            headers: { "Content-Type": "application/json" },
        });
    }
}
