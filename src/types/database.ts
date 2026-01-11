export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'merchant' | 'admin';
export type Currency = 'SSP' | 'USD';
export type PaymentMethod = 'mtn_momo' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'matched' | 'confirmed' | 'rejected' | 'expired';
export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'expired' | 'cancelled';
export type BillingCycle = 'one_time' | 'monthly' | 'yearly';
export type ProductType = 'subscription' | 'digital_product' | 'one_time';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          phone: string | null;
          business_name: string | null;
          mtn_momo_number: string | null;
          bank_name_ssp: string | null;
          bank_account_number_ssp: string | null;
          bank_account_name_ssp: string | null;
          bank_name_usd: string | null;
          bank_account_number_usd: string | null;
          bank_account_name_usd: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          business_name?: string | null;
          mtn_momo_number?: string | null;
          bank_name_ssp?: string | null;
          bank_account_number_ssp?: string | null;
          bank_account_name_ssp?: string | null;
          bank_name_usd?: string | null;
          bank_account_number_usd?: string | null;
          bank_account_name_usd?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          phone?: string | null;
          business_name?: string | null;
          mtn_momo_number?: string | null;
          bank_name_ssp?: string | null;
          bank_account_number_ssp?: string | null;
          bank_account_name_ssp?: string | null;
          bank_name_usd?: string | null;
          bank_account_number_usd?: string | null;
          bank_account_name_usd?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          product_type: ProductType;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          product_type?: ProductType;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          product_type?: ProductType;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          amount: number;
          currency: Currency;
          billing_cycle: BillingCycle;
          trial_days: number;
          grace_period_days: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          amount: number;
          currency?: Currency;
          billing_cycle?: BillingCycle;
          trial_days?: number;
          grace_period_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          amount?: number;
          currency?: Currency;
          billing_cycle?: BillingCycle;
          trial_days?: number;
          grace_period_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          merchant_id: string;
          price_id: string;
          customer_phone: string;
          customer_email: string | null;
          reference_code: string;
          amount: number;
          currency: Currency;
          payment_method: PaymentMethod;
          status: PaymentStatus;
          transaction_id: string | null;
          proof_url: string | null;
          matched_at: string | null;
          confirmed_at: string | null;
          confirmed_by: string | null;
          rejection_reason: string | null;
          expires_at: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          price_id: string;
          customer_phone: string;
          customer_email?: string | null;
          reference_code: string;
          amount: number;
          currency?: Currency;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          transaction_id?: string | null;
          proof_url?: string | null;
          matched_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          rejection_reason?: string | null;
          expires_at: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          price_id?: string;
          customer_phone?: string;
          customer_email?: string | null;
          reference_code?: string;
          amount?: number;
          currency?: Currency;
          payment_method?: PaymentMethod;
          status?: PaymentStatus;
          transaction_id?: string | null;
          proof_url?: string | null;
          matched_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          rejection_reason?: string | null;
          expires_at?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          merchant_id: string;
          product_id: string;
          price_id: string;
          payment_id: string;
          customer_phone: string;
          customer_email: string | null;
          status: SubscriptionStatus;
          current_period_start: string;
          current_period_end: string;
          trial_end: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          product_id: string;
          price_id: string;
          payment_id: string;
          customer_phone: string;
          customer_email?: string | null;
          status?: SubscriptionStatus;
          current_period_start: string;
          current_period_end: string;
          trial_end?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          product_id?: string;
          price_id?: string;
          payment_id?: string;
          customer_phone?: string;
          customer_email?: string | null;
          status?: SubscriptionStatus;
          current_period_start?: string;
          current_period_end?: string;
          trial_end?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          merchant_id: string;
          name: string;
          public_key: string;
          secret_key_hash: string;
          last_used_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          name: string;
          public_key: string;
          secret_key_hash: string;
          last_used_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          name?: string;
          public_key?: string;
          secret_key_hash?: string;
          last_used_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhooks: {
        Row: {
          id: string;
          merchant_id: string;
          url: string;
          events: string[];
          secret: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          url: string;
          events: string[];
          secret: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          url?: string;
          events?: string[];
          secret?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_id: string;
          event_type: string;
          payload: Json;
          response_status: number | null;
          response_body: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          webhook_id: string;
          event_type: string;
          payload: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          webhook_id?: string;
          event_type?: string;
          payload?: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      access_logs: {
        Row: {
          id: string;
          subscription_id: string;
          customer_phone: string;
          access_granted: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          customer_phone: string;
          access_granted: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          customer_phone?: string;
          access_granted?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      sms_payments: {
        Row: {
          id: string;
          merchant_id: string;
          raw_sms: string;
          parsed_amount: number | null;
          parsed_sender: string | null;
          parsed_reference: string | null;
          parsed_transaction_id: string | null;
          matched_payment_id: string | null;
          is_processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          raw_sms: string;
          parsed_amount?: number | null;
          parsed_sender?: string | null;
          parsed_reference?: string | null;
          parsed_transaction_id?: string | null;
          matched_payment_id?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          raw_sms?: string;
          parsed_amount?: number | null;
          parsed_sender?: string | null;
          parsed_reference?: string | null;
          parsed_transaction_id?: string | null;
          matched_payment_id?: string | null;
          is_processed?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: UserRole;
      currency: Currency;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      subscription_status: SubscriptionStatus;
      billing_cycle: BillingCycle;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Price = Database['public']['Tables']['prices']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type Webhook = Database['public']['Tables']['webhooks']['Row'];
export type WebhookDelivery = Database['public']['Tables']['webhook_deliveries']['Row'];
export type AccessLog = Database['public']['Tables']['access_logs']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type SmsPayment = Database['public']['Tables']['sms_payments']['Row'];

export interface ProductWithPrices extends Product {
  prices: Price[];
}

export interface PaymentWithDetails extends Payment {
  product: Product;
  price: Price;
  merchant: User;
}

export interface SubscriptionWithDetails extends Subscription {
  product: Product;
  price: Price;
  payment: Payment;
}
