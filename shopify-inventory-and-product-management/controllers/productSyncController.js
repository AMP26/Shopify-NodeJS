const axios = require("axios");
const { Shop, Product, Variant } = require("../models");

const productSyncController = {
  sync: async (req, res) => {
    const { shop } = req.query;
    const accessToken = req.headers["x-shopify-access-token"];

    if (!accessToken) { return res.status(400).send("Access token not found!"); }

    try {
      const shopDetails = await Shop.findOne({ where: { domain: shop } });

      if (!shopDetails) { return res.status(400).send("Shop not authenticated in the database"); }

      let hasNextPage = true;
      let endCursor = null;
      let allProducts = [];

      while (hasNextPage) {
        const productQuery = `
          query ($after: String) {
            products(first: 50, after: $after) {
              edges {
                node {
                  id
                  title
                  descriptionHtml
                  variants(first: 250) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        inventoryQuantity
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }`;

        const variables = endCursor ? { after: endCursor } : {};
        const response = await axios.post(
          `https://${shop}/admin/api/2025-01/graphql.json`,
          { query: productQuery, variables },
          { headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": accessToken
            }
          });

        if (!response.data || !response.data.data) { return res.status(500).send("Error fetching products from Shopify"); }

        const { edges, pageInfo } = response.data.data.products;
        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;

        for (const product of edges) {
          const productData = {
            id: product.node.id,
            title: product.node.title,
            description: product.node.descriptionHtml,
            variants: product.node.variants.edges.map((variant) => variant.node)
          };

          let variantHasNextPage = product.node.variants.pageInfo.hasNextPage;
          let variantEndCursor = product.node.variants.pageInfo.endCursor;

          while (variantHasNextPage) {
            const variantQuery = `
              query ($after: String) {
                product(id: "${productData.id}") {
                  variants(first: 250, after: $after) {
                    edges {
                      node {
                        id
                        title
                        sku
                        price
                        inventoryQuantity
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              }`;

            const variantVariables = variantEndCursor ? { after: variantEndCursor } : {};
            const variantResponse = await axios.post(
              `https://${shop}/admin/api/2025-01/graphql.json`,
              { query: variantQuery, variables: variantVariables },
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-Shopify-Access-Token": accessToken
                }
              });

            if (!variantResponse.data || !variantResponse.data.data) { return res.status(500).send("Error fetching variants from Shopify"); }

            const { edges: variantEdges, pageInfo: variantPageInfo } = variantResponse.data.data.product.variants;
            variantHasNextPage = variantPageInfo.hasNextPage;
            variantEndCursor = variantPageInfo.endCursor;

            productData.variants = [...productData.variants, ...variantEdges.map((variant) => variant.node)];
          }

          allProducts.push(productData);
        }
      }

      const productUpsert = [];
      const variantUpsert = [];

      for (const p of allProducts) {
        productUpsert.push({
          gid: p.id,
          name: p.title,
          description: p.description,
          shopId: shopDetails.id
        });

        p.variants.forEach((v) => {
          variantUpsert.push({
            id: v.id,
            name: v.title,
            sku: v.sku,
            price: parseFloat(v.price),
            old_inventory_quantity: v.inventoryQuantity, // this comes from Shopify
            productId: p.id
          });
        });
      }

      await Product.bulkCreate(productUpsert, { updateOnDuplicate: ["gid", "name", "description", "shopId"] });

      await Variant.bulkCreate(variantUpsert, { updateOnDuplicate: ["id", "name", "sku", "price", "inventory_quantity"] });

      nextPage = hasNextPage ? endCursor : null;
      // res.json({ products: allProducts, nextPage: endCursor });
      res.json({ products: allProducts, nextPage });
      console.log("Products and variants synced successfully!");
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error syncing products and variants");
    }
  }
};

module.exports = productSyncController;