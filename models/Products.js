const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductsSchema = new Schema({
  name: {
    type: String,
    required: [true, "Enter a product name."],
  },
  description: {
    type: String,
  },
  unitType: {
    type: String,
    required: [true, "Enter the unit type (pounds, ounces, grams, etc)."],
  },
  unitSize: {
    type: Number,
    required: [true, "Enter how many units per package/container."],
  },
  price: {
    type: Number,
    required: [true, "Enter a product price."],
  },
  quantity: {
    type: Number,
    required: [true, "Enter a product/container quantity."],
  },
  category: {
    type: String,
    required: [true, "Select a product category."],
  },
  pathway: {
    type: String,
    default: "/assets/product_images/placeholder.png"
  },
  image: {
    data: Buffer,  // For storing image data directly in MongoDB if needed
    contentType: String,  // For storing the MIME type if needed
    originalName: String  // Store original filename for reference
  }
});

// Add a virtual getter for the full image URL if needed
ProductsSchema.virtual('imageUrl').get(function() {
  if (this.pathway && this.pathway.startsWith('/uploads/')) {
    return `${process.env.BASE_URL || ''}${this.pathway}`;
  }
  return this.pathway;
});

const Products = mongoose.model("Products", ProductsSchema);

module.exports = Products;