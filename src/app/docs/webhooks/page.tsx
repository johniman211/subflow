import Link from 'next/link';
import { ArrowLeft, Webhook, Code, CheckCircle } from 'lucide-react';

export default function WebhooksDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Payssd</span>
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Webhooks</h1>
        <p className="text-xl text-gray-600 mb-12">Receive real-time notifications when events occur</p>

        <div className="space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="bg-white rounded-xl p-6 border">
              <p className="text-gray-600 mb-4">
                Webhooks allow you to receive HTTP POST requests to your server whenever specific events occur in Payssd.
                This is useful for automating workflows, syncing data, and triggering actions in your application.
              </p>
              <p className="text-gray-600">
                Configure webhooks from your <Link href="/dashboard/webhooks" className="text-primary-600 hover:underline">Dashboard → Webhooks</Link>
              </p>
            </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Webhook className="h-6 w-6" /> Event Types
            </h2>
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">payment.created</td>
                    <td className="px-6 py-4 text-gray-600">A new payment has been initiated</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">payment.confirmed</td>
                    <td className="px-6 py-4 text-gray-600">A payment has been confirmed by merchant</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">payment.rejected</td>
                    <td className="px-6 py-4 text-gray-600">A payment has been rejected</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">subscription.created</td>
                    <td className="px-6 py-4 text-gray-600">A new subscription has been created</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">subscription.renewed</td>
                    <td className="px-6 py-4 text-gray-600">A subscription has been renewed</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">subscription.expired</td>
                    <td className="px-6 py-4 text-gray-600">A subscription has expired</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">subscription.cancelled</td>
                    <td className="px-6 py-4 text-gray-600">A subscription has been cancelled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Payload */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Code className="h-6 w-6" /> Payload Format
            </h2>
            <div className="bg-white rounded-xl p-6 border">
              <p className="text-gray-600 mb-4">All webhook payloads follow this structure:</p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "id": "evt_abc123",
  "type": "payment.confirmed",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "payment_id": "pay_xyz789",
    "amount": 5000,
    "currency": "SSP",
    "customer_phone": "+211912345678",
    "product_name": "Pro Plan",
    "subscription_id": "sub_def456"
  }
}`}
              </pre>
            </div>
          </section>

          {/* Verification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" /> Verifying Webhooks
            </h2>
            <div className="bg-white rounded-xl p-6 border">
              <p className="text-gray-600 mb-4">
                Each webhook request includes a signature header for verification:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-4">
{`X-Payssd-Signature: sha256=abc123...`}
              </pre>
              <p className="text-gray-600">
                Verify by computing HMAC-SHA256 of the raw body using your webhook secret.
              </p>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>
            <div className="bg-white rounded-xl p-6 border">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Return a 200 status code quickly to acknowledge receipt
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Process webhooks asynchronously to avoid timeouts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Handle duplicate events gracefully (use event ID)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  Always verify the webhook signature
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
