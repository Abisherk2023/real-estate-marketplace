const express = require("express");
const {
  getFavorites, getFavoriteIds, toggleFavorite,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getFavorites);
router.get("/ids", protect, getFavoriteIds); // above the :propertyId route
router.post("/:propertyId", protect, toggleFavorite);

module.exports = router;