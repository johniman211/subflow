import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/nav';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Try to get existing profile
  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // If no profile exists, create one from auth metadata
  if (!profile) {
    const metadata = user.user_metadata || {};
    const { data: newProfile, error } = await supabase.from('users').insert({
      id: user.id,
      email: user.email!,
      full_name: metadata.full_name || null,
      business_name: metadata.business_name || null,
      phone: metadata.phone || null,
      role: 'merchant',
    }).select().single();

    if (!error && newProfile) {
      profile = newProfile;
    }
  }

  const isAdmin = profile?.is_platform_admin || false;
  
  // Check if user is a creator (check both is_creator flag AND existing creator profile for backward compatibility)
  let isCreator = (profile as any)?.is_creator || false;
  
  if (!isCreator && user) {
    // Check if user has an existing creator profile (for users created before is_creator flag)
    const { data: creatorProfile } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (creatorProfile) {
      isCreator = true;
      // Auto-fix the is_creator flag
      await supabase
        .from('users')
        .update({ is_creator: true })
        .eq('id', user.id);
    }
  }

  return (
    <DashboardWrapper>
      <div className="min-h-screen transition-colors duration-200">
        <DashboardNav user={profile} isAdmin={isAdmin} isCreator={isCreator} />
        <main className="lg:pl-72">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardWrapper>
  );
}
