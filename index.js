const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for live
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const getAccessToken = async () => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios({
    url: `${PAYPAL_API_BASE}/v1/oauth2/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    data: 'grant_type=client_credentials',
  });
  return response.data.access_token;
};

app.post('/create-order', async (req, res) => {
  const accessToken = await getAccessToken();
  const orderData = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: '100.00', // Set order amount
        },
      },
    ],
  };

  const response = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    data: orderData,
  });

  res.json(response.data);
});

app.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const accessToken = await getAccessToken();

  const response = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  res.json(response.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
