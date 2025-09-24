import requests
import os
import json

# -------------------------
# SETTINGS
# -------------------------
api_key = ""  # Optional: API key for NSFW access
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "wallhaven_config.json")


# -------------------------
# CONFIG LOAD / SAVE
# -------------------------
def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    # Default config
    return {
        "categories": "100",
        "purity": "100",
        "sorting": "toplist",
        "topRange": "1M",
        "atleast": "1920x1080",
        "resolutions": "",
        "ratios": "",
        "pages": 1,
    }


def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)


# -------------------------
# HELPER FUNCTIONS
# -------------------------
CATEGORY_MAPPING = {"g": "100", "a": "010", "p": "001"}
PURITY_MAPPING = {"s": "100", "k": "010", "n": "001"}


def categories_to_letters(val):
    letters = ""
    if val[0] == "1":
        letters += "g"
    if val[1] == "1":
        letters += "a"
    if val[2] == "1":
        letters += "p"
    return letters or "None"


def letters_to_categories(letters):
    val = ["0", "0", "0"]
    if "g" in letters:
        val[0] = "1"
    if "a" in letters:
        val[1] = "1"
    if "p" in letters:
        val[2] = "1"
    return "".join(val)


def purity_to_letters(val):
    letters = ""
    if val[0] == "1":
        letters += "s"
    if val[1] == "1":
        letters += "k"
    if val[2] == "1":
        letters += "n"
    return letters or "None"


def letters_to_purity(letters):
    val = ["0", "0", "0"]
    if "s" in letters:
        val[0] = "1"
    if "k" in letters:
        val[1] = "1"
    if "n" in letters:
        val[2] = "1"
    return "".join(val)


# -------------------------
# DOWNLOAD FUNCTION
# -------------------------
def download_wallpapers(
    search_query="",
    search_categories="100",
    search_purity="100",
    search_sorting="toplist",
    pages=1,
    topRange=None,
    atleast=None,
    resolutions=None,
    ratios=None,
):
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
            "sorting": search_sorting,
            "page": page,
        }

        if search_sorting == "toplist" and topRange:
            params["topRange"] = topRange
        if resolutions:  # Exact resolution takes priority
            params["resolutions"] = resolutions
        else:
            params["atleast"] = atleast
        if ratios:
            params["ratios"] = ratios
        if search_purity[2] == "1" and api_key:  # Only include API key if NSFW enabled
            params["apikey"] = api_key

        api_full_url = requests.Request("GET", api_url, params=params).prepare().url
        website_full_url = requests.Request("GET", website_url, params=params).prepare().url

        print(f"\n🌐 Scraping page {page}: {api_full_url}")

        try:
            response = requests.get(api_url, params=params)
            response.raise_for_status()
            data = response.json().get("data", [])
        except Exception as e:
            print(f"❌ Error accessing API - NO NSFW for you 😈: {e}")
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
            try:
                img_data = requests.get(img_url).content
                with open(file_name, "wb") as f:
                    f.write(img_data)
            except Exception as e:
                print(f"❌ Failed to download {img_url}: {e}")

    print(f"\n✈️ Website URL: {website_full_url}")
    print(f"\n✅ Done! Wallpapers saved in {base_dir}")


# -------------------------
# UPDATE A SINGLE FIELD
# -------------------------
def update_field(config, field, prompt, cast=str, letters_mapping=None, to_letters=None, to_values=None):
    current = config.get(field, "")
    current_display = to_letters(current) if current and to_letters else current

    val = input(f"{prompt} [current: {current_display}] (Enter=keep | c=clear): ").strip()

    if val.lower() == "c":
        config[field] = "" if field in ["atleast", "resolutions"] else current
        print(f"🗑️ Cleared '{field}'.")
    elif val:
        if letters_mapping and to_values:
            config[field] = to_values(val.lower())
        else:
            try:
                config[field] = cast(val)
            except ValueError:
                print("⚠️ Invalid input, keeping old value.")

    # Ensure only one of 'atleast' or 'resolutions' is set
    if field == "resolutions" and config[field] and config.get("atleast"):
        print("⚠️ Clearing 'Minimum resolution' because exact resolutions were set.")
        config["atleast"] = ""
    elif field == "atleast" and config[field] and config.get("resolutions"):
        print("⚠️ Clearing 'Exact resolutions' because minimum resolution was set.")
        config["resolutions"] = ""


# -------------------------
# CONFIGURE PARAMETERS MENU
# -------------------------
def configure_parameters(config):
    print("\n⚙️ Configure important parameters (required before running 1/2/3/4)")

    update_field(
        config,
        "categories",
        "📂 Categories: g = General | a = Anime | p = People (combine e.g., 'ga')",
        letters_mapping=CATEGORY_MAPPING,
        to_letters=categories_to_letters,
        to_values=letters_to_categories,
    )
    update_field(
        config,
        "purity",
        "🌶️ Purity: s = SFW | k = Sketchy | n = NSFW (combine e.g., 'sn')",
        letters_mapping=PURITY_MAPPING,
        to_letters=purity_to_letters,
        to_values=letters_to_purity,
    )
    update_field(config, "sorting", "💡 Sorting (date_added | relevance | random | views | favorites | toplist)")
    if config["sorting"] == "toplist":
        update_field(config, "topRange", "📊 Top range (1d | 1w | 1M | 3M | 6M | 1y)")
    update_field(config, "atleast", "🖥️ Minimum resolution (e.g., 1920x1080)")
    update_field(config, "resolutions", "🖥️ Exact resolutions (comma-separated, e.g., 1920x1080,2560x1440)")
    update_field(config, "ratios", "📐 Aspect ratios (comma-separated, e.g., 16x9,21x9,4x3,32x9, landscape | portrait)")
    update_field(config, "pages", "📄 Pages", int)

    save_config(config)
    print("✅ Parameters saved!")


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    config = load_config()

    while True:
        print("\n📂 Select an option:")
        print("0. Configure parameters (categories, purity, sorting, resolutions, etc.)")
        print("1. Latest wallpapers")
        print("2. Toplist wallpapers")
        print("3. Random wallpapers")
        print("4. Manual search")

        choice = input("\nEnter number: ").strip()

        if choice == "0":
            configure_parameters(config)
            continue

        if choice in ["1", "2", "3"]:
            search_sorting = {"1": "date_added", "2": "toplist", "3": "random"}[choice]
            search_query = ""  # general search
        elif choice == "4":
            search_query = input("🔍 Enter search term: ").strip()
            search_sorting = config["sorting"]
        else:
            print("⚠️ Invalid option, try again.")
            continue

        # Resolution conflict check
        if config.get("atleast") and config.get("resolutions"):
            print("⚠️ You have set both 'Minimum resolution' (atleast) and 'Exact resolution'.")
            print("     Only one will be used. Exact resolution takes priority.")
            choice_res = input("Do you want to clear 'Minimum resolution' and continue? (y/n): ").strip().lower()
            if choice_res == "y":
                config["atleast"] = ""
            else:
                print("Please adjust your settings in option 0 and rerun.")
                continue

        # Download
        download_wallpapers(
            search_query,
            search_categories=config["categories"],
            search_purity=config["purity"],
            search_sorting=search_sorting,
            pages=config["pages"],
            topRange=config.get("topRange"),
            atleast=config.get("atleast"),
            resolutions=config.get("resolutions"),
            ratios=config.get("ratios"),
        )

        # Rerun prompt
        again = input("\n🔄 Rerun with same settings? (y=again | c=change settings | q=quit): ").strip().lower()
        if again == "y":
            continue
        elif again == "c":
            configure_parameters(config)
        else:
            print("👋 Goodbye!")
            break
