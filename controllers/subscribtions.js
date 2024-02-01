import Stripe from 'stripe';
import Subscription from '../models/subcribtionModel.js';
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
  const subscription = await Subscription.findOne({ userId: request.user.id });

  if (!subscription || !subscription.stripeCustomerId) {
    return response.status(400).json({ message: 'Stripe customer ID not found for the user' });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('The STRIPE_WEBHOOK_SECRET environment variable is not set. Webhook handling is disabled.');
    return response.status(500).json({ message: 'Webhook handling is disabled due to missing configuration.' });
  }

  let event;
  let signature = request.headers['stripe-signature'];

  try {
    event = stripe.webhooks.constructEvent(request.body, signature, webhookSecret);
  } catch (error) {
    console.log('⚠️  Webhook signature verification failed : ', error.message);
    return response.status(400).json({ message: 'Webhook signature verification failed.' });
  }
  // Extract the object from the event.
  data = event.data;
  eventType = event.type;

  console.log('WEBHOOK EVENT data : ', data);
  console.log('WEBHOOK EVENT type : ', eventType);

  switch (eventType) {
    case 'checkout.session.completed':
      console.log('WEBHOOK : checkout.session.completed');
      if (dataObject.mode === 'subscription') {
        const customerEmail = dataObject.customer_details.email; // Récupère l'email du client
        const subscriptionId = dataObject.subscription; // Récupère l'ID de l'abonnement Stripe

        // Trouve l'utilisateur correspondant dans ta base de données
        const user = await User.findOne({ email: customerEmail });
        if (!user) {
          console.error('User not found with email:', customerEmail);
          return response.status(404).send('User not found');
        }

        // Optionnellement, récupère les détails de l'abonnement Stripe pour plus d'informations
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Met à jour ou crée l'enregistrement d'abonnement dans ta base de données
        let userSubscription = await Subscription.findOne({ userId: user._id });
        if (userSubscription) {
          // Met à jour l'abonnement existant
          userSubscription.stripeSubscriptionId = subscriptionId;
          userSubscription.subscriptionStatus = subscription.status;
          userSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          // ...autres mises à jour selon les champs de ton schéma
        } else {
          // Crée un nouvel enregistrement d'abonnement
          userSubscription = new Subscription({
            userId: user._id,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: dataObject.customer,
            planId: subscription.items.data[0].plan.id,
            subscriptionStatus: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
        }
        await userSubscription.save();
      }
      break;

    case 'customer.subscription.updated':
      console.log('WEBHOOK : customer.subscription.updated');
      // Met à jour l'enregistrement d'abonnement existant
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: dataObject.id },
        {
          subscriptionStatus: dataObject.status,
          currentPeriodStart: new Date(dataObject.current_period_start * 1000),
          currentPeriodEnd: new Date(dataObject.current_period_end * 1000),
        }
      );
      break;

    case 'customer.subscription.deleted':
      console.log('WEBHOOK : customer.subscription.deleted');
      // Marque l'abonnement comme annulé ou supprime l'enregistrement
      await Subscription.findOneAndUpdate({ stripeSubscriptionId: dataObject.id }, { subscriptionStatus: 'canceled' });
      break;
    default:
      console.log(`Unhandled event type : ${eventType}`);
  }

  response.status(200).json({ message: eventType });
};

export const deleteSubscribtion = async (request, response) => {};
