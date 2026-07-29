import * as React from "react";
import { CalendarDays, PlusCircle } from "lucide-react";
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
import {
  formatLogbookDate,
  POSTING_CHIEFS,
  POSTING_OPTIONS,
  todayForInput,
} from "@/lib/logbook-config";

type PostingName = (typeof POSTING_OPTIONS)[number];

type Posting = {
  number: number;
  name: PostingName;
  startDate: string;
  endDate: string;
  chief: string;
  status: "completed" | "submitted";
};

const initialPostings: Posting[] = [
  { number: 1, name: "Ward Posting U1", startDate: "2026-03-01", endDate: "2026-04-30", chief: "Dr. Mohamad", status: "completed" },
  { number: 2, name: "NICU", startDate: "2026-05-01", endDate: "2026-06-30", chief: "Dr. Urmila", status: "completed" },
  { number: 3, name: "PICU", startDate: "2026-07-01", endDate: "2026-07-31", chief: "Dr. Mohammed", status: "submitted" },
];

const initialForm = {
  name: "Ward Posting U1" as PostingName,
  startDate: todayForInput(),
  endDate: todayForInput(),
};

export function PostingsPage() {
  const [postings, setPostings] = React.useState(initialPostings);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);

  const addPosting = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.endDate < form.startDate) {
      toast.error("End date must be on or after the start date");
      return;
    }

    const next: Posting = {
      number: Math.max(0, ...postings.map((posting) => posting.number)) + 1,
      ...form,
      chief: POSTING_CHIEFS[form.name],
      status: "submitted",
    };
    setPostings([...postings, next]);
    setForm({ ...initialForm, startDate: todayForInput(), endDate: todayForInput() });
    setOpen(false);
    toast.success(`${next.name} added for chief review`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow">Student-managed clinical training</p>
          <h2 className="page-title mt-1">Postings &amp; rotations</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add each posting yourself with its exact start and end dates. The assigned chief is selected automatically.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="h-4 w-4" /> Add posting / rotation</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl bg-white sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add posting / rotation</DialogTitle>
              <DialogDescription>Select the posting and enter the actual dates attended.</DialogDescription>
            </DialogHeader>
            <form onSubmit={addPosting} className="space-y-5">
              <Field label="Posting / rotation name" htmlFor="posting-name">
                <Select
                  value={form.name}
                  onValueChange={(value: PostingName) => setForm({ ...form, name: value })}
                >
                  <SelectTrigger id="posting-name"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {POSTING_OPTIONS.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start date" htmlFor="posting-start-date">
                  <Input id="posting-start-date" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
                </Field>
                <Field label="End date" htmlFor="posting-end-date">
                  <Input id="posting-end-date" type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
                </Field>
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Assigned chief</p>
                <p className="mt-1 font-bold text-teal-950">{POSTING_CHIEFS[form.name]}</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Add posting</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ChiefCard area="HOD / Ward U1 / Ward U2 / DRP" chief="Dr. Mohamad" />
        <ChiefCard area="PICU" chief="Dr. Mohammed" />
        <ChiefCard area="NICU" chief="Dr. Urmila" />
      </div>

      <Card>
        <CardHeader className="border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">My posting and rotation record</CardTitle>
              <p className="mt-1 text-xs text-slate-500">Entries are sent to the assigned chief for review.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Posting / rotation</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>End date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Chief</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postings.map((posting) => (
                <TableRow key={posting.number}>
                  <TableCell className="font-bold">{posting.number}</TableCell>
                  <TableCell className="font-semibold">{posting.name}</TableCell>
                  <TableCell>{formatLogbookDate(posting.startDate)}</TableCell>
                  <TableCell>{formatLogbookDate(posting.endDate)}</TableCell>
                  <TableCell>{duration(posting.startDate, posting.endDate)}</TableCell>
                  <TableCell className="font-semibold text-teal-800">{posting.chief}</TableCell>
                  <TableCell>
                    <Badge className={posting.status === "completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                      {posting.status === "completed" ? "Completed" : "Sent to chief"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function duration(startDate: string, endDate: string) {
  const milliseconds = new Date(`${endDate}T00:00:00`).getTime() - new Date(`${startDate}T00:00:00`).getTime();
  return `${Math.floor(milliseconds / 86_400_000) + 1} days`;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}

function ChiefCard({ area, chief }: { area: string; chief: string }) {
  return (
    <Card className="border-teal-100 bg-white/75">
      <CardContent className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">{area}</p>
        <p className="mt-2 text-lg font-bold text-slate-900">{chief}</p>
        <p className="mt-1 text-xs text-slate-500">Assigned chief</p>
      </CardContent>
    </Card>
  );
}
