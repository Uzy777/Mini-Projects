const fs = require("fs");
const yaml = require("js-yaml");

const data = yaml.load(fs.readFileSync("cv.yaml", "utf8"));
let template = fs.readFileSync("template.html", "utf8");

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

fs.writeFileSync("preview.html", template);
console.log("Created preview.html");
