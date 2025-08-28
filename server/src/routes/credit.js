import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import Stripe from 'stripe';
const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PLANS = [
  { id:'basic', name:'Basic', price:5, credits:100 },
  { id:'pro', name:'Pro', price:20, credits:500 },
  { id:'ultra', name:'Ultra', price:50, credits:1500 },
];

router.get('/plan', auth, async (_req, res) => {
  res.json({ success:true, plans: PLANS });
});

router.post('/purchase', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const selected = PLANS.find(p => p.id === plan);
    if (!selected) return res.json({ success:false, message:'Invalid plan' });
    if (!stripe) return res.json({ success:false, message:'Stripe not configured' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${selected.name} (${selected.credits} credits)` },
          unit_amount: selected.price * 100,
        },
        quantity: 1
      }],
      metadata: { userId: String(req.user._id), planId: selected.id, credits: String(selected.credits) },
      success_url: `${process.env.CLIENT_ORIGINS?.split(',')[0]}/loading`,
      cancel_url: `${process.env.CLIENT_ORIGINS?.split(',')[0]}/credits`
    });

    res.json({ success:true, url: session.url });
  } catch (e) { res.status(500).json({ success:false, message:e.message }); }
});

export default router;
