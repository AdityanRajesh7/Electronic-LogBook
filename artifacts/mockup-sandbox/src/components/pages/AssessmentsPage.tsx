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
  type: "Quarterly" | "Annual";
  date: string;
  marks: number;
  maximum: number;
  assessor: string;
  remarks: string;
};

const seededAssessments: Assessment[] = [
  { number: 3, type: "Quarterly", date: "2026-06-30", marks: 78, maximum: 100, assessor: "Dr. Mohamad", remarks: "Good progress in clinical reasoning; strengthen procedure documentation." },
  { number: 2, type: "Quarterly", date: "2026-03-31", marks: 74, maximum: 100, assessor: "Dr. Mohammed", remarks: "Satisfactory progress with consistent ward participation." },
  { number: 1, type: "Annual", date: "2025-12-20", marks: 71, maximum: 100, assessor: "Dr. Urmila", remarks: "Meets year-one outcomes. Focus on structured case presentation." },
];

export function AssessmentsPage() {
  const [assessments, setAssessments] = React.useState(seededAssessments);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ type: "Quarterly" as Assessment["type"], date: todayForInput(), marks: "75", maximum: "100" });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Assessment = {
      number: assessments.length + 1,
      type: form.type,
      date: form.date,
      marks: Number(form.marks),
      maximum: Number(form.maximum),
      assessor: "Dr. Mohamad",
      remarks: "Assessment submitted; detailed faculty remarks pending.",
    };
    setAssessments([next, ...assessments]);
    setOpen(false);
    toast.success(`${next.type} assessment added`);
  };

  const latest = assessments[0];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow">Training progress</p>
          <h2 className="page-title mt-1">Assessments</h2>
          <p className="mt-2 text-sm text-slate-500">Quarterly and annual assessment marks recorded by the department.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="h-4 w-4" /> Add assessment</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add assessment result</DialogTitle>
              <DialogDescription>Record the assessment date and marks awarded.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Assessment type</Label>
                <Select value={form.type} onValueChange={(value: Assessment["type"]) => setForm({ ...form, type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                <p className="text-[10px] text-slate-500">Displayed in dd/mm/yy format after saving.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input type="number" value={form.marks} onChange={(event) => setForm({ ...form, marks: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Maximum marks</Label>
                  <Input type="number" value={form.maximum} onChange={(event) => setForm({ ...form, maximum: event.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Save assessment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-teal-100">
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Latest score</p>
            <p className="mt-2 text-3xl font-bold text-teal-700">{latest.marks}<span className="text-sm text-slate-400">/{latest.maximum}</span></p>
          </CardContent>
        </Card>
        <Card className="border-teal-100">
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Assessment cycle</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{latest.type}</p>
          </CardContent>
        </Card>
        <Card className="border-teal-100 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
          <CardContent className="flex items-center gap-3 p-5">
            <TrendingUp className="h-8 w-8 text-teal-100" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-100">Progress</p>
              <p className="mt-1 text-sm font-bold">Up 4 marks this quarter</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-teal-100">
          <CardTitle className="flex items-center gap-2 text-lg"><ClipboardCheck className="h-5 w-5 text-teal-600" /> Assessment record</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Assessor</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.number}>
                  <TableCell className="font-bold">{assessment.number}</TableCell>
                  <TableCell><Badge variant="outline" className="border-teal-100 bg-teal-50 text-teal-800">{assessment.type}</Badge></TableCell>
                  <TableCell>{formatLogbookDate(assessment.date)}</TableCell>
                  <TableCell className="font-bold text-teal-700">{assessment.marks}/{assessment.maximum}</TableCell>
                  <TableCell>{assessment.assessor}</TableCell>
                  <TableCell className="max-w-xs text-xs text-slate-500">{assessment.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
