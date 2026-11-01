# CV editor

A local React + Tailwind CSS editor for the CV layout in `Scripts/cv-generator`. The HTML/CSS template and example YAML were copied into this project; the script project is unchanged.

## Run locally

```bash
cd React/cv-studio
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For a production build, run `npm run build`; `dist/` contains static files suitable for later hosting.

## Use it

- Focus a field to highlight its matching text in the preview. The preview scrolls to the relevant area, and highlights are excluded from PDFs.
- Start with a blank CV or use **File → Load example CV** for inspiration. Existing saved drafts and older YAML / JSON files retain their content.
- Use **Jump to section** to switch directly between included sections; **Your sections** always returns to the overview. The controls stay visible while the editor scrolls, and opening a different section starts at its top.
- Open **Edit CV → Your sections** to build your own structure. Contact, summary, experience, projects, education, certifications, skills, volunteering, languages and interests are all optional. Add only what you need; **Hide section** keeps its content so you can add it back later.
- Use the up/down controls to arrange sections. In Original and Structured, choose **Main** or **Sidebar** and reorder within each column. Single-column designs follow their displayed section order. A column with no visible content collapses automatically.
- Select a section to edit its heading and content. Add any number of **Custom sections** for free-form text, with shortcuts for Awards, Publications, References and Courses. Line breaks are preserved; custom text is treated as plain text, not HTML or Markdown.
- Empty sections and empty entries do not appear in the CV. Use each entry’s eye button to hide it without deleting it. Name, headline, photo, email, phone, location and individual online links also have visibility controls. All fields can be left blank.
- Edit the fields under **Edit CV**. Experience, project, education, certification, and volunteering entries expand individually, with controls to move or duplicate entries. Adding, moving, duplicating or removing an entry offers **Undo** until you make another edit. Section and list counts help you keep track of the content.
- Under **Contact → Online links**, choose a platform using the icon picker. Add URLs or supported usernames, change their order, and open valid links to check them. **Other link** supports a custom label. Existing LinkedIn, GitHub and website fields are carried over automatically; links remain clickable in the CV and PDF.
- Open **Design** to choose from six layouts: **Original** (two columns), **Essential** and **Editorial** (simple single columns), **Modern** (geometric header with an optional photo), **Structured** (information sidebar), and **Minimal** (section labels in the left margin). Switching layouts keeps your details.
- Pick an accent with the browser's colour picker or enter a six-digit hex code in **Design**. The colour applies to the editor controls and the CV. Very light or dark choices are adjusted where needed to keep text readable. Your choice is remembered in this browser.
- When **Modern** is selected, **Name & headline** shows an optional JPG, PNG, or WebP photo control. The app crops and resizes the photo before saving it in the local draft and YAML backup. Switching layouts hides the control and photo without deleting it.
- The sun/moon button changes the editor theme. It initially follows your device and remembers your choice. The CV paper stays white while its accent follows your colour choice.
- The preview shows separate A4 pages and the page count. **Save PDF** uses those same pages in the current tab's browser print window. Choose **Save as PDF** with A4 paper and 100% scale. No paid service or server is needed.
- Under **File**, use **Import YAML / JSON** to open your existing `Scripts/cv-generator/data/cv.yaml` from your computer. New drafts start blank; the bundled example uses fictional details.
- **File → Export YAML backup** saves portable CV data, including section order, headings, column choices, visibility and custom content for reimport into this editor. Hidden content is included in backups so it can be restored. The separate script does not honour this editor’s section or visibility settings; use this editor for matching PDF output. Theme, template, and accent preferences are stored separately in this browser.
- Backups include the full `links` list. The first LinkedIn, GitHub and Website entries also populate the legacy fields for the original script; additional platforms and custom labels are rendered by this editor.
- The editor and preview share the desktop workspace, with more room for editing. Fields and action rows adapt to the editor panel’s width. On smaller screens, switch between **Editor** and **Preview**. Preview offers **Fit** and **100%** zoom.
- Changes are saved to this browser's local storage and load on your next visit using the same browser and site address. Export a backup before clearing site data or switching devices.

No account, backend, analytics, or external API is used. If this project is hosted publicly, each visitor starts with a blank CV and their draft stays in their own browser. Browser print settings can affect pagination; check the PDF preview before saving, especially for longer CVs.

## Parsing and accessibility

All templates keep CV copy as real text rather than turning the page into an image. Essential and Editorial use the simplest single-column reading order. Modern and Minimal remain single-column but add more visual styling; Original and Structured use two columns. According to [Greenhouse's parsing guidance](https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse), columns and graphics can interfere with some resume parsers. A layout cannot guarantee acceptance or ranking by every applicant tracking system. Follow the employer's requested file format.

Controls support keyboard use and visible focus, template choices use native radio inputs, and animations respect `prefers-reduced-motion`.

Project `bullets` from example YAML now appear in the editor and CV.

## Checks

Run `npm test` for normalization, legacy-file import, backup round-trips, visibility, custom-section escaping, and ordering checks across all six renderers. Run `npm run build` for the production bundle.

Browser review should cover choosing and hiding sections, entry visibility, renaming, moving between columns, switching templates, reloading a draft, importing a backup, mobile navigation, and printing a long custom section over multiple A4 pages.

## Section workflow references

The optional-section workflow draws on [Novorésumé’s content-preserving layout controls](https://intercom.help/novoresume/en/articles/13106568-resume-using-the-layout-functionality-2-0), [FlowCV’s flexible content and layout choices](https://flowcv.com/), and [Resume.com’s section and entry ordering](https://www.resume.com/help/how-do-i-rearrange-sections-and-entries/). This editor uses keyboard-accessible move buttons and keeps these choices in the local CV draft and portable backup.
