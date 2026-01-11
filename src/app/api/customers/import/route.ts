import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

// POST /api/customers/import - Bulk import customers from CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customers } = body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return Response.json({ error: 'customers array is required' }, { status: 400 });
    }

    const results = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const customer of customers) {
      if (!customer.phone) {
        results.failed++;
        results.errors.push('Missing phone number');
        continue;
      }

      try {
        const { error } = await supabase
          .from('customers')
          .upsert({
            merchant_id: user.id,
            phone: customer.phone,
            email: customer.email || null,
            name: customer.name || null,
            notes: customer.notes || null,
            tags: customer.tags ? (Array.isArray(customer.tags) ? customer.tags : customer.tags.split(',').map((t: string) => t.trim())) : [],
          }, {
            onConflict: 'merchant_id,phone',
          });

        if (error) {
          results.failed++;
          results.errors.push(`${customer.phone}: ${error.message}`);
        } else {
          results.imported++;
        }
      } catch (e: any) {
        results.failed++;
        results.errors.push(`${customer.phone}: ${e.message}`);
      }
    }

    return Response.json({
      success: true,
      results,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
