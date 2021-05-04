import axios from 'axios';
import { showAlert } from './alert.js';

const stripe = Stripe(
  'pk_test_51IjqQhSD4e2Y5NvLNjK0Cc0IKg44RF7XmMBOyA9v9VQ958ZVaKq0sY4APzWyQErE0rYabOIdO7397SKFFl0QrXpw00FSVDUr0X'
);

export const bookTour = async (checkoutTourId) => {
  try {
    // 1) get the seesion details using the axios service
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${checkoutTourId}`
    );
    // console.log(response);
    // 2) Call the stripe object with the public key
    const result = await stripe.redirectToCheckout({
      sessionId: response.data.session.id,
    });
    // console.log(result);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
