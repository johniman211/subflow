'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Code, Globe, Webhook, Key, CreditCard, Users, Terminal } from 'lucide-react';

const codeExamples = {
  javascript: {
    checkout: `// Initialize Payssd
const payssd = new Payssd('pk_live_your_public_key');

// Open checkout modal
payssd.checkout({
  priceId: 'price_abc123',
  customerPhone: '+211912345678',
  customerEmail: 'customer@example.com',
  onSuccess: (data) => {
    console.log('Payment successful!', data);
    // Grant access to your product
  },
  onCancel: () => {
    console.log('Payment cancelled');
  }
});`,
    accessCheck: `// Check subscription access (Server-side only)
const response = await fetch('https://payssd.com/api/v1/access/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_secret_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product_id: 'prod_abc123',
    customer_phone: '+211912345678'
  })
});

const { has_access, subscription } = await response.json();

if (has_access) {
  // Grant access to content
} else {
  // Redirect to checkout
}`,
  },
  php: {
    accessCheck: `<?php
// Check subscription access
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://payssd.com/api/v1/access/check",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer sk_live_your_secret_key",
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "product_id" => "prod_abc123",
    "customer_phone" => "+211912345678"
  ])
]);

$response = curl_exec($curl);
$result = json_decode($response, true);

if ($result['has_access']) {
    // Grant access to content
} else {
    // Redirect to checkout
}
?>`,
    webhook: `<?php
// Verify webhook signature
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PAYSSD_SIGNATURE'];
$timestamp = $_SERVER['HTTP_X_PAYSSD_TIMESTAMP'];

$expected = hash_hmac('sha256', $timestamp . '.' . $payload, $webhook_secret);

if (hash_equals($expected, $signature)) {
    $event = json_decode($payload, true);
    
    switch ($event['event']) {
        case 'payment.confirmed':
            // Activate subscription
            break;
        case 'subscription.expired':
            // Revoke access
            break;
    }
    
    http_response_code(200);
} else {
    http_response_code(401);
}
?>`,
  },
  wordpress: {
    plugin: `<?php
/**
 * Plugin Name: Payssd Integration
 * Description: Accept payments via Payssd
 */

// Add Payssd SDK to your theme
function payssd_enqueue_scripts() {
    wp_enqueue_script(
        'payssd-sdk',
        'https://payssd.com/sdk/payssd.js',
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'payssd_enqueue_scripts');

// Shortcode for checkout button
function payssd_checkout_button($atts) {
    $atts = shortcode_atts([
        'price_id' => '',
        'text' => 'Subscribe Now',
    ], $atts);
    
    return sprintf(
        '<button onclick="openPayssdCheckout(\'%s\')">%s</button>
        <script>
        function openPayssdCheckout(priceId) {
            const phone = prompt("Enter your phone number:");
            if (phone) {
                const payssd = new Payssd("pk_live_your_key");
                payssd.checkout({
                    priceId: priceId,
                    customerPhone: phone,
                    onSuccess: () => location.reload()
                });
            }
        }
        </script>',
        esc_attr($atts['price_id']),
        esc_html($atts['text'])
    );
}
add_shortcode('payssd_checkout', 'payssd_checkout_button');

// Check access before showing content
function payssd_check_access($product_id, $phone) {
    $response = wp_remote_post('https://payssd.com/api/v1/access/check', [
        'headers' => [
            'Authorization' => 'Bearer ' . PAYSSD_SECRET_KEY,
            'Content-Type' => 'application/json',
        ],
        'body' => json_encode([
            'product_id' => $product_id,
            'customer_phone' => $phone,
        ]),
    ]);
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['has_access'] ?? false;
}
?>`,
  },
};

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative">
      <div className="absolute top-2 right-2">
        <button
          onClick={() => copyCode(code, id)}
          className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          {copiedCode === id ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-300" />
          )}
        </button>
      </div>
      <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Payssd API Documentation</h1>
          </div>
          <Link href="/dashboard/api-keys" className="btn-primary btn-sm">
            Get API Keys
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <nav className="sticky top-8 space-y-1">
              {[
                { id: 'quickstart', label: 'Quick Start', icon: Terminal },
                { id: 'authentication', label: 'Authentication', icon: Key },
                { id: 'checkout', label: 'Checkout', icon: CreditCard },
                { id: 'access', label: 'Access Check', icon: Users },
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                { id: 'wordpress', label: 'WordPress', icon: Globe },
                { id: 'sdk', label: 'JavaScript SDK', icon: Code },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-9 space-y-8">
            {activeTab === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
                  <p className="text-gray-600 mb-6">
                    Integrate Payssd payments into your website in minutes. Accept MTN Mobile Money 
                    and Bank Transfers from customers in South Sudan.
                  </p>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">1. Get your API Keys</h3>
                  <p className="text-gray-600">
                    Go to your <Link href="/dashboard/api-keys" className="text-primary-600 hover:underline">API Keys</Link> page 
                    and create a new key pair. You&apos;ll get:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li><strong>Public Key (pk_...)</strong> - Use in frontend/browser code</li>
                    <li><strong>Secret Key (sk_...)</strong> - Use in backend/server code only</li>
                  </ul>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">2. Add the SDK to your website</h3>
                  <CodeBlock
                    id="sdk-script"
                    language="html"
                    code={`<script src="https://payssd.com/sdk/payssd.js"></script>`}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">3. Create a checkout button</h3>
                  <CodeBlock
                    id="checkout-button"
                    language="javascript"
                    code={codeExamples.javascript.checkout}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">4. Verify access on your server</h3>
                  <CodeBlock
                    id="access-check"
                    language="javascript"
                    code={codeExamples.javascript.accessCheck}
                  />
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">API Key Types</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Public Key (pk_...)</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Safe to use in browser/frontend code. Used with the JavaScript SDK.
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900">Secret Key (sk_...)</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Keep secret! Only use in server-side code. Never expose in frontend.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Using the Secret Key</h3>
                  <p className="text-gray-600">Include your secret key in the Authorization header:</p>
                  <CodeBlock
                    id="auth-header"
                    language="bash"
                    code={`curl -X POST https://payssd.com/api/v1/access/check \\
  -H "Authorization: Bearer sk_live_your_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{"product_id": "...", "customer_phone": "..."}'`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'checkout' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout API</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">POST /api/v1/checkout/create</h3>
                  <p className="text-gray-600">Create a new checkout session.</p>
                  
                  <h4 className="font-medium mt-4">Request Body</h4>
                  <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono">
                    <div><span className="text-purple-600">price_id</span>: <span className="text-gray-600">string (required)</span></div>
                    <div><span className="text-purple-600">customer_phone</span>: <span className="text-gray-600">string (required)</span></div>
                    <div><span className="text-purple-600">customer_email</span>: <span className="text-gray-600">string (optional)</span></div>
                    <div><span className="text-purple-600">success_url</span>: <span className="text-gray-600">string (optional)</span></div>
                    <div><span className="text-purple-600">cancel_url</span>: <span className="text-gray-600">string (optional)</span></div>
                    <div><span className="text-purple-600">metadata</span>: <span className="text-gray-600">object (optional)</span></div>
                  </div>

                  <h4 className="font-medium mt-4">Response</h4>
                  <CodeBlock
                    id="checkout-response"
                    language="json"
                    code={`{
  "success": true,
  "checkout_session": {
    "id": "pay_abc123",
    "url": "https://your-app.com/checkout/prod_xyz?payment=pay_abc123",
    "reference_code": "1234567890",
    "amount": 5000,
    "currency": "SSP",
    "expires_at": "2024-01-02T00:00:00Z",
    "product": { "id": "...", "name": "...", "type": "subscription" },
    "price": { "id": "...", "name": "...", "billing_cycle": "monthly" },
    "payment_methods": {
      "mtn_momo": { "number": "+211...", "name": "Business Name" },
      "bank_transfer": { ... }
    }
  }
}`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'access' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Check API</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">POST /api/v1/access/check</h3>
                  <p className="text-gray-600">Check if a customer has active access to a product.</p>
                  
                  <h4 className="font-medium mt-4">Request Body</h4>
                  <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono">
                    <div><span className="text-purple-600">product_id</span>: <span className="text-gray-600">string (required)</span></div>
                    <div><span className="text-purple-600">customer_phone</span>: <span className="text-gray-600">string (required)</span></div>
                  </div>

                  <h4 className="font-medium mt-4">Response</h4>
                  <CodeBlock
                    id="access-response"
                    language="json"
                    code={`{
  "success": true,
  "has_access": true,
  "subscription": {
    "id": "sub_abc123",
    "status": "active",
    "current_period_end": "2024-02-01T00:00:00Z",
    "grace_period_end": "2024-02-04T00:00:00Z",
    "days_remaining": 15,
    "is_renewable": true,
    "product_type": "subscription"
  }
}`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Webhooks</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Available Events</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      'payment.created', 'payment.matched', 'payment.confirmed', 'payment.rejected',
                      'subscription.created', 'subscription.activated', 'subscription.renewed', 
                      'subscription.expired', 'subscription.cancelled'
                    ].map((event) => (
                      <code key={event} className="bg-gray-100 px-2 py-1 rounded">{event}</code>
                    ))}
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Webhook Payload</h3>
                  <CodeBlock
                    id="webhook-payload"
                    language="json"
                    code={`{
  "event": "payment.confirmed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "amount": 5000,
    "currency": "SSP",
    "customer_phone": "+211912345678",
    "subscription_id": "sub_xyz789"
  }
}`}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Verify Signature (PHP)</h3>
                  <CodeBlock
                    id="webhook-verify"
                    language="php"
                    code={codeExamples.php.webhook}
                  />
                </div>
              </div>
            )}

            {activeTab === 'wordpress' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">WordPress Integration</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Plugin Code</h3>
                  <p className="text-gray-600">
                    Create a new file <code className="bg-gray-100 px-2 py-1 rounded">wp-content/plugins/payssd/payssd.php</code>:
                  </p>
                  <CodeBlock
                    id="wordpress-plugin"
                    language="php"
                    code={codeExamples.wordpress.plugin}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Usage</h3>
                  <p className="text-gray-600">Add a checkout button using shortcode:</p>
                  <CodeBlock
                    id="wordpress-shortcode"
                    language="html"
                    code={`[payssd_checkout price_id="price_abc123" text="Subscribe Now"]`}
                  />
                </div>
              </div>
            )}

            {activeTab === 'sdk' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">JavaScript SDK</h2>
                
                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Installation</h3>
                  <CodeBlock
                    id="sdk-install"
                    language="html"
                    code={`<script src="https://payssd.com/sdk/payssd.js"></script>`}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Modal Checkout</h3>
                  <CodeBlock
                    id="sdk-modal"
                    language="javascript"
                    code={`const payssd = new Payssd('pk_live_your_public_key');

// Open checkout in a modal
payssd.checkout({
  priceId: 'price_abc123',
  customerPhone: '+211912345678',
  customerEmail: 'customer@example.com', // optional
  mode: 'modal', // default
  onSuccess: (data) => {
    console.log('Payment successful!', data);
    window.location.href = '/thank-you';
  },
  onCancel: () => {
    console.log('User cancelled');
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});`}
                  />
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-semibold">Redirect Checkout</h3>
                  <CodeBlock
                    id="sdk-redirect"
                    language="javascript"
                    code={`const payssd = new Payssd('pk_live_your_public_key');

// Redirect to hosted checkout page
payssd.checkout({
  priceId: 'price_abc123',
  customerPhone: '+211912345678',
  mode: 'redirect',
  successUrl: 'https://your-site.com/success',
  cancelUrl: 'https://your-site.com/cancelled',
});`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
