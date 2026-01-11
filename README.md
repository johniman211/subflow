# SubFlow - Subscription Management SaaS Platform

A comprehensive subscription management platform designed for **South Sudan (Phase 1)** with expansion to **East Africa (Phase 2)**. SubFlow enables merchants to accept MTN MoMo and bank transfer payments, manage subscriptions, and control access to digital products and software.

> **Important**: SubFlow never holds funds. It acts purely as a payment verification and access control platform.

## Features

### MVP Features (Phase 1)
- **Multi-role System**: Merchants, Customers (guest checkout), Admins
- **Payment Methods**: MTN MoMo and Bank Transfer with manual confirmation
- **Reference Codes**: Unique codes for payment matching
- **Guest Checkout**: No account required, phone number identification
- **Subscription Types**: One-time, Monthly, Yearly with trial periods
- **Multi-Currency**: SSP and USD support
- **Merchant Dashboard**: Payment confirmation, analytics, product management
- **API Keys**: Programmatic access for developers
- **Webhooks**: Real-time event notifications

### Advanced Features (Phase 2)
- **Android SMS Parser**: Semi-auto MTN MoMo payment detection
- **Auto-match Rules**: Intelligent payment matching
- **East Africa Expansion**: Support for Kenya, Uganda, Tanzania, Rwanda, Ethiopia

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (Postgres + Auth + Storage + Edge Functions)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: TanStack Query

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
cd Deal

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Update .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-project-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run development server
npm run dev
```

### Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the migration files in order:
```sql
-- Run in Supabase SQL Editor
-- 1. First run: supabase/migrations/001_initial_schema.sql
-- 2. Then run: supabase/migrations/002_functions.sql
```

3. Create a storage bucket for payment proofs:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', true);
```

4. Enable Row Level Security on the storage bucket

## Project Structure

```
Deal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/               # Login, Register, Callback
│   │   ├── dashboard/          # Merchant dashboard
│   │   │   ├── products/       # Product management
│   │   │   ├── payments/       # Payment confirmation
│   │   │   ├── analytics/      # Analytics dashboard
│   │   │   ├── api-keys/       # API key management
│   │   │   ├── webhooks/       # Webhook configuration
│   │   │   └── settings/       # Account settings
│   │   ├── checkout/           # Guest checkout flow
│   │   └── api/                # API routes
│   │       └── v1/             # Versioned API
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   └── checkout/           # Checkout components
│   ├── lib/                    # Utilities and config
│   │   ├── supabase/           # Supabase clients
│   │   ├── utils.ts            # Helper functions
│   │   └── constants.ts        # App constants
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # Database migrations
│   └── config.toml             # Supabase config
└── android-sms-parser/         # Android SMS parser app
```

## User Flows

### Merchant Flow
1. Register account → Complete profile → Add payment details
2. Create products → Set pricing plans (SSP/USD, billing cycle)
3. Share checkout link → Receive payments
4. View pending payments → Confirm with one click
5. Monitor analytics → Manage subscriptions

### Customer Flow (Guest Checkout)
1. Visit checkout link → Select plan
2. Enter phone number (+ optional email)
3. Receive payment instructions with reference code
4. Pay via MTN MoMo or Bank Transfer (include reference code)
5. Submit proof (transaction ID or screenshot)
6. Wait for merchant confirmation
7. Access granted upon confirmation

## API Reference

### Check Subscription Access
```bash
POST /api/v1/access/check
Authorization: Bearer sk_live_xxxxx
Content-Type: application/json

{
  "product_id": "uuid",
  "customer_phone": "+211912345678"
}

# Response
{
  "has_access": true,
  "subscription_id": "uuid",
  "subscription_status": "active",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

### Submit Payment (Programmatic)
```bash
POST /api/v1/payments/submit
Content-Type: application/json

{
  "product_id": "uuid",
  "price_id": "uuid",
  "customer_phone": "+211912345678",
  "customer_email": "customer@example.com",
  "payment_method": "mtn_momo"
}

# Response
{
  "payment_id": "uuid",
  "reference_code": "SF-ABC123-XYZ",
  "amount": 10000,
  "currency": "SSP",
  "expires_at": "2024-01-02T12:00:00Z",
  "payment_instructions": {
    "mtn_momo_number": "+211912345678"
  }
}
```

## Subscription Status Flow

```
PENDING → ACTIVE → PAST_DUE → EXPIRED
                 ↘ CANCELLED
```

- **PENDING**: Payment submitted, awaiting confirmation
- **ACTIVE**: Payment confirmed, access granted
- **PAST_DUE**: Subscription expired but within grace period
- **EXPIRED**: Grace period ended, access revoked
- **CANCELLED**: Manually cancelled by merchant

## Webhook Events

Configure webhooks to receive real-time notifications:

- `payment.created` - New payment initiated
- `payment.matched` - Payment proof submitted
- `payment.confirmed` - Payment confirmed by merchant
- `payment.rejected` - Payment rejected
- `payment.expired` - Payment expired
- `subscription.created` - New subscription created
- `subscription.activated` - Subscription activated
- `subscription.renewed` - Recurring subscription renewed
- `subscription.expired` - Subscription expired
- `subscription.cancelled` - Subscription cancelled

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Deploy to Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

### Production Checklist

- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Enable Supabase email confirmations
- [ ] Configure storage bucket policies
- [ ] Set up database backups
- [ ] Configure webhook retry policies
- [ ] Set up monitoring and alerts
- [ ] Test payment flows end-to-end

## Android SMS Parser (Phase 2)

The optional Android app enables semi-automated MTN MoMo payment detection:

1. Listens for incoming MTN MoMo SMS
2. Parses amount, sender, reference code, transaction ID
3. Submits to SubFlow API for auto-matching
4. Merchant sees suggested matches in dashboard

See `android-sms-parser/README.md` for setup instructions.

## Security Considerations

- All API keys are hashed before storage
- Webhook payloads are signed with HMAC-SHA256
- Row Level Security enforced on all tables
- Phone numbers used for customer identification
- No sensitive payment data stored (reference codes only)
- SMS parser uses encrypted API key storage

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@subflow.app or join our Discord community.

---

Built with ❤️ for South Sudan and East Africa
