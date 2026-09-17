import { kv } from '@vercel/kv';
import { checkAdminHeader } from '../lib/auth.js';

async function getBookings() {
  return (await kv.get('bookings')) || [];
}
async function setBookings(list) {
  await kv.set('bookings', list);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const b = req.body || {};
    if (!b.name || !b.phone || !b.listingId) {
      res.status(400).json({ ok: false, error: 'Invalid booking' });
      return;
    }
    const bookings = await getBookings();
    const booking = {
      id: 'bk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      listingId: b.listingId,
      listingName: b.listingName,
      name: b.name,
      phone: b.phone,
      guests: b.guests,
      checkin: b.checkin,
      checkout: b.checkout,
      nights: b.nights,
      total: b.total,
      paid: false,
      createdAt: new Date().toISOString()
    };
    bookings.unshift(booking);
    await setBookings(bookings);
    res.status(200).json({ ok: true, booking });
    return;
  }

  if (req.method === 'GET') {
    if (!(await checkAdminHeader(req))) {
      res.status(401).json({ ok: false, error: 'Not authorized' });
      return;
    }
    res.status(200).json({ bookings: await getBookings() });
    return;
  }

  if (req.method === 'PATCH') {
    if (!(await checkAdminHeader(req))) {
      res.status(401).json({ ok: false, error: 'Not authorized' });
      return;
    }
    const { id, paid } = req.body || {};
    const bookings = await getBookings();
    const idx = bookings.findIndex((x) => x.id === id);
    if (idx === -1) {
      res.status(404).json({ ok: false, error: 'Booking not found' });
      return;
    }
    bookings[idx].paid = !!paid;
    await setBookings(bookings);
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ ok: false, error: 'Method not allowed' });
}
