import * as React from "react";
import { ClipboardCheck, PlusCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";

type Assessment = {
  number: number;
  examName: string;
  type: string;
  date: string;
  marks: number;
  maximum: number;
  assessorId: number;
  assessorName: string;
};

import { apiGet, apiPost } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";

export function AssessmentsPage() {
  const [open, setOpen] = React.useState(false);
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const user = React.useMemo(() => getCurrentUser(), []);
  const [loading, setLoading] = React.useState(false);
  const [professors, setProfessors] = React.useState<any[]>([]);

  // Form State
  const [examName, setExamName] = React.useState("");
  const [type, setType] = React.useState<"quarterly" | "annual">("quarterly");
  const [date, setDate] = React.useState(todayForInput());
  const [marks, setMarks] = React.useState("");
  const [assessorId, setAssessorId] = React.useState("");
  
  const fetchAssessments = React.useCallback(async () => {
    if (!user?.studentProfileId) return;
    setLoading(true);
    try {
      const data = await apiGet(`/api/students/${user.studentProfileId}/assessments`);
      setAssessments(data || []);
    } catch (e) {
      toast.error("Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  }, [user?.studentProfileId]);

  React.useEffect(() => {
    fetchAssessments();
    if (user?.departmentId) {
      apiGet(`/api/departments/${user.departmentId}/professors`).then(setProfessors).catch(console.error);
    }
  }, [fetchAssessments, user?.departmentId]);

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.studentProfileId) return;

    if (!examName || !marks || !assessorId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await apiPost(`/api/students/${user.studentProfileId}/assessments`, {
        examName,
        type,
        date,
        marks,
        assessorId
      });
      toast.success("Assessment added successfully");
      setOpen(false);
      fetchAssessments();
      // reset form
      setExamName("");
      setMarks("");
    } catch (e: any) {
      toast.error(e.message || "Failed to add assessment");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow flex items-center gap-2">Training progress</p>
          <h2 className="page-title mt-1">Assessments</h2>
          <p className="mt-2 text-sm text-slate-500">Track your quarterly and annual assessment scores.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" /> Add assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Assessment</DialogTitle>
              <DialogDescription>
                Record your quarterly or annual assessment results.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAssessment} className="space-y-4">
              <div className="space-y-2">
                <Label>Exam Name</Label>
                <Input value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Q1 Exam 2026" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(val: any) => setType(val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Marks (out of 100)</Label>
                <Input type="number" min="0" max="100" value={marks} onChange={e => setMarks(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Assessor</Label>
                <Select value={assessorId} onValueChange={setAssessorId}>
                  <SelectTrigger><SelectValue placeholder="Select professor" /></SelectTrigger>
                  <SelectContent>
                    {professors.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save Assessment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Assessment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClipboardCheck className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No assessments logged</h3>
              <p className="mt-2 text-sm text-slate-500">You haven't added any assessments yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Assessor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((item) => (
                  <TableRow key={item.number}>
                    <TableCell className="font-medium text-slate-900">{formatLogbookDate(item.date)}</TableCell>
                    <TableCell>{item.examName}</TableCell>
                    <TableCell className="capitalize">{item.type}</TableCell>
                    <TableCell className="font-bold text-slate-900">{item.marks} / {item.maximum}</TableCell>
                    <TableCell>{item.assessorName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


