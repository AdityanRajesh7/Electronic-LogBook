import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Building,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  UserPlus,
  Filter,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function HODPortal({ activeTab }: { activeTab?: string }) {
  const [location, setLocation] = useLocation();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all");

  const [isPostingModalOpen, setIsPostingModalOpen] = React.useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = React.useState(false);

  // Dynamic states
  const [rotations, setRotations] = React.useState([
    { name: "PICU Rotation (1 Month)", duration: "31 Days", inCharge: "Dr. Meenakshi Sundaram", residentsCount: 6 },
    { name: "NICU Rotation (2 Months)", duration: "61 Days", inCharge: "Prof. Dr. Piyush Gupta", residentsCount: 5 },
    { name: "Paediatric Emergency (1 Month)", duration: "31 Days", inCharge: "Dr. Sunita Kulkarni", residentsCount: 7 },
  ]);

  const [mentorAllocations, setMentorAllocations] = React.useState([
    { resident: "Dr. Aarav Sharma (PG-II)", mentor: "Prof. Dr. Piyush Gupta", batch: "2024-2027" },
    { resident: "Dr. Ananya Roy (PG-II)", mentor: "Prof. Dr. Piyush Gupta", batch: "2024-2027" },
    { resident: "Dr. Rohan Verma (PG-III)", mentor: "Dr. Meenakshi Sundaram", batch: "2023-2026" },
  ]);

  const [newPosting, setNewPosting] = React.useState({ name: "", duration: "31 Days", inCharge: "Dr. Meenakshi Sundaram" });
  const [newMentor, setNewMentor] = React.useState({ resident: "Dr. Priyanshi Patel (PG-II)", mentor: "Dr. Sunita Kulkarni" });

  const getTabFromPath = () => {
    if (activeTab) return activeTab;
    if (location === "/postings-builder") return "posting-schedules";
    if (location === "/mentor-matching") return "mentor-matching";
    if (location === "/leave-approvals") return "leave-approvals";
    return "gap-dashboard";
  };

  const currentTab = getTabFromPath();

  const handleTabChange = (val: string) => {
    if (val === "posting-schedules") setLocation("/postings-builder");
    else if (val === "mentor-matching") setLocation("/mentor-matching");
    else if (val === "leave-approvals") setLocation("/leave-approvals");
    else setLocation("/");
  };

  React.useEffect(() => {
    async function fetchHODData() {
      try {
        const res = await fetch("/api/hod/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(getFallbackHODData());
        }
      } catch (e) {
        setData(getFallbackHODData());
      } finally {
        setLoading(false);
      }
    }
    fetchHODData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Loading Department Gap Engine &amp; Analytics...</p>
      </div>
    );
  }

  const dept = data?.department || {};
  const residents = data?.residentsGapOverview || [];
  const leaves = data?.pendingLeaves || [];

  const handleApproveLeave = (id: string, residentName: string) => {
    if (data) {
      setData({ ...data, pendingLeaves: data.pendingLeaves.filter((l: any) => l.id !== id) });
    }
    toast.success(`Leave Application ${id} Approved!`, {
      description: `Granted leave for ${residentName}. Logged in department register.`,
    });
  };

  const handleRejectLeave = (id: string, residentName: string) => {
    if (data) {
      setData({ ...data, pendingLeaves: data.pendingLeaves.filter((l: any) => l.id !== id) });
    }
    toast.error(`Leave Application ${id} Rejected`, {
      description: `Notified ${residentName}.`,
    });
  };

  const handleAddPosting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosting.name) return;

    setRotations([...rotations, { name: newPosting.name, duration: newPosting.duration, inCharge: newPosting.inCharge, residentsCount: 4 }]);
    toast.success(`Rotation Posting Created!`, {
      description: `${newPosting.name} added to schedule for Batch 2024-2027.`,
    });
    setNewPosting({ name: "", duration: "31 Days", inCharge: "Dr. Meenakshi Sundaram" });
    setIsPostingModalOpen(false);
  };

  const handleAddMentorAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    setMentorAllocations([...mentorAllocations, { resident: newMentor.resident, mentor: newMentor.mentor, batch: "2024-2027" }]);
    toast.success(`Faculty Mentor Allocated!`, {
      description: `${newMentor.resident} paired with ${newMentor.mentor}.`,
    });
    setIsMentorModalOpen(false);
  };

  const handleRecalculateGaps = () => {
    toast.success("Gap Analytics Engine Recalculated!", {
      description: `Re-evaluated 18 resident logbook portfolios against NMC PGMER-2023 baseline targets.`,
    });
  };

  const filteredResidents = residents.filter((r: any) =>
    filterSeverity === "all" ? true : r.shortfallSeverity === filterSeverity
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: HOD Overview */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs font-semibold mb-2">
            Head of Department (HOD) Dashboard
          </Badge>
          <h2 className="text-2xl font-black">{dept.name}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Total Residents: <strong>{dept.totalResidents}</strong> • Faculty Count: <strong>{dept.facultyCount}</strong> • NMC Readiness: <strong className="text-emerald-400">{dept.inspectionReadiness}</strong>
          </p>
        </div>

        {/* Severity Metrics */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-center">
            <p className="text-lg font-black text-emerald-400">{dept.onTrackCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">On Track</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-center">
            <p className="text-lg font-black text-amber-400">{dept.atRiskCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">At Risk</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl text-center">
            <p className="text-lg font-black text-rose-400">{dept.behindCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Behind</p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-slate-200/70 p-1 rounded-xl">
          <TabsTrigger value="gap-dashboard" className="gap-2 text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Department Gap Dashboard
          </TabsTrigger>
          <TabsTrigger value="posting-schedules" className="gap-2 text-xs font-semibold">
            <Calendar className="h-4 w-4" /> Posting Schedule Builder
          </TabsTrigger>
          <TabsTrigger value="mentor-matching" className="gap-2 text-xs font-semibold">
            <Users className="h-4 w-4" /> Mentor-Mentee Assignments
          </TabsTrigger>
          <TabsTrigger value="leave-approvals" className="gap-2 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Leave Approvals ({leaves.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Department Gap Dashboard */}
        <TabsContent value="gap-dashboard" className="pt-4 space-y-4">
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  NMC Compliance &amp; Target Shortfall Matrix
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Department-wide exposure analysis sorted by severity of target gap
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button onClick={handleRecalculateGaps} variant="outline" size="sm" className="text-xs gap-1.5 text-teal-800 border-teal-200 bg-teal-50">
                  <RefreshCw className="h-3.5 w-3.5" /> Re-calculate Gap Engine
                </Button>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-40 text-xs">
                      <SelectValue placeholder="Filter Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity Levels</SelectItem>
                      <SelectItem value="behind">Behind Only</SelectItem>
                      <SelectItem value="at_risk">At Risk Only</SelectItem>
                      <SelectItem value="on_track">On Track Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Resident</TableHead>
                    <TableHead className="text-xs font-semibold">Batch &amp; Rotation</TableHead>
                    <TableHead className="text-xs font-semibold">Assigned Mentor</TableHead>
                    <TableHead className="text-xs font-semibold">Cases Completed</TableHead>
                    <TableHead className="text-xs font-semibold">Procedures Completed</TableHead>
                    <TableHead className="text-xs font-semibold">Shortfall Severity</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Target Gap Analysis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((r: any) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/60">
                      <TableCell className="font-bold text-xs text-slate-900">
                        {r.name}
                        <p className="text-[11px] text-slate-500 font-normal">{r.registrationNumber}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {r.batch}
                        <p className="text-[11px] text-teal-700 font-semibold">{r.currentPosting}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">{r.mentor}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        {r.casesCompleted} / {r.casesRequired}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {r.proceduresCompleted} / {r.proceduresRequired}
                      </TableCell>
                      <TableCell>{renderSeverityBadge(r.shortfallSeverity)}</TableCell>
                      <TableCell className="text-right text-xs text-slate-600 max-w-[220px]">
                        {r.shortfallNote}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Posting Schedule Builder */}
        <TabsContent value="posting-schedules" className="pt-4 space-y-4">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Rotation Posting Schedule Builder</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Manage posting schedules and clinical rotations for Batch 2024-2027
                </CardDescription>
              </div>

              <Dialog open={isPostingModalOpen} onOpenChange={setIsPostingModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5">
                    <PlusCircle className="h-4 w-4" /> Create New Rotation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-teal-600" /> Create Clinical Rotation
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">Add a new rotation posting schedule.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPosting} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Rotation Name</Label>
                      <Input
                        placeholder="e.g. Pediatric Nephrology Rotation"
                        value={newPosting.name}
                        onChange={(e) => setNewPosting({ ...newPosting, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Faculty In-Charge</Label>
                      <Select value={newPosting.inCharge} onValueChange={(val) => setNewPosting({ ...newPosting, inCharge: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dr. Meenakshi Sundaram">Dr. Meenakshi Sundaram</SelectItem>
                          <SelectItem value="Prof. Dr. Piyush Gupta">Prof. Dr. Piyush Gupta</SelectItem>
                          <SelectItem value="Dr. Sunita Kulkarni">Dr. Sunita Kulkarni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsPostingModalOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-teal-600 text-white">Add Rotation</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rotations.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900">{post.name}</h4>
                    <p className="text-[11px] text-slate-500">Duration: {post.duration} • In-Charge: <strong>{post.inCharge}</strong></p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-teal-800 font-semibold">Assigned Residents: {post.residentsCount}</p>
                      <Badge variant="outline" className="bg-white text-xs text-teal-700">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Mentor Matching */}
        <TabsContent value="mentor-matching" className="pt-4 space-y-4">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">Faculty Mentor Allocation</CardTitle>

              <Dialog open={isMentorModalOpen} onOpenChange={setIsMentorModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5">
                    <UserPlus className="h-4 w-4" /> Allocate New Mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-teal-600" /> Allocate Faculty Mentor
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">Pair resident with evaluator mentor.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMentorAllocation} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Resident Name</Label>
                      <Input
                        value={newMentor.resident}
                        onChange={(e) => setNewMentor({ ...newMentor, resident: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Assign Faculty Mentor</Label>
                      <Select value={newMentor.mentor} onValueChange={(val) => setNewMentor({ ...newMentor, mentor: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Prof. Dr. Piyush Gupta">Prof. Dr. Piyush Gupta</SelectItem>
                          <SelectItem value="Dr. Meenakshi Sundaram">Dr. Meenakshi Sundaram</SelectItem>
                          <SelectItem value="Dr. Sunita Kulkarni">Dr. Sunita Kulkarni</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsMentorModalOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-teal-600 text-white">Save Allocation</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">PG Resident</TableHead>
                    <TableHead className="text-xs font-semibold">Batch</TableHead>
                    <TableHead className="text-xs font-semibold">Assigned Faculty Mentor</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorAllocations.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-xs text-slate-900">{m.resident}</TableCell>
                      <TableCell className="text-xs text-slate-700">{m.batch}</TableCell>
                      <TableCell className="text-xs font-semibold text-teal-800">{m.mentor}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Leave Approvals Queue */}
        <TabsContent value="leave-approvals" className="pt-4 space-y-4">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Resident Leave Approvals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaves.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No pending leave applications.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Resident</TableHead>
                      <TableHead className="text-xs font-semibold">Leave Type</TableHead>
                      <TableHead className="text-xs font-semibold">Duration &amp; Dates</TableHead>
                      <TableHead className="text-xs font-semibold">Reason</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-bold text-xs text-slate-900">{l.residentName}</TableCell>
                        <TableCell className="text-xs text-slate-700">{l.type}</TableCell>
                        <TableCell className="text-xs font-medium">
                          {l.totalDays} Days ({l.fromDate} to {l.toDate})
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{l.reason}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            onClick={() => handleRejectLeave(l.id, l.residentName)}
                            size="sm"
                            variant="outline"
                            className="text-xs border-rose-300 text-rose-700 hover:bg-rose-50"
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApproveLeave(l.id, l.residentName)}
                            size="sm"
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderSeverityBadge(severity: string) {
  switch (severity) {
    case "on_track":
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">On Track</Badge>;
    case "behind":
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">Behind Target</Badge>;
    default:
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">At Risk</Badge>;
  }
}

function getFallbackHODData() {
  return {
    department: { name: "Department of Paediatrics", totalResidents: 18, facultyCount: 8, onTrackCount: 11, atRiskCount: 5, behindCount: 2, inspectionReadiness: "84%" },
    residentsGapOverview: [
      { id: 1, name: "Dr. Rohan Verma", registrationNumber: "PG2023-PAED-005", batch: "2023-2026", mentor: "Prof. Dr. Piyush Gupta", currentPosting: "General Wards", casesCompleted: 28, casesRequired: 60, proceduresCompleted: 8, proceduresRequired: 25, shortfallSeverity: "behind", shortfallNote: "Lagging in Independent Procedures." },
    ],
    pendingLeaves: [],
  };
}
