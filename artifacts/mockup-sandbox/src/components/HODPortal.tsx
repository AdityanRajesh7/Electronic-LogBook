import * as React from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  KeyRound,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";

type StudentAccount = {
  number: number;
  name: string;
  registrationNumber: string;
  kuhsId: string;
  dateOfJoining: string;
  guide: string;
  status: "Active" | "Invite issued";
};

const initialStudents: StudentAccount[] = [
  { number: 14, name: "Dr. Adithya Nair", registrationNumber: "PG2024-PAED-014", kuhsId: "KUHS-MD-PED-2024-014", dateOfJoining: "2024-06-03", guide: "Prof. Dr. Mohammad MTP", status: "Active" },
  { number: 18, name: "Dr. Anilkumar A", registrationNumber: "PG2024-PAED-018", kuhsId: "KUHS-MD-PED-2024-018", dateOfJoining: "2024-06-03", guide: "Dr. Radhamani KV", status: "Active" },
];

const paths: Record<string, string> = {
  "gap-dashboard": "/",
  "posting-schedules": "/postings-builder",
  "mentor-matching": "/mentor-matching",
  "student-access": "/student-access",
  "leave-approvals": "/leave-approvals",
};

export function HODPortal({ activeTab = "gap-dashboard" }: { activeTab?: string }) {
  const [, setLocation] = useLocation();
  const [studentOpen, setStudentOpen] = React.useState(false);
  const [students, setStudents] = React.useState(initialStudents);
  const [studentForm, setStudentForm] = React.useState({
    name: "",
    registrationNumber: "",
    kuhsId: "",
    dateOfJoining: todayForInput(),
    guide: "Prof. Dr. Mohammad MTP",
  });
  const [rotations, setRotations] = React.useState([
    { number: 1, name: "Pediatric Intensive Care Unit", duration: "31 days", guide: "Dr. Radhamani KV", residents: 6 },
    { number: 2, name: "Neonatal Intensive Care Unit", duration: "61 days", guide: "Prof. Dr. Mohammad MTP", residents: 5 },
    { number: 3, name: "Pediatric Emergency", duration: "31 days", guide: "Dr. Anilkumar A", residents: 7 },
  ]);
  const [rotationOpen, setRotationOpen] = React.useState(false);
  const [rotation, setRotation] = React.useState({ name: "", duration: "31 days", guide: "Prof. Dr. Mohammad MTP" });
  const [leaves, setLeaves] = React.useState([
    { number: 402, resident: "Dr. Adithya Nair", type: "Academic leave", from: "2026-08-12", to: "2026-08-14", reason: "National Pediatric Pulmonary Conference" },
    { number: 407, resident: "Dr. Anilkumar A", type: "Casual leave", from: "2026-08-22", to: "2026-08-22", reason: "Personal appointment" },
  ]);

  const tabChange = (value: string) => setLocation(paths[value] || "/");

  const addStudent = (event: React.FormEvent) => {
    event.preventDefault();
    const number = Math.max(...students.map((student) => student.number)) + 1;
    setStudents([{ number, ...studentForm, status: "Invite issued" }, ...students]);
    setStudentOpen(false);
    toast.success("Student account created", {
      description: `A temporary password was issued for ${studentForm.registrationNumber}. The student must reset it at first sign-in.`,
    });
  };

  const addRotation = (event: React.FormEvent) => {
    event.preventDefault();
    setRotations([...rotations, { number: rotations.length + 1, ...rotation, residents: 0 }]);
    setRotationOpen(false);
    toast.success("Rotation added to the clinical schedule");
  };

  const decideLeave = (number: number, approved: boolean) => {
    setLeaves(leaves.filter((leave) => leave.number !== number));
    toast[approved ? "success" : "error"](`Leave number ${number} ${approved ? "approved" : "returned"}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-teal-100 bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-600 text-white">
        <CardContent className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
          <div>
            <Badge className="border-white/20 bg-white/10 text-teal-50">HOD department workspace</Badge>
            <h2 className="mt-3 text-3xl font-bold">Department of Pediatrics</h2>
            <p className="mt-1 text-xs text-teal-50">Dr. Radhamani KV • MCI-aligned department administration</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric value="18" label="Residents" />
            <Metric value="91%" label="On track" />
            <Metric value="2" label="Leave requests" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={tabChange}>
        <TabsList className="h-auto flex-wrap rounded-2xl border border-white/80 bg-white/60 p-1">
          <TabsTrigger value="gap-dashboard"><AlertTriangle className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="posting-schedules"><CalendarDays className="mr-2 h-4 w-4" /> Schedules</TabsTrigger>
          <TabsTrigger value="mentor-matching"><Users className="mr-2 h-4 w-4" /> Mentors</TabsTrigger>
          <TabsTrigger value="student-access"><UserPlus className="mr-2 h-4 w-4" /> Student access</TabsTrigger>
          <TabsTrigger value="leave-approvals"><CheckCircle2 className="mr-2 h-4 w-4" /> Leave approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="gap-dashboard" className="space-y-5 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Overview label="Clinical cases" value="712 / 900" note="79% department completion" />
            <Overview label="Required procedures" value="206 / 270" note="76% department completion" />
            <Overview label="Assessments due" value="4" note="Quarterly reviews this month" />
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-teal-100">
              <CardTitle className="text-lg">Requirement gaps</CardTitle>
              <Button variant="outline" size="sm" onClick={() => toast.success("Department gaps recalculated")}><RefreshCw className="h-4 w-4" /> Recalculate</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Resident</TableHead><TableHead>Registration</TableHead><TableHead>Case completion</TableHead><TableHead>Procedure completion</TableHead><TableHead>Risk</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow><TableCell className="font-semibold">Dr. Adithya Nair</TableCell><TableCell>PG2024-PAED-014</TableCell><TableCell>42/50</TableCell><TableCell>11/15</TableCell><TableCell><Badge className="border-amber-200 bg-amber-50 text-amber-700">At risk</Badge></TableCell></TableRow>
                  <TableRow><TableCell className="font-semibold">Dr. Anilkumar A</TableCell><TableCell>PG2024-PAED-018</TableCell><TableCell>46/50</TableCell><TableCell>14/15</TableCell><TableCell><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">On track</Badge></TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posting-schedules" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-teal-100">
              <div><p className="page-eyebrow">Department calendar</p><CardTitle className="mt-1 text-xl">Clinical rotation schedules</CardTitle></div>
              <Dialog open={rotationOpen} onOpenChange={setRotationOpen}>
                <DialogTrigger asChild><Button size="sm"><PlusCircle className="h-4 w-4" /> Add rotation</Button></DialogTrigger>
                <DialogContent className="rounded-2xl bg-white sm:max-w-md">
                  <DialogHeader><DialogTitle>Add clinical rotation</DialogTitle><DialogDescription>Create a schedule available for resident allocation.</DialogDescription></DialogHeader>
                  <form onSubmit={addRotation} className="space-y-4">
                    <Field label="Rotation name"><Input value={rotation.name} onChange={(e) => setRotation({ ...rotation, name: e.target.value })} required /></Field>
                    <Field label="Duration"><Input value={rotation.duration} onChange={(e) => setRotation({ ...rotation, duration: e.target.value })} /></Field>
                    <Field label="HOD / Guide"><FacultySelect value={rotation.guide} onChange={(guide) => setRotation({ ...rotation, guide })} /></Field>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setRotationOpen(false)}>Cancel</Button><Button type="submit">Save rotation</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Rotation</TableHead><TableHead>Duration</TableHead><TableHead>HOD / Guide</TableHead><TableHead>Residents</TableHead></TableRow></TableHeader><TableBody>{rotations.map((item) => <TableRow key={item.number}><TableCell className="font-bold">{item.number}</TableCell><TableCell className="font-semibold">{item.name}</TableCell><TableCell>{item.duration}</TableCell><TableCell>{item.guide}</TableCell><TableCell>{item.residents}</TableCell></TableRow>)}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor-matching" className="pt-4">
          <Card>
            <CardHeader className="border-b border-teal-100"><CardTitle className="text-xl">HOD / Guide allocation</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow><TableHead>Resident</TableHead><TableHead>Registration</TableHead><TableHead>Assigned guide</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{students.map((item) => <TableRow key={item.number}><TableCell className="font-semibold">{item.name}</TableCell><TableCell>{item.registrationNumber}</TableCell><TableCell>{item.guide}</TableCell><TableCell><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Assigned</Badge></TableCell></TableRow>)}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-access" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [UserPlus, "1. Create account", "HOD enters registration, KUHS ID, joining date and guide."],
              [KeyRound, "2. Issue credentials", "The system generates a temporary password for the student."],
              [ShieldCheck, "3. First sign-in", "The student signs in and is required to choose a new password."],
            ].map(([Icon, title, text]) => {
              const StepIcon = Icon as typeof UserPlus;
              return <Card key={String(title)}><CardContent className="p-5"><StepIcon className="h-5 w-5 text-teal-600" /><p className="mt-3 text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-slate-500">{String(text)}</p></CardContent></Card>;
            })}
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-teal-100">
              <div><p className="page-eyebrow">Account provisioning</p><CardTitle className="mt-1 text-xl">Student access</CardTitle></div>
              <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
                <DialogTrigger asChild><Button><UserPlus className="h-4 w-4" /> Add student</Button></DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white sm:max-w-lg">
                  <DialogHeader><DialogTitle>Create student account</DialogTitle><DialogDescription>The HOD provisions the account; students do not self-register.</DialogDescription></DialogHeader>
                  <form onSubmit={addStudent} className="space-y-4">
                    <Field label="Student name"><Input value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required /></Field>
                    <Field label="Registration number"><Input value={studentForm.registrationNumber} onChange={(e) => setStudentForm({ ...studentForm, registrationNumber: e.target.value })} required /></Field>
                    <Field label="KUHS ID"><Input value={studentForm.kuhsId} onChange={(e) => setStudentForm({ ...studentForm, kuhsId: e.target.value })} required /></Field>
                    <Field label="Date of joining"><Input type="date" value={studentForm.dateOfJoining} onChange={(e) => setStudentForm({ ...studentForm, dateOfJoining: e.target.value })} required /></Field>
                    <Field label="HOD / Guide"><FacultySelect value={studentForm.guide} onChange={(guide) => setStudentForm({ ...studentForm, guide })} /></Field>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setStudentOpen(false)}>Cancel</Button><Button type="submit">Create & issue password</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Student</TableHead><TableHead>Registration</TableHead><TableHead>KUHS ID</TableHead><TableHead>Date joined</TableHead><TableHead>Guide</TableHead><TableHead>Access</TableHead></TableRow></TableHeader><TableBody>{students.map((student) => <TableRow key={student.number}><TableCell className="font-bold">{student.number}</TableCell><TableCell className="font-semibold">{student.name}</TableCell><TableCell>{student.registrationNumber}</TableCell><TableCell className="text-xs text-teal-800">{student.kuhsId}</TableCell><TableCell>{formatLogbookDate(student.dateOfJoining)}</TableCell><TableCell>{student.guide}</TableCell><TableCell><Badge className={student.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{student.status}</Badge></TableCell></TableRow>)}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-approvals" className="pt-4">
          <Card>
            <CardHeader className="border-b border-teal-100"><CardTitle className="text-xl">Pending leave requests</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table><TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Resident</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Decision</TableHead></TableRow></TableHeader><TableBody>{leaves.map((leave) => <TableRow key={leave.number}><TableCell className="font-bold">{leave.number}</TableCell><TableCell className="font-semibold">{leave.resident}</TableCell><TableCell>{leave.type}</TableCell><TableCell>{formatLogbookDate(leave.from)} – {formatLogbookDate(leave.to)}</TableCell><TableCell>{leave.reason}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => decideLeave(leave.number, false)} className="text-rose-700"><XCircle className="h-4 w-4" /> Return</Button><Button size="sm" onClick={() => decideLeave(leave.number, true)}><CheckCircle2 className="h-4 w-4" /> Approve</Button></div></TableCell></TableRow>)}</TableBody></Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center"><p className="text-xl font-bold">{value}</p><p className="text-[9px] font-bold uppercase tracking-wider text-teal-100">{label}</p></div>;
}

function Overview({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card><CardContent className="p-5"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-teal-700">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></CardContent></Card>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}

function FacultySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="Prof. Dr. Mohammad MTP">Prof. Dr. Mohammad MTP</SelectItem>
        <SelectItem value="Dr. Radhamani KV">Dr. Radhamani KV</SelectItem>
        <SelectItem value="Dr. Anilkumar A">Dr. Anilkumar A</SelectItem>
      </SelectContent>
    </Select>
  );
}
