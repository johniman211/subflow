'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Link2, 
  Code, 
  Webhook, 
  Key, 
  Copy, 
  Check, 
  ChevronRight,
  ExternalLink,
  Terminal,
  Smartphone,
  Globe,
  Shield,
  Zap,
  ArrowLeft
} from 'lucide-react';

export default function IntegrationGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-dark-950 text-lemon-400 rounded-lg p-4 overflow-x-auto text-sm border border-dark-800">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-dark-800 hover:bg-dark-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedCode === id ? (
          <Check className="h-4 w-4 text-lemon-400" />
        ) : (
          <Copy className="h-4 w-4 text-dark-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-lemon-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-grape-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
                <span className="text-[#333] font-black text-xs italic">PAY</span>
              </div>
              <span className="text-xl font-black text-white italic">SSD</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Integration Guide
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Everything you need to accept payments on your website with Payssd. 
            Choose the integration method that works best for you.
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <a href="#payment-links" className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 hover:shadow-lg hover:border-lemon-400/50 transition-all group">
              <div className="w-12 h-12 bg-lemon-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lemon-400/30 transition-colors">
                <Link2 className="h-6 w-6 text-lemon-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Payment Links</h3>
              <p className="text-slate-600 text-sm mb-3">Share a link to accept payments. No coding required.</p>
              <span className="text-lemon-400 text-sm font-medium flex items-center gap-1">
                Easiest <ChevronRight className="h-4 w-4" />
              </span>
            </a>
            
            <a href="#embed-widget" className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 hover:shadow-lg hover:border-lemon-400/50 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Embed Widget</h3>
              <p className="text-slate-600 text-sm mb-3">Add checkout to your website with a few lines of code.</p>
              <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
                Recommended <ChevronRight className="h-4 w-4" />
              </span>
            </a>
            
            <a href="#api-integration" className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 hover:shadow-lg hover:border-lemon-400/50 transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Terminal className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">API Integration</h3>
              <p className="text-slate-600 text-sm mb-3">Full control with our REST API for custom integrations.</p>
              <span className="text-purple-600 text-sm font-medium flex items-center gap-1">
                Advanced <ChevronRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Payment Links Section */}
      <section id="payment-links" className="py-16 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-lemon-400/20 rounded-lg flex items-center justify-center">
              <Link2 className="h-5 w-5 text-lemon-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">1. Payment Links</h2>
            <span className="px-2 py-1 bg-lemon-400/20 text-emerald-700 text-xs font-medium rounded-full">Easiest</span>
          </div>
          
          <p className="text-slate-600 mb-8">
            The simplest way to accept payments. Create a product in your dashboard and share the payment link 
            anywhere - your website, WhatsApp, social media, or email.
          </p>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">How it works:</h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-lemon-400/20 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                <div>
                  <p className="font-medium text-slate-900">Create a product in your dashboard</p>
                  <p className="text-slate-600 text-sm">Go to Dashboard → Products → New Product</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-lemon-400/20 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                <div>
                  <p className="font-medium text-slate-900">Copy your payment link</p>
                  <p className="text-slate-600 text-sm">Each product gets a unique payment URL</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-lemon-400/20 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                <div>
                  <p className="font-medium text-slate-900">Share the link with customers</p>
                  <p className="text-slate-600 text-sm">Put it on your website, send via WhatsApp, post on social media</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-dark-800/50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Link Format:</h3>
            <CodeBlock 
              code={`https://www.payssd.com/pay/your-business-name/product-name

# Examples:
https://www.payssd.com/pay/juba-fitness/monthly-membership
https://www.payssd.com/pay/tech-academy/web-development-course
https://www.payssd.com/pay/my-store/premium-subscription`}
              language="text"
              id="payment-link"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Add to your website:</h3>
            <CodeBlock 
              code={`<!-- Simple link -->
<a href="https://www.payssd.com/pay/your-business/your-product">
  Subscribe Now
</a>

<!-- Styled button -->
<a href="https://www.payssd.com/pay/your-business/your-product" 
   style="display: inline-block; padding: 12px 24px; background: #10b981; 
          color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
  Subscribe - 50,000 SSP/month
</a>`}
              language="html"
              id="payment-link-html"
            />
          </div>
        </div>
      </section>

      {/* Embed Widget Section */}
      <section id="embed-widget" className="py-16 px-4 bg-dark-800/50 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">2. Embed Widget</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Recommended</span>
          </div>
          
          <p className="text-slate-600 mb-8">
            Add our JavaScript SDK to your website for a seamless checkout experience. 
            Customers can complete payments without leaving your site.
          </p>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Step 1: Add the SDK script</h3>
            <CodeBlock 
              code={`<script src="https://www.payssd.com/embed.js"></script>`}
              language="html"
              id="sdk-script"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Option A: Modal Popup (Recommended)</h3>
            <p className="text-slate-600 text-sm mb-4">Opens checkout in a popup modal over your page.</p>
            <CodeBlock 
              code={`<!-- Button to trigger checkout -->
<button onclick="openCheckout()">Subscribe Now</button>

<script>
function openCheckout() {
  Payssd.checkout({
    productId: 'your-product-id',  // Get this from your dashboard
    
    // Called when customer submits payment
    onSuccess: function(payment) {
      console.log('Payment submitted:', payment);
      alert('Thank you! We will confirm your payment shortly.');
    },
    
    // Called if there's an error
    onError: function(error) {
      console.error('Payment error:', error);
    }
  });
}
</script>`}
              language="html"
              id="modal-popup"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Option B: Inline Embed</h3>
            <p className="text-slate-600 text-sm mb-4">Embed checkout form directly into your page.</p>
            <CodeBlock 
              code={`<!-- Container for the checkout form -->
<div id="payment-form"></div>

<script>
Payssd.embed({
  container: '#payment-form',
  productId: 'your-product-id',
  height: '650px',  // Optional: customize height
  
  onSuccess: function(payment) {
    console.log('Payment submitted:', payment);
  }
});
</script>`}
              language="html"
              id="inline-embed"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Option C: Auto-Initialize with Data Attributes</h3>
            <p className="text-slate-600 text-sm mb-4">Simplest method - no JavaScript coding needed.</p>
            <CodeBlock 
              code={`<!-- Just add data attributes to any button or link -->
<button data-payssd-product="your-product-id">
  Pay Now
</button>

<!-- Works on any element -->
<a href="#" data-payssd-product="your-product-id">
  Subscribe - 50,000 SSP/month
</a>`}
              language="html"
              id="data-attributes"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Option D: Styled Button</h3>
            <p className="text-slate-600 text-sm mb-4">Create a pre-styled payment button.</p>
            <CodeBlock 
              code={`<!-- Container for the button -->
<div id="pay-button"></div>

<script>
Payssd.button({
  container: '#pay-button',
  productId: 'your-product-id',
  text: 'Subscribe - 50,000 SSP/month',
  
  onSuccess: function(payment) {
    window.location.href = '/thank-you';
  }
});
</script>`}
              language="html"
              id="styled-button"
            />
          </div>
        </div>
      </section>

      {/* API Integration Section */}
      <section id="api-integration" className="py-16 px-4 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Terminal className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">3. API Integration</h2>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Advanced</span>
          </div>
          
          <p className="text-slate-600 mb-8">
            Full control over the payment flow with our REST API. Perfect for custom checkout experiences 
            and server-side integrations.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Get your API Key</p>
                <p className="text-amber-700 text-sm">Go to Dashboard → API Keys to create your secret key. Keep it secure!</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Base URL</h3>
            <CodeBlock 
              code={`https://www.payssd.com/api/v1`}
              language="text"
              id="base-url"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Authentication</h3>
            <p className="text-slate-600 text-sm mb-4">Include your API key in the Authorization header:</p>
            <CodeBlock 
              code={`Authorization: Bearer sk_live_your_api_key_here`}
              language="text"
              id="auth-header"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Create Checkout Session</h3>
            <p className="text-slate-600 text-sm mb-4">Create a payment session and get checkout URL or payment details.</p>
            <CodeBlock 
              code={`POST /api/v1/checkout/create

// Request
{
  "price_id": "price_xxxxx",
  "customer_phone": "+211912345678",
  "customer_email": "customer@email.com",  // Optional
  "success_url": "https://yoursite.com/success",  // Optional
  "cancel_url": "https://yoursite.com/cancel"  // Optional
}

// Response
{
  "success": true,
  "data": {
    "checkout_session": {
      "id": "pay_xxxxx",
      "url": "https://www.payssd.com/checkout/...",
      "reference_code": "ABC123",
      "amount": 50000,
      "currency": "SSP",
      "expires_at": "2026-01-13T14:00:00Z",
      "payment_methods": {
        "mtn_momo": {
          "number": "0912345678",
          "name": "Your Business"
        }
      }
    }
  }
}`}
              language="javascript"
              id="create-checkout"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Check Customer Access</h3>
            <p className="text-slate-600 text-sm mb-4">Verify if a customer has an active subscription.</p>
            <CodeBlock 
              code={`POST /api/v1/access/check

// Request
{
  "product_id": "prod_xxxxx",
  "customer_phone": "+211912345678"
}

// Response
{
  "success": true,
  "data": {
    "has_access": true,
    "subscription": {
      "id": "sub_xxxxx",
      "status": "active",
      "current_period_end": "2026-02-12T00:00:00Z",
      "days_remaining": 30,
      "is_renewable": true
    }
  }
}`}
              language="javascript"
              id="check-access"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">List Subscriptions</h3>
            <p className="text-slate-600 text-sm mb-4">Get all subscriptions for your account.</p>
            <CodeBlock 
              code={`GET /api/v1/subscriptions?status=active&limit=50

// Response
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "sub_xxxxx",
        "status": "active",
        "customer_phone": "+211912345678",
        "customer_email": "john@email.com",
        "current_period_start": "2026-01-12T00:00:00Z",
        "current_period_end": "2026-02-12T00:00:00Z",
        "product": {
          "id": "prod_xxxxx",
          "name": "Monthly Membership"
        },
        "price": {
          "amount": 50000,
          "currency": "SSP",
          "billing_cycle": "monthly"
        }
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 1
    }
  }
}`}
              language="javascript"
              id="list-subscriptions"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Example: Node.js Integration</h3>
            <CodeBlock 
              code={`const PAYSSD_API_KEY = 'sk_live_your_api_key';
const BASE_URL = 'https://www.payssd.com/api/v1';

// Create checkout session
async function createCheckout(priceId, customerPhone) {
  const response = await fetch(\`\${BASE_URL}/checkout/create\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${PAYSSD_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      price_id: priceId,
      customer_phone: customerPhone
    })
  });
  
  return response.json();
}

// Check customer access
async function checkAccess(productId, customerPhone) {
  const response = await fetch(\`\${BASE_URL}/access/check\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${PAYSSD_API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      product_id: productId,
      customer_phone: customerPhone
    })
  });
  
  const data = await response.json();
  return data.data.has_access;
}`}
              language="javascript"
              id="nodejs-example"
            />
          </div>
        </div>
      </section>

      {/* Webhooks Section */}
      <section id="webhooks" className="py-16 px-4 bg-dark-800/50 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Webhook className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">4. Webhooks</h2>
          </div>
          
          <p className="text-slate-600 mb-8">
            Receive real-time notifications when payments are confirmed or subscriptions change. 
            Configure webhooks in Dashboard → Webhooks.
          </p>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Available Events</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">payment.created</p>
                <p className="text-slate-600 text-sm">Customer submits a payment</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">payment.confirmed</p>
                <p className="text-slate-600 text-sm">Payment is confirmed by merchant</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">subscription.created</p>
                <p className="text-slate-600 text-sm">New subscription activated</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">subscription.renewed</p>
                <p className="text-slate-600 text-sm">Subscription period extended</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">subscription.expired</p>
                <p className="text-slate-600 text-sm">Subscription has expired</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-lg">
                <p className="font-mono text-sm text-lemon-400 mb-1">subscription.cancelled</p>
                <p className="text-slate-600 text-sm">Subscription was cancelled</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Webhook Payload</h3>
            <CodeBlock 
              code={`{
  "event": "payment.confirmed",
  "timestamp": "2026-01-12T14:00:00Z",
  "data": {
    "payment": {
      "id": "pay_xxxxx",
      "reference_code": "ABC123",
      "amount": 50000,
      "currency": "SSP",
      "status": "confirmed",
      "customer_phone": "+211912345678",
      "customer_email": "john@email.com"
    },
    "product": {
      "id": "prod_xxxxx",
      "name": "Monthly Membership"
    },
    "subscription": {
      "id": "sub_xxxxx",
      "status": "active",
      "current_period_end": "2026-02-12T00:00:00Z"
    }
  }
}`}
              language="json"
              id="webhook-payload"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Webhook Headers</h3>
            <p className="text-slate-600 text-sm mb-4">Each webhook includes these headers for verification:</p>
            <CodeBlock 
              code={`X-Payssd-Signature: sha256_hash_of_payload
X-Payssd-Timestamp: 1704981600000
X-Payssd-Event: payment.confirmed`}
              language="text"
              id="webhook-headers"
            />
          </div>

          <div className="bg-dark-900/50 rounded-xl border border-dark-800 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Example: Express.js Webhook Handler</h3>
            <CodeBlock 
              code={`const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/webhooks/payssd', express.json(), (req, res) => {
  const signature = req.headers['x-payssd-signature'];
  const timestamp = req.headers['x-payssd-timestamp'];
  const event = req.headers['x-payssd-event'];
  
  // Verify signature (optional but recommended)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(\`\${timestamp}.\${JSON.stringify(req.body)}\`)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Handle the event
  switch (event) {
    case 'payment.confirmed':
      const { payment, subscription } = req.body.data;
      console.log('Payment confirmed:', payment.reference_code);
      // Grant access to customer
      grantAccess(payment.customer_phone, subscription);
      break;
      
    case 'subscription.expired':
      const { subscription: expiredSub } = req.body.data;
      console.log('Subscription expired:', expiredSub.id);
      // Revoke access
      revokeAccess(expiredSub.customer_phone);
      break;
  }
  
  res.json({ received: true });
});`}
              language="javascript"
              id="webhook-handler"
            />
          </div>
        </div>
      </section>

      {/* Complete Flow */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Complete Integration Flow</h2>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <p className="font-semibold">Setup</p>
                  <p className="text-slate-300 text-sm">Create account → Add MTN MoMo number → Create products</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <p className="font-semibold">Integrate</p>
                  <p className="text-slate-300 text-sm">Add payment links, embed widget, or use API</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <p className="font-semibold">Customer Pays</p>
                  <p className="text-slate-300 text-sm">Customer sees checkout → Pays via MTN MoMo → Gets reference code</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <p className="font-semibold">You Confirm</p>
                  <p className="text-slate-300 text-sm">See payment in dashboard → Click Confirm → Subscription activated</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold">5</div>
                <div>
                  <p className="font-semibold">Webhook Notification</p>
                  <p className="text-slate-300 text-sm">Your server receives event → Grant customer access automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-lemon-400/10 to-grape-500/10 border border-lemon-400/20 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
            <p className="text-dark-300 mb-8">Create your account and start accepting payments in minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register"
                className="btn-primary btn-lg"
              >
                Create Free Account
              </Link>
              <Link 
                href="/dashboard"
                className="px-8 py-3 bg-dark-800 text-white rounded-xl font-semibold hover:bg-dark-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#F7C500] rounded-full flex items-center justify-center">
                <span className="text-[#333] font-black text-[10px] italic">PAY</span>
              </div>
              <span className="text-white font-black italic">SSD</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-dark-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-dark-500 text-sm">© {new Date().getFullYear()} Payssd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
