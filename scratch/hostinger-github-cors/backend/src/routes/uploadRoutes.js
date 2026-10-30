const express = require("express");
const router = express.Router();
const { uploadSingle, uploadToCloudinary } = require("../middleware/uploadMiddleware");

router.post("/upload", uploadSingle("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;