import { UseCaseLayout } from '@/components/use-case-layout';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';


export default function CoursesUseCasePage() {
  return (
    <UseCaseLayout
      icon={BookOpen}
      subtitle="Courses & Digital Products"
      title="Sell Courses and Digital Products Without Manual Work"
      description="Stop chasing payments and sending files manually. Payssd helps you sell courses and digital products with automatic access control."
      ctaText="Start Selling Courses"
      
      problemTitle="The problem"
      problemDescription="Selling courses online often means manual work that doesn't scale."
      problemPoints={[
        "Manual payment confirmation",
        "Sending files one by one",
        "No control when access should expire"
      ]}
      
      solutionTitle="The solution"
      solutionDescription="Payssd automates the entire flow."
      solutionSubtext="Students pay you directly. Access is unlocked automatically and removed when it expires."
      
      offerTitle="What you can sell"
      offerItems={[
        "Online courses",
        "Training programs",
        "PDFs and resources",
        "Subscription content"
      ]}
      
      steps={[
        {
          title: "Create your course or product",
          description: "Set pricing and access rules."
        },
        {
          title: "Share your checkout link",
          description: "Students pay using Mobile Money or bank transfer."
        },
        {
          title: "Access is managed automatically",
          description: "Only paid users get access."
        }
      ]}
      
      whyTitle="Why educators use Payssd"
      features={[
        { text: "No manual follow-up" },
        { text: "No technical setup" },
        { text: "Professional payment flow" },
        { text: "Built for local markets" },
      ]}
    />
  );
}
