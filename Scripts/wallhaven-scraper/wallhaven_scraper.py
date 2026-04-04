import json
import os
import requests

# -------------------------
# SETTINGS
# -------------------------
api_key = ""  # Optional: API key for NSFW access
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "wallhaven_config.json")

VALID_SORTING = {"relevance", "random", "date_added", "views", "favorites", "toplist"}
VALID_TOP_RANGES = {"1d", "3d", "1w", "1M", "3M", "6M", "1y"}

CATEGORY_LETTERS = {"g", "a", "p"}
PURITY_LETTERS = {"s", "k", "n"}


# -------------------------
# DEFAULT CONFIG
# -------------------------
def get_default_config():
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


# -------------------------
# CONFIG LOAD / SAVE
# -------------------------
def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                loaded = json.load(f)

            config = get_default_config()
            if isinstance(loaded, dict):
                config.update(loaded)
            return config
        except (json.JSONDecodeError, OSError) as e:
            print(f"⚠️ Failed to load config, using defaults: {e}")

    return get_default_config()


def save_config(config):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)


# -------------------------
# HELPER FUNCTIONS
# -------------------------
def categories_to_letters(val):
    val = str(val)
    if len(val) != 3 or any(ch not in "01" for ch in val):
        return "Not set"

    letters = ""
    if val[0] == "1":
        letters += "g"
    if val[1] == "1":
        letters += "a"
    if val[2] == "1":
        letters += "p"

    return letters if letters else "None enabled"


def purity_to_letters(val):
    val = str(val)
    if len(val) != 3 or any(ch not in "01" for ch in val):
        return "Not set"

    letters = ""
    if val[0] == "1":
        letters += "s"
    if val[1] == "1":
        letters += "k"
    if val[2] == "1":
        letters += "n"

    return letters if letters else "None enabled"


def format_categories_display(val):
    return categories_to_letters(val)


def format_purity_display(val):
    return purity_to_letters(val)


def parse_categories_input(user_input):
    user_input = user_input.strip().lower()

    if not user_input:
        raise ValueError("Enter at least one letter (g, a, p).")

    letters = set(user_input)

    if not letters.issubset({"g", "a", "p"}):
        raise ValueError("Only use letters: g (General), a (Anime), p (People).")

    value = ["0", "0", "0"]

    if "g" in letters:
        value[0] = "1"
    if "a" in letters:
        value[1] = "1"
    if "p" in letters:
        value[2] = "1"

    return "".join(value)


def parse_purity_input(user_input):
    user_input = user_input.strip().lower()

    if not user_input:
        raise ValueError("Enter at least one letter (s, k, n).")

    letters = set(user_input)

    if not letters.issubset({"s", "k", "n"}):
        raise ValueError("Only use letters: s (SFW), k (Sketchy), n (NSFW).")

    value = ["0", "0", "0"]

    if "s" in letters:
        value[0] = "1"
    if "k" in letters:
        value[1] = "1"
    if "n" in letters:
        value[2] = "1"

    return "".join(value)


def parse_sorting_input(user_input):
    value = user_input.strip().lower()
    if value not in VALID_SORTING:
        raise ValueError(f"Invalid sorting. Choose one of: {', '.join(sorted(VALID_SORTING))}")
    return value


def parse_top_range_input(user_input):
    value = user_input.strip()
    if value not in VALID_TOP_RANGES:
        raise ValueError(f"Invalid topRange. Choose one of: {', '.join(VALID_TOP_RANGES)}")
    return value


def parse_pages_input(user_input):
    value = int(user_input)
    if value < 1:
        raise ValueError("Pages must be at least 1.")
    return value


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

    last_website_url = ""

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

        if resolutions:
            params["resolutions"] = resolutions
        elif atleast:
            params["atleast"] = atleast

        if ratios:
            params["ratios"] = ratios

        if len(search_purity) == 3 and search_purity[2] == "1" and api_key:
            params["apikey"] = api_key

        api_full_url = requests.Request("GET", api_url, params=params).prepare().url
        website_full_url = requests.Request("GET", website_url, params=params).prepare().url
        last_website_url = website_full_url

        print(f"\n🌐 Scraping page {page}: {api_full_url}")

        try:
            response = requests.get(api_url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json().get("data", [])
        except Exception as e:
            print(f"❌ Error accessing API: {e}")
            break

        if not data:
            print("⚠️ No wallpapers found for this search.")
            continue

        for wallpaper in data:
            img_url = wallpaper.get("path")
            if not img_url:
                print("⚠️ Skipping wallpaper with missing image path.")
                continue

            file_name = os.path.join(base_dir, os.path.basename(img_url))

            if os.path.exists(file_name):
                print(f"⏭️ Skipping (already exists): {file_name}")
                continue

            print(f"⬇️ Downloading {img_url} -> {file_name}")

            try:
                img_response = requests.get(img_url, timeout=30)
                img_response.raise_for_status()

                with open(file_name, "wb") as f:
                    f.write(img_response.content)
            except Exception as e:
                print(f"❌ Failed to download {img_url}: {e}")

    if last_website_url:
        print(f"\n✈️ Website URL: {last_website_url}")
    print(f"\n✅ Done! Wallpapers saved in {base_dir}")


# -------------------------
# UPDATE HELPERS
# -------------------------
def update_field(config, field, prompt, parser=None, display_formatter=None, clearable=False):
    current = config.get(field, "")
    current_display = display_formatter(current) if display_formatter else (current if current != "" else "Not set")

    val = input(f"{prompt}\n[current: {current_display}] (Enter=keep{' | c=clear' if clearable else ''}): ").strip()

    if val == "":
        return

    if clearable and val.lower() == "c":
        config[field] = ""
        print(f"🗑️ Cleared '{field}'.")
        return

    try:
        config[field] = parser(val) if parser else val
    except ValueError as e:
        print(f"⚠️ {e} Keeping old value.")
        return

    if field == "resolutions" and config.get("resolutions") and config.get("atleast"):
        print("⚠️ Clearing 'Minimum resolution' because exact resolutions were set.")
        config["atleast"] = ""

    if field == "atleast" and config.get("atleast") and config.get("resolutions"):
        print("⚠️ Clearing 'Exact resolutions' because minimum resolution was set.")
        config["resolutions"] = ""


# -------------------------
# CONFIGURE PARAMETERS MENU
# -------------------------
def configure_parameters(config):
    print("\n⚙️ Configure parameters\n")

    update_field(
        config,
        "categories",
        "📂 Categories\n"
        "Choose wallpaper types using letters:\n"
        "  g = General\n"
        "  a = Anime\n"
        "  p = People\n"
        "\nExamples:\n"
        "  g\n"
        "  ga\n"
        "  gap\n",
        parser=parse_categories_input,
        display_formatter=format_categories_display,
    )
    print()

    update_field(
        config,
        "purity",
        "🧹 Purity (content rating)\n"
        "Choose content rating using letters:\n"
        "  s = SFW\n"
        "  k = Sketchy\n"
        "  n = NSFW\n"
        "\nExamples:\n"
        "  s\n"
        "  sk\n"
        "  skn\n",
        parser=parse_purity_input,
        display_formatter=format_purity_display,
    )
    print()

    update_field(
        config,
        "sorting",
        "📊 Sorting method\nOptions:\n  relevance\n  random\n  date_added\n  views\n  favorites\n  toplist",
        parser=parse_sorting_input,
    )
    print()

    if config["sorting"] == "toplist":
        update_field(
            config,
            "topRange",
            "📅 Toplist time range\nOnly used when sorting = toplist.\nOptions:\n  1d | 3d | 1w | 1M | 3M | 6M | 1y",
            parser=parse_top_range_input,
            clearable=True,
        )
        print()

    update_field(
        config,
        "atleast",
        "📏 Minimum resolution\nExamples:\n  1920x1080\n  2560x1440\n  3840x2160",
        clearable=True,
    )
    print()

    update_field(
        config,
        "resolutions",
        "💻 Exact resolutions (comma-separated)\nExamples:\n  1920x1080\n  2560x1440,3840x2160",
        clearable=True,
    )
    print()

    update_field(
        config,
        "ratios",
        "📐 Aspect ratios or orientation\nExamples:\n  16x9\n  21x9\n  16x9,21x9\n  landscape\n  portrait",
        clearable=True,
    )
    print()

    update_field(
        config,
        "pages",
        "📄 Number of pages to fetch\nEach page is roughly 24 wallpapers.\nExample:\n  3",
        parser=parse_pages_input,
    )
    print()

    save_config(config)
    print("✅ Parameters saved!\n")


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    config = load_config()

    while True:
        print("\n📂 Select an option:")
        print("0. Configure parameters")
        print("1. Latest wallpapers")
        print("2. Toplist wallpapers")
        print("3. Random wallpapers")
        print("4. Manual search")

        choice = input("\nEnter number: ").strip()

        if choice == "0":
            configure_parameters(config)
            continue

        if choice in {"1", "2", "3"}:
            search_sorting = {
                "1": "date_added",
                "2": "toplist",
                "3": "random",
            }[choice]
            search_query = ""
        elif choice == "4":
            search_query = input("🔍 Enter search term: ").strip()
            search_sorting = config["sorting"]
        else:
            print("⚠️ Invalid option, try again.")
            continue

        if config.get("atleast") and config.get("resolutions"):
            print("⚠️ You have both 'Minimum resolution' and 'Exact resolutions' set.")
            print("   Exact resolutions will take priority.")
            choice_res = input("Clear 'Minimum resolution' and continue? (y/n): ").strip().lower()

            if choice_res == "y":
                config["atleast"] = ""
            else:
                print("Please adjust your settings in option 0.")
                continue

        download_wallpapers(
            search_query=search_query,
            search_categories=config["categories"],
            search_purity=config["purity"],
            search_sorting=search_sorting,
            pages=config["pages"],
            topRange=config.get("topRange"),
            atleast=config.get("atleast"),
            resolutions=config.get("resolutions"),
            ratios=config.get("ratios"),
        )

        again = input("\n🔄 Rerun with same settings? (y=again | c=change settings | q=quit): ").strip().lower()

        if again == "y":
            continue
        if again == "c":
            configure_parameters(config)
            continue

        print("👋 Goodbye!")
        break
