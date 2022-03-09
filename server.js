const tempy = import("tempy"),
  util = require("util"),
  execFile = util.promisify(require("child_process").execFile),
  spawn = util.promisify(require("child_process").spawn),
  singleFile = require("./SingleFile/cli/single-file-cli-api.js"),
  path = require("path"),
  hashUrl = require("./hashurl.js"),
  fetch = import("node-fetch");

const chrome = "/usr/bin/chromium-browser";
const exts = "/app/bypass-paywalls-chrome,/app/uBlock0.chromium";
const headless = true
        let defaultOptions = {
          browserHeadless: false,
          browserExecutablePath: chrome,
          browserArgs:
            '['+(headless?'"--enable-features=UseOzonePlatform","--ozone-platform=headless",':'')+'"--disable-extensions-except='+exts+'","--load-extension='+exts+'"]',
          acceptHeaders: {
            font: "application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8",
            image:
              "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            stylesheet: "text/css,*/*;q=0.1",
            script: "*/*",
            document:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          backEnd: "puppeteer",
          blockMixedContent: false,
          browserServer: "",
          browserWidth: 1280,
          browserHeight: 720,
          browserLoadMaxTime: 10*1000,
          browserWaitDelay: 0,
          browserWaitUntil: "networkidle2",
          browserWaitUntilFallback: true,
          browserDebug: false,
          browserStartMinimized: false,
          browserCookiesFile: "",
          dumpContent: false,
          filenameTemplate: "{page-title} ({date-iso} {time-locale}).html",
          filenameConflictAction: "uniquify",
          filenameReplacementCharacter: "_",
          filenameMaxLength: 192,
          filenameMaxLengthUnit: "bytes",
          groupDuplicateImages: true,
          includeInfobar: false,
          loadDeferredImages: true,
          loadDeferredImagesMaxIdleTime: 1500,
          loadDeferredImagesKeepZoomLevel: false,
          maxParallelWorkers: 8,
          maxResourceSizeEnabled: false,
          maxResourceSize: 10,
          moveStylesInHead: false,
          outputDirectory: "",
          removeHiddenElements: true,
          removeUnusedStyles: true,
          removeUnusedFonts: true,
          removeFrames: false,
          removeImports: true,
          removeScripts: true,
          removeAudioSrc: true,
          removeVideoSrc: true,
          removeAlternativeFonts: true,
          removeAlternativeMedias: true,
          removeAlternativeImages: true,
          saveOriginalUrls: false,
          saveRawPage: false,
          webDriverExecutablePath: "",
          userScriptEnabled: true,
          crawlLinks: false,
          crawlInnerLinksOnly: true,
          crawlRemoveUrlFragment: true,
          crawlMaxDepth: 1,
          crawlExternalLinksMaxDepth: 1,
          crawlReplaceUrls: false,
//        url: request.query.url,
//        output: file,
          backgroundSave: true,
          crawlReplaceURLs: false,
          crawlRemoveURLFragment: true,
          httpHeaders: {},
          browserCookies: [],
          browserScripts: [],
          browserStylesheets: [],
          crawlRewriteRules: [],
          emulateMediaFeatures: [],
          retrieveLinks: true
        };

let browser = singleFile.launch(defaultOptions);

async function dl(url){
  try {
    console.log("Checking validity of url")
    new URL(url);
    console.log("Making temp folder")
    await (
      await tempy
    ).default.file.task(
      async (file) => {
        let options = Object.assign({}, defaultOptions, {url: url, output: file, browser: await browser})
        let urls = [options.url];
        console.log("Initializing")
      	const singlefile = await singleFile.initialize(options);
        console.log("Capturing")
        await singlefile.capture(urls);
        console.log("Finishing")
        await singlefile.finish();
        console.log("Uploading")
        let hashedUrl = await hashUrl(options.url)
        console.log(hashedUrl)
        let results = await execFile("rclone", ["moveto", file, "b2:13ft-pages/"+hashedUrl+".html"]);
        console.log(results.stdout, results.stderr)
      },
      { extension: "html" }
    );
  } catch (error) {
    throw error;
  }
};

(async() => {
    while (1) {
        try {
            const keys = await (await fetch("https://13ft-api.easrng.workers.dev/?pending=1")).json()
            for (const key of keys) {
                try {
                  const {
                    url,
                    status
                  } = await (await fetch("https://13ft-api.easrng.workers.dev/?id=" + encodeURIComponent(key))).json();
                  try {
                    console.log(key, url)
                    if(status === "working") await dl(url);
                    console.log(await(await fetch("https://13ft-api.easrng.workers.dev/?put=" + encodeURIComponent(key) + "&password=" + encodeURIComponent(password))).text())
                  } catch (e) { console.warn(e) }
                } catch (e) {
                    console.warn(e)
                }
                await new Promise(cb => setTimeout(cb, 800))
            }
        } catch (e) {
            console.warn(e)
        }
        await new Promise(cb => setTimeout(cb, 5000))
    }
})();
