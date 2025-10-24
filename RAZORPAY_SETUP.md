# Razorpay Configuration Setup

## Issue Fixed
The application was crashing with the error: `Error: 'key_id' or 'oauthToken' is mandatory`

This was because the Razorpay payment gateway was trying to initialize without the required credentials.

## Solution Applied
1. Modified `controller/paymentcontroller.js` to handle missing Razorpay credentials gracefully
2. Added proper error handling for when Razorpay is not configured
3. Created an `env.example` file as a template for environment variables

## How to Configure Razorpay

### Step 1: Get Razorpay Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Sign up or log in to your Razorpay account
3. Navigate to the "API Keys" section
4. Copy your `Key ID` and `Key Secret`

### Step 2: Set Environment Variables
Create a `.env` file in the root directory with the following content:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

### Step 3: Restart the Application
After setting the environment variables, restart your application:

```bash
npm run dev
```

## Current Status
✅ Application now starts without crashing
✅ Razorpay integration will work once credentials are provided
✅ Proper error messages are shown when Razorpay is not configured

## Testing Payment Endpoints
- **Create Order**: `POST /create-order`
- **Validate Payment**: `POST /order/validate`

If Razorpay is not configured, these endpoints will return appropriate error messages instead of crashing the application.



