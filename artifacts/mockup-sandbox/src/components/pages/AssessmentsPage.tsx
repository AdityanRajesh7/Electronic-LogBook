import * as React from "react";
import { ClipboardCheck, PlusCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate, todayForInput } from "@/lib/logbook-config";

type Assessment = {
  number: number;
  type: "Quarterly" | "Annual";
  date: string;
  marks: number;
  maximum: number;
  assessor: string;
  remarks: string;
};

export function AssessmentsPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow flex items-center gap-2">
            Training progress
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-amber-100 text-amber-800 border-0 hover:bg-amber-100 rounded-sm">Demo data — not yet persisted</Badge>
          </p>
          <h2 className="page-title mt-1 text-slate-400">Assessments</h2>
          <p className="mt-2 text-sm text-slate-400 italic">Assessment tracking is coming soon.</p>
        </div>
        <Button disabled className="opacity-50 cursor-not-allowed" title="Assessment tracking coming soon">
          <PlusCircle className="h-4 w-4 mr-2" /> Add assessment
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <ClipboardCheck className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Assessment Module Not Available</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The ability to log and track quarterly/annual assessments is not yet implemented. This page will be available in a future update once the backend schema is finalized.
        </p>
      </div>
    </div>
  );
}


