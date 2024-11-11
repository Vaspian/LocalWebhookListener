const stripe = require('stripe')('TEST_SECRET_KEY'');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "WEBHOOK_SECRET";

// Middleware to parse JSON and verify signature
app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Log the entire event for debugging
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Handle the event
  switch (event.type) {
    case 'charge.captured':
      console.log('Charge captured:', event.data.object);
      break;
    case 'charge.failed':
      console.log('Charge failed:', event.data.object);
      break;
    case 'charge.succeeded':
      console.log('charge.succeeded event reached!'); // Debugging line
      console.log(event.data.object); // This is the line we'll focus on
      break;
    case 'invoice.created':
      console.log('Invoice created:', event.data.object);
      break;
    case 'invoice.finalized':
      console.log('Invoice finalized:', event.data.object);
      break;
    case 'invoice.paid':
      console.log('Invoice paid:', event.data.object);
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.status(200).send();
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));