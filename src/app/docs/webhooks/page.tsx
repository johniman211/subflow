import Link from 'next/link';
import { ArrowLeft, Webhook, Code, CheckCircle } from 'lucide-react';

export default function WebhooksDocsPage() {
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
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#F7C500] rounded-full flex items-center justify-center shadow-lemon">
                <span className="text-[#333] font-black text-xs italic">PAY</span>
              </div>
              <span className="text-xl font-black text-white italic">SSD</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary btn-sm">
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl relative">
        <Link href="/docs" className="inline-flex items-center text-dark-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Docs
        </Link>

        <h1 className="text-4xl font-bold text-white mb-4">Webhooks</h1>
        <p className="text-xl text-dark-300 mb-12">Receive real-time notifications when events occur</p>

        <div className="space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300 mb-4">
                Webhooks allow you to receive HTTP POST requests to your server whenever specific events occur in Payssd.
                This is useful for automating workflows, syncing data, and triggering actions in your application.
              </p>
              <p className="text-dark-300">
                Configure webhooks from your <Link href="/dashboard/webhooks" className="text-lemon-400 hover:underline">Dashboard → Webhooks</Link>
              </p>
            </div>
          </section>

          {/* Events */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Webhook className="h-6 w-6 text-lemon-400" /> Event Types
            </h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Event</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">payment.created</td>
                    <td className="px-6 py-4 text-dark-300">A new payment has been initiated</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">payment.confirmed</td>
                    <td className="px-6 py-4 text-dark-300">A payment has been confirmed by merchant</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">payment.rejected</td>
                    <td className="px-6 py-4 text-dark-300">A payment has been rejected</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">subscription.created</td>
                    <td className="px-6 py-4 text-dark-300">A new subscription has been created</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">subscription.renewed</td>
                    <td className="px-6 py-4 text-dark-300">A subscription has been renewed</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">subscription.expired</td>
                    <td className="px-6 py-4 text-dark-300">A subscription has expired</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-sm text-lemon-400">subscription.cancelled</td>
                    <td className="px-6 py-4 text-dark-300">A subscription has been cancelled</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Payload */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="h-6 w-6 text-lemon-400" /> Payload Format
            </h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300 mb-4">All webhook payloads follow this structure:</p>
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm border border-dark-800">
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
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-lemon-400" /> Verifying Webhooks
            </h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300 mb-4">
                Each webhook request includes a signature header for verification:
              </p>
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm mb-4 border border-dark-800">
{`X-Payssd-Signature: sha256=abc123...`}
              </pre>
              <p className="text-dark-300">
                Verify by computing HMAC-SHA256 of the raw body using your webhook secret.
              </p>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <ul className="space-y-3 text-dark-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-lemon-400 flex-shrink-0 mt-0.5" />
                  Return a 200 status code quickly to acknowledge receipt
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-lemon-400 flex-shrink-0 mt-0.5" />
                  Process webhooks asynchronously to avoid timeouts
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-lemon-400 flex-shrink-0 mt-0.5" />
                  Handle duplicate events gracefully (use event ID)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-lemon-400 flex-shrink-0 mt-0.5" />
                  Always verify the webhook signature
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>

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
