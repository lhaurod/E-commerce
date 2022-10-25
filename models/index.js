// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category

Product.belongsTo(Category, {
  foreignKey: 'category_id',
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
})

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'category_id',
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
})

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
  through: ProductTag,
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
})


// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product, {
  through: ProductTag,
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
})



module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
