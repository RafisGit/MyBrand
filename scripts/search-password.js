const fs = require("fs");
const path = require("path");

function searchFile(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== ".next") {
        searchFile(fullPath, pattern);
      }
    } else {
      const content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes(pattern)) {
        console.log(`Found pattern "${pattern}" in file: ${fullPath}`);
      }
    }
  }
}

try {
  searchFile(path.join(__dirname, ".."), "POSTGRES_PASSWORD");
  searchFile(path.join(__dirname, ".."), "db_password");
  searchFile(path.join(__dirname, ".."), "dbPassword");
} catch (e) {
  console.error(e);
}
