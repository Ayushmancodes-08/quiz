import { cn } from "@/lib/utils";
import Link from "next/link";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("font-headline text-2xl font-bold tracking-tighter", className)}>
      <span className="text-glow-cyan">QuizMaster</span>
      <span className="text-glow-magenta">AI</span>
    </Link>
  );
}
