import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductData {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category: string;
  stock_quantity: number;
  images?: string[];
  colors?: string[];
  sizes?: string[];
  occasions?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  care_instructions?: string;
  sku?: string;
}

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

    // Check admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "create": {
        const productData: ProductData = await req.json();
        console.log("Creating product:", productData.name);

        const { data: product, error } = await supabaseAdmin
          .from("products")
          .insert({
            name: productData.name,
            description: productData.description,
            price: productData.price,
            original_price: productData.original_price,
            category: productData.category,
            stock_quantity: productData.stock_quantity,
            images: productData.images || [],
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            occasions: productData.occasions || [],
            is_featured: productData.is_featured || false,
            is_new: productData.is_new || true,
            is_active: productData.is_active !== false,
            care_instructions: productData.care_instructions,
            sku: productData.sku || `SKU-${Date.now()}`,
          })
          .select()
          .single();

        if (error) {
          console.error("Create product error:", error);
          throw new Error(error.message);
        }

        return new Response(
          JSON.stringify({ success: true, product }),
          { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "update": {
        const { id, ...updateData }: { id: string } & Partial<ProductData> = await req.json();
        console.log("Updating product:", id);

        const { data: product, error } = await supabaseAdmin
          .from("products")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Update product error:", error);
          throw new Error(error.message);
        }

        return new Response(
          JSON.stringify({ success: true, product }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "delete": {
        const { id } = await req.json();
        console.log("Deleting product:", id);

        const { error } = await supabaseAdmin
          .from("products")
          .update({ is_active: false })
          .eq("id", id);

        if (error) {
          console.error("Delete product error:", error);
          throw new Error(error.message);
        }

        return new Response(
          JSON.stringify({ success: true, message: "Product deactivated" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "list": {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const category = url.searchParams.get("category");
        const search = url.searchParams.get("search");
        const includeInactive = url.searchParams.get("includeInactive") === "true";

        let query = supabaseAdmin
          .from("products")
          .select("*", { count: "exact" });

        if (!includeInactive) {
          query = query.eq("is_active", true);
        }

        if (category) {
          query = query.eq("category", category);
        }

        if (search) {
          query = query.ilike("name", `%${search}%`);
        }

        const { data: products, error, count } = await query
          .order("created_at", { ascending: false })
          .range((page - 1) * limit, page * limit - 1);

        if (error) {
          throw new Error(error.message);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            products, 
            total: count,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: create, update, delete, list" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
  } catch (error: any) {
    console.error("Manage products error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to manage products" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
