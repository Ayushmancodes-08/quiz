import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/dashboard/create-quiz-form";
import { MyQuizzes } from "@/components/dashboard/my-quizzes";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { BrainCircuit, List, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-4xl font-bold font-headline">Admin Dashboard</h1>
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
