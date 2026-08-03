import * as React from "react";
import { ClipboardCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLogbookDate } from "@/lib/logbook-config";
import { apiGet } from "@/lib/apiClient";
import { getCurrentUser } from "@/lib/session";
import { toast } from "sonner";

type Assessment = {
  number: number;
  examName: string;
  type: string;
  date: string;
  marks: number;
  maximum: number;
  assessorId: number;
  assessorName: string;
};

export function AssessmentsPage() {
  const [assessments, setAssessments] = React.useState<Assessment[]>([]);
  const user = React.useMemo(() => getCurrentUser(), []);
  const [loading, setLoading] = React.useState(false);

  const fetchAssessments = React.useCallback(async () => {
    if (!user?.studentProfileId) return;
    setLoading(true);
    try {
      const data = await apiGet(`/api/students/${user.studentProfileId}/assessments`);
      setAssessments(data || []);
    } catch (e) {
      toast.error("Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  }, [user?.studentProfileId]);

  React.useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="page-eyebrow flex items-center gap-2">Training progress</p>
          <h2 className="page-title mt-1">Assessments</h2>
          <p className="mt-2 text-sm text-slate-500">Your quarterly and annual assessment results, entered by your faculty assessor.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Assessment Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClipboardCheck className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No assessments recorded</h3>
              <p className="mt-2 text-sm text-slate-500">Assessment scores will appear here once your professor enters them.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Assessed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((item) => (
                  <TableRow key={item.number}>
                    <TableCell className="font-medium text-slate-900">{formatLogbookDate(item.date)}</TableCell>
                    <TableCell>{item.examName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{item.marks} / {item.maximum}</TableCell>
                    <TableCell>{item.assessorName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
