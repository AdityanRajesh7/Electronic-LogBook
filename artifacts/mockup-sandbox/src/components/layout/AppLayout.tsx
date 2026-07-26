import * as React from "react";
import { useLocation, Link } from "wouter";
import { Toaster } from "@/components/ui/sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Stethoscope,
  GraduationCap,
  CalendarDays,
  Clock,
  Award,
  ChevronDown,
  BookOpenCheck,
  Bell,
  ShieldCheck,
  UserCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Users,
  UserPlus,
  BookOpen,
} from "lucide-react";

export type RoleType = "Student" | "Professor" | "HOD" | "Dean";

interface AppLayoutProps {
  children: React.ReactNode;
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
}

export function AppLayout({ children, activeRole, setActiveRole }: AppLayoutProps) {
  const [location, setLocation] = useLocation();

  const getNavigationForRole = (role: RoleType) => {
    switch (role) {
      case "Professor":
        return [
          { title: "Evaluation Queue", icon: FileText, href: "/", badge: "4 Pending", badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300" },
          { title: "Assigned Mentees", icon: UserCheck, href: "/mentees" },
          { title: "Quarterly Appraisal", icon: Award, href: "/appraisals" },
        ];
      case "HOD":
        return [
          { title: "Department Gap View", icon: AlertTriangle, href: "/", badge: "NMC Live", badgeColor: "bg-rose-500/15 text-rose-700 border-rose-300" },
          { title: "Posting Schedule Builder", icon: CalendarDays, href: "/postings-builder" },
          { title: "Mentor Allocation", icon: Users, href: "/mentor-matching" },
          { title: "Leave Approvals", icon: CheckCircle2, href: "/leave-approvals", badge: "2 New", badgeColor: "bg-teal-500/15 text-teal-700 border-teal-300" },
        ];
      case "Dean":
        return [
          { title: "Compliance Heatmap", icon: ShieldCheck, href: "/", badge: "91.2%", badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-300" },
          { title: "User Provisioning", icon: UserPlus, href: "/user-provisioning" },
          { title: "Requirement Master Data", icon: BookOpen, href: "/nmc-master" },
        ];
      default: // Student
        return [
          { title: "Dashboard", icon: LayoutDashboard, href: "/", badge: "NMC Live", badgeColor: "bg-emerald-500/15 text-emerald-700 border-emerald-300" },
          { title: "Case Logs", icon: FileText, href: "/cases", badge: "42/50" },
          { title: "Procedure Logs", icon: Stethoscope, href: "/procedures", badge: "At Risk", badgeColor: "bg-amber-500/15 text-amber-700 border-amber-300" },
          { title: "Academic Activities", icon: GraduationCap, href: "/academics" },
          { title: "Postings & Rotations", icon: CalendarDays, href: "/postings", badge: "PICU" },
          { title: "Attendance & Leave", icon: Clock, href: "/attendance" },
          { title: "Certifications & Thesis", icon: Award, href: "/milestones" },
        ];
    }
  };

  const navigationItems = getNavigationForRole(activeRole);

  const handleRoleChange = (newRole: RoleType) => {
    setActiveRole(newRole);
    setLocation("/");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/20">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                  E-Logbook
                </span>
                <span className="text-xs text-teal-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 inline" /> NMC PGMER-2023
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 space-y-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1 flex items-center justify-between">
                <span>{activeRole} Portal</span>
                <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-800 border-teal-200">
                  {activeRole}
                </Badge>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                            isActive
                              ? "bg-teal-50 text-teal-900 font-semibold shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <Icon className={`h-4 w-4 ${isActive ? "text-teal-600" : "text-slate-500"}`} />
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0.5 font-medium rounded-full ${
                                  item.badgeColor || "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-100 transition-colors border border-slate-200/80 bg-slate-50/50">
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={getAvatarForRole(activeRole)} />
                    <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold">
                      {getInitialsForRole(activeRole)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-semibold text-slate-900">{getNameForRole(activeRole)}</p>
                    <p className="truncate text-[11px] text-teal-700 font-medium">{activeRole} Portal</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-white border border-slate-200 shadow-lg">
                <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Switch Role Portal</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleRoleChange("Student")}
                  className={`flex items-center gap-2 cursor-pointer text-xs ${activeRole === "Student" ? "font-bold text-teal-700 bg-teal-50" : ""}`}
                >
                  <UserCheck className="h-3.5 w-3.5 text-teal-600" /> PG Student Portal (Dr. Aarav)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRoleChange("Professor")}
                  className={`flex items-center gap-2 cursor-pointer text-xs ${activeRole === "Professor" ? "font-bold text-teal-700 bg-teal-50" : ""}`}
                >
                  <Stethoscope className="h-3.5 w-3.5 text-slate-600" /> Professor Review Queue (Dr. Piyush)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRoleChange("HOD")}
                  className={`flex items-center gap-2 cursor-pointer text-xs ${activeRole === "HOD" ? "font-bold text-teal-700 bg-teal-50" : ""}`}
                >
                  <Building className="h-3.5 w-3.5 text-slate-600" /> HOD Department Portal (Paediatrics)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleRoleChange("Dean")}
                  className={`flex items-center gap-2 cursor-pointer text-xs ${activeRole === "Dean" ? "font-bold text-teal-700 bg-teal-50" : ""}`}
                >
                  <Award className="h-3.5 w-3.5 text-slate-600" /> Dean / Executive Compliance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur px-6 shadow-2xs">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <h1 className="text-sm font-semibold text-slate-900">
                  Department of Paediatrics • {activeRole} View
                </h1>
                <p className="text-xs text-slate-500">NMC PGMER-2023 Residency Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Switch Quick Pills */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs border border-slate-200">
                {(["Student", "Professor", "HOD", "Dean"] as RoleType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      activeRole === r ? "bg-white text-teal-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </SidebarInset>
        <Toaster position="top-right" richColors />
      </div>
    </SidebarProvider>
  );
}

function getNameForRole(role: RoleType) {
  switch (role) {
    case "Professor": return "Prof. Dr. Piyush Gupta";
    case "HOD": return "Dr. Meenakshi Sundaram (HOD)";
    case "Dean": return "Dean Dr. R. K. Sharma";
    default: return "Dr. Aarav Sharma";
  }
}

function getInitialsForRole(role: RoleType) {
  switch (role) {
    case "Professor": return "PG";
    case "HOD": return "MS";
    case "Dean": return "RS";
    default: return "AS";
  }
}

function getAvatarForRole(role: RoleType) {
  switch (role) {
    case "Professor": return "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80";
    case "HOD": return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";
    case "Dean": return "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80";
    default: return "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";
  }
}
