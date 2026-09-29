require("dotenv").config();
const cloudinary = require("./config/cloudinary");

// 1x1 transparent PNG
const tiny =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const run = async (label, fn) => {
  try {
    const r = await fn();
    console.log(label, "OK ->", r.secure_url);
  } catch (e) {
    console.log(label, "FAILED ->", e.http_code, e.message);
  }
};

(async () => {
  await run("A) tiny base64 image", () =>
    cloudinary.uploader.upload(tiny, { folder: "real-estate" })
  );
  await run("B) remote URL", () =>
    cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      { folder: "real-estate" }
    )
  );
  await run("C) your file", () =>
    cloudinary.uploader.upload("C:/Users/Abisherk/Downloads/599374508.jpg", {
      folder: "real-estate",
    })
  );
})();