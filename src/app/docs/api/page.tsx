import Link from 'next/link';
import { ArrowLeft, Code, Key, Webhook, Lock } from 'lucide-react';

export default function ApiDocsPage() {
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

        <h1 className="text-4xl font-bold text-white mb-4">API Reference</h1>
        <p className="text-xl text-dark-300 mb-12">Integrate Payssd into your applications</p>

        <div className="space-y-12">
          {/* Authentication */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="h-6 w-6 text-lemon-400" /> Authentication
            </h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300 mb-4">
                All API requests require authentication using your API keys. Include your secret key in the Authorization header.
              </p>
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm border border-dark-800">
{`Authorization: Bearer sk_live_your_secret_key`}
              </pre>
              <p className="text-sm text-dark-400 mt-4">
                Get your API keys from the <Link href="/dashboard/api-keys" className="text-lemon-400 hover:underline">Dashboard → API Keys</Link>
              </p>
            </div>
          </section>

          {/* Base URL */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Base URL</h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm border border-dark-800">
{`https://www.payssd.com/api/v1`}
              </pre>
            </div>
          </section>

          {/* Endpoints */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Code className="h-6 w-6 text-lemon-400" /> Endpoints
            </h2>

            {/* Check Access */}
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-lemon-400/20 text-lemon-400 px-2 py-1 rounded text-sm font-mono">GET</span>
                <code className="text-white font-mono">/access/check</code>
              </div>
              <p className="text-dark-300 mb-4">Verify if a customer has active access to a product.</p>
              <h4 className="font-semibold text-white mb-2">Query Parameters</h4>
              <table className="w-full text-sm mb-4">
                <tbody>
                  <tr className="border-b border-dark-800">
                    <td className="py-2 font-mono text-lemon-400">phone</td>
                    <td className="py-2 text-dark-300">Customer phone number (required)</td>
                  </tr>
                  <tr className="border-b border-dark-800">
                    <td className="py-2 font-mono text-lemon-400">product_id</td>
                    <td className="py-2 text-dark-300">Product UUID (optional)</td>
                  </tr>
                </tbody>
              </table>
              <h4 className="font-semibold text-white mb-2">Response</h4>
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm border border-dark-800">
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
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-lemon-400/20 text-lemon-400 px-2 py-1 rounded text-sm font-mono">GET</span>
                <code className="text-white font-mono">/subscriptions</code>
              </div>
              <p className="text-dark-300 mb-4">List all subscriptions for your merchant account.</p>
              <h4 className="font-semibold text-white mb-2">Query Parameters</h4>
              <table className="w-full text-sm mb-4">
                <tbody>
                  <tr className="border-b border-dark-800">
                    <td className="py-2 font-mono text-lemon-400">status</td>
                    <td className="py-2 text-dark-300">Filter by status: active, expired, cancelled</td>
                  </tr>
                  <tr className="border-b border-dark-800">
                    <td className="py-2 font-mono text-lemon-400">limit</td>
                    <td className="py-2 text-dark-300">Number of results (default: 50)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Create Payment */}
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-grape-500/20 text-grape-400 px-2 py-1 rounded text-sm font-mono">POST</span>
                <code className="text-white font-mono">/payments</code>
              </div>
              <p className="text-dark-300 mb-4">Create a new payment record.</p>
              <h4 className="font-semibold text-white mb-2">Request Body</h4>
              <pre className="bg-dark-950 text-lemon-400 p-4 rounded-lg overflow-x-auto text-sm border border-dark-800">
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
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-lemon-400" /> Rate Limits
            </h2>
            <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-6">
              <p className="text-dark-300">
                API requests are limited to <strong className="text-white">100 requests per minute</strong> per API key.
                If you exceed this limit, you'll receive a <code className="bg-dark-800 px-1 rounded text-lemon-400">429 Too Many Requests</code> response.
              </p>
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
