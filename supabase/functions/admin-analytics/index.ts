import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["admin", "florist"].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "7d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch current period orders
    const { data: currentOrders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("id, total_amount, created_at, status, user_id")
      .gte("created_at", startDate.toISOString())
      .neq("status", "cancelled");

    if (ordersError) {
      console.error("Orders fetch error:", ordersError);
    }

    // Fetch previous period orders for comparison
    const { data: previousOrders } = await supabaseAdmin
      .from("orders")
      .select("id, total_amount")
      .gte("created_at", previousStartDate.toISOString())
      .lt("created_at", startDate.toISOString())
      .neq("status", "cancelled");

    // Fetch products count
    const { count: productsCount } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact" })
      .eq("is_active", true);

    // Fetch customers count
    const { count: customersCount } = await supabaseAdmin
      .from("user_profiles")
      .select("id", { count: "exact" });

    // Fetch previous customers for comparison
    const { count: previousCustomersCount } = await supabaseAdmin
      .from("user_profiles")
      .select("id", { count: "exact" })
      .lt("created_at", startDate.toISOString());

    // Calculate stats
    const totalRevenue = (currentOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const previousRevenue = (previousOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = currentOrders?.length || 0;
    const previousOrdersCount = previousOrders?.length || 0;

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue * 100) 
      : 0;
    const ordersGrowth = previousOrdersCount > 0 
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount * 100) 
      : 0;
    const customersGrowth = (previousCustomersCount || 0) > 0
      ? (((customersCount || 0) - (previousCustomersCount || 0)) / (previousCustomersCount || 1) * 100)
      : 0;

    // Fetch top products by order items
    const { data: topProductsData } = await supabaseAdmin
      .from("order_items")
      .select(`
        product_id,
        quantity,
        total_price,
        products (
          id,
          name,
          images,
          rating,
          review_count
        )
      `)
      .not("product_id", "is", null);

    // Aggregate top products
    const productSales: Record<string, { 
      name: string; 
      sales: number; 
      revenue: number; 
      rating: number; 
      reviews: number;
      image: string;
    }> = {};

    (topProductsData || []).forEach((item: any) => {
      if (item.products) {
        const pid = item.product_id;
        if (!productSales[pid]) {
          productSales[pid] = {
            name: item.products.name,
            sales: 0,
            revenue: 0,
            rating: item.products.rating || 0,
            reviews: item.products.review_count || 0,
            image: item.products.images?.[0] || "",
          };
        }
        productSales[pid].sales += item.quantity;
        productSales[pid].revenue += item.total_price;
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Fetch recent orders with user info
    const { data: recentOrdersData } = await supabaseAdmin
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        user_id,
        user_profiles!orders_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    // Format recent orders - handle the join properly
    const recentOrders = (recentOrdersData || []).map((order: any) => {
      const profile = order.user_profiles;
      return {
        id: order.order_number || order.id,
        customer: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email : 'Guest',
        total: order.total_amount,
        status: order.status,
        date: order.created_at,
      };
    });

    // Get orders by status for chart
    const ordersByStatus: Record<string, number> = {};
    (currentOrders || []).forEach((order: any) => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    });

    const salesByCategory = Object.entries(ordersByStatus).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Generate revenue chart data
    const revenueByDay: Record<string, number> = {};
    (currentOrders || []).forEach((order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + (order.total_amount || 0);
    });

    const revenue = Object.entries(revenueByDay)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log("Analytics fetched for period:", period);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalCustomers: customersCount || 0,
          totalProducts: productsCount || 0,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          ordersGrowth: Math.round(ordersGrowth * 10) / 10,
          customersGrowth: Math.round(customersGrowth * 10) / 10,
          productsGrowth: 0,
        },
        recentOrders,
        topProducts,
        analyticsData: {
          revenue,
          salesByCategory,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch analytics" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
