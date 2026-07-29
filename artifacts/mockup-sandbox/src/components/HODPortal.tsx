import * as React from "react";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACADEMIC_REQUIREMENTS,
  DEPARTMENT_HOD,
  formatLogbookDate,
  REQUIRED_PROCEDURE_COUNT,
} from "@/lib/logbook-config";

type Registration = {
  number: number;
  name: string;
  department: string;
  registrationNumber: string;
  dateOfJoining: string;
  expectedCompletion: string;
  payment: "Paid";
  status: "Pending verification" | "Active" | "Rejected";
};

const initialRegistrations: Registration[] = [
  {
    number: 1,
    name: "Dr. Anilkumar A",
    department: "Pediatrics",
    registrationNumber: "PG2024-PAED-014",
    dateOfJoining: "2024-06-03",
    expectedCompletion: "2027-06-03",
    payment: "Paid",
    status: "Active",
  },
  {
    number: 2,
    name: "Dr. Radhamani KV",
    department: "Pediatrics",
    registrationNumber: "PG2025-PAED-018",
    dateOfJoining: "2025-05-12",
    expectedCompletion: "2028-05-12",
    payment: "Paid",
    status: "Pending verification",
  },
  {
    number: 3,
    name: "Dr. Mohammad MTP",
    department: "Pediatrics",
    registrationNumber: "PG2026-PAED-003",
    dateOfJoining: "2026-06-01",
    expectedCompletion: "2029-06-01",
    payment: "Paid",
    status: "Pending verification",
  },
];

const paths: Record<string, string> = {
  "gap-dashboard": "/",
  "student-access": "/student-access",
  "leave-approvals": "/leave-approvals",
};

export function HODPortal({ activeTab = "gap-dashboard" }: { activeTab?: string }) {
  const [, setLocation] = useLocation();
  const [registrations, setRegistrations] = React.useState(initialRegistrations);
  const [leaves, setLeaves] = React.useState([
    { number: 1, resident: "Dr. Anilkumar A", type: "Casual leave", from: "2026-08-04", to: "2026-08-05", reason: "Family commitment" },
    { number: 2, resident: "Dr. Radhamani KV", type: "Academic leave", from: "2026-08-11", to: "2026-08-13", reason: "Conference presentation" },
  ]);

  const decideRegistration = (number: number, approved: boolean) => {
    setRegistrations((current) => current.map((student) => (
      student.number === number
        ? { ...student, status: approved ? "Active" : "Rejected" }
        : student
    )));
    toast.success(approved ? "Student registration activated" : "Registration returned");
  };

  const decideLeave = (number: number, approved: boolean) => {
    setLeaves((current) => current.filter((leave) => leave.number !== number));
    toast.success(approved ? "Leave approved" : "Leave returned");
  };

  const pending = registrations.filter((student) => student.status === "Pending verification").length;

  return (
    <div className="space-y-6 pb-12">
      <Card className="overflow-hidden border-teal-100 bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-600 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-100">Department leadership</p>
              <h2 className="mt-2 text-3xl font-bold">{DEPARTMENT_HOD}</h2>
              <p className="mt-2 text-sm text-teal-50">HOD, Department of Pediatrics</p>
              <p className="mt-4 max-w-2xl text-xs leading-5 text-teal-100">
                Students create and pay for their own account. The HOD verifies paid registrations and oversees programme completion.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Metric value={String(registrations.length)} label="Registered" />
              <Metric value={String(pending)} label="To verify" />
              <Metric value="3 years" label="Programme" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setLocation(paths[value] ?? "/")}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="gap-dashboard"><ShieldCheck className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="student-access"><Users className="h-4 w-4" /> Student registrations</TabsTrigger>
          <TabsTrigger value="leave-approvals"><Clock3 className="h-4 w-4" /> Leave approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="gap-dashboard" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Overview label="Paid registrations" value={`${registrations.length}/${registrations.length}`} note="Student payment captured before verification" icon={CreditCard} />
            <Overview label="Procedure target" value={String(REQUIRED_PROCEDURE_COUNT)} note="Across emergency and invasive procedures" icon={UserCheck} />
            <Overview label="Case discussions" value="50" note="Mandatory total per resident" icon={CheckCircle2} />
          </div>
          <Card>
            <CardHeader className="border-b border-teal-100">
              <CardTitle className="text-xl">Mandatory academic frequency</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {ACADEMIC_REQUIREMENTS.map((item) => (
                <div key={item.name} className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="mt-2 text-2xl font-bold text-teal-700">{item.target}</p>
                  <p className="text-xs text-slate-500">{item.requirement}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-access" className="space-y-4 pt-4">
          <Card className="border-cyan-100 bg-cyan-50/50">
            <CardContent className="flex gap-3 p-5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
              <div>
                <p className="font-bold text-slate-900">Student self-registration</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Students submit their registration number, department, exact joining date, joining year and payment. HOD verification activates access.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b border-teal-100">
              <CardTitle className="text-xl">Paid student registrations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Registration number</TableHead>
                    <TableHead>Date joined</TableHead>
                    <TableHead>Expected completion</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Registration access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((student) => (
                    <TableRow key={student.number}>
                      <TableCell className="font-bold">{student.number}</TableCell>
                      <TableCell className="font-semibold">{student.name}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.registrationNumber}</TableCell>
                      <TableCell>{formatLogbookDate(student.dateOfJoining)}</TableCell>
                      <TableCell>{formatLogbookDate(student.expectedCompletion)}</TableCell>
                      <TableCell><Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">{student.payment}</Badge></TableCell>
                      <TableCell className="text-right">
                        {student.status === "Pending verification" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => decideRegistration(student.number, false)}><XCircle className="h-4 w-4" /> Return</Button>
                            <Button size="sm" onClick={() => decideRegistration(student.number, true)}><CheckCircle2 className="h-4 w-4" /> Activate</Button>
                          </div>
                        ) : (
                          <RegistrationStatus status={student.status} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-approvals" className="pt-4">
          <Card>
            <CardHeader className="border-b border-teal-100"><CardTitle className="text-xl">Pending leave requests</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Number</TableHead><TableHead>Resident</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Decision</TableHead></TableRow></TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.number}>
                      <TableCell className="font-bold">{leave.number}</TableCell>
                      <TableCell className="font-semibold">{leave.resident}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{formatLogbookDate(leave.from)} – {formatLogbookDate(leave.to)}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => decideLeave(leave.number, false)} className="text-rose-700"><XCircle className="h-4 w-4" /> Return</Button>
                          <Button size="sm" onClick={() => decideLeave(leave.number, true)}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

function Overview({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: React.ComponentType<{ className?: string }> }) {
  return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-teal-600" /><p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-teal-700">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></CardContent></Card>;
}

function RegistrationStatus({ status }: { status: Registration["status"] }) {
  const active = status === "Active";
  return <Badge className={active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}>{status}</Badge>;
}
