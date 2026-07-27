import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { FileText, PlusCircle, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function CaseLogsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [caseLogs, setCaseLogs] = React.useState([
    {
      id: "LOG-1092",
      date: "2026-07-26",
      posting: "PICU",
      patientUhid: "UHID-2026-004281",
      patientInfo: "7 yr / Male",
      diagnosis: "Acute Severe Asthma Exacerbation",
      management: "Nebulized Salbutamol + Ipratropium, IV Hydrocortisone, supplemental O2",
      status: "pending",
      remarks: "Awaiting Prof. Dr. Mohammad MTP review",
    },
    {
      id: "LOG-1085",
      date: "2026-07-23",
      posting: "PICU",
      patientUhid: "UHID-2026-004097",
      patientInfo: "3 yr / Female",
      diagnosis: "Severe Dengue Hemorrhagic Fever with Plasma Leakage",
      management: "IV Fluid resuscitation as per WHO Dengue protocol, hematocrit tracking",
      status: "verified",
      remarks: "Excellent fluid balance management and monitoring notes.",
    },
    {
      id: "LOG-1079",
      date: "2026-07-19",
      posting: "Paediatric Wards",
      patientUhid: "UHID-2026-003812",
      patientInfo: "10 mo / Male",
      diagnosis: "Acute Gastroenteritis with Moderate Dehydration",
      management: "ORS rehydration, Zinc supplementation, ongoing breastfeeding guidance",
      status: "verified",
      remarks: "Appropriate assessment of dehydration parameters.",
    },
    {
      id: "LOG-1070",
      date: "2026-07-15",
      posting: "Emergency Ward",
      patientUhid: "UHID-2026-003641",
      patientInfo: "5 yr / Female",
      diagnosis: "Febrile Seizure (First Episode)",
      management: "Intranasal Midazolam, antipyretic measures, EEG scheduling",
      status: "rejected",
      remarks: "Please document lumbar puncture findings to rule out CNS infection.",
    },
  ]);

  const [form, setForm] = React.useState({
    patientUhid: "",
    patientAge: "5",
    patientGender: "male",
    posting: "PICU",
    diagnosis: "",
    management: "",
  });

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientUhid || !form.diagnosis) return;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      posting: form.posting,
      patientUhid: form.patientUhid,
      patientInfo: `${form.patientAge} yr / ${form.patientGender === "male" ? "Male" : "Female"}`,
      diagnosis: form.diagnosis,
      management: form.management || "Managed as per clinical ward protocol",
      status: "pending",
      remarks: "Submitted for faculty review",
    };

    setCaseLogs([newLog, ...caseLogs]);
    toast.success(`Case ${newLog.id} logged!`, {
      description: `${newLog.diagnosis} added to Case Logbook.`,
    });

    setForm({ patientUhid: "", patientAge: "5", patientGender: "male", posting: "PICU", diagnosis: "", management: "" });
    setIsModalOpen(false);
  };

  const filteredLogs = caseLogs.filter(
    (log) =>
      log.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.posting.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patientUhid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-600" /> Clinical Case Logbook
          </h2>
          <p className="text-xs text-slate-500">
            Clinical cases presented and maintained according to MCI logbook preparation guidelines
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2">
              <PlusCircle className="h-4 w-4" /> Log New Case Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" /> Log Clinical Case Entry
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Record clinical presentation details for faculty verification.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCase} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Patient UHID</Label>
                <Input
                  placeholder="e.g. UHID-2026-004281"
                  value={form.patientUhid}
                  onChange={(e) => setForm({ ...form, patientUhid: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient Age (Years)</Label>
                  <Input
                    type="number"
                    value={form.patientAge}
                    onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={form.patientGender} onValueChange={(val) => setForm({ ...form, patientGender: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Provisional / Final Diagnosis</Label>
                <Input
                  placeholder="e.g. Acute Severe Asthma Exacerbation"
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Management Plan &amp; Interventions</Label>
                <Textarea
                  rows={3}
                  placeholder="Outline management plan..."
                  value={form.management}
                  onChange={(e) => setForm({ ...form, management: e.target.value })}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 text-white">Submit Case Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search diagnosis, posting, UHID, or log ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Total Cases Logged: {caseLogs.length} / 50 Target
          </span>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Log ID &amp; Date</TableHead>
                <TableHead className="text-xs font-semibold">Diagnosis &amp; Rotation</TableHead>
                <TableHead className="text-xs font-semibold">Patient UHID &amp; Info</TableHead>
                <TableHead className="text-xs font-semibold">Management Plan</TableHead>
                <TableHead className="text-xs font-semibold">Review Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Faculty Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/60">
                  <TableCell className="py-3 text-xs font-bold text-slate-900">
                    {log.id}
                    <p className="text-[11px] text-slate-400 font-normal">{log.date}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs">
                    <p className="font-bold text-slate-900">{log.diagnosis}</p>
                    <Badge variant="outline" className="text-[10px] mt-0.5 bg-slate-100 text-slate-700">
                      {log.posting}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-700 font-medium">
                    <p className="font-bold text-teal-800">{log.patientUhid}</p>
                    <p className="text-[11px] font-normal text-slate-500">{log.patientInfo}</p>
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-600 max-w-[280px] truncate">{log.management}</TableCell>
                  <TableCell className="py-3">{renderStatusBadge(log.status)}</TableCell>
                  <TableCell className="py-3 text-right text-xs text-slate-500 max-w-[180px] truncate">
                    {log.remarks}
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
