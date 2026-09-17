import { kv } from '@vercel/kv';
import { checkAdminHeader } from '../lib/auth.js';

const SEED = [
  {
    id: 'seed1', name: 'Lakeview Cottage', type: 'Airbnb', location: 'Karagita, near Lake Naivasha',
    price: 4500, description: 'Cosy 2-bedroom cottage with a private garden looking onto the lake. 5 minutes from the main gate.',
    photos: []
  },
  {
    id: 'seed2', name: 'Sunbird Hotel', type: 'Hotel', location: 'Naivasha town centre',
    price: 3200, description: 'Comfortable ensuite rooms, secure parking, breakfast included. Popular with weekend travellers.',
    photos: []
  }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const listings = (await kv.get('listings')) || SEED;
    res.status(200).json({ listings });
    return;
  }

  if (req.method === 'POST') {
    if (!(await checkAdminHeader(req))) {
      res.status(401).json({ ok: false, error: 'Not authorized' });
      return;
    }
    const listings = req.body;
    if (!Array.isArray(listings)) {
      res.status(400).json({ ok: false, error: 'Invalid payload' });
      return;
    }
    await kv.set('listings', listings);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
