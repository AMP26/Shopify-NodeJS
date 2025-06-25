const axios = require("axios");
const { Variant, Shop } = require("../models");

const inventoryController = {
  updateInventory: async (req, res) => {
    const { shop } = req.query; // shop domain
    const accessToken = req.headers["x-shopify-access-token"];

    if (!accessToken) { return res.status(400).send("Access token not found!"); }

    try {
      const shopDetails = await Shop.findOne({ where: { domain: shop } }); // Validating shop

      if (!shopDetails) { return res.status(400).send("Shop not authenticated in the database."); }

      const locationsResponse = await axios.get(
        `https://${shopDetails.domain}/admin/api/2025-01/locations.json`,
        { headers: { "X-Shopify-Access-Token": shopDetails.accessToken } }
      );

      const locations = locationsResponse.data.locations;
      if (locations.length === 0) { return res.status(404).send("No locations found for the shop."); }

      const locationId = locations[0].id;

      const variantsToUpdate = await Variant.findAll({ where: { isUpdated: 1 } }); // finding all variants with isUpdated flag set to 1

      if (variantsToUpdate.length === 0) { return res.status(404).send("No variants with updated inventory found."); }

      for (const variant of variantsToUpdate) {
        try {
          const sku = variant.sku;

          const variantResponse = await axios.get(
            `https://${shopDetails.domain}/admin/api/2025-01/variants.json`,
            { headers: { "X-Shopify-Access-Token": shopDetails.accessToken },
              params: { sku }
            });

          const shopifyVariant = variantResponse.data.variants.find((v) => v.sku === sku);

          if (!shopifyVariant) {
            console.log(`Variant with SKU ${sku} not found on Shopify.`);
            continue; // if a variant not found skip it
          }

          const inventoryItemId = shopifyVariant.inventory_item_id; // get the inventory_item_id for inventory update

          const inventoryUpdateResponse = await axios.post(  // upadte Shopify inventory
            `https://${shopDetails.domain}/admin/api/2025-01/inventory_levels/set.json`,
            { inventory_item_id: inventoryItemId,
              available: variant.inventory_quantity,
              location_id: locationId
            },
            { headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": shopDetails.accessToken
              }
            });

          if (inventoryUpdateResponse.status === 200) { console.log(`Inventory updated for SKU: ${sku} on Shopify.`); }
          else { console.error(`Failed to update inventory for SKU: ${sku}.`); }

          // Update local database
          variant.old_inventory_quantity = variant.inventory_quantity;
          variant.update({inventory_quantity: null});
          variant.isUpdated = 0;  // resetting the isUpdated flag after sync
          await variant.save();
        }
        catch (variantError) { console.error(`Error processing SKU: ${variant.sku}`, variantError.message); }
      }

      res.send("Inventory updated and synced with Shopify successfully.");
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error updating inventory.");
    }
  }
};

module.exports = inventoryController;