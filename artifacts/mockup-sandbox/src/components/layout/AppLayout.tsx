import * as React from "react";
import { Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
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
import { apiGet } from "@/lib/apiClient";
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
  LayoutDashboard,
  LogOut,
  Printer,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
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

  React.useEffect(() => {
    if (activeRole !== "Student") return;
    const user = getCurrentUser();
    if (!user?.studentProfileId) return;

    apiGet(`/api/students/${user.studentProfileId}/dashboard`)
      .then(data => setDashboardData(data))
      .catch(err => console.error("Failed to load nav badges", err))
      .finally(() => setLoadingBadges(false));
  }, [activeRole]);

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

  return (
    <SidebarProvider defaultOpen>
      <div className="medical-grid h-screen w-full overflow-hidden p-0 text-slate-900 md:p-3 lg:p-4">
        <div className="glass-panel mx-auto flex h-[100dvh] md:h-[calc(100vh-24px)] lg:h-[calc(100vh-32px)] w-full max-w-[1600px] overflow-hidden rounded-none border-white/70 md:rounded-[30px]">
          <Sidebar className="print-hidden border-r border-teal-100/80 bg-white/56">
            <SidebarHeader className="border-b border-teal-100/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20">
                  <BookOpenCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold leading-tight text-slate-900">Pediatrics E-Logbook</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                    <ShieldCheck className="h-3 w-3" /> MCI-aligned training record
                  </p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarGroup>
                <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-900/45">
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
                            className={`h-11 w-full rounded-xl px-3 transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-teal-600 to-cyan-600 font-semibold text-white shadow-md shadow-teal-700/15 hover:text-white"
                                : "text-slate-600 hover:bg-white/80 hover:text-teal-900"
                            }`}
                          >
                            <Link href={item.href} className="flex w-full items-center gap-3">
                              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-teal-600"}`} />
                              <span className="flex-1 truncate text-[13px]">{item.title}</span>
                              
                              {item.badgeLoading ? (
                                <Skeleton className="h-4 w-12 rounded-full bg-teal-100/50" />
                              ) : item.badge ? (
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-1.5 py-0 text-[9px] ${
                                    isActive
                                      ? "border-white/25 bg-white/15 text-white"
                                      : item.badgeColor || "border-teal-100 bg-teal-50 text-teal-700"
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

            <SidebarFooter className="sticky bottom-0 z-20 mt-auto border-t border-teal-100/80 bg-white/95 p-3 backdrop-blur-md">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-white/80 bg-white/72 p-2.5 text-left shadow-sm transition hover:bg-white">
                    <Avatar className="h-10 w-10 border border-teal-100">
                      <AvatarFallback className="bg-gradient-to-br from-teal-100 to-cyan-100 text-xs font-bold text-teal-800">
                        {getInitialsForRole(activeRole)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{getNameForRole(activeRole)}</p>
                      <p className="truncate text-[10px] font-semibold text-teal-700">{activeRole} portal</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-teal-700/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl border-teal-100 bg-white/95 p-1 shadow-xl">
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
            <header className="print-hidden sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/70 bg-white/58 px-4 backdrop-blur-xl md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="rounded-xl text-teal-800 hover:bg-white" />
                <div className="hidden h-7 w-px bg-teal-100 sm:block" />
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
                    className="hidden border-white bg-white/70 text-teal-800 sm:inline-flex"
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print PDF
                  </Button>
                )}
                <button onClick={() => toast.info("No new notifications")} className="relative rounded-xl border border-white/80 bg-white/65 p-2 text-teal-800 shadow-sm transition hover:bg-white">
                  <Bell className="h-4 w-4" />
                  <span className="hidden absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
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
