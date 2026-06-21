const REST_COUNTRIES_URL = "https://api.restcountries.com/countries/v5";

const ALLOWED_QUERY_PARAMETERS = ["limit", "offset", "response_fields"];

export default async function handler(request, response) {
    if (request.method !== "GET") {
        response.setHeader("Allow", "GET");

        return response.status(405).json({
            errors: [
                {
                    message: "Method not allowed.",
                },
            ],
        });
    }

    const apiKey = process.env.REST_COUNTRIES_API_KEY;

    if (!apiKey) {
        return response.status(500).json({
            errors: [
                {
                    message: "REST_COUNTRIES_API_KEY is not configured.",
                },
            ],
        });
    }

    try {
        const upstreamUrl = new URL(REST_COUNTRIES_URL);

        for (const parameter of ALLOWED_QUERY_PARAMETERS) {
            const value = request.query?.[parameter];

            if (typeof value === "string" && value) {
                upstreamUrl.searchParams.set(parameter, value);
            }
        }

        const apiResponse = await fetch(upstreamUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        const responseBody = await apiResponse.text();

        response.setHeader("Content-Type", apiResponse.headers.get("content-type") || "application/json");

        response.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=86400");

        return response.status(apiResponse.status).send(responseBody);
    } catch (error) {
        console.error("REST Countries request failed:", error);

        return response.status(500).json({
            errors: [
                {
                    message: "Unable to retrieve countries.",
                },
            ],
        });
    }
}
