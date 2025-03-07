var express = require("express");
var router = express.Router();
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Ajouter un avatar via la caméra
router.post("/upload", async (req, res) => {
    // console.log(req.files)
  const photoPath = `./tmp/${uniqid()}.jpg`;
  const resultMove = await req.files.photoFromFront.mv(photoPath);
  const resultCloudinary = await cloudinary.uploader.upload(photoPath);

  fs.unlinkSync(photoPath);
  if (!resultMove) {
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  }
});

module.exports = router;