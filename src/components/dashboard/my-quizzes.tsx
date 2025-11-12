
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Share2, Link as LinkIcon, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

import { useSupabaseQuizzes } from "@/hooks/use-supabase-quizzes";
import { useSupabaseClient } from "@/supabase";
import { ShareQuizDialog } from './share-quiz-dialog';

export function MyQuizzes() {
  const { quizzes, isLoading, error } = useSupabaseQuizzes();
  const { toast } = useToast();
  const supabase = useSupabaseClient();

  const handleCopyLink = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Quiz link copied to clipboard." });
  };
  
  const handleDelete = async (quizId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)
        .eq('author_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been removed from your list.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete the quiz.",
      });
    }
  }

  const difficultyVariant = {
    easy: "default",
    medium: "secondary",
    hard: "destructive",
  } as const;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center">Error: Could not load quizzes.</div>;
  }
  
  if (!quizzes || quizzes.length === 0) {
    return <p className="text-center text-muted-foreground mt-8 px-4">You haven't created any quizzes yet. Go to the "Create Quiz" tab to get started!</p>
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableCaption>A list of your generated quizzes.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.title}</TableCell>
                <TableCell>{quiz.topic}</TableCell>
                <TableCell>
                  <Badge variant={difficultyVariant[quiz.difficulty] || 'default'} className="capitalize">{quiz.difficulty}</Badge>
                </TableCell>
                <TableCell className="text-center">{quiz.questions.length}</TableCell>
                <TableCell>{new Date(quiz.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ShareQuizDialog 
                      quizId={quiz.id} 
                      quizTitle={quiz.title}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      }
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(quiz.id)}>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                quiz and any associated attempt data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(quiz.id, quiz.authorId)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{quiz.topic}</p>
              </div>
              <Badge variant={difficultyVariant[quiz.difficulty] || 'default'} className="capitalize flex-shrink-0">
                {quiz.difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{quiz.questions.length} questions</span>
              <span>•</span>
              <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <ShareQuizDialog 
                quizId={quiz.id} 
                quizTitle={quiz.title}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{quiz.title}" and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(quiz.id, quiz.authorId)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
