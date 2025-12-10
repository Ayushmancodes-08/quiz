"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
    FileText,
    AlertTriangle,
    CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { QuizAttempt } from "@/lib/types";
import { format } from "date-fns";
import { WithId } from "@/supabase";

interface DetailedResultsTableProps {
    attempts: WithId<QuizAttempt>[];
}

export function DetailedResultsTable({ attempts }: DetailedResultsTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter attempts based on search term
    const filteredAttempts = attempts.filter((attempt) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            attempt.studentName?.toLowerCase().includes(searchLower) ||
            attempt.quizTitle?.toLowerCase().includes(searchLower) ||
            attempt.registrationNumber?.toLowerCase().includes(searchLower)
        );
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAttempts = filteredAttempts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students or quizzes..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-8"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredAttempts.length)} of {filteredAttempts.length} results
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Violations</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentAttempts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentAttempts.map((attempt) => (
                                <TableRow key={attempt.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{attempt.studentName}</span>
                                            <span className="text-xs text-muted-foreground">{attempt.registrationNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={attempt.quizTitle}>
                                        {attempt.quizTitle}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={attempt.score >= 70 ? "outline" : "secondary"}>
                                            {attempt.score}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {attempt.violations > 0 ? (
                                            <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                <AlertTriangle className="h-3 w-3" />
                                                {attempt.violations}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {attempt.isFlagged ? (
                                            <Badge variant="destructive">
                                                {attempt.violations >= 3 ? "Auto-Submitted (Security)" : "Flagged"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                <CheckCircle className="mr-1 h-3 w-3" /> Clean
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {attempt.completedAt ? format(new Date(attempt.completedAt), "PP p") : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/quiz/review/${attempt.id}`)}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
