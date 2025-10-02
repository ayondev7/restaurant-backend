const Dish = require("../models/Dish");
const Category = require("../models/Category");
const { body, validationResult } = require("express-validator");
const { processAndUploadImage } = require("../utils/imageUtils");

exports.createDish = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("category").trim().notEmpty().withMessage("Category name is required"),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      const category = await Category.findOne({ name: req.body.category });
      if (!category) {
        return res.status(400).json({ error: "Category not found" });
      }

      const dish = new Dish({
        name: req.body.name,
        category: category._id,
        image: await processAndUploadImage(req.file.buffer, req.file.originalname),
      });

      await dish.save();
      const populatedDish = await Dish.findById(dish._id).populate(
        "category",
        "name"
      );
      res.status(201).json(populatedDish);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Server error" });
    }
  },
];

exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.aggregate([
      {
        $lookup: {
          from: "categories", 
          localField: "category", 
          foreignField: "_id", 
          as: "categoryInfo",
        },
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          image: 1,
          category: "$categoryInfo.name", 
        },
      },
    ]);

    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
