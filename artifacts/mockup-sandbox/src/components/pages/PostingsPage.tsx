import * as React from "react";
import { CalendarDays, PlusCircle } from "lucide-react";
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
import {
  formatLogbookDate,
  POSTING_CHIEFS,
  POSTING_OPTIONS,
  todayForInput,
} from "@/lib/logbook-config";

type PostingName = (typeof POSTING_OPTIONS)[number];

type Posting = {
  number: number;
  name: PostingName;
  startDate: string;
  endDate: string;
  chief: string;
  status: "completed" | "submitted";
};

export function PostingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow flex items-center gap-2">
            Student-managed clinical training
            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-amber-100 text-amber-800 border-0 hover:bg-amber-100 rounded-sm">Demo data — not yet persisted</Badge>
          </p>
          <h2 className="page-title mt-1 text-slate-400">Postings &amp; rotations</h2>
          <p className="mt-2 text-sm text-slate-400 italic">
            Posting tracking is coming soon.
          </p>
        </div>
        <Button disabled className="opacity-50 cursor-not-allowed" title="Posting tracking coming soon">
          <PlusCircle className="h-4 w-4 mr-2" /> Add posting / rotation
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
        <CalendarDays className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Postings Module Not Available</h3>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          The ability to track individual ward postings and rotations is not yet implemented. This feature will be available in a future update once the backend schema is finalized.
        </p>
      </div>
    </div>
  );
}


