const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// =========================
// File paths
// =========================
const rootDir = path.join(__dirname, "..");
const dataPath = path.join(rootDir, "data", "cv.yaml");
const templatePath = path.join(rootDir, "templates", "default.html");
const outputDir = path.join(rootDir, "output");
const outputPath = path.join(outputDir, "preview.html");

// =========================
// Read input files
// =========================
const data = yaml.load(fs.readFileSync(dataPath, "utf8"));
let template = fs.readFileSync(templatePath, "utf8");

// Ensure output folder exists
fs.mkdirSync(outputDir, { recursive: true });

// =========================
// Small helper
// =========================
const safe = (value) => value || "";

// =========================
// Build HTML for skills
// =========================
const skillsHtml = (data.skills || []).map((skill) => `<li>${skill}</li>`).join("");

// =========================
// Build HTML for projects
// =========================
const projectsHtml = (data.projects || [])
    .map(
        (project) => `
      <div class="job">
        <div class="job-header">
          <span>${safe(project.name)}</span>
        </div>
        <p>${safe(project.description)}</p>
      </div>
    `,
    )
    .join("");

// =========================
// Build HTML for experience
// =========================
const experienceHtml = (data.experience || [])
    .map(
        (job) => `
      <div class="job">
        
        <div class="job-top">
          <span class="job-role">${safe(job.role)}</span>
          <span class="job-date">${safe(job.start)} - ${safe(job.end)}</span>
        </div>

        <div class="job-sub">
          ${safe(job.company)} - ${safe(job.location)} - ${safe(job.type)}
        </div>

        <p>${job.info}</p>

        <ul>
          ${(job.bullets || []).map((bullet) => `<li>${bullet}</li>`).join("")}
        </ul>

      </div>
    `,
    )
    .join("");

// =========================
// Build HTML for education
// =========================
const educationHtml = (data.education || [])
    .map(
        (item) => `
      <div class="job">
        <div class="job-header">
          <span>${safe(item.institution)}</span>
          <span>${safe(item.start)} - ${safe(item.end)}</span>
        </div>
        <p>${safe(item.course)}</p>
      </div>
    `,
    )
    .join("");

// =========================
// Build HTML for certifications
// =========================
const certificationsHtml = (data.certifications || [])
    .map(
        (cert) => `
        <span class="qual-title">${cert.title}</span>
        <p class="qual-meta">${cert.issuer} | ${cert.issued}</p>
    `,
    )
    .join("");

// =========================
// Replace template placeholders
// =========================
template = template
    .replace("{{name}}", safe(data.name))
    .replace("{{title}}", safe(data.title))
    .replace("{{summary}}", safe(data.summary))

    // Contact
    .replace("{{email}}", safe(data.contact?.email))
    .replace("{{phone}}", safe(data.contact?.phone))
    .replace("{{linkedin}}", safe(data.contact?.linkedin))
    .replace("{{location}}", safe(data.contact?.location))
    .replace("{{website}}", safe(data.website))

    // Section HTML
    .replace("{{skills}}", skillsHtml)
    .replace("{{projects}}", projectsHtml)
    .replace("{{experience}}", experienceHtml)
    .replace("{{education}}", educationHtml)
    .replace("{{certifications}}", certificationsHtml);

// =========================
// Write final preview file
// =========================
fs.writeFileSync(outputPath, template);
console.log("Created output/preview.html");
