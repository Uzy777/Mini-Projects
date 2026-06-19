export async function GET(request: Request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query?.trim()) {
        return Response.json({ error: "A search query is required." }, { status: 400 });
    }

    const params = new URLSearchParams({
        q: query.trim(),
        purity: "100",
        sorting: "relevance",
    });

    try {
        const response = await fetch(`https://wallhaven.cc/api/v1/search?${params.toString()}`);

        if (!response.ok) {
            return Response.json({ error: "Wallhaven could not complete the search." }, { status: response.status });
        }

        const result = await response.json();

        return Response.json(result);
    } catch {
        return Response.json({ error: "Could not connect to Wallhaven." }, { status: 500 });
    }
}
