# Wallhaven Wallpaper Scraper

A Python script to download wallpapers from [Wallhaven](https://wallhaven.cc/) easily. You can fetch wallpapers using **latest**, **toplist**, **random**, or perform a **manual search** with custom search terms, purity, sorting, and resolution.

---


## Features

- Choose **Latest**, **Toplist**, or **Random** wallpapers automatically.  
- Perform **manual search** with custom keywords.  
- Filter wallpapers by **purity** (SFW, Sketchy, NSFW).  
- Automatically skips duplicates and saves wallpapers to organized folders.  
- Supports **custom minimum resolution** for downloaded wallpapers.  
- NSFW content requires a valid **API key**.

---


## Requirements

- Python 3.x  
<!-- - `requests` library (`pip install requests`)   -->

---


## Usage

1. Clone or download this repository.  
2. Open `wallhaven_scraper.py` and optionally add your **API key** at the top to access NSFW content:  

```python
api_key = "YOUR_API_KEY"
```

3. Run the script:  
```python
python3 wallhaven_scraper.py
```

4. Follow the prompts:
- **Select an option:**
    - Latest wallpapers
    - Toplist wallpapers
    - Random wallpapers
    - Manual search
- **Enter search term** (manual search only).
- **Set purity:**
    - `100` = SFW (Safe For Work)
    - `010` = Sketchy (Semi Not Safe For Work)
    - `111` = NSFW (Not Safe For Work)
- **Choose sorting** (manual search only): `relevance`, `random`, `views`, `favorites`, `toplist`
- **Specify number of pages** (1 page ≈ 24 wallpapers).

5. Wallpapers will be downloaded to:
```javascript
~/Downloads/Wallhaven/<search_term_or_sorting>/
```


## Notes
- If your search term yields limited results, try using a **more specific keyword**.
- Update the `atleast` parameter in the script if you want to **download a different minimum resolution**.
- NSFW content requires a valid API key. Create an account at [Wallhaven](https://wallhaven.cc/) to access your key.


## Example
Fetch **latest SFW wallpapers**, 2 pages:
```vbnet
📂 Select an option:
1. Latest wallpapers
2. Toplist wallpapers
3. Random wallpapers
4. Manual search
Enter number: 1
🌶️ Purity level (100=SFW | 010=Sketchy | 111=NSFW) [default 100]: 100
📄 How many pages to scrape? (1 page ≈ 24 wallpapers) [default 1]: 2
```


---