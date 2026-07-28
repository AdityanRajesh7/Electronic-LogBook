import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { formatLogbookDate } from "@/lib/logbook-config";

export function PostingsPage() {
  const postings = [
    {
      id: 1,
      name: "Pediatric Intensive Care Unit (PICU)",
      startDate: "2026-07-01",
      endDate: "2026-07-31",
      duration: "31 Days",
      hodOrGuide: "Dr. Radhamani KV",
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
      hodOrGuide: "Dr. Anilkumar A",
      status: "upcoming",
      statusLabel: "Upcoming",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="page-eyebrow">Clinical training schedule</p>
        <h2 className="page-title mt-1">Postings &amp; rotations</h2>
        <p className="mt-2 text-sm text-slate-500">Department schedule with the assigned HOD / Guide.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg">Clinical schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Posting Name</TableHead>
                <TableHead className="text-xs font-semibold">Date range</TableHead>
                <TableHead className="text-xs font-semibold">Duration</TableHead>
                <TableHead className="text-xs font-semibold">HOD / Guide</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postings.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">{p.name}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{formatLogbookDate(p.startDate)} – {formatLogbookDate(p.endDate)}</TableCell>
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
