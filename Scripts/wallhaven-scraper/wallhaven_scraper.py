import requests
import os

# -------------------------
# SETTINGS
# -------------------------
api_key = ""  # Optional: API key for NSFW access


# -------------------------
# FUNCTIONS
# -------------------------
def download_wallpapers(search_query="", search_categories="100", search_purity="100", search_sorting="toplist", pages=1):
    api_url = "https://wallhaven.cc/api/v1/search"
    website_url = "https://wallhaven.cc/search"

    base_name = search_query if search_query else search_sorting
    base_dir = os.path.expanduser(f"~/Downloads/Wallhaven/{base_name}")
    os.makedirs(base_dir, exist_ok=True)

    for page in range(1, pages + 1):
        params = {
            "q": search_query,
            "categories": search_categories,
            "purity": search_purity,
            "atleast": "3440x1440",
            "sorting": search_sorting,
            "page": page,
        }

        # Include API key only if NSFW
        if search_purity == "111" and api_key:
            params["apikey"] = api_key

        api_full_url = requests.Request("GET", api_url, params=params).prepare().url
        website_full_url = requests.Request("GET", website_url, params=params).prepare().url

        print(f"\n🌐 Scraping page {page}: {api_full_url}")

        try:
            response = requests.get(api_url, params=params)
            response.raise_for_status()
            data = response.json().get("data", [])
        except Exception as e:
            print(f"❌ Error accessing API: {e}")
            break

        if not data:
            print("⚠️ No wallpapers found for this search.")
            continue

        for wallpaper in data:
            img_url = wallpaper["path"]
            file_name = os.path.join(base_dir, os.path.basename(img_url))

            if os.path.exists(file_name):
                print(f"⏭️ Skipping (already exists): {file_name}")
                continue

            print(f"⬇️ Downloading {img_url} -> {file_name}")
            img_data = requests.get(img_url).content
            with open(file_name, "wb") as f:
                f.write(img_data)

    print(f"\n✈️ Website URL: {website_full_url}")
    print(f"\n✅ Done! Wallpapers saved in {base_dir}")


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    print("📂 Select an option:")
    print("1. Latest wallpapers")
    print("2. Toplist wallpapers")
    print("3. Random wallpapers")
    print("4. Manual search")

    choice = input("\nEnter number: ").strip()

    if choice in ["1", "2", "3"]:
        search_sorting = {"1": "date_added", "2": "toplist", "3": "random"}[choice]
        search_query = ""  # No query, fetch general
        search_purity = input("🌶️ Purity level (100=SFW | 010=Sketchy | 111=NSFW) [default 100]: ").strip() or "100"
        if search_purity == "111" and not api_key:
            print("❌ NSFW (111) requires a valid API key. Defaulting to 100 (SFW).")
            search_purity = "100"
        pages = int(input("📄 How many pages to scrape? (1 page ≈ 24 wallpapers) [default 1]: ") or "1")
    else:
        search_query = input("🔍 Enter search term: ").strip()
        search_purity = input("🌶️ Purity level (100=SFW | 010=Sketchy | 111=NSFW) [default 100]: ").strip() or "100"
        if search_purity == "111" and not api_key:
            print("❌ NSFW (111) requires a valid API key. Defaulting to 100 (SFW).")
            search_purity = "100"
        search_sorting = input("💡 Sorting (relevance | random | views | favorites | toplist) [default toplist]: ").strip() or "toplist"
        pages = int(input("📄 How many pages to scrape? (1 page ≈ 24 wallpapers) [default 1]: ") or "1")

    download_wallpapers(search_query, search_purity=search_purity, search_sorting=search_sorting, pages=pages)
