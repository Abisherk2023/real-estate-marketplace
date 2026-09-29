const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const c = cloudinary.config();
console.log("CLOUD NAME:", c.cloud_name);
console.log("API KEY SET:", Boolean(c.api_key), "| API SECRET SET:", Boolean(c.api_secret));

module.exports = cloudinary;