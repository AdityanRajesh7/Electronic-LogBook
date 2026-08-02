import * as React from "react";
import { getCurrentUser } from "@/lib/session";
import { apiGet } from "@/lib/apiClient";
import { formatLogbookDate } from "@/lib/logbook-config";
import { Printer } from "lucide-react";

export function PrintableLogbook() {
  const user = getCurrentUser();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.studentProfileId) return;

    const fetchAll = async () => {
      try {
        const id = user.studentProfileId;
        const [cases, procs, academics, postings, leaves, assessments] = await Promise.all([
          apiGet(`/api/students/${id}/logs`).catch(() => ({ caseLogs: [] })),
          apiGet(`/api/students/${id}/procedures`).catch(() => []),
          apiGet(`/api/students/${id}/academics`).catch(() => []),
          apiGet(`/api/students/${id}/postings`).catch(() => ({ data: [] })),
          apiGet(`/api/students/${id}/leave-records`).catch(() => []),
          apiGet(`/api/students/${id}/assessments`).catch(() => [])
        ]);

        setData({
          cases: cases.caseLogs || [],
          procs: procs || [],
          academics: academics || [],
          postings: postings.data || [],
          leaves: leaves || [],
          assessments: assessments || []
        });
      } catch (err) {
        console.error("Failed to load consolidated print data", err);
      } finally {
        setLoading(false);
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    };
    
    fetchAll();
  }, [user]);

  if (loading) return <div className="p-12 text-center text-slate-500">Preparing consolidated PDF...</div>;

  return (
    <div className="bg-white p-8 font-serif text-black max-w-[1000px] mx-auto">
      <div className="mb-12 border-b-2 border-black pb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Department of Pediatrics</h1>
        <h2 className="mt-2 text-xl">Resident Logbook - Complete Record</h2>
        <p className="mt-4 text-sm">Resident: <span className="font-bold">{user?.name}</span> | Batch: 2024</p>
      </div>

      <Section title="1. Postings & Rotations">
        {data.postings.length === 0 ? <p>No postings recorded.</p> : (
          <table className="w-full text-left border-collapse">
            <thead><tr className="border-b border-black"><th className="py-2">Ward/Unit</th><th>Start Date</th><th>End Date</th><th>Supervisor</th></tr></thead>
            <tbody>
              {data.postings.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-300">
                  <td className="py-2">{p.ward}</td>
                  <td>{formatLogbookDate(p.startDate)}</td>
                  <td>{formatLogbookDate(p.endDate)}</td>
                  <td>{p.supervisorName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="2. Case Discussions">
        {data.cases.length === 0 ? <p>No cases recorded.</p> : (
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="border-b border-black"><th className="py-2">Date</th><th>Patient</th><th>Diagnosis</th><th>Status</th></tr></thead>
            <tbody>
              {data.cases.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-300">
                  <td className="py-2">{formatLogbookDate(c.date)}</td>
                  <td>{c.patientUhid} ({c.patientAge})</td>
                  <td>{c.diagnosisFinal || c.diagnosisProvisional}</td>
                  <td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="3. Procedure Logs">
        {data.procs.length === 0 ? <p>No procedures recorded.</p> : (
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="border-b border-black"><th className="py-2">Date</th><th>Procedure</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {data.procs.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-300">
                  <td className="py-2">{formatLogbookDate(p.date)}</td>
                  <td>{p.procedureName}</td>
                  <td>{p.role}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="4. Academic Activities">
        {data.academics.length === 0 ? <p>No academic activities recorded.</p> : (
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="border-b border-black"><th className="py-2">Date</th><th>Type</th><th>Topic</th><th>Status</th></tr></thead>
            <tbody>
              {data.academics.map((a: any) => (
                <tr key={a.id} className="border-b border-gray-300">
                  <td className="py-2">{formatLogbookDate(a.date)}</td>
                  <td className="capitalize">{a.type.replace("-", " ")}</td>
                  <td>{a.topic}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="5. Assessments">
        {data.assessments.length === 0 ? <p>No assessments recorded.</p> : (
          <table className="w-full text-left border-collapse text-sm">
            <thead><tr className="border-b border-black"><th className="py-2">Date</th><th>Exam</th><th>Marks</th></tr></thead>
            <tbody>
              {data.assessments.map((a: any) => (
                <tr key={a.id} className="border-b border-gray-300">
                  <td className="py-2">{formatLogbookDate(a.date)}</td>
                  <td>{a.examName} ({a.type})</td>
                  <td>{a.marks} / {a.maximum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <div className="mt-20 flex justify-between">
        <div className="text-center">
          <div className="w-48 border-t border-black pt-2">Resident Signature</div>
        </div>
        <div className="text-center">
          <div className="w-48 border-t border-black pt-2">HOD Signature & Stamp</div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center print:hidden">
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded bg-teal-600 px-4 py-2 text-white">
          <Printer className="h-4 w-4" /> Print Document
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10 page-break-inside-avoid">
      <h3 className="mb-4 text-lg font-bold border-b-2 border-slate-200 pb-1">{title}</h3>
      {children}
    </div>
  );
}
