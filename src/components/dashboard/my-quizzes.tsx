
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
import { MoreHorizontal, Share2, Link as LinkIcon, Trash2, Play, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { useUserQuizzes } from "@/hooks/use-user-quizzes";
import { deleteDocumentNonBlocking, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";

export function MyQuizzes() {
  const { quizzes, isLoading, error } = useUserQuizzes();
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleCopyLink = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Quiz link copied to clipboard." });
  };
  
  const handleDelete = (quizId: string, userId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, `users/${userId}/quizzes/${quizId}`);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Quiz Deleted",
      description: "The quiz has been removed from your list.",
    });
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
    return <p className="text-center text-muted-foreground mt-8">You haven't created any quizzes yet. Go to the "Create Quiz" tab to get started!</p>
  }

  return (
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/quiz/${quiz.id}`}><Play className="mr-2 h-4 w-4"/>Take</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share</span>
                    </DropdownMenuItem>
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
  );
}
