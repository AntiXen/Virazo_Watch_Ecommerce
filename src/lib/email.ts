/**
 * Email Service Helper
 * 
 * To enable real emails:
 * 1. Sign up for Resend (https://resend.com)
 * 2. Get an API Key
 * 3. Add VITE_RESEND_API_KEY to your .env
 * 4. Update the sendEmail function to use the Resend fetch API.
 */

export async function sendOrderConfirmationEmail(order: any) {
  console.log(`[MOCK EMAIL] Sending confirmation to ${order.customer_email} for order ${order.order_number}`);
  
  // Example implementation for Resend (Uncomment and add key to use)
  /*
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Virazo Watch <orders@yourdomain.com>',
      to: [order.customer_email],
      subject: `Order Confirmed: ${order.order_number}`,
      html: `
        <h1>Order Confirmed!</h1>
        <p>Hello ${order.customer_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been confirmed and is now being processed.</p>
        <p>Total: ${order.total} BDT</p>
        <p>You can view your invoice here: ${window.location.origin}/invoice/${order.id}</p>
        <br/>
        <p>Thank you for shopping with Virazo Watch!</p>
      `,
    }),
  });
  return res.json();
  */

  return { success: true, message: "Mock email sent" };
}

export async function sendOrderConfirmationSMS(order: any) {
  console.log(`[MOCK SMS] Sending confirmation text to ${order.customer_phone} for order ${order.order_number}`);
  // To enable real SMS: Use a service like Twilio or Bulksmsbd
  return { success: true };
}
