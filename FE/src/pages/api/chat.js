import axios from 'axios';

const OPEN_API_KEY = process.env.OPENAI_API_KEY
const OPEN_API_URL = 'https://api.openai.com/v1/chat/completions';

export default async function handler(req, res) {
  const referer = req.headers.referer || req.headers.referrer; // get the referer from the request headers

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method should be POST' });
  } else if (process.env.NODE_ENV !== 'development') {
    if (!referer || referer !== process.env.APP_URL) {
      res.status(401).json({ message: 'Unauthorized' });
      return; // Stop execution if unauthorized
    }
  } else {
    try {
      const { body } = req;

      if (!body) {
        res.status(400).json({ message: 'Request body is required' });
        return; // Stop execution if no request body
      }

      const headers = {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${OPEN_API_KEY}`
      };

      const response = await axios.post(OPEN_API_URL, body, { headers });

      res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
}
