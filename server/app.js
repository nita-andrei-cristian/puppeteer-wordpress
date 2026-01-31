const express = require("express");
const puppeteer = require("puppeteer");

const fs = require("fs");
const path = require("path");
const { error } = require("console");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../static")));

const baseUrl = `https://bakery-demo.local/`;
var urlsToProcess = [`${baseUrl}`, `${baseUrl}about/`];

async function processCriticalCSS() {
  const browser = await puppeteer.launch({
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  await page.goto(baseUrl, { waitUntil: "networkidle0" });

  const rawLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map((a) => a.href)
      .filter(
        (href) => href.startsWith(location.origin) || href.startsWith("/")
      );
  });

  urlsToProcess = [
    ...new Set(
      rawLinks.map((link) =>
        link.startsWith("/") ? new URL(link, location.origin).href : link
      )
    ),
  ];

  await page.setViewport({ width: 1200, height: 800 });
  for (const url of urlsToProcess) {
    console.log(`Processing ${url} ...`);

    await page.coverage.startCSSCoverage();

    await page.goto(url, { waitUntil: "networkidle0" });

    const cssCoverage = await page.coverage.stopCSSCoverage();
    let criticalCSS = "";

    for (const entry of cssCoverage) {
      for (const range of entry.ranges) {
        const usedCSS = entry.text.slice(range.start, range.end);
        criticalCSS += usedCSS + "\n";
      }
    }

    let fileName = url.replace(baseUrl, "");
    if (!fileName || fileName === "/") {
      fileName = "home";
    }
    fileName = fileName.replace(/[\/\?\&=\:#]+/g, "");

    await page.evaluate((criticalCSS) => {
      const style = document.createElement("style");
      style.id = "critical-css";
      style.textContent = criticalCSS;
      document.head.prepend(style);
    }, criticalCSS);

    // change links
    await page.evaluate(() => {
      const anchors = document.querySelectorAll(
        'a[href^="/"], a[href^="https://bakery-demo.local"]'
      );
      anchors.forEach((a) => {
        const href = a.getAttribute("href");
        if (href)
          a.setAttribute(
            "href",
            href.replace("https://bakery-demo.local", "http://localhost:3000")
          );
      });
    });

    // javascript
    await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      scripts.forEach((s) => {
        const clone = document.createElement("script");
        clone.src = s.src;
        clone.defer = true;
        document.body.appendChild(clone);
      });
    });

    const targetDir = path.join(__dirname, "../static/wordpress/");
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const finalHTML = await page.content();
    const filePath = path.join(
      __dirname,
      "../static/wordpress/",
      `${fileName}.html`
    );
    fs.writeFileSync(filePath, finalHTML, "utf-8");
  }

  // Close the browser after processing all pages
  await browser.close();
}

app.get("/generate-critical-css", async (req, res) => {
  try {
    console.log("request received");
    await processCriticalCSS();
    res.status(200).json({
      message: "Your CSS was generated :)",
      ok: true,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "It didn't worked :(", ok: false })
      .send("An error occured during generation");
  }
});

app.get("/get-urls", async (req, res) => {
  const urls = urlsToProcess.map((url) =>
    url == baseUrl ? "home" : url.substring(baseUrl.length, url.length - 1)
  );
  console.log("Processing succsefully");

  res.status(200).json({ urls });
});

app.get("/:page", async function (req, res, next) {
  const page = req.params.page;
  try {
    res.sendFile(path.join(__dirname, "../static/wordpress", `${page}.html`));
  } catch (error) {
    console.error(error);
  }
});

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname + "../static/", "index.html"));
});

app.listen(PORT, () => {
  console.log("Server is running at " + PORT);
});
