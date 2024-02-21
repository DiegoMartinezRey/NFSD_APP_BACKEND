const express = require("express");
const connectionsController = require("../controllers/connectionsController");
const router = express.Router();
const { verifyToken } = require("../controllers/userController");

router.post("/:profileId", verifyToken, connectionsController.addConection);
router.get("/");

module.exports = router;