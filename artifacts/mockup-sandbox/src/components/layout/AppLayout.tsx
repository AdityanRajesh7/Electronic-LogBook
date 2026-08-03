import * as React from "react";
import { Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet, apiPost } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpenCheck,
  Building,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Printer,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { formatLogbookDate } from "@/lib/logbook-config";

export type RoleType = "Student" | "Professor" | "HOD";

interface AppLayoutProps {
  children: React.ReactNode;
  activeRole: RoleType;
  onSignOut?: () => void;
}

type NavigationItem = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  badgeColor?: string;
  badgeLoading?: boolean;
};

function navigationForRole(role: RoleType, dashboardData?: any, loadingBadges?: boolean): NavigationItem[] {
  if (role === "Professor") {
    return [
      { title: "Evaluation Queue", icon: FileText, href: "/" },
      { title: "All Students", icon: UserCheck, href: "/mentees" },
      { title: "Assessments", icon: ClipboardCheck, href: "/appraisals" },
    ];
  }

  if (role === "HOD") {
    return [
      { title: "Department Overview", icon: AlertTriangle, href: "/" },
      { title: "Student Registrations", icon: UserPlus, href: "/student-access" },
      { title: "Leave Approvals", icon: CheckCircle2, href: "/leave-approvals" },
    ];
  }

  const getCount = (id: string) => {
    if (!dashboardData) return undefined;
    const cat = dashboardData.categories?.find((c: any) => c.id === id);
    if (!cat) return undefined;
    return `${cat.logged}/${cat.required}`;
  };

  return [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Postings & Rotations", icon: CalendarDays, href: "/postings" },
    { title: "Case Logs", icon: FileText, href: "/cases", badge: getCount("cases"), badgeLoading: loadingBadges },
    { title: "Procedure Logs", icon: Stethoscope, href: "/procedures", badge: getCount("procedures"), badgeLoading: loadingBadges },
    { title: "Academic Activities", icon: GraduationCap, href: "/academics" },
    { title: "Assessments", icon: ClipboardCheck, href: "/assessments" },
    { title: "Thesis & Certifications", icon: Award, href: "/milestones" },
    { title: "Leave Records", icon: CalendarDays, href: "/attendance" },
  ];
}

export function AppLayout({
  children,
  activeRole,
  onSignOut,
}: AppLayoutProps) {
  const [location] = useLocation();
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [loadingBadges, setLoadingBadges] = React.useState(activeRole === "Student");

  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [cpForm, setCpForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Fix: Get actual user from session for the sidebar profile
  const currentUser = getCurrentUser();
  const displayName = dashboardData?.student?.name || currentUser?.name || getNameForRole(activeRole);
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : getInitialsForRole(activeRole);

  React.useEffect(() => {
    if (activeRole !== "Student") return;
    if (!currentUser?.studentProfileId) return;

    apiGet(`/api/students/${currentUser.studentProfileId}/dashboard`)
      .then(data => setDashboardData(data))
      .catch(err => console.error("Failed to load nav badges", err))
      .finally(() => setLoadingBadges(false));
  }, [activeRole, currentUser?.studentProfileId]);

  const navigationItems = navigationForRole(activeRole, dashboardData, loadingBadges);

  const printCurrentView = () => {
    const label = activeRole === "Student" ? "DRAFT" : "OFFICIAL COPY";
    document.body.dataset.printLabel = `${label} • ${formatLogbookDate(new Date())}`;
    const clearLabel = () => {
      delete document.body.dataset.printLabel;
      window.removeEventListener("afterprint", clearLabel);
    };
    window.addEventListener("afterprint", clearLabel);
    window.print();
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpForm.newPassword !== cpForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await apiPost("/api/auth/change-password", { 
        currentPassword: cpForm.currentPassword, 
        newPassword: cpForm.newPassword 
      });
      toast.success("Password changed successfully");
      setIsChangePasswordOpen(false);
      setCpForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="medical-grid h-screen w-full overflow-hidden p-0 text-slate-900 md:p-3 lg:p-4">
        <div className="glass-panel mx-auto flex h-[100dvh] w-full max-w-[1600px] overflow-hidden rounded-none border-white/70 md:h-[calc(100vh-24px)] md:rounded-[30px] lg:h-[calc(100vh-32px)]">
          <Sidebar collapsible="icon" className="print-hidden border-r border-white/75 bg-white/72 shadow-[0_24px_80px_rgba(124,58,237,0.08)] backdrop-blur-xl">
            <SidebarHeader className="border-b border-purple-100/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e1b3ff] via-[#dbb0f6] to-[#e8c7fd] text-purple-950 shadow-[0_16px_34px_rgba(124,58,237,0.18)]">
                  <BookOpenCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold leading-tight text-slate-900">Pediatrics E-Logbook</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-purple-700">
                    <ShieldCheck className="h-3 w-3" /> MCI-aligned training record
                  </p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-900/45">
                  {activeRole} workspace
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {navigationItems.map((item) => {
                      const isActive =
                        location === item.href ||
                        (item.href !== "/" && location.startsWith(item.href));
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={`h-11 w-full rounded-xl px-3 transition-all duration-200 ${
                              isActive
                                ? "border border-white/65 bg-gradient-to-r from-[#e1b3ff] to-[#dbb0f6] font-semibold text-purple-950 shadow-[0_16px_36px_rgba(124,58,237,0.18)] hover:text-purple-950"
                                : "text-slate-600 hover:border hover:border-purple-100 hover:bg-purple-50/80 hover:text-purple-900"
                            }`}
                          >
                            <Link href={item.href} className="flex w-full items-center gap-3">
                              <Icon className={`h-4 w-4 ${isActive ? "text-purple-950" : "text-purple-600"}`} />
                              <span className="flex-1 truncate text-[13px]">{item.title}</span>
                              
                              {item.badgeLoading ? (
                                <Skeleton className="h-4 w-12 rounded-full bg-teal-100/50" />
                              ) : item.badge ? (
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-1.5 py-0 text-[9px] ${
                                    isActive
                                      ? "border-white/25 bg-white/20 text-purple-950"
                                      : item.badgeColor || "border-purple-100 bg-purple-50 text-purple-700"
                                  }`}
                                >
                                  {item.badge}
                                </Badge>
                              ) : null}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="sticky bottom-0 z-20 mt-auto border-t border-purple-100/70 bg-white/92 p-3 backdrop-blur-md">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-purple-100/70 bg-white/80 p-2.5 text-left shadow-[0_14px_30px_rgba(124,58,237,0.05)] transition hover:-translate-y-0.5 hover:bg-white">
                    <Avatar className="h-10 w-10 border border-purple-100">
                      <AvatarFallback className="bg-gradient-to-br from-[#ecd0ff] to-[#e1b3ff] text-xs font-bold text-purple-900">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{displayName}</p>
                      <p className="truncate text-[10px] font-semibold text-purple-700">{activeRole} portal</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-purple-700/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl border-purple-100/70 bg-white/92 p-1 shadow-[0_24px_60px_rgba(124,58,237,0.10)] backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)} className="cursor-pointer rounded-xl text-xs">
                    <KeyRound className="mr-2 h-4 w-4" /> Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onSignOut && (
                    <DropdownMenuItem onClick={onSignOut} className="cursor-pointer rounded-xl text-xs text-rose-700">
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

          <SidebarInset className="flex min-w-0 flex-1 flex-col bg-transparent overflow-y-auto">
            <header className="print-hidden sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/70 bg-white/68 px-4 backdrop-blur-xl md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="rounded-xl text-teal-800 hover:bg-white" />
                <div className="hidden h-7 w-px bg-purple-100 sm:block" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold text-slate-900">
                    Department of Pediatrics
                  </p>
                  <p className="truncate text-[11px] font-medium text-slate-500">
                    Postgraduate training • {activeRole} view
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeRole === "Student" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/print', '_blank')}
                    title="Print the complete consolidated record."
                    className="hidden border-purple-100/70 bg-white/80 text-purple-800 shadow-[0_12px_24px_rgba(124,58,237,0.05)] sm:inline-flex"
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print PDF
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative rounded-xl border border-purple-100/70 bg-white/76 p-2 text-purple-800 shadow-[0_12px_24px_rgba(124,58,237,0.05)] transition hover:-translate-y-0.5 hover:bg-white">
                      <Bell className="h-4 w-4" />
                      <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-2xl border-purple-100/70 bg-white/92 p-2 shadow-[0_24px_60px_rgba(124,58,237,0.10)] backdrop-blur-xl">
                    <DropdownMenuLabel className="px-3 pt-2">Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-xl px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-900">3 procedures due this week</span>
                        <span className="text-[11px] text-slate-500">Keep the logbook moving to stay on track.</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-900">Professor remarks pending</span>
                        <span className="text-[11px] text-slate-500">Recent entries are waiting for verification.</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-3 py-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-slate-900">Next milestone due in 18 days</span>
                        <span className="text-[11px] text-slate-500">Thesis planning and leave review are both active.</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="mx-auto w-full max-w-[1380px] flex-1 p-4 md:p-6 lg:p-8">
              <div className="print-only mb-6 border-b border-slate-300 pb-4">
                <p className="page-eyebrow">Department of Pediatrics</p>
                <h1 className="mt-1 text-2xl font-bold">Postgraduate Electronic Logbook</h1>
              </div>
              {children}
            </main>
          </SidebarInset>
          <Toaster position="top-right" richColors />

          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogContent className="sm:max-w-md rounded-[20px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>Update your account password securely.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={cpForm.currentPassword} onChange={e => setCpForm({...cpForm, currentPassword: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" minLength={8} value={cpForm.newPassword} onChange={e => setCpForm({...cpForm, newPassword: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" minLength={8} value={cpForm.confirmPassword} onChange={e => setCpForm({...cpForm, confirmPassword: e.target.value})} required />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={changingPassword}>{changingPassword ? "Saving..." : "Change Password"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SidebarProvider>
  );
}

function getNameForRole(role: RoleType) {
  if (role === "Professor") return "Dr. Radhamani K V";
  if (role === "HOD") return "Dr. Mohammed M T P";
  return "Aravind P";
}

function getInitialsForRole(role: RoleType) {
  if (role === "Professor") return "RK";
  if (role === "HOD") return "MM";
  return "AP";
}
