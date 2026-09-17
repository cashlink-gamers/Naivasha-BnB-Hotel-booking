import { kv } from '@vercel/kv';
import { checkAdminHeader } from '../lib/auth.js';

const DEFAULT_SETTINGS = { paybill: '545542', account: '385091' };

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const settings = (await kv.get('settings')) || DEFAULT_SETTINGS;
    res.status(200).json({ settings });
    return;
  }

  if (req.method === 'POST') {
    if (!(await checkAdminHeader(req))) {
      res.status(401).json({ ok: false, error: 'Not authorized' });
      return;
    }
    const { paybill, account } = req.body || {};
    if (!paybill || !account) {
      res.status(400).json({ ok: false, error: 'Missing paybill or account' });
      return;
    }
    const settings = { paybill: String(paybill), account: String(account) };
    await kv.set('settings', settings);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
