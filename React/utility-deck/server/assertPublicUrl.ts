import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

function isPublicIpAddress(address: string): boolean {
    const parsedAddress = ipaddr.process(address);

    return parsedAddress.range() === "unicast";
}

export async function assertPublicUrl(value: string): Promise<URL> {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Only HTTP and HTTPS URLs are supported.");
    }

    if (parsedUrl.username || parsedUrl.password) {
        throw new Error("URLs containing login details are not supported.");
    }

    const hostname = parsedUrl.hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();

    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
        throw new Error("Local network URLs are not allowed.");
    }

    if (ipaddr.isValid(hostname)) {
        if (!isPublicIpAddress(hostname)) {
            throw new Error("Private or reserved IP addresses are not allowed.");
        }

        return parsedUrl;
    }

    const resolvedAddresses = await lookup(hostname, {
        all: true,
        order: "verbatim",
    });

    if (resolvedAddresses.length === 0 || resolvedAddresses.some(({ address }) => !isPublicIpAddress(address))) {
        throw new Error("The URL does not resolve to a public address.");
    }

    return parsedUrl;
}
