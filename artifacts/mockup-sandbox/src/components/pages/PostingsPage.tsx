import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

export function PostingsPage() {
  const postings = [
    {
      id: 1,
      name: "Pediatric Intensive Care Unit (PICU)",
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      duration: "31 Days",
      hodOrGuide: "Dr. Meenakshi Sundaram",
      status: "active",
      statusLabel: "Current Rotation",
    },
    {
      id: 2,
      name: "Neonatal Intensive Care Unit (NICU)",
      startDate: "2026-05-01",
      endDate: "2026-06-30",
      duration: "61 Days",
      hodOrGuide: "Prof. Dr. Mohammad MTP",
      status: "completed",
      statusLabel: "Completed",
    },
    {
      id: 3,
      name: "Paediatric Emergency & Trauma",
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      duration: "31 Days",
      hodOrGuide: "Dr. Sunita Kulkarni",
      status: "upcoming",
      statusLabel: "Upcoming",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-teal-600" /> Rotation Postings Schedule
        </h2>
        <p className="text-xs text-slate-500">
          Clinical postings with assigned HOD / Guide
        </p>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Clinical Postings Schedule (Batch 2024-2027)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Posting Name</TableHead>
                <TableHead className="text-xs font-semibold">Start &amp; End Dates</TableHead>
                <TableHead className="text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-xs font-semibold">HOD / Guide</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postings.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">{p.name}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{p.startDate} to {p.endDate}</TableCell>
                  <TableCell className="py-3 text-xs font-medium text-slate-800">{p.duration}</TableCell>
                  <TableCell className="py-3 text-xs text-teal-800 font-semibold">{p.hodOrGuide}</TableCell>
                  <TableCell className="py-3">
                    {p.status === "active" && <Badge className="bg-emerald-600 text-white text-[10px]">Current</Badge>}
                    {p.status === "completed" && <Badge className="bg-slate-100 text-slate-700 text-[10px]">Completed</Badge>}
                    {p.status === "upcoming" && <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">Upcoming</Badge>}
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
