const multer = require("multer");
const xlsx = require("xlsx");
const { Variant } = require("../models");

const upload = multer({ dest: "uploads/" });

const importController = {
  uploadAndSync: async (req, res) => {
    try {
      const file = req.file; // Reading the uploaded excel file
      if (!file) { return res.status(400).send("No file uploaded."); }

      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      for (const row of data) {
        const { SKU, InventoryQuantity } = row;

        const variant = await Variant.findOne({ where: { sku: SKU } });

        // console.log(variant);

        if (!variant) {
          console.log(`Variant with SKU ${SKU} not found.`);
          continue;
        }

        // Check if inventory quantity has changed
        if (variant.old_inventory_quantity !== InventoryQuantity) {
          variant.inventory_quantity = InventoryQuantity;
          // variant.old_inventory_quantity = variant.inventory_quantity;
          variant.isUpdated = 1;
          await variant.save();
        }
      }

      res.send("Inventory updated successfully.");
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error importing inventory data.");
    }
  }
};

module.exports = { upload, importController };