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

  return (
    <DashboardWrapper>
      <div className="min-h-screen transition-colors duration-200">
        <DashboardNav user={profile} isAdmin={isAdmin} />
        <main className="lg:pl-72">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardWrapper>
  );
}
