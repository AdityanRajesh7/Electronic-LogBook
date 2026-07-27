import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Stethoscope, PlusCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PROCEDURE_OPTIONS, REQUIRED_PROCEDURE_COUNT } from "@/lib/logbook-config";

export function ProcedureLogsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [procedureLogs, setProcedureLogs] = React.useState([
    {
      id: "LOG-1088",
      date: "2026-07-24",
      posting: "PICU",
      patientUhid: "UHID-2026-003944",
      procedureName: "Endotracheal Intubation",
      patientAge: "7 years",
      selfCompetency: "Performed Independently",
      facultyVerified: "Performed Independently",
      status: "verified",
      remarks: "Well performed with standard sterile technique under supervision.",
    },
    {
      id: "LOG-1075",
      date: "2026-07-20",
      posting: "Emergency Ward",
      patientUhid: "UHID-2026-003771",
      procedureName: "Lumbar Puncture",
      patientAge: "4 months",
      selfCompetency: "Assisted",
      facultyVerified: "Assisted",
      status: "rejected",
      remarks: "Please expand on CSF analysis findings and post-procedure monitoring notes.",
    },
    {
      id: "LOG-1062",
      date: "2026-07-14",
      posting: "NICU",
      patientUhid: "UHID-2026-003502",
      procedureName: "Surfactant Administration via ETT",
      patientAge: "32 weeks gestation",
      selfCompetency: "Performed Under Supervision",
      facultyVerified: "Performed Under Supervision",
      status: "verified",
      remarks: "Correct dosage calculation and post-instillation bag ventilation.",
    },
  ]);

  const [form, setForm] = React.useState({
    procedureName: "",
    patientUhid: "",
    patientAge: "",
    competency: "performed_independently",
  });

  const handleAddProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.procedureName || !form.patientUhid || !form.patientAge) return;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      posting: "PICU",
      patientUhid: form.patientUhid,
      procedureName: form.procedureName,
      patientAge: form.patientAge,
      selfCompetency: form.competency === "performed_independently" ? "Performed Independently" : "Performed Under Supervision",
      facultyVerified: "Pending Review",
      status: "pending",
      remarks: "Awaiting faculty verification",
    };

    setProcedureLogs([newLog, ...procedureLogs]);
    toast.success(`Procedure Log ${newLog.id} submitted!`, {
      description: `${newLog.procedureName} queued for faculty review.`,
    });

    setForm({ procedureName: "", patientUhid: "", patientAge: "", competency: "performed_independently" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-teal-600" /> Procedure Logbook
          </h2>
          <p className="text-xs text-slate-500">
            Procedural skills and competency self-declarations submitted for faculty verification
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2">
              <PlusCircle className="h-4 w-4" /> Log Procedure Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" /> Log Procedure Entry
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Log procedures performed or observed for faculty verification.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProcedure} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Procedure Name</Label>
                <Select
                  value={form.procedureName}
                  onValueChange={(val) => setForm({ ...form, procedureName: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Select a required procedure" /></SelectTrigger>
                  <SelectContent>
                    {PROCEDURE_OPTIONS.map((procedure) => (
                      <SelectItem key={procedure} value={procedure}>{procedure}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient UHID</Label>
                  <Input
                    placeholder="UHID-2026-004281"
                    value={form.patientUhid}
                    onChange={(e) => setForm({ ...form, patientUhid: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input
                    placeholder="e.g. 4 months"
                    value={form.patientAge}
                    onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Self-Declared Competency</Label>
                  <Select value={form.competency} onValueChange={(val) => setForm({ ...form, competency: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performed_independently">Performed Independently</SelectItem>
                      <SelectItem value="performed_under_supervision">Under Supervision</SelectItem>
                      <SelectItem value="assisted">Assisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 text-white">Submit Procedure Log</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700" />
          <p className="text-xs text-amber-900">
            <strong>Requirement Gap Warning:</strong> You have logged <strong>{procedureLogs.length}/{REQUIRED_PROCEDURE_COUNT}</strong> procedures. New entries must be selected from the required procedure list.
          </p>
        </div>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Logged Procedures</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Log ID &amp; Date</TableHead>
                <TableHead className="text-xs font-semibold">Procedure Name</TableHead>
                <TableHead className="text-xs font-semibold">Patient UHID</TableHead>
                <TableHead className="text-xs font-semibold">Age</TableHead>
                <TableHead className="text-xs font-semibold">Declared Competency</TableHead>
                <TableHead className="text-xs font-semibold">Faculty Verified</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedureLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/60">
                  <TableCell className="py-3 text-xs font-bold text-slate-900">
                    {log.id}
                    <p className="text-[11px] text-slate-400 font-normal">{log.date}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">
                    {log.procedureName}
                    <p className="text-[11px] text-slate-500 font-normal">{log.posting}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-teal-800">{log.patientUhid}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{log.patientAge}</TableCell>
                  <TableCell className="py-3 text-xs text-teal-800 font-semibold">{log.selfCompetency}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{log.facultyVerified}</TableCell>
                  <TableCell className="py-3">{renderStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Verified</Badge>;
    case "rejected":
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]"><AlertCircle className="h-3 w-3 mr-1 text-rose-600" /> Revision</Badge>;
    default:
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"><Clock className="h-3 w-3 mr-1 text-amber-600" /> Pending</Badge>;
  }
}
