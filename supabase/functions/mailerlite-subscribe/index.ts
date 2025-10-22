import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
const MAILERLITE_GROUP_ID = "144434370088184786";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  restaurantName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MAILERLITE_API_KEY) {
      console.error("MAILERLITE_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { email, restaurantName }: SubscribeRequest = await req.json();

    // Validate inputs
    if (!email || !restaurantName) {
      return new Response(
        JSON.stringify({ error: "Email and restaurant name are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Subscribing to MailerLite:", email, restaurantName);

    // Subscribe to MailerLite
    const formData = new URLSearchParams();
    formData.append("fields[email]", email);
    formData.append("fields[name]", restaurantName);
    formData.append("groups[]", MAILERLITE_GROUP_ID);

    const response = await fetch(
      "https://connect.mailerlite.com/api/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MAILERLITE_API_KEY}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email,
          fields: {
            name: restaurantName,
          },
          groups: [MAILERLITE_GROUP_ID],
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error("MailerLite API error:", responseData);
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData.message || "Failed to subscribe",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Successfully subscribed to MailerLite");

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in mailerlite-subscribe function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
