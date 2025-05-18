const Dish = require('../models/Dish');
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');

exports.createDish = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category name is required'),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      const category = await Category.findOne({ name: req.body.category });
      if (!category) {
        return res.status(400).json({ error: 'Category not found' });
      }

      const dish = new Dish({
        name: req.body.name,
        category: category._id,
        image: req.file.buffer
      });

      await dish.save();
      const populatedDish = await Dish.findById(dish._id).populate('category', 'name');
      res.status(201).json(populatedDish);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
];

exports.getAllDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().populate('category', 'name');
    const dishesWithImages = dishes.map(dish => ({
      ...dish._doc,
      image: dish.image ? `data:image/jpeg;base64,${dish.image.toString('base64')}` : null
    }));
    res.status(200).json(dishesWithImages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};