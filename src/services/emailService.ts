// Email Service for Roses Garden
// Handles all email notifications and confirmations

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery: string;
  trackingNumber?: string;
}

export interface PasswordResetData {
  customerName: string;
  customerEmail: string;
  resetLink: string;
  expiresIn: string;
}

export interface WelcomeData {
  customerName: string;
  customerEmail: string;
  loginLink: string;
}

export interface OrderStatusUpdateData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  status: string;
  statusMessage: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface AbandonedCartData {
  customerName: string;
  customerEmail: string;
  cartItems: Array<{
    name: string;
    price: number;
    image: string;
    quantity: number;
  }>;
  cartTotal: number;
  checkoutLink: string;
}

export interface ReviewRequestData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  productImage: string;
  reviewLink: string;
}

export interface BirthdayDiscountData {
  customerName: string;
  customerEmail: string;
  discountCode: string;
  discountAmount: string;
  expiryDate: string;
}

class EmailService {
  private apiKey: string;
  private baseUrl: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_EMAIL_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_EMAIL_API_URL || 'https://api.emailjs.com/api/v1.0/email/send';
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@rosesgarden.com';
    this.fromName = import.meta.env.VITE_FROM_NAME || 'Roses Garden';
  }

  // Generic email sending method
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<boolean> {
    try {
      // For development, we'll simulate email sending
      if (import.meta.env.DEV) {
        console.log('📧 Email would be sent:', {
          to,
          subject,
          html: html.substring(0, 100) + '...',
        });
        return true;
      }

      // In production, integrate with actual email service (SendGrid, Resend, etc.)
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to,
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject,
          html,
          text,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Order Confirmation Email
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    const template = this.getOrderConfirmationTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Password Reset Email
  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    const template = this.getPasswordResetTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Welcome Email
  async sendWelcomeEmail(data: WelcomeData): Promise<boolean> {
    const template = this.getWelcomeTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Order Status Update Email
  async sendOrderStatusUpdate(data: OrderStatusUpdateData): Promise<boolean> {
    const template = this.getOrderStatusUpdateTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Abandoned Cart Email
  async sendAbandonedCartReminder(data: AbandonedCartData): Promise<boolean> {
    const template = this.getAbandonedCartTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Review Request Email
  async sendReviewRequest(data: ReviewRequestData): Promise<boolean> {
    const template = this.getReviewRequestTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Birthday Discount Email
  async sendBirthdayDiscount(data: BirthdayDiscountData): Promise<boolean> {
    const template = this.getBirthdayDiscountTemplate(data);
    return this.sendEmail(
      data.customerEmail,
      template.subject,
      template.html,
      template.text
    );
  }

  // Email Templates
  private getOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
    const subject = `Order Confirmation - ${data.orderNumber} | Roses Garden`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #667eea; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Order Confirmation</h1>
            <p>Thank you for your order, ${data.customerName}!</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
              
              <h3>Items Ordered</h3>
              ${data.items.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.name}</strong><br>
                    <small>Qty: ${item.quantity}</small>
                  </div>
                  <div>$${item.price.toFixed(2)}</div>
                </div>
              `).join('')}
              
              <div class="item total">
                <div>Total Amount</div>
                <div>$${data.totalAmount.toFixed(2)}</div>
              </div>
            </div>
            
            <div class="order-details">
              <h3>Shipping Address</h3>
              <p>
                ${data.shippingAddress.street}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
                ${data.shippingAddress.country}
              </p>
            </div>
            
            <p>We'll send you another email when your order ships. If you have any questions, please contact us.</p>
            
            <a href="${window.location.origin}/orders/${data.orderNumber}" class="button">Track Your Order</a>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Confirmation - ${data.orderNumber}

Dear ${data.customerName},

Thank you for your order! We're excited to prepare your beautiful flowers.

Order Details:
- Order Number: ${data.orderNumber}
- Order Date: ${data.orderDate}
- Estimated Delivery: ${data.estimatedDelivery}
${data.trackingNumber ? `- Tracking Number: ${data.trackingNumber}` : ''}

Items Ordered:
${data.items.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

Total Amount: $${data.totalAmount.toFixed(2)}

Shipping Address:
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

We'll send you another email when your order ships. If you have any questions, please contact us.

Track your order: ${window.location.origin}/orders/${data.orderNumber}

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getPasswordResetTemplate(data: PasswordResetData): EmailTemplate {
    const subject = 'Reset Your Password - Roses Garden';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Reset your Roses Garden password</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We received a request to reset your password for your Roses Garden account.</p>
            <p>Click the button below to reset your password:</p>
            
            <a href="${data.resetLink}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in ${data.expiresIn}</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${data.resetLink}</p>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset - Roses Garden

Dear ${data.customerName},

We received a request to reset your password for your Roses Garden account.

To reset your password, click this link:
${data.resetLink}

Important:
- This link will expire in ${data.expiresIn}
- If you didn't request this reset, please ignore this email
- For security, never share this link with anyone

If the link doesn't work, copy and paste it into your browser.

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getWelcomeTemplate(data: WelcomeData): EmailTemplate {
    const subject = 'Welcome to Roses Garden! 🌹';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Roses Garden</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .benefit { display: flex; align-items: center; margin: 10px 0; }
          .icon { font-size: 24px; margin-right: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Welcome to Roses Garden!</h1>
            <p>Your journey to beautiful flowers starts here</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Welcome to Roses Garden! We're thrilled to have you join our community of flower lovers.</p>
            
            <div class="benefits">
              <h3>What you can enjoy:</h3>
              <div class="benefit">
                <span class="icon">🌹</span>
                <span>Fresh, premium quality flowers delivered to your door</span>
              </div>
              <div class="benefit">
                <span class="icon">🎨</span>
                <span>Custom bouquet builder for personalized arrangements</span>
              </div>
              <div class="benefit">
                <span class="icon">🚚</span>
                <span>Fast and reliable delivery service</span>
              </div>
              <div class="benefit">
                <span class="icon">💝</span>
                <span>Special discounts and exclusive offers</span>
              </div>
              <div class="benefit">
                <span class="icon">📱</span>
                <span>Easy order tracking and management</span>
              </div>
            </div>
            
            <p>Ready to explore our beautiful collection?</p>
            
            <a href="${data.loginLink}" class="button">Start Shopping</a>
            
            <p>If you have any questions, our customer service team is here to help!</p>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to Roses Garden! 🌹

Dear ${data.customerName},

Welcome to Roses Garden! We're thrilled to have you join our community of flower lovers.

What you can enjoy:
🌹 Fresh, premium quality flowers delivered to your door
🎨 Custom bouquet builder for personalized arrangements
🚚 Fast and reliable delivery service
💝 Special discounts and exclusive offers
📱 Easy order tracking and management

Ready to explore our beautiful collection?

Start shopping: ${data.loginLink}

If you have any questions, our customer service team is here to help!

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getOrderStatusUpdateTemplate(data: OrderStatusUpdateData): EmailTemplate {
    const subject = `Order Update - ${data.orderNumber} | ${data.status}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .status { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Order Status Update</h1>
            <p>Your order status has been updated</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            
            <div class="status-box">
              <h2>Order #${data.orderNumber}</h2>
              <div class="status">${data.status}</div>
              <p>${data.statusMessage}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
              ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
            </div>
            
            <p>We'll keep you updated on any further changes to your order status.</p>
            
            <a href="${window.location.origin}/orders/${data.orderNumber}" class="button">Track Your Order</a>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Status Update - ${data.orderNumber}

Dear ${data.customerName},

Your order status has been updated:

Order #${data.orderNumber}
Status: ${data.status}
${data.statusMessage}

${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}

We'll keep you updated on any further changes to your order status.

Track your order: ${window.location.origin}/orders/${data.orderNumber}

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getAbandonedCartTemplate(data: AbandonedCartData): EmailTemplate {
    const subject = 'Don\'t forget your beautiful flowers! 🌹';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cart-items { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
          .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
          .item-details { flex: 1; }
          .item-price { font-weight: bold; color: #667eea; }
          .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; margin-top: 15px; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌹 Complete Your Order</h1>
            <p>Your beautiful flowers are waiting for you</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We noticed you left some beautiful flowers in your cart. Don't let them wilt away!</p>
            
            <div class="cart-items">
              <h3>Items in your cart:</h3>
              ${data.cartItems.map(item => `
                <div class="item">
                  <img src="${item.image}" alt="${item.name}" class="item-image">
                  <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                  </div>
                  <div class="item-price">$${item.price.toFixed(2)}</div>
                </div>
              `).join('')}
              <div class="total">Total: $${data.cartTotal.toFixed(2)}</div>
            </div>
            
            <p>Complete your order now and bring joy to someone special (including yourself)!</p>
            
            <a href="${data.checkoutLink}" class="button">Complete Order</a>
            
            <p>This offer is valid for a limited time. Don't miss out on these beautiful flowers!</p>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Complete Your Order - Roses Garden

Dear ${data.customerName},

We noticed you left some beautiful flowers in your cart. Don't let them wilt away!

Items in your cart:
${data.cartItems.map(item => `- ${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`).join('\n')}

Total: $${data.cartTotal.toFixed(2)}

Complete your order now and bring joy to someone special (including yourself)!

Complete order: ${data.checkoutLink}

This offer is valid for a limited time. Don't miss out on these beautiful flowers!

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getReviewRequestTemplate(data: ReviewRequestData): EmailTemplate {
    const subject = 'How was your order? Share your experience! ⭐';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Review Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .product-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .product-image { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; margin: 0 auto 15px; display: block; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Share Your Experience</h1>
            <p>Your feedback helps us grow</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We hope you're enjoying your beautiful flowers from order #${data.orderNumber}!</p>
            
            <div class="product-box">
              <img src="${data.productImage}" alt="${data.productName}" class="product-image">
              <h3>${data.productName}</h3>
              <p>How was your experience with this product?</p>
            </div>
            
            <p>Your review helps other customers make informed decisions and helps us improve our service.</p>
            
            <a href="${data.reviewLink}" class="button">Write a Review</a>
            
            <p>Thank you for choosing Roses Garden. We appreciate your feedback!</p>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Share Your Experience - Roses Garden

Dear ${data.customerName},

We hope you're enjoying your beautiful flowers from order #${data.orderNumber}!

Product: ${data.productName}

How was your experience with this product?

Your review helps other customers make informed decisions and helps us improve our service.

Write a review: ${data.reviewLink}

Thank you for choosing Roses Garden. We appreciate your feedback!

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }

  private getBirthdayDiscountTemplate(data: BirthdayDiscountData): EmailTemplate {
    const subject = 'Happy Birthday! Special discount just for you! 🎂🌹';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Birthday Special</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .discount-box { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #667eea; }
          .discount-code { font-size: 32px; font-weight: bold; color: #667eea; margin: 15px 0; }
          .discount-amount { font-size: 24px; color: #667eea; margin: 10px 0; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎂 Happy Birthday!</h1>
            <p>Special discount just for you, ${data.customerName}!</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Happy Birthday! 🎉 We hope your special day is filled with joy and beautiful moments.</p>
            
            <div class="discount-box">
              <h2>Birthday Special Offer</h2>
              <div class="discount-amount">${data.discountAmount} OFF</div>
              <div class="discount-code">${data.discountCode}</div>
              <p>Use this code at checkout to claim your birthday discount!</p>
              <p><strong>Valid until:</strong> ${data.expiryDate}</p>
            </div>
            
            <p>Treat yourself or someone special to beautiful flowers on your special day!</p>
            
            <a href="${window.location.origin}" class="button">Shop Now</a>
            
            <p>Thank you for being part of the Roses Garden family. Have a wonderful birthday!</p>
          </div>
          <div class="footer">
            <p>Roses Garden - Your Joy is Roses</p>
            <p>This email was sent to ${data.customerEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Happy Birthday! Special discount just for you! 🎂🌹

Dear ${data.customerName},

Happy Birthday! 🎉 We hope your special day is filled with joy and beautiful moments.

Birthday Special Offer:
${data.discountAmount} OFF
Code: ${data.discountCode}

Use this code at checkout to claim your birthday discount!
Valid until: ${data.expiryDate}

Treat yourself or someone special to beautiful flowers on your special day!

Shop now: ${window.location.origin}

Thank you for being part of the Roses Garden family. Have a wonderful birthday!

Best regards,
Roses Garden Team
    `;

    return { subject, html, text };
  }
}

export default new EmailService();
