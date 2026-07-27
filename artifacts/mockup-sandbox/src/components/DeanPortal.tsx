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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Award,
  ShieldCheck,
  UserPlus,
  FileSpreadsheet,
  PlusCircle,
  BookOpen,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export function DeanPortal({ activeTab }: { activeTab?: string }) {
  const [location, setLocation] = useLocation();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = React.useState(false);

  // Dynamic provisioned users list
  const [usersList, setUsersList] = React.useState([
    { name: "Dr. Smita Deshmukh", email: "smita@medical.edu.in", role: "Professor", dept: "Paediatrics", status: "Active" },
    { name: "Dr. Vikram Sethi", email: "vikram@medical.edu.in", role: "Student", dept: "General Surgery", status: "Active" },
    { name: "Dr. Meenakshi Sundaram", email: "meenakshi@medical.edu.in", role: "HOD", dept: "Paediatrics", status: "Active" },
  ]);

  // Form state for user provisioning
  const [userForm, setUserForm] = React.useState({
    fullName: "",
    email: "",
    role: "student",
    department: "Paediatrics",
  });

  // Dynamic MCI logbook requirements master seed
  const [requirementsMaster, setRequirementsMaster] = React.useState([
    { specialty: "MD Paediatrics", category: "Case Presentations", itemName: "Clinical Cases Presented", count: 50 },
    { specialty: "MD Paediatrics", category: "Procedures", itemName: "Independent Pediatric Procedures", count: 15 },
    { specialty: "MD Paediatrics", category: "Academic", itemName: "Journal Club Presentations", count: 8 },
    { specialty: "MS General Surgery", category: "Procedures", itemName: "Independent Major Surgeries", count: 40 },
  ]);

  const [reqForm, setReqForm] = React.useState({
    specialty: "MD Paediatrics",
    category: "Procedures",
    itemName: "",
    count: 20,
  });

  const getTabFromPath = () => {
    if (activeTab) return activeTab;
    if (location === "/user-provisioning") return "user-provisioning";
    if (location === "/mci-guidelines" || location === "/nmc-master") return "mci-master";
    return "heatmap";
  };

  const currentTab = getTabFromPath();

  const handleTabChange = (val: string) => {
    if (val === "user-provisioning") setLocation("/user-provisioning");
    else if (val === "mci-master") setLocation("/mci-guidelines");
    else setLocation("/");
  };

  React.useEffect(() => {
    async function fetchDeanData() {
      try {
        const res = await fetch("/api/dean/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(getFallbackDeanData());
        }
      } catch (e) {
        setData(getFallbackDeanData());
      } finally {
        setLoading(false);
      }
    }
    fetchDeanData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Loading Institution Compliance Data...</p>
      </div>
    );
  }

  const inst = data?.institution || {};
  const heatmap = data?.departmentComplianceHeatmap || [];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email) return;

    const newUser = {
      name: userForm.fullName,
      email: userForm.email,
      role: userForm.role === "student" ? "Student" : userForm.role === "professor" ? "Professor" : "HOD",
      dept: userForm.department,
      status: "Active",
    };

    setUsersList([newUser, ...usersList]);
    toast.success(`User Profile Created!`, {
      description: `${newUser.name} (${newUser.role}) provisioned in ${newUser.dept}.`,
    });

    setUserForm({ fullName: "", email: "", role: "student", department: "Paediatrics" });
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.itemName) return;

    setRequirementsMaster([...requirementsMaster, { specialty: reqForm.specialty, category: reqForm.category, itemName: reqForm.itemName, count: reqForm.count }]);
    toast.success(`MCI Logbook Target Rule Saved!`, {
      description: `${reqForm.itemName}: Target ${reqForm.count} for ${reqForm.specialty}.`,
    });
    setReqForm({ specialty: "MD Paediatrics", category: "Procedures", itemName: "", count: 20 });
    setIsRequirementModalOpen(false);
  };

  const handleExportReport = () => {
    toast.success("MCI Logbook Compliance Report Exported!", {
      description: "Generated official institution audit summary (PDF/CSV format).",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Dean Overview */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs font-semibold mb-2">
            Dean &amp; Executive Compliance Administration
          </Badge>
          <h2 className="text-2xl font-black">{inst.name}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Total Departments: <strong>{inst.totalDepartments}</strong> • Total PG Residents: <strong>{inst.totalPGResidents}</strong> • Faculty: <strong>{inst.totalFaculty}</strong>
          </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/30 px-5 py-3 rounded-xl text-center">
          <p className="text-2xl font-black text-emerald-400">{inst.overallMCICompliance}</p>
          <p className="text-[11px] text-slate-300 font-semibold uppercase">MCI Logbook Readiness</p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="bg-slate-200/70 p-1 rounded-xl">
          <TabsTrigger value="heatmap" className="gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> MCI Compliance Heatmap
          </TabsTrigger>
          <TabsTrigger value="user-provisioning" className="gap-2 text-xs font-semibold">
            <UserPlus className="h-4 w-4" /> Profile &amp; User Provisioning ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="mci-master" className="gap-2 text-xs font-semibold">
            <BookOpen className="h-4 w-4" /> Requirement Master Seed Data ({requirementsMaster.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Institution Compliance Heatmap */}
        <TabsContent value="heatmap" className="pt-4 space-y-4">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Department Compliance Matrix</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Logbook readiness score per department against MCI guidance
                </CardDescription>
              </div>
              <Button onClick={handleExportReport} size="sm" variant="outline" className="text-xs text-teal-700 border-teal-300 gap-1 font-semibold">
                <FileSpreadsheet className="h-4 w-4" /> Export MCI Compliance Report
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Department</TableHead>
                    <TableHead className="text-xs font-semibold">PG Residents</TableHead>
                    <TableHead className="text-xs font-semibold">Compliance Rate</TableHead>
                    <TableHead className="text-xs font-semibold">At-Risk Count</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Last Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatmap.map((d: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-xs text-slate-900">{d.name}</TableCell>
                      <TableCell className="text-xs text-slate-700">{d.totalResidents} Residents</TableCell>
                      <TableCell className="text-xs w-48">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold">{d.complianceRate}%</span>
                        </div>
                        <Progress value={d.complianceRate} className="h-2" />
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-amber-700">{d.atRiskResidents} Residents</TableCell>
                      <TableCell>{renderHeatmapBadge(d.status)}</TableCell>
                      <TableCell className="text-right text-xs text-slate-500">{d.lastAudited}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: User Provisioning */}
        <TabsContent value="user-provisioning" className="pt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Provision New User Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="e.g. Dr. Smita Deshmukh"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="smita@medical.edu.in"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Assign Role</Label>
                      <Select value={userForm.role} onValueChange={(val) => setUserForm({ ...userForm, role: val })}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">PG Student</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                          <SelectItem value="hod">HOD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={userForm.department} onValueChange={(val) => setUserForm({ ...userForm, department: val })}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paediatrics">Paediatrics</SelectItem>
                          <SelectItem value="General Surgery">Surgery</SelectItem>
                          <SelectItem value="Medicine">Medicine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold">
                    Create User Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Provisioned Institution Accounts</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">User Name</TableHead>
                      <TableHead className="text-xs font-semibold">Email</TableHead>
                      <TableHead className="text-xs font-semibold">Role</TableHead>
                      <TableHead className="text-xs font-semibold">Department</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((u, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-bold text-xs text-slate-900">{u.name}</TableCell>
                        <TableCell className="text-xs text-slate-600">{u.email}</TableCell>
                        <TableCell className="text-xs text-teal-800 font-semibold">{u.role}</TableCell>
                        <TableCell className="text-xs text-slate-700">{u.dept}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">{u.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: MCI logbook requirement master */}
        <TabsContent value="mci-master" className="pt-4 space-y-4">
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">MCI Logbook Preparation Requirements</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Specialty-specific minimum target baseline rules for gap analytics engine
                </CardDescription>
              </div>

              <Dialog open={isRequirementModalOpen} onOpenChange={setIsRequirementModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5">
                    <PlusCircle className="h-4 w-4" /> Add Target Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-teal-600" /> Add MCI Requirement Target Rule
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">Define minimum target for specialty curriculum.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddRequirement} className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Specialty</Label>
                      <Select value={reqForm.specialty} onValueChange={(val) => setReqForm({ ...reqForm, specialty: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MD Paediatrics">MD Paediatrics</SelectItem>
                          <SelectItem value="MS General Surgery">MS General Surgery</SelectItem>
                          <SelectItem value="MD General Medicine">MD General Medicine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rule Description / Item Name</Label>
                      <Input
                        placeholder="e.g. Lumbar Puncture Target Count"
                        value={reqForm.itemName}
                        onChange={(e) => setReqForm({ ...reqForm, itemName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Required Count</Label>
                      <Input
                        type="number"
                        value={reqForm.count}
                        onChange={(e) => setReqForm({ ...reqForm, count: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsRequirementModalOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-teal-600 text-white">Save Requirement Rule</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Specialty</TableHead>
                    <TableHead className="text-xs font-semibold">Category</TableHead>
                    <TableHead className="text-xs font-semibold">Requirement Rule Item</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Min Target Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requirementsMaster.map((r, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-xs text-slate-900">{r.specialty}</TableCell>
                      <TableCell className="text-xs text-teal-800 font-semibold">{r.category}</TableCell>
                      <TableCell className="text-xs text-slate-700">{r.itemName}</TableCell>
                      <TableCell className="text-right text-xs font-extrabold text-slate-900">{r.count}</TableCell>
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

function renderHeatmapBadge(status: string) {
  switch (status) {
    case "on_track":
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">High Compliance</Badge>;
    case "behind":
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">Inspection Risk</Badge>;
    default:
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Moderate Risk</Badge>;
  }
}

function getFallbackDeanData() {
  return {
    institution: { name: "Grant Government Medical College, Mumbai", totalDepartments: 14, totalPGResidents: 240, totalFaculty: 85, overallMCICompliance: "91.2%" },
    departmentComplianceHeatmap: [
      { name: "Paediatrics", totalResidents: 18, complianceRate: 84, status: "at_risk", atRiskResidents: 7, lastAudited: "2026-07-20" },
      { name: "General Surgery", totalResidents: 32, complianceRate: 94, status: "on_track", atRiskResidents: 2, lastAudited: "2026-07-22" },
    ],
  };
}
