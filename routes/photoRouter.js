const express = require("express");
const photoController = require("../controllers/photoController");
const router = express.Router();
const upload = require("../middleware/multer");

// router.get("/", photoController.getAllActivities);
router.post("/", upload.single("file"), photoController.addPhoto);

module.exports = router;