import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendFulfillmentEmailProps {
  to: string;
  userName: string;
  orderId: string;
  totalAmount: string;
  fulfillmentDetails: {
    serviceName: string;
    keys: string[];
  }[];
}

export const sendFulfillmentEmail = async ({
  to,
  userName,
  orderId,
  totalAmount,
  fulfillmentDetails
}: SendFulfillmentEmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email delivery skipped.");
    return { error: "Email configuration missing" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CrossPay <onboarding@resend.dev>', // In production, use your verified domain
      to: [to],
      subject: 'Your Digital Keys from CrossPay 🚀',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Digital Keys</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0; background-color: #f0f0f0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 4px solid #000; box-shadow: 12px 12px 0px #000; padding: 40px; }
            .header { border-bottom: 4px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; }
            .highlight { color: #FF00F5; }
            h1 { font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; letter-spacing: -1px; }
            .order-info { background: #FFE600; border: 3px solid #000; padding: 15px; margin-bottom: 30px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .service-card { border: 3px solid #000; padding: 20px; margin-bottom: 20px; position: relative; }
            .service-name { font-size: 18px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; display: block; border-bottom: 2px solid #000; padding-bottom: 5px; }
            .key-container { background: #00F0FF; border: 2px solid #000; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 16px; font-weight: bold; word-break: break-all; }
            .footer { margin-top: 40px; font-size: 12px; font-weight: bold; text-transform: uppercase; opacity: 0.6; text-align: center; }
            .button { display: inline-block; background: #00FF66; color: #000; border: 3px solid #000; padding: 15px 30px; text-decoration: none; font-weight: 900; text-transform: uppercase; margin-top: 20px; box-shadow: 4px 4px 0px #000; }
            .button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #000; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Cross<span class="highlight">Pay</span></div>
              <h1>Digital Delivery Confirmation</h1>
            </div>

            <p>Hey <strong>${userName}</strong>,</p>
            <p>Thank you for choosing CrossPay! Your payment was successful, and your digital keys are ready for use. Below are the details of your purchase:</p>

            <div class="order-info">
              Order ID: #${orderId.slice(0, 8)}...<br>
              Total Paid: NPR ${totalAmount}
            </div>

            ${fulfillmentDetails.map(detail => `
              <div class="service-card">
                <span class="service-name">${detail.serviceName}</span>
                <div style="margin-top: 10px; font-size: 12px; text-transform: uppercase; opacity: 0.7;">Your Digital Key(s):</div>
                ${detail.keys.map(key => `
                  <div class="key-container">${key}</div>
                `).join('')}
              </div>
            `).join('')}

            <p>To use your keys, simply copy and paste them into the respective service's redemption page.</p>
            
            <a href="${process.env.BETTER_AUTH_URL}/dashboard" class="button">Go to Dashboard</a>

            <div class="footer">
              &copy; 2026 CrossPay Nepal. All rights reserved.<br>
              Need help? Contact us at support@crosspay.com.np
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { error: "Internal server error during email delivery" };
  }
};
