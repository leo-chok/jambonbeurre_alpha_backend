var express = require("express");
var router = express.Router();
const uniqid = require("uniqid");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Ajouter un avatar via la caméra
router.post("/upload", async (req, res) => {
  // console.log(req.files)
  // const photoPath = `./tmp/${uniqid()}.jpg`;
  // const resultMove = await req.files.photoFromFront.mv(photoPath);
  // const resultCloudinary = await cloudinary.uploader.upload(photoPath);
  try {

    const resultCloudinary = await cloudinary.uploader
      .upload_stream(async (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          res
            .status(500)
            .json({ result: false, error: "Internal Server Error" });
        } else {
          res.json({ result: true, url: result.secure_url });
        }
      })
      .end(req.files.photoFromFront.data);
  } catch (error) {
    console.error("Error processing picture:", error);
    res.status(500).json({ result: false, error: "Internal Server Error" });
  }

  // fs.unlinkSync(photoPath);
  // if (!resultMove) {
  //   res.json({ result: true, url: resultCloudinary.secure_url });
  // } else {
  //   res.json({ result: false, error: resultMove });
  // }
});

module.exports = router;
