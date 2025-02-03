// pages/api/cloudflare.js
import axios from 'axios';

export default async function handler(req, res) {
  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/6be8bb8c9a7803c841e08c30d1e8a9dd/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      { "prompt" },
      {
        headers: {
          'Authorization': `Bearer ${yxeigAPSSdn4ppsKZ2OxplNqF8rXqEijj8bcZ0gL}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
