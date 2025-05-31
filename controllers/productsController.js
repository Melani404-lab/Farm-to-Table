const express = require("express");
const router = express.Router();
const db = require("../models");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original name + timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  }
});

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//GET api route to return a product
router.get("/api/products/:id", (req, res) => {
  db.Products.findById(req.params.id)
    .then((product) => {
      res.json(product);
    })
    .catch((err) => {
      res.json(err);
    });
});

//GET api route to return all products
router.get("/api/products", (req, res) => {
  db.Products.find({})
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      res.json(err);
    });
});

//GET api route to return all products based on category
router.get("/api/products/filtered/:category", (req, res) => {
  db.Products.find({ category: req.params.category })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      res.json(err);
    });
});

//POST api route to create a product with image upload
router.post("/api/products", upload.single('image'), (req, res) => {
  // Extract product data from the request body
  const productData = req.body;
  
  // If an image was uploaded, add the image path to the product data
  if (req.file) {
    // Create a URL path to access the image
    const imagePath = `/uploads/${req.file.filename}`;
    productData.pathway = imagePath;
  } else {
    // Use a default image path if no image was uploaded
    const placeholder = "/assets/product_images/placeholder.png";
    productData.pathway = process.env.PUBLIC_URL + placeholder;
  }

  // Create the product in the database
  db.Products.create(productData)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error("Error creating product:", err);
      res.status(500).json(err);
    });
});

//PUT route to update a product with image
router.put("/api/products/:id", upload.single('image'), (req, res) => {
  // Extract product data from the request body
  const productData = req.body;
  
  // If an image was uploaded, add the image path to the product data
  if (req.file) {
    // Create a URL path to access the image
    const imagePath = `/uploads/${req.file.filename}`;
    productData.pathway = imagePath;
    
    // If updating an image, find the old image and delete it
    db.Products.findById(req.params.id)
      .then((product) => {
        if (product.pathway && product.pathway.startsWith('/uploads/')) {
          const oldImagePath = path.join(__dirname, '..', product.pathway);
          // Check if file exists and is not a default image before deleting
          if (fs.existsSync(oldImagePath) && !product.pathway.includes('placeholder')) {
            fs.unlinkSync(oldImagePath);
          }
        }
      })
      .catch(err => console.error("Error removing old image:", err));
  }

  // Update the product in the database
  db.Products.findByIdAndUpdate(req.params.id, productData, { new: true })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// DELETE route for a product
router.delete("/api/products/:id", (req, res) => {
  // Find the product to get its image path before deleting
  db.Products.findById(req.params.id)
    .then((product) => {
      if (product.pathway && product.pathway.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', product.pathway);
        // Delete the image file if it exists and is not a default image
        if (fs.existsSync(imagePath) && !product.pathway.includes('placeholder')) {
          fs.unlinkSync(imagePath);
        }
      }
      // Delete the product from the database
      return db.Products.findByIdAndDelete(req.params.id);
    })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;