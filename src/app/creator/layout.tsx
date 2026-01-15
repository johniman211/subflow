import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CreatorNav } from '@/components/creator/nav';
import { DashboardWrapper } from '@/components/dashboard/DashboardWrapper';

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/creator');
  }

  // Get user profile
  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/auth/login?next=/creator');
  }

  // Check if user has creator role
  const isCreator = (profile as any).is_creator === true;

  // Get creator profile if user is a creator
  let creator = null;
  if (isCreator) {
    const { data } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .single();
    creator = data;
  }

  return (
    <DashboardWrapper>
      <div className="min-h-screen transition-colors duration-200">
        <CreatorNav user={profile} creator={creator} isCreator={isCreator} />
        <main className="lg:pl-72">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </DashboardWrapper>
  );
}
