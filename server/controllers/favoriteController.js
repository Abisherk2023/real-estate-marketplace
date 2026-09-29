const User = require("../models/User");

// GET /api/favorites - full property objects
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      match: { status: "approved" },
      populate: { path: "agent", select: "name" },
    });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/favorites/ids - just the ids (for heart buttons)
exports.getFavoriteIds = async (req, res) => {
  const user = await User.findById(req.user._id).select("favorites");
  res.json(user.favorites.map((id) => id.toString()));
};

// POST /api/favorites/:propertyId - toggle
exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pid = req.params.propertyId;

    const exists = user.favorites.some((id) => id.toString() === pid);
    if (exists) {
      user.favorites = user.favorites.filter((id) => id.toString() !== pid);
    } else {
      user.favorites.push(pid);
    }

    await user.save();
    res.json({ favorited: !exists, ids: user.favorites.map((id) => id.toString()) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};