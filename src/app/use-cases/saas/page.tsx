import { UseCaseLayout } from '@/components/use-case-layout';
import { Code } from 'lucide-react';


export default function SaaSUseCasePage() {
  return (
    <UseCaseLayout
      icon={Code}
      subtitle="SaaS & Software"
      title="Sell Software Subscriptions Without Payment APIs"
      description="Launch and manage paid software in South Sudan without complex payment integrations. Payssd helps you charge users and automatically control access — while payments go directly to you."
      ctaText="Start Selling Software"
      
      problemTitle="The problem"
      problemDescription="Selling software subscriptions locally is hard. Payment APIs are unavailable, manual confirmations waste time, and access control becomes messy."
      
      solutionTitle="The solution"
      solutionDescription="Payssd separates payments from access control."
      solutionSubtext="Your users pay you directly using Mobile Money or bank transfer. Payssd tracks payments and automatically unlocks or locks access."
      
      steps={[
        {
          title: "Create a software plan",
          description: "Set price, billing cycle, and access duration."
        },
        {
          title: "Share your checkout link",
          description: "Users pay directly to your account."
        },
        {
          title: "Access updates automatically",
          description: "Active subscribers get access. Expired ones don't."
        }
      ]}
      
      whyTitle="Why SaaS teams choose Payssd"
      features={[
        { text: "No payment APIs required" },
        { text: "No wallets or fund holding" },
        { text: "Simple subscription logic" },
        { text: "Works with local payment methods" },
      ]}
    />
  );
}
