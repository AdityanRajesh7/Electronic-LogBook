import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { GraduationCap, PlusCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export function AcademicLogsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [academicLogs, setAcademicLogs] = React.useState([
    {
      id: "LOG-1081",
      date: "2026-07-22",
      type: "Journal Club",
      topic: "High-Flow Nasal Cannula vs CPAP in Pediatric Bronchiolitis",
      supervisor: "Prof. Dr. Mohammad MTP",
      status: "verified",
      remarks: "Critical appraisal of NEJM 2025 RCT study design.",
    },
    {
      id: "LOG-1072",
      date: "2026-07-16",
      type: "Seminar",
      topic: "Approach to Neonatal Cholestasis & Biliary Atresia",
      supervisor: "Dr. Sunita Kulkarni",
      status: "verified",
      remarks: "Comprehensive overview of diagnostic algorithm.",
    },
    {
      id: "LOG-1065",
      date: "2026-07-10",
      type: "Bedside Presentation",
      topic: "Nephrotic Syndrome presenting with Anasarca in a 4yo",
      supervisor: "Dr. Meenakshi Sundaram",
      status: "pending",
      remarks: "Awaiting supervisor signature",
    },
  ]);

  const [form, setForm] = React.useState({
    type: "Journal Club",
    topic: "",
    supervisor: "Prof. Dr. Mohammad MTP",
  });

  const handleAddAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic) return;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      type: form.type,
      topic: form.topic,
      supervisor: form.supervisor,
      status: "pending",
      remarks: "Submitted for faculty evaluation",
    };

    setAcademicLogs([newLog, ...academicLogs]);
    toast.success(`Academic Activity ${newLog.id} logged!`, {
      description: `${newLog.type}: ${newLog.topic}`,
    });

    setForm({ type: "Journal Club", topic: "", supervisor: "Prof. Dr. Mohammad MTP" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-teal-600" /> Academic Activity Logbook
          </h2>
          <p className="text-xs text-slate-500">
            Journal clubs, seminars, symposia, bedside case presentations, and mortality meeting logs
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2">
              <PlusCircle className="h-4 w-4" /> Log Academic Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-teal-600" /> Log Academic Presentation
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Log academic presentations, seminars, or journal club appraisals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAcademic} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Activity Category</Label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Journal Club">Journal Club Presentation</SelectItem>
                    <SelectItem value="Seminar">Seminar Presentation</SelectItem>
                    <SelectItem value="Symposia">Symposia</SelectItem>
                    <SelectItem value="Bedside Presentation">Bedside Case Presentation</SelectItem>
                    <SelectItem value="Mortality Meeting">Mortality Meeting Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topic Title / Subject</Label>
                <Input
                  placeholder="e.g. Approach to Management of Pediatric Septic Shock"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Faculty Supervisor</Label>
                <Select value={form.supervisor} onValueChange={(val) => setForm({ ...form, supervisor: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prof. Dr. Mohammad MTP">Prof. Dr. Mohammad MTP</SelectItem>
                    <SelectItem value="Dr. Meenakshi Sundaram">Dr. Meenakshi Sundaram</SelectItem>
                    <SelectItem value="Dr. Sunita Kulkarni">Dr. Sunita Kulkarni</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 text-white">Submit Academic Entry</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Academic Presentations &amp; Seminars</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Activity Type</TableHead>
                <TableHead className="text-xs font-semibold">Topic Title</TableHead>
                <TableHead className="text-xs font-semibold">Date</TableHead>
                <TableHead className="text-xs font-semibold">Faculty Supervisor</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="py-3">
                    <Badge variant="outline" className="text-xs bg-slate-100 text-slate-800">
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">{log.topic}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">{log.date}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700 font-medium">{log.supervisor}</TableCell>
                  <TableCell className="py-3">
                    {log.status === "verified" ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                        <Clock className="h-3 w-3 mr-1 text-amber-600" /> Pending
                      </Badge>
                    )}
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
