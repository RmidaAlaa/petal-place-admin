import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { OrderModel, Address } from '../models/Order';
import { ProductModel } from '../models/Product';

interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

interface CheckoutRequest {
  items: CartItem[];
  shipping_address: Address;
}

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2024-06-20',
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { items, shipping_address } = req.body as CheckoutRequest;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Get product details and calculate total
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await ProductModel.findById(item.product_id);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      const unitAmount = Math.round(product.price * 100); // Convert to cents
      totalAmount += unitAmount * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'sar',
          product_data: {
            name: product.name,
            description: product.description,
            images: product.images.slice(0, 1), // Stripe allows max 8 images
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      customer_email: req.user.email,
      metadata: {
        user_id: req.user.id,
        items: JSON.stringify(items),
        shipping_address: JSON.stringify(shipping_address),
      },
    });

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle successful payment
router.post('/success', async (req: Request, res: Response) => {
  try {
    const { session_id } = (req as Request).body as { session_id?: string };

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Create order in database
    const items = JSON.parse(session.metadata.items);
    const shipping_address = JSON.parse(session.metadata.shipping_address);

    const orderData = {
      user_id: session.metadata.user_id,
      items: items.map((item: CartItem) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      shipping_address,
      payment_method: 'stripe',
      payment_intent_id: session.payment_intent,
    };

    const order = await OrderModel.create(orderData);

    res.json({
      message: 'Payment successful',
      order: order,
    });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ error: 'Failed to process payment success' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = (req.headers as Record<string, string | string[] | undefined>)['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send('Missing signature or webhook secret');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment succeeded:', session.id);
      // Update order status if needed
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      // Handle failed payment
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
