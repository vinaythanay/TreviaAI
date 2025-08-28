import Stripe from 'stripe';
import User from '../models/User.js';
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function webhookHandler(req, res) {
  if (!stripe) return res.status(400).send('Stripe not configured');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0', 10);
      if (userId && credits > 0) await User.updateOne({ _id: userId }, { $inc: { credits } });
    } catch (e) {}
  }
  res.json({ received: true });
}
