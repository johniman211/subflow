import { createServiceRoleClient } from '@/lib/supabase/server';
import { hashApiKey } from '@/lib/utils';

export interface ApiAuthResult {
  success: boolean;
  merchantId?: string;
  error?: string;
}

export async function authenticateApiKey(request: Request): Promise<ApiAuthResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return { success: false, error: 'Missing Authorization header' };
  }

  const [scheme, key] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !key) {
    return { success: false, error: 'Invalid Authorization format. Use: Bearer YOUR_SECRET_KEY' };
  }

  // Check if it's a secret key (starts with sk_)
  if (!key.startsWith('sk_')) {
    return { success: false, error: 'Invalid API key. Use your secret key (sk_...)' };
  }

  const supabase = createServiceRoleClient();
  const keyHash = hashApiKey(key);

  // Find API key by hash
  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('merchant_id, is_active')
    .eq('secret_key_hash', keyHash)
    .single();

  if (error || !apiKey) {
    return { success: false, error: 'Invalid API key' };
  }

  if (!apiKey.is_active) {
    return { success: false, error: 'API key is inactive' };
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('secret_key_hash', keyHash);

  return { success: true, merchantId: apiKey.merchant_id };
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function apiSuccess(data: any, status: number = 200) {
  return Response.json({ success: true, ...data }, { status });
}
