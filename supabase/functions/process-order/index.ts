import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name?: string;
  custom_bouquet_data?: any;
}

interface DeliveryAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface OrderRequest {
  items: OrderItem[];
  delivery_address: DeliveryAddress;
  billing_address?: DeliveryAddress;
  delivery_date?: string;
  delivery_time_slot?: string;
  gift_message?: string;
  special_instructions?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount?: number;
  total_amount: number;
  payment_method: string;
  customer_email: string;
  customer_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const orderData: OrderRequest = await req.json();
    console.log("Processing order for user:", user.id);
    console.log("Order data:", JSON.stringify(orderData));

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No items in order" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Step 1: Verify stock availability and get current product data
    const productIds = orderData.items.map(item => item.product_id).filter(Boolean);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock_quantity, images")
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return new Response(
        JSON.stringify({ error: "Failed to verify products" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check stock availability
    for (const item of orderData.items) {
      if (!item.product_id) continue; // Skip custom bouquets
      
      const product = products?.find(p => p.id === item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${item.product_id} not found` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Step 2: Generate order number
    const orderNumber = `PP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Step 3: Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: "confirmed",
        payment_status: "paid",
        payment_method: orderData.payment_method,
        delivery_address: orderData.delivery_address,
        billing_address: orderData.billing_address || orderData.delivery_address,
        delivery_date: orderData.delivery_date,
        delivery_time_slot: orderData.delivery_time_slot,
        gift_message: orderData.gift_message,
        special_instructions: orderData.special_instructions,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        shipping_amount: orderData.shipping_amount,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount,
        currency: "USD",
        estimated_delivery: orderData.delivery_date 
          ? new Date(orderData.delivery_date).toISOString() 
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Order created:", order.id);

    // Step 4: Create order items
    const orderItems = orderData.items.map(item => {
      const product = products?.find(p => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
        custom_bouquet_data: item.custom_bouquet_data || null,
      };
    });

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Step 5: Deduct stock for each product
    for (const item of orderData.items) {
      if (!item.product_id) continue;
      
      const product = products?.find(p => p.id === item.product_id);
      if (product) {
        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        const { error: stockError } = await supabaseAdmin
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);

        if (stockError) {
          console.error(`Error updating stock for product ${item.product_id}:`, stockError);
        }
      }
    }

    // Step 6: Create initial order tracking entry
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: order.id,
        status: "confirmed",
        description: "Order confirmed and payment received",
      });

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError);
    }

    // Step 7: Clear user's cart
    const { error: cartError } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (cartError) {
      console.error("Error clearing cart:", cartError);
    }

    // Step 8: Send confirmation email (background task)
    if (resendApiKey) {
      EdgeRuntime.waitUntil(sendConfirmationEmail(
        resendApiKey,
        orderData.customer_email,
        orderData.customer_name,
        order,
        orderData.items,
        products || []
      ));
    }

    console.log("Order processing complete:", orderNumber);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order_number: orderNumber,
        message: "Order placed successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Order processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process order" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function sendConfirmationEmail(
  apiKey: string,
  customerEmail: string,
  customerName: string,
  order: any,
  items: OrderItem[],
  products: any[]
) {
  try {
    const resend = new Resend(apiKey);
    
    // Build items HTML
    const itemsHtml = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      const name = product?.name || item.product_name || "Custom Bouquet";
      const image = product?.images?.[0] || "";
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${image ? `<img src="${image}" alt="${name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ""}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${name}</strong><br>
            <span style="color: #666;">Qty: ${item.quantity}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${(item.unit_price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `;
    }).join("");

    const deliveryAddress = order.delivery_address;
    const addressHtml = `
      ${deliveryAddress.first_name} ${deliveryAddress.last_name}<br>
      ${deliveryAddress.address_line_1}<br>
      ${deliveryAddress.address_line_2 ? deliveryAddress.address_line_2 + "<br>" : ""}
      ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.postal_code}<br>
      ${deliveryAddress.country}
    `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #d4a574; margin: 0;">🌸 Petal Place</h1>
            <p style="color: #666; margin-top: 10px;">Thank you for your order!</p>
          </div>
          
          <div style="background-color: #f8f4f0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 15px 0;">Order Confirmed</h2>
            <p style="color: #666; margin: 0;">
              Hi ${customerName},<br><br>
              We've received your order and it's being prepared with care.
            </p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">Order Details</h3>
            <p><strong>Order Number:</strong> ${order.order_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            ${order.delivery_date ? `<p><strong>Delivery Date:</strong> ${new Date(order.delivery_date).toLocaleDateString()}</p>` : ""}
            ${order.delivery_time_slot ? `<p><strong>Time Slot:</strong> ${order.delivery_time_slot}</p>` : ""}
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f8f4f0;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: left;">Details</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background-color: #f8f4f0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0;">Subtotal:</td>
                <td style="text-align: right;">$${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Shipping:</td>
                <td style="text-align: right;">$${(order.shipping_amount || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Tax:</td>
                <td style="text-align: right;">$${(order.tax_amount || 0).toFixed(2)}</td>
              </tr>
              ${order.discount_amount ? `
              <tr>
                <td style="padding: 5px 0; color: #22c55e;">Discount:</td>
                <td style="text-align: right; color: #22c55e;">-$${order.discount_amount.toFixed(2)}</td>
              </tr>
              ` : ""}
              <tr style="font-weight: bold; font-size: 18px;">
                <td style="padding: 10px 0; border-top: 2px solid #d4a574;">Total:</td>
                <td style="text-align: right; border-top: 2px solid #d4a574; color: #d4a574;">$${order.total_amount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; border-bottom: 2px solid #d4a574; padding-bottom: 10px;">Delivery Address</h3>
            <p style="color: #666;">${addressHtml}</p>
          </div>

          ${order.gift_message ? `
          <div style="background-color: #fff3e0; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-top: 0;">🎁 Gift Message</h3>
            <p style="color: #666; font-style: italic;">"${order.gift_message}"</p>
          </div>
          ` : ""}

          <div style="text-align: center; padding: 30px 0; border-top: 1px solid #eee;">
            <p style="color: #666; margin: 0;">
              Questions? Reply to this email or contact us.<br>
              <strong>Petal Place</strong> - Beautiful flowers, delivered with love 🌷
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: "Petal Place <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmed - ${order.order_number}`,
      html,
    });

    console.log("Confirmation email sent to:", customerEmail);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
}

serve(handler);
