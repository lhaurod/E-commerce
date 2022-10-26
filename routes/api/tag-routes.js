const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  console.log(`GET ALL TAGS ROUTE SLAPPED`)
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  console.log(`GET SINGLE TAG ROUTE SLAPPED`)
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  console.log(`CREATE SINGLE TAG ROUTE SLAPPED`);
  Tag.create(req.body)
    .then((tag) => {
      // if tag is tied to products, we need to create pairings to bulk create in the ProductTag model
      if (req.body.productIds.length) {
        const tagProductIdArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(tagProductIdArr);
      }
      // if no products tied to tag, just respond
      res.status(200).json(tag)
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  console.log(`UPDATE PRODUCT ROUTE SLAPPED`)
  Tag.update(req.body, {
    where: {
      id: req.params.id, //update the TAG entries where id = params
    },
  })
    .then((tag) => {
      // find all entries in ProductTag that are linked via tag_id foreign key with the tag being updated
      return ProductTag.findAll({
        where: {
          tag_id: req.params.id
        }
      })
    })
    .then((productTags) => {
      //TWO OPERATIONS 

      // All entries in the ProductTag table whose tag_id matches the req.params.id
      console.log(productTags)

      // deconstruct from productTags a list of just the product_ids tied to the tag being updated from ProductTags
      const productTagIds = productTags.map(({ product_id }) => product_id);//pulls just the product_id's out of the ProductTags 
      console.log(productTagIds);

      // create filtered list of new product_ids
      const newProductTags = req.body.productIds
        .filter((product_id) => !productTagIds.
          includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          }
        });

      // figure out which productTag entries to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  console.log(`DELETE SINGLE TAG ROUTE SLAPPED`)
  try {
    const deleteTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(`Tag ID ${req.params.id} was successfully deleted`)
  } catch (err) {
    console.log(err);
    res.status(500).json(err)
  }
});

module.exports = router;