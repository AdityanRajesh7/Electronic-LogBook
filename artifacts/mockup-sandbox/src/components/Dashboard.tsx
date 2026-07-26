import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Stethoscope,
  FileText,
  GraduationCap,
  Calendar,
  AlertCircle,
  TrendingUp,
  User,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { toast } from "sonner";

export function Dashboard() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCaseModalOpen, setIsCaseModalOpen] = React.useState(false);
  const [isProcedureModalOpen, setIsProcedureModalOpen] = React.useState(false);
  const [isClockedIn, setIsClockedIn] = React.useState(true);

  // Form states
  const [caseForm, setCaseForm] = React.useState({
    patientAge: "7",
    patientGender: "male",
    diagnosisProvisional: "",
    managementPlan: "",
  });

  const [procedureForm, setProcedureForm] = React.useState({
    procedureName: "",
    ageCategory: "pediatric",
    competencyLevel: "performed_independently",
  });

  React.useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/student/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setIsClockedIn(json.attendance?.clockedIn ?? true);
        } else {
          setData(getFallbackMockData());
        }
      } catch (e) {
        setData(getFallbackMockData());
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.diagnosisProvisional) return;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "Case Log",
      title: caseForm.diagnosisProvisional,
      date: new Date().toISOString().split("T")[0],
      posting: data?.currentPosting?.postingName || "PICU",
      status: "pending",
      statusLabel: "Pending Faculty Review",
      patientInfo: `${caseForm.patientAge} yr / ${caseForm.patientGender === "male" ? "Male" : "Female"}`,
      detail: caseForm.managementPlan || "Managed as per ward protocols",
    };

    if (data) {
      setData({
        ...data,
        recentLogs: [newLog, ...data.recentLogs],
        categories: data.categories.map((c: any) =>
          c.id === "cases" ? { ...c, logged: c.logged + 1, percentage: Math.min(100, Math.round(((c.logged + 1) / c.required) * 100)) } : c
        ),
      });
    }

    toast.success(`Case Entry ${newLog.id} submitted!`, {
      description: `Diagnosis: ${newLog.title}. Sent to Prof. Dr. Piyush Gupta for verification.`,
    });

    setCaseForm({ patientAge: "7", patientGender: "male", diagnosisProvisional: "", managementPlan: "" });
    setIsCaseModalOpen(false);
  };

  const handleCreateProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureForm.procedureName) return;

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      type: "Procedure",
      title: procedureForm.procedureName,
      date: new Date().toISOString().split("T")[0],
      posting: data?.currentPosting?.postingName || "PICU",
      status: "pending",
      statusLabel: "Pending Faculty Review",
      competency: "Performed Independently",
      detail: `Category: ${procedureForm.ageCategory}`,
    };

    if (data) {
      setData({
        ...data,
        recentLogs: [newLog, ...data.recentLogs],
        categories: data.categories.map((c: any) =>
          c.id === "procedures" ? { ...c, logged: c.logged + 1, percentage: Math.min(100, Math.round(((c.logged + 1) / c.required) * 100)) } : c
        ),
      });
    }

    toast.success(`Procedure Log ${newLog.id} submitted!`, {
      description: `${newLog.title} (${procedureForm.competencyLevel.replace(/_/g, ' ')}) queued for faculty verification.`,
    });

    setProcedureForm({ procedureName: "", ageCategory: "pediatric", competencyLevel: "performed_independently" });
    setIsProcedureModalOpen(false);
  };

  const toggleClock = () => {
    const nextState = !isClockedIn;
    setIsClockedIn(nextState);
    toast.info(nextState ? "Duty On (Clocked In at 08:00 AM)" : "Duty Off (Clocked Out)", {
      description: nextState ? "Duty attendance register updated." : "Duty session logged.",
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-sm font-medium text-slate-500">Loading Student Dashboard & Analytics...</p>
        </div>
      </div>
    );
  }

  const student = data?.student;
  const posting = data?.currentPosting;
  const categories = data?.categories || [];
  const recentLogs = data?.recentLogs || [];
  const attendance = data?.attendance;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Current Posting & Resident Profile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs font-semibold px-2.5 py-0.5">
                Active Rotation
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Days Elapsed: {posting?.daysElapsed}/{posting?.totalDays}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {posting?.postingName || "Pediatric Intensive Care Unit (PICU)"}
            </h2>
            <p className="text-sm text-slate-300 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-teal-400" /> Resident: <strong className="text-white">{student?.name}</strong> ({student?.registrationNumber})
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-teal-400" /> In-Charge: <strong className="text-white">{posting?.inCharge}</strong>
              </span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Dialog open={isCaseModalOpen} onOpenChange={setIsCaseModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/30 gap-2">
                  <PlusCircle className="h-4 w-4" /> Log Case
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-600" /> Log New Clinical Case
                  </DialogTitle>
                  <DialogDescription className="text-slate-500">
                    Record patient clinical details. All entries remain strictly de-identified per NMC compliance.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCase} className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Patient Age (Years)</Label>
                      <Input
                        id="age"
                        type="number"
                        value={caseForm.patientAge}
                        onChange={(e) => setCaseForm({ ...caseForm, patientAge: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={caseForm.patientGender}
                        onValueChange={(val) => setCaseForm({ ...caseForm, patientGender: val })}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Provisional / Final Diagnosis</Label>
                    <Input
                      id="diagnosis"
                      placeholder="e.g. Acute Severe Asthma Exacerbation"
                      value={caseForm.diagnosisProvisional}
                      onChange={(e) => setCaseForm({ ...caseForm, diagnosisProvisional: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="management">Management Plan & Key Interventions</Label>
                    <Textarea
                      id="management"
                      rows={3}
                      placeholder="Outline diagnostic workup, oxygenation, pharmacotherapy..."
                      value={caseForm.managementPlan}
                      onChange={(e) => setCaseForm({ ...caseForm, managementPlan: e.target.value })}
                    />
                  </div>

                  <DialogFooter className="pt-3">
                    <Button type="button" variant="outline" onClick={() => setIsCaseModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                      Submit Log
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isProcedureModalOpen} onOpenChange={setIsProcedureModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold gap-2 border border-slate-700">
                  <Stethoscope className="h-4 w-4 text-teal-400" /> Log Procedure
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-teal-600" /> Log Procedure Entry
                  </DialogTitle>
                  <DialogDescription className="text-slate-500">
                    Log procedures performed or observed during your rotation for faculty verification.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProcedure} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="procName">Procedure Name</Label>
                    <Input
                      id="procName"
                      placeholder="e.g. Lumbar Puncture / Endotracheal Intubation"
                      value={procedureForm.procedureName}
                      onChange={(e) => setProcedureForm({ ...procedureForm, procedureName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageCategory">Age Category</Label>
                      <Select
                        value={procedureForm.ageCategory}
                        onValueChange={(val) => setProcedureForm({ ...procedureForm, ageCategory: val })}
                      >
                        <SelectTrigger id="ageCategory">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neonatal">Neonatal (&lt; 28 days)</SelectItem>
                          <SelectItem value="pediatric">Pediatric (1mo - 18yr)</SelectItem>
                          <SelectItem value="adult">Adult (&gt; 18yr)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="competency">Self-Declared Level</Label>
                      <Select
                        value={procedureForm.competencyLevel}
                        onValueChange={(val) => setProcedureForm({ ...procedureForm, competencyLevel: val })}
                      >
                        <SelectTrigger id="competency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performed_independently">Performed Independently</SelectItem>
                          <SelectItem value="performed_under_supervision">Under Supervision</SelectItem>
                          <SelectItem value="assisted">Assisted</SelectItem>
                          <SelectItem value="observed">Observed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="pt-3">
                    <Button type="button" variant="outline" onClick={() => setIsProcedureModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
                      Submit Procedure Log
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={toggleClock}
              className={`font-medium transition-all ${
                isClockedIn
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {isClockedIn ? "Duty On (Clock Out)" : "Clock In Duty"}
            </Button>
          </div>
        </div>
      </div>

      {/* Gap Analytics Alert Banner (PRD Section 4 & 6: Progress-first) */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-500/15 rounded-lg text-amber-700 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                NMC Target Gap Alert — MD Paediatrics Baseline
                <Badge className="bg-amber-600 text-white text-[10px] uppercase font-semibold">
                  Action Required
                </Badge>
              </h3>
              <span className="text-xs text-amber-700 font-mono font-medium">
                Shortfall Count: 2 Categories
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              You are currently behind schedule on <strong>Independent Procedures (60%)</strong> and <strong>M&amp;M Meetings (50%)</strong> for your training phase. Increase procedure logging during your current PICU rotation to maintain compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Requirement Categories Visual Progress Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Training Target Progression</h3>
            <p className="text-xs text-slate-500">
              Live tracking against NMC PGMER-2023 specialty requirement baseline
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Overall Completion: 73%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat: any) => {
            const statusConfig = getStatusBadge(cat.status);
            return (
              <Card key={cat.id} className="border border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white">
                <CardHeader className="pb-3 pt-4 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-bold text-slate-800 leading-snug">
                      {cat.name}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.className}`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 px-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">{cat.logged}</span>
                      <span className="text-xs text-slate-500 font-medium">/ {cat.required} {cat.unit}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{cat.percentage}%</span>
                  </div>

                  <Progress
                    value={cat.percentage}
                    className={`h-2.5 rounded-full bg-slate-100 ${statusConfig.progressColor}`}
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Faculty Verified: <strong className="text-slate-700">{cat.verified}</strong></span>
                    <span className="text-slate-400">Target Min: {cat.required}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Log Submissions & Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Recent Submissions &amp; Review Queue
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Activity logs submitted for faculty verification
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-teal-700 hover:text-teal-800 gap-1 font-semibold">
                  View All Logs <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="text-xs font-semibold text-slate-600">Type &amp; Title</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Date &amp; Rotation</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 text-right">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log: any) => (
                    <TableRow key={log.id} className="hover:bg-slate-50/60 border-b border-slate-100">
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700 border-slate-200">
                              {log.type}
                            </Badge>
                            <span className="font-semibold text-xs text-slate-900 truncate max-w-[240px]">
                              {log.title}
                            </span>
                          </div>
                          {log.patientInfo && (
                            <p className="text-[11px] text-slate-500">Patient: {log.patientInfo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-600">
                        <p className="font-medium text-slate-800">{log.date}</p>
                        <p className="text-[11px] text-slate-400">{log.posting}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        {renderLogStatusBadge(log.status)}
                      </TableCell>
                      <TableCell className="py-3 text-right text-xs text-slate-500 max-w-[180px] truncate">
                        {log.facultyRemarks || log.detail || "No remarks yet"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Widget Column */}
        <div className="space-y-6">
          {/* Duty & Attendance Card */}
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" /> Duty Attendance &amp; Leave
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Current Status</p>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isClockedIn ? "Duty On (08:00 AM)" : "Off Duty"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={toggleClock}
                  className={isClockedIn ? "bg-amber-600 hover:bg-amber-700 text-white text-xs" : "bg-teal-600 hover:bg-teal-700 text-white text-xs"}
                >
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-teal-50/60 rounded-lg border border-teal-100">
                  <p className="text-xl font-black text-teal-900">{attendance?.attendanceRate || 96.4}%</p>
                  <p className="text-[11px] font-medium text-teal-700">Attendance Rate</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xl font-black text-slate-900">{attendance?.leavesTaken || 1}</p>
                  <p className="text-[11px] font-medium text-slate-500">Leaves Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Mentor Information */}
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal-600" /> Assigned Faculty Mentor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  PG
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Prof. Dr. Piyush Gupta</h4>
                  <p className="text-[11px] text-slate-500">HOD &amp; Professor of Paediatrics</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                Next appraisal review: <strong>31 Aug 2026</strong> (NMC Annexure-I Quarterly Appraisal)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "on_track":
      return {
        label: "On Track",
        className: "bg-emerald-50 text-emerald-700 border-emerald-300",
        progressColor: "[&>div]:bg-emerald-600",
      };
    case "at_risk":
      return {
        label: "At Risk",
        className: "bg-amber-50 text-amber-700 border-amber-300",
        progressColor: "[&>div]:bg-amber-500",
      };
    case "behind":
      return {
        label: "Behind Target",
        className: "bg-rose-50 text-rose-700 border-rose-300",
        progressColor: "[&>div]:bg-rose-600",
      };
    default:
      return {
        label: "Pending",
        className: "bg-slate-50 text-slate-700 border-slate-300",
        progressColor: "[&>div]:bg-teal-600",
      };
  }
}

function renderLogStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Faculty Verified
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
          <AlertCircle className="h-3 w-3 mr-1 text-rose-600" /> Needs Revision
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
          <Clock className="h-3 w-3 mr-1 text-amber-600" /> Pending Review
        </Badge>
      );
  }
}

function getFallbackMockData() {
  return {
    student: {
      name: "Dr. Aarav Sharma",
      registrationNumber: "PG2024-PAED-014",
    },
    currentPosting: {
      postingName: "Pediatric Intensive Care Unit (PICU)",
      daysElapsed: 27,
      totalDays: 31,
      inCharge: "Dr. Meenakshi Sundaram",
    },
    categories: [
      { id: "cases", name: "Clinical Case Exposure", logged: 42, required: 50, verified: 38, status: "on_track", percentage: 84, unit: "cases" },
      { id: "procedures", name: "Independent Procedures", logged: 9, required: 15, verified: 7, status: "behind", percentage: 60, unit: "procedures" },
      { id: "journal_clubs", name: "Journal Club Presentations", logged: 7, required: 8, verified: 6, status: "on_track", percentage: 87, unit: "clubs" },
      { id: "seminars", name: "Seminars Presented", logged: 5, required: 6, verified: 5, status: "on_track", percentage: 83, unit: "seminars" },
      { id: "bedside", name: "Bedside Case Presentations", logged: 14, required: 20, verified: 12, status: "at_risk", percentage: 70, unit: "presentations" },
      { id: "mm_meetings", name: "M&M Meetings Attended", logged: 2, required: 4, verified: 2, status: "at_risk", percentage: 50, unit: "meetings" },
    ],
    recentLogs: [
      {
        id: "LOG-1092",
        type: "Case Log",
        title: "Acute Severe Asthma Exacerbation in a 7yo Child",
        date: "2026-07-26",
        posting: "PICU",
        status: "pending",
        patientInfo: "7 yr / Male",
        detail: "Managed with Nebulized Salbutamol + Ipratropium",
      },
      {
        id: "LOG-1088",
        type: "Procedure",
        title: "Endotracheal Intubation (Pediatric)",
        date: "2026-07-24",
        posting: "PICU",
        status: "verified",
        competency: "Performed Independently",
        facultyRemarks: "Well performed with sterile technique.",
      },
    ],
    attendance: {
      clockedIn: true,
      attendanceRate: 96.4,
      leavesTaken: 1,
    },
  };
}
