import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/dashboard/create-quiz-form";
import { MyQuizzes } from "@/components/dashboard/my-quizzes";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { Button } from "@/components/ui/button";
import { BrainCircuit, List, BarChart3, Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-headline">Admin Dashboard</h1>
        <Button variant="outline" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Create Quiz
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <List className="mr-2 h-4 w-4" />
            My Quizzes
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart3 className="mr-2 h-4 w-4" />
            Results
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="mt-6">
          <CreateQuizForm />
        </TabsContent>
        <TabsContent value="quizzes" className="mt-6">
          <MyQuizzes />
        </TabsContent>
        <TabsContent value="results" className="mt-6">
          <ResultsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
