import Link from 'next/link';
import { ArrowLeft, Code, Key, Webhook, Lock } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SubFlow</span>
            </Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/docs" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Docs
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Reference</h1>
        <p className="text-xl text-gray-600 mb-12">Integrate SubFlow into your applications</p>

        <div className="space-y-12">
          {/* Authentication */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="h-6 w-6" /> Authentication
            </h2>
            <div className="bg-white rounded-xl p-6 border">
              <p className="text-gray-600 mb-4">
                All API requests require authentication using your API keys. Include your secret key in the Authorization header.
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`Authorization: Bearer sk_live_your_secret_key`}
              </pre>
              <p className="text-sm text-gray-500 mt-4">
                Get your API keys from the <Link href="/dashboard/api-keys" className="text-primary-600 hover:underline">Dashboard → API Keys</Link>
              </p>
            </div>
          </section>

          {/* Base URL */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Base URL</h2>
            <div className="bg-white rounded-xl p-6 border">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`https://your-domain.com/api/v1`}
              </pre>
            </div>
          </section>

          {/* Endpoints */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="h-6 w-6" /> Endpoints
            </h2>

            {/* Check Access */}
            <div className="bg-white rounded-xl p-6 border mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">GET</span>
                <code className="text-gray-900 font-mono">/access/check</code>
              </div>
              <p className="text-gray-600 mb-4">Verify if a customer has active access to a product.</p>
              <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
              <table className="w-full text-sm mb-4">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-gray-900">phone</td>
                    <td className="py-2 text-gray-600">Customer phone number (required)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-gray-900">product_id</td>
                    <td className="py-2 text-gray-600">Product UUID (optional)</td>
                  </tr>
                </tbody>
              </table>
              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "has_access": true,
  "subscription": {
    "id": "uuid",
    "status": "active",
    "current_period_end": "2024-02-01T00:00:00Z",
    "product": { "id": "uuid", "name": "Pro Plan" }
  }
}`}
              </pre>
            </div>

            {/* List Subscriptions */}
            <div className="bg-white rounded-xl p-6 border mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-mono">GET</span>
                <code className="text-gray-900 font-mono">/subscriptions</code>
              </div>
              <p className="text-gray-600 mb-4">List all subscriptions for your merchant account.</p>
              <h4 className="font-semibold text-gray-900 mb-2">Query Parameters</h4>
              <table className="w-full text-sm mb-4">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-gray-900">status</td>
                    <td className="py-2 text-gray-600">Filter by status: active, expired, cancelled</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono text-gray-900">limit</td>
                    <td className="py-2 text-gray-600">Number of results (default: 50)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Create Payment */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-mono">POST</span>
                <code className="text-gray-900 font-mono">/payments</code>
              </div>
              <p className="text-gray-600 mb-4">Create a new payment record.</p>
              <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "price_id": "uuid",
  "customer_phone": "+211912345678",
  "customer_email": "customer@example.com",
  "payment_method": "mtn_momo"
}`}
              </pre>
            </div>
          </section>

          {/* Rate Limits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6" /> Rate Limits
            </h2>
            <div className="bg-white rounded-xl p-6 border">
              <p className="text-gray-600">
                API requests are limited to <strong>100 requests per minute</strong> per API key.
                If you exceed this limit, you'll receive a <code className="bg-gray-100 px-1 rounded">429 Too Many Requests</code> response.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
