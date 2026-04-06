const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const dataPath = path.join(__dirname, "..", "data", "cv.yaml");
const templatePath = path.join(__dirname, "..", "templates", "default.html");
const outputPath = path.join(__dirname, "..", "output", "preview.html");

const data = yaml.load(fs.readFileSync(dataPath, "utf8"));
let template = fs.readFileSync(templatePath, "utf8");

const skillsHtml = data.skills.map((skill) => `<li>${skill}</li>`).join("");

const projectsHtml = data.projects
    .map(
        (project) => `
      <div style="margin-bottom: 16px;">
        <strong>${project.name}</strong>
        <p>${project.description}</p>
      </div>
    `,
    )
    .join("");

template = template
    .replace("{{name}}", data.name)
    .replace("{{title}}", data.title)
    .replace("{{email}}", data.email)
    .replace("{{location}}", data.location)
    .replace("{{summary}}", data.summary)
    .replace("{{skills}}", skillsHtml)
    .replace("{{projects}}", projectsHtml);

// ensure output folder exists
fs.mkdirSync(path.join(__dirname, "..", "output"), { recursive: true });

fs.writeFileSync(outputPath, template);
console.log("Created output/preview.html");

