import { getStoredAuth, setStoredAuth, verifyPasswordHash } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const stored = await getStoredAuth();
    res.status(200).json({ hasPassword: !!stored });
    return;
  }

  if (req.method === 'POST') {
    const { action, password, currentPassword, newPassword } = req.body || {};

    if (action === 'setup') {
      const stored = await getStoredAuth();
      if (stored) {
        res.status(400).json({ ok: false, error: 'A passcode is already set. Log in and use Change passcode instead.' });
        return;
      }
      if (!password || password.length < 8) {
        res.status(400).json({ ok: false, error: 'Choose a passcode with at least 8 characters.' });
        return;
      }
      await setStoredAuth(password);
      res.status(200).json({ ok: true });
      return;
    }

    if (action === 'login') {
      const stored = await getStoredAuth();
      if (!stored) {
        res.status(400).json({ ok: false, error: 'No passcode has been set up yet.' });
        return;
      }
      if (verifyPasswordHash(password, stored)) {
        res.status(200).json({ ok: true });
      } else {
        res.status(401).json({ ok: false, error: 'Wrong passcode.' });
      }
      return;
    }

    if (action === 'change') {
      const stored = await getStoredAuth();
      if (!stored || !verifyPasswordHash(currentPassword, stored)) {
        res.status(401).json({ ok: false, error: 'Current passcode is incorrect.' });
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        res.status(400).json({ ok: false, error: 'New passcode must be at least 8 characters.' });
        return;
      }
      await setStoredAuth(newPassword);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ ok: false, error: 'Unknown action' });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
