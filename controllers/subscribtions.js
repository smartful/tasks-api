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
  });
  console.log('session : ', session);

  response.json({ url: session?.url });
};

export const deleteSubscribtion = async (request, response) => {};
