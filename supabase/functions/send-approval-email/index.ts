import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  email: string;
  materialTitle: string;
  externalLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract and verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // 3. Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Invalid authentication:", userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check if user has admin role using the has_role function
    const { data: hasAdminRole, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });
    
    const { data: hasSuperAdminRole } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'super_admin' });

    if (roleError || (!hasAdminRole && !hasSuperAdminRole)) {
      console.error("Unauthorized - admin access required for user:", user.id);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Validate input
    const { email, materialTitle, externalLink }: ApprovalEmailRequest = await req.json();
    
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!materialTitle || typeof materialTitle !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid material title' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize materialTitle to prevent injection
    const sanitizedTitle = materialTitle.replace(/[<>]/g, '').substring(0, 200);

    console.log(`Admin ${user.id} sending approval email to ${email} for material: ${sanitizedTitle}`);

    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "DevLearn",
          email: "noreply@devlearn.com",
        },
        to: [{ email }],
        subject: `Access Granted: ${sanitizedTitle}`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7C3AED, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Payment Approved!</h1>
              </div>
              <div class="content">
                <p>Great news! Your payment for <strong>${sanitizedTitle}</strong> has been verified and approved.</p>
                <p>You now have full access to this resource.</p>
                ${externalLink ? `<a href="${externalLink}" class="button">Access Your Resource</a>` : '<a href="https://devlearn.app/my-purchases" class="button">View My Purchases</a>'}
                <p style="margin-top: 30px;">Thank you for your purchase!</p>
              </div>
              <div class="footer">
                <p>DevLearn - Learn, Build, Grow</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
