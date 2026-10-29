# CV Studio

A local React + Tailwind CSS editor for the CV layout in `Scripts/cv-generator`. The HTML/CSS template and example YAML were copied into this project; the script project is unchanged.

## Run locally

```bash
cd React/cv-studio
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). For a production build, run `npm run build`; `dist/` contains static files suitable for later hosting.

## Use it

- Edit the fields under **Content**. Experience, project and qualification entries expand individually. Removing an entry offers **Undo** until you make another edit.
- Open **Templates** to choose **Original** (the unchanged default design), **Essential** (compact, single column), or **Editorial** (single column with serif headings). Switching layouts keeps your details.
- The sun/moon button changes the editor theme. It initially follows your device and remembers your choice. The CV itself always stays white.
- Select **Save PDF**, then choose **Save as PDF** in the browser print window. The continuous preview shows all your content; the print window shows the final page breaks. No paid service or server is needed.
- Under **File**, use **Import YAML / JSON** to open your existing `Scripts/cv-generator/data/cv.yaml` from your computer. The app starts with the example CV so personal contact details are not bundled into a public build.
- **File → Export YAML backup** saves portable CV data compatible with the original script. **Download HTML** saves the selected template as a standalone CV page. Theme and template preferences are stored separately in this browser.
- On smaller screens, switch between **Editor** and **Preview**. Preview offers **Fit** and **100%** zoom.
- Changes are saved to this browser's local storage and load on your next visit using the same browser and site address. Export a backup before clearing site data or switching devices.

No account, backend, analytics, or external API is used. If this project is hosted publicly, each visitor starts from the example and their draft stays in their own browser. Browser print settings can affect pagination; check the PDF preview before saving, especially for longer CVs.

## Parsing and accessibility

All templates export real text rather than a canvas or image. The new single-column layouts use standard section headings and keep their document reading order the same as their visual order. This follows the readable-text guidance in [Lever's resume parsing documentation](https://help.lever.co/s/article/Understanding-Resume-Parsing); it is not a guarantee of acceptance or ranking by every applicant tracking system. Follow the employer's requested file format.

Controls support keyboard use and visible focus, template choices use native radio inputs, and animations respect `prefers-reduced-motion`.

The source template includes project `bullets` in example YAML but does not display them. Imports and exports preserve those values; the editor shows only fields that appear in the CV.
