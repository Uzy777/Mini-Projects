export async function requestUrlToMarkdown(url: string) {
    return fetch("/api/url-to-markdown", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    });
}
