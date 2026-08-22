import "@supabase/functions-js/edge-runtime.d.ts";

import { withSupabase } from "@supabase/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return Response.json(body, {
        status,
        headers: corsHeaders,
    });
}

const handleAuthenticatedRequest = withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
        return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const userId = ctx.userClaims?.id;

    if (!userId) {
        return jsonResponse({ error: "Unable to identify the signed-in user." }, 401);
    }

    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
        console.error("Failed to delete user:", error);

        return jsonResponse({ error: "Unable to delete account." }, 500);
    }

    return jsonResponse({ success: true });
});

export default {
    async fetch(req: Request) {
        if (req.method === "OPTIONS") {
            return new Response("ok", {
                headers: corsHeaders,
            });
        }

        const response = await handleAuthenticatedRequest(req);
        const headers = new Headers(response.headers);

        Object.entries(corsHeaders).forEach(([name, value]) => {
            headers.set(name, value);
        });

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    },
};
