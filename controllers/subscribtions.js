import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscribtion = async (request, response) => {
  const { userId, planId } = request.body;

  try {
    // Création d'un client Stripe
    const customer = await stripe.customers.create({
      email: request?.user.email,
      name: request?.user.name,
    });

    const stripeCustomerId = customer.id;

    // Enregistre l'ID client Stripe dans ta base de données pour une utilisation future
    console.log('customer : ', customer);

    // On récupère les produits
    const products = await stripe.products.list({
      limit: 1,
    });
    console.log('product : ', products.data[0]);

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: products.data[0].default_price }],
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('subscription : ', subscription);

    // Enregistre les détails de l'abonnement dans ta base de données

    response.json(subscription);
  } catch (error) {
    console.error('Erreur lors de la création de l’abonnement :', error);
    response.status(500).json({ message: error.message });
  }
};

export const deleteSubscribtion = async (request, response) => {};
