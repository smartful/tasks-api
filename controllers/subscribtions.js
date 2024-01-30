import Stripe from 'stripe';
import User from '../models/userModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const YOUR_DOMAIN = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.CLIENT_URL;

export const createSubscribtion = async (request, response) => {
  const { userId, planId } = request.body;

  try {
    const user = await User.findById(request.user.id).select('-password');

    if (!user) {
      return response.status(400).json({ message: 'User not found' });
    }

    // Customer
    let customer;
    if (user?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user?.stripeCustomerId);
    } else {
      // Création d'un client Stripe
      customer = await stripe.customers.create({
        email: request?.user.email,
        name: request?.user.name,
      });

      // Enregistre l'ID client Stripe dans ta base de données
      user.stripeCustomerId = customer.id;
    }
    console.log('customer : ', customer);

    // Product
    let product;
    if (user?.stripeProductId) {
      product = await stripe.products.retrieve(user?.stripeProductId);
    } else {
      // On récupère les produits
      const products = await stripe.products.list({
        limit: 1,
      });

      product = products.data[0];
      user.stripeProductId = product.id;
    }
    console.log('product : ', product);

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: product.default_price }],
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('subscription : ', subscription);

    // Enregistre les détails de l'abonnement dans ta base de données
    const updatedUser = await user.save();

    response.json(subscription);
  } catch (error) {
    console.error('Erreur lors de la création de l’abonnement :', error);
    response.status(500).json({ message: error.message });
  }
};

export const createCheckoutSession = async (request, response) => {
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: process.env.PRICE_API,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    subscription_data: {
      trial_period_days: 7,
    },
  });
  console.log('session : ', session);

  response.json({ url: session?.url });
};

export const createPortalSession = async (request, response) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  // const { session_id } = request.body;
  // const session_id = 'cs_test_a1H51P2Mxjx825QRYc2s925UUNl0WOWRRUMQFRmbzJ3m0QpuwAOzGI6l2l';
  // const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // const user = await User.findById(request.user.id).select('-password');

  // if (!user) {
  //   return response.status(400).json({ message: 'User not found' });
  // }
  // customer = await stripe.customers.retrieve(user?.stripeCustomerId);
  const customer = await stripe.customers.retrieve('cus_PRYYVD0ifln5CE');
  console.log('customer : ', customer);

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customer?.id,
    return_url: `${YOUR_DOMAIN}/portal`,
  });

  console.log('portalSession : ', portalSession);

  response.json({ url: portalSession?.url });
};

export const subscribtionWebhook = async (request, response) => {
  console.log('--- WEBHOOK ---');
  let data;
  let eventType;
  // Check if webhook signing is configured.
  // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const webhookSecret = false;
  if (webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = request.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(request.body, signature, webhookSecret);
    } catch (error) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return response.status(400).json({ message: error.message });
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = request.body.data;
    eventType = request.body.type;
  }

  console.log('WEBHOOK EVENT data : ', data);
  console.log('WEBHOOK EVENT type : ', eventType);

  switch (eventType) {
    case 'checkout.session.completed':
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      console.log('WEBHOOK : checkout.session.completed');
      break;
    case 'payment_intent.succeeded':
      console.log('WEBHOOK : payment_intent.succeeded');
      break;
    case 'invoice.paid':
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      console.log('WEBHOOK : invoice.paid');
      break;
    case 'invoice.payment_failed':
      // The payment failed or the customer does not have a valid payment method.
      // The subscription becomes past_due. Notify your customer and send them to the
      // customer portal to update their payment information.
      console.log('WEBHOOK : invoice.payment_failed');
      break;
    case 'customer.subscription.updated':
      console.log('WEBHOOK : customer.subscription.updated');
      break;
    default:
    // Unhandled event type
  }

  response.status(200).json({ message: eventType });
};

export const deleteSubscribtion = async (request, response) => {};
