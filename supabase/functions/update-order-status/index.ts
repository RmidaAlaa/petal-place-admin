import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  order_id: string;
  status: string;
  tracking_number?: string;
  notes?: string;
}

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: "Order is pending confirmation",
  confirmed: "Order confirmed and payment received",
  preparing: "Your bouquet is being prepared with care",
  out_for_delivery: "Order is on its way to you",
  delivered: "Order has been delivered",
  cancelled: "Order has been cancelled",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user and check admin role
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

    // Check if user is admin or florist
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleData || !["admin", "florist"].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Admin or florist access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { order_id, status, tracking_number, notes }: StatusUpdateRequest = await req.json();

    // Validate request
    if (!order_id || !status) {
      return new Response(
        JSON.stringify({ error: "Order ID and status are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Valid statuses: ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get current order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update order status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (tracking_number) {
      updateData.tracking_number = tracking_number;
    }

    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", order_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order status" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Add tracking entry
    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id,
        status,
        description: notes || STATUS_DESCRIPTIONS[status] || `Status changed to ${status}`,
      });

    if (trackingError) {
      console.error("Error creating tracking entry:", trackingError);
    }

    console.log(`Order ${order_id} status updated to ${status} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        order: updatedOrder,
        message: `Order status updated to ${status}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Status update error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update order status" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
