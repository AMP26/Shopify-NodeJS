const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");
const { Shop } = require("../models");

const authController = {
  auth: (req, res) => {
    const shop = req.query.shop;
    const state = crypto.randomBytes(16).toString('hex');
    const redirectUri = `${process.env.HOST_NAME}/auth/callback`;

    // installation URL
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SCOPES}&redirect_uri=${redirectUri}&state=${state}&grant_options[]=per-user`;

    res.redirect(installUrl);
  },
  callback: async (req, res) => {
    const { code, shop, state } = req.query;
  
    if (!state) { return res.status(400).send("Missing state param"); }

    try {
      const accessTokenResponse = await axios.post(
        `https://${shop}/admin/oauth/access_token`,
        qs.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code
        })
      );

      const accessToken = accessTokenResponse.data.access_token;

      const shopDetails = await axios.get(
        `https://${shop}/admin/api/2023-01/shop.json`, 
        { headers: { "X-Shopify-Access-Token": accessToken }
      });

      const shopData = shopDetails.data.shop;

      // Storedshop and access token details in the database
      await Shop.create({
        id: shop,
        domain: shop,
        accessToken: accessToken,
        email: shopData.email,
        country: shopData.country,
        currency: shopData.currency
      });

      res.send(`App installed successfully! Access token: ${accessToken}`);
    }
    catch (error) {
      console.error(error);
      res.status(500).send("Error in exchanging code for access token");
    }
  }
};

module.exports = authController;