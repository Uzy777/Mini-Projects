export async function GET(request: Request) {
    const url = new URL(request.url);

    const query = url.searchParams.get("q");
    const categories = url.searchParams.get("categories") ?? "111";
    const apiKey = request.headers.get("X-API-Key");

    if (!query?.trim()) {
        return Response.json({ error: "A search query is required." }, { status: 400 });
    }

    const isValidCategoryParameter = /^[01]{3}$/.test(categories) && categories !== "000";

    if (!isValidCategoryParameter) {
        return Response.json({ error: "Invalid category selection." }, { status: 400 });
    }

    const params = new URLSearchParams({
        q: query.trim(),
        categories,
        purity: "100",
        sorting: "relevance",
    });

    const wallhavenHeaders = new Headers();

    if (apiKey) {
        wallhavenHeaders.set("X-API-Key", apiKey);
    }

    try {
        const response = await fetch(`https://wallhaven.cc/api/v1/search?${params.toString()}`, {
            headers: wallhavenHeaders,
        });

        if (!response.ok) {
            return Response.json({ error: "Wallhaven could not complete the search." }, { status: response.status });
        }

        const result = await response.json();

        return Response.json(result);
    } catch {
        return Response.json({ error: "Could not connect to Wallhaven." }, { status: 500 });
    }
}
