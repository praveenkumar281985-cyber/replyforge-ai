import {
    access,
    cp,
    mkdir,
    readFile,
    rm,
  } from "node:fs/promises";
  import path from "node:path";
  import process from "node:process";
  
  const rootDirectory = process.cwd();
  
  const sourceDirectory = path.join(
    rootDirectory,
    "extension"
  );
  
  const outputDirectory = path.join(
    rootDirectory,
    "dist",
    "extension"
  );
  
  const requiredFiles = [
    "manifest.json",
    "background.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "options.html",
    "options.css",
    "options.js",
    "content.js",
    "content.css",
    "webapp-bridge.js",
    "sidepanel.html",
    "sidepanel.css",
    "sidepanel.js",
  ];
  
  async function verifyRequiredFiles() {
    const missingFiles = [];
  
    for (const fileName of requiredFiles) {
      const filePath = path.join(
        sourceDirectory,
        fileName
      );
  
      try {
        await access(filePath);
      } catch {
        missingFiles.push(fileName);
      }
    }
  
    if (missingFiles.length > 0) {
      throw new Error(
        `Extension build failed. Missing files: ${missingFiles.join(
          ", "
        )}`
      );
    }
  }
  
  async function validateManifest() {
    const manifestPath = path.join(
      sourceDirectory,
      "manifest.json"
    );
  
    const manifestText = await readFile(
      manifestPath,
      "utf8"
    );
  
    let manifest;
  
    try {
      manifest = JSON.parse(manifestText);
    } catch {
      throw new Error(
        "extension/manifest.json contains invalid JSON."
      );
    }
  
    if (manifest.manifest_version !== 3) {
      throw new Error(
        "Chrome extension must use manifest_version 3."
      );
    }
  
    if (!manifest.name || !manifest.version) {
      throw new Error(
        "manifest.json must contain name and version."
      );
    }
  
    if (
      manifest.background?.service_worker !==
      "background.js"
    ) {
      throw new Error(
        "manifest.json background service worker must be background.js."
      );
    }
  
    const hasPopup =
      manifest.action?.default_popup ===
      "popup.html";

    const hasSidePanel =
      manifest.side_panel?.default_path ===
      "sidepanel.html";

    if (!hasPopup && !hasSidePanel) {
      throw new Error(
        "manifest.json must configure popup.html or sidepanel.html as its UI entry point."
      );
    }
  }
  
  async function buildExtension() {
    console.log("Building Messaura extension...");
  
    await verifyRequiredFiles();
    await validateManifest();
  
    await rm(outputDirectory, {
      recursive: true,
      force: true,
    });
  
    await mkdir(
      path.dirname(outputDirectory),
      {
        recursive: true,
      }
    );
  
    await cp(sourceDirectory, outputDirectory, {
      recursive: true,
    });
  
    console.log("");
    console.log("Extension build completed.");
    console.log(`Output: ${outputDirectory}`);
    console.log("");
    console.log(
      "Download the dist/extension folder and load it through chrome://extensions."
    );
  }
  
  buildExtension().catch((error) => {
    console.error("");
    console.error(error.message);
    process.exitCode = 1;
  });
