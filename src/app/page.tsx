import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, ShieldCheck, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary text-glow-primary" />,
    title: 'AI-Powered Generation',
    description: 'Instantly generate quizzes on any topic with adjustable difficulty and length using Google Gemini.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary text-glow-primary" />,
    title: 'Advanced Anti-Cheat',
    description: 'Ensure integrity with fullscreen enforcement, tab switch detection, and more.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary text-glow-primary" />,
    title: 'Insightful Analytics',
    description: 'Track performance with detailed results, attempt history, and AI-powered summaries.',
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <section className="text-center">
        <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
          <span className="text-glow-primary">QuizMaster</span>
          <span className="text-glow-secondary">AI</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 md:text-xl">
          The future of assessments is here. Create, distribute, and analyze quizzes with the power of AI and a robust anti-cheat system.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="font-bold">
            <Link href="/dashboard">
              Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-bold">
            <Link href="/auth">
              Login
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="gradient-border bg-card/60 backdrop-blur-sm">
              <CardHeader className="items-center text-center">
                {feature.icon}
                <CardTitle className="font-headline text-2xl text-glow-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-foreground/70">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
