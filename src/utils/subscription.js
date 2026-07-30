// utils
import { postApiCall } from 'src/utils/apiRequests';

// constants
import {
  ENTERPRISE_OUTBOUND_CAPACITY, ENTERPRISE_OUTBOUND_PRICING,
  PLAN_CHARGE_TYPES,
} from 'boot/constants';

export const createSetupIntent = async () => {
  try {
    // fetch the client secret from BE
    const response = await postApiCall({
      endpoint: 'subscription/create-setup-intent',
      payload: {},
    });

    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to save business details. Please try again later.');
  }
};

export const saveBusinessDetails = async ({
  billingDetails, gstNumber,
}) => {
  try {
    const payload = {
      business_address: billingDetails,
    };

    if (gstNumber) {
      payload.tax_details = {
        type: 'in_gst',
        value: gstNumber,
      };
    }

    await postApiCall({
      endpoint: 'subscription/save-business-details',
      payload,
    });

    return true;
  } catch (error) {
    throw new Error(error.message || 'Failed to save business details. Please try again later.');
  }
};

export const setupStripeIntent = async ({
  customerClientSecret, billingDetails, stripeInputRef,
}) => {
  try {
    const response = await stripeInputRef.stripe
      ?.confirmCardSetup(customerClientSecret, {
        payment_method: {
          card: stripeInputRef?.cardElement,
          billing_details: billingDetails,
        },
      });

    if (response.error) {
      // throw error to the parent component
      throw new Error(response.error.message);
    }

    return response?.setupIntent?.payment_method;
  } catch (error) {
    // throw error to the parent component
    throw new Error('Failed to setup Stripe card setup. Please try again later.');
  }
};

export const confirmStripePayment = async ({
  customerClientSecret, confirmCardPayment,
}) => {
  try {
    // confirm the card setup
    const response = await confirmCardPayment(customerClientSecret);

    if (response.error) {
      // throw error to the parent component
      throw new Error(response.error.message);
    }

    return true;
  } catch (error) {
    // throw error to the parent component
    throw new Error(error.message || 'Failed to confirm Stripe payment. Please try again later.');
  }
};

export const calculatePriceByOutboundCapacity = (capacity) => {
  const BASE_PRICE = PLAN_CHARGE_TYPES.month.ENTERPRISE_PLAN;

  if (capacity <= ENTERPRISE_OUTBOUND_CAPACITY.min) {
    return BASE_PRICE;
  }

  // anything above 1 million
  if (capacity >= 1000000) {
    return (capacity * ENTERPRISE_OUTBOUND_PRICING.EVERY_1M) / 1000000;
  }

  return (capacity * ENTERPRISE_OUTBOUND_PRICING.EVERY_100K) / 100000;
};
