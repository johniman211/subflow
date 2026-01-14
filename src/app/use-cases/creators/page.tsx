import { UseCaseLayout } from '@/components/use-case-layout';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default function CreatorsUseCasePage() {
  return (
    <UseCaseLayout
      icon={Users}
      subtitle="Creators & Public Figures"
      title="Turn Your Followers Into Paying Members"
      description="Monetize your audience with memberships, exclusive content, and private access — without relying on social media platforms."
      ctaText="Monetize Your Audience"
      
      problemTitle="The problem"
      problemDescription="Many creators already charge manually through WhatsApp or Mobile Money, but it doesn't scale."
      problemPoints={[
        "Access is hard to manage",
        "Subscriptions expire unnoticed",
        "Everything depends on manual work"
      ]}
      
      solutionTitle="The solution"
      solutionDescription="Payssd professionalizes creator monetization."
      solutionSubtext="Fans pay you directly. Payssd manages access automatically."
      
      offerTitle="What you can offer"
      offerItems={[
        "Private communities",
        "Exclusive updates",
        "Fan clubs",
        "Membership content"
      ]}
      
      steps={[
        {
          title: "Create a membership plan",
          description: "Choose monthly, yearly, or one-time access."
        },
        {
          title: "Share your checkout link",
          description: "Fans pay directly to you."
        },
        {
          title: "Access is managed automatically",
          description: "Active members get access. Expired ones lose it."
        }
      ]}
      
      whyTitle="Why creators use Payssd"
      features={[
        { text: "No platform restrictions" },
        { text: "No fund holding" },
        { text: "Simple and professional setup" },
        { text: "Built for local payments" },
      ]}
    />
  );
}
