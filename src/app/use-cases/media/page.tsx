import { UseCaseLayout } from '@/components/use-case-layout';
import { Newspaper } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MediaUseCasePage() {
  return (
    <UseCaseLayout
      icon={Newspaper}
      subtitle="Media & Publishers"
      title="Monetize News and Content Without Giving Up Control"
      description="Offer memberships, premium articles, or supporter access while keeping full ownership of your revenue and audience."
      ctaText="Explore Media Monetization"
      
      problemTitle="The problem"
      problemDescription="Media organizations struggle to monetize sustainably."
      problemPoints={[
        "Monetize content sustainably",
        "Rely on ads alone",
        "Control access to premium articles"
      ]}
      
      solutionTitle="The solution"
      solutionDescription="Payssd enables reader-supported journalism."
      solutionSubtext="Readers pay you directly. Payssd manages who can access premium content."
      
      offerTitle="Monetization options"
      offerItems={[
        "Premium articles",
        "Members-only sections",
        "Supporter subscriptions",
        "Paid archives"
      ]}
      
      steps={[
        {
          title: "Create a membership or premium plan",
          description: "Define pricing and access rules."
        },
        {
          title: "Share your checkout link",
          description: "Readers pay directly to you."
        },
        {
          title: "Control access automatically",
          description: "Only active members can read premium content."
        }
      ]}
      
      whyTitle="Why publishers choose Payssd"
      features={[
        { text: "No revenue sharing" },
        { text: "No platform dependency" },
        { text: "Transparent access control" },
        { text: "Works with local payments" },
      ]}
    />
  );
}
