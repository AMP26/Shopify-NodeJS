const multer = require("multer");
const xlsx = require("xlsx");
const { Variant } = require("../models");

const upload = multer({ dest: "uploads/" });

const exportController = {
  exportInventory: async (req, res) => {
    try {
      // fetching all variants from the database
      const variants = await Variant.findAll({ attributes: ["name", "sku", "price", "old_inventory_quantity"] });

      if (variants.length === 0) { return res.status(404).send("No variants found to export."); }

      // data to export in excel
      const data = variants.map(variant => ({
        Name: variant.name,
        SKU: variant.sku,
        Price: variant.price,
        InventoryQuantity: variant.old_inventory_quantity
      }));

      const ws = xlsx.utils.json_to_sheet(data); // worksheet

      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, "Variants"); // workbook

      const filePath = `uploads/variants_${Date.now()}.xlsx`;
      xlsx.writeFile(wb, filePath); // file generated

      res.download(filePath, (err) => { // download file
        if (err) {
          console.error(err);
          return res.status(500).send("Error downloading the file.");
        }
      });
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error exporting variants.");
    }
  },
};

module.exports = { upload, exportController };