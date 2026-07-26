import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Award, PlusCircle, CheckCircle2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

export function MilestonesPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [certs, setCerts] = React.useState([
    { name: "PALS (Pediatric Advanced Life Support)", provider: "Indian Academy of Pediatrics", expiry: "2027-10-15", status: "Active", fileName: "pals_cert_2025.pdf" },
    { name: "NRP (Neonatal Resuscitation Program)", provider: "NVKP & IAP", expiry: "2027-04-20", status: "Active", fileName: "nrp_cert.pdf" },
    { name: "BLS (Basic Life Support)", provider: "AHA", expiry: "2026-12-01", status: "Active", fileName: "bls_card_2024.pdf" },
  ]);

  const [form, setForm] = React.useState({
    name: "",
    provider: "",
    expiry: "2028-01-01",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      toast.info(`File attached: ${file.name}`, {
        description: `${(file.size / 1024).toFixed(1)} KB`,
      });
    }
  };

  const handleUploadCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.provider) return;

    const newCert = {
      name: form.name,
      provider: form.provider,
      expiry: form.expiry,
      status: "Active",
      fileName: selectedFile ? selectedFile.name : "certificate_doc.pdf",
    };

    setCerts([newCert, ...certs]);
    toast.success(`Certificate uploaded & verified!`, {
      description: `${newCert.name} (${newCert.fileName}) saved to resident profile.`,
    });

    setForm({ name: "", provider: "", expiry: "2028-01-01" });
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-600" /> Certifications &amp; Thesis Milestones
          </h2>
          <p className="text-xs text-slate-500">
            Mandatory certifications (BLS, NRP, PALS) and PG dissertation submission tracker
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs gap-2">
              <PlusCircle className="h-4 w-4" /> Upload Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-teal-600" /> Upload Certification Document
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Upload official certification proof (BLS / NRP / PALS / ACLS).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadCert} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Certificate Title</Label>
                <Input
                  placeholder="e.g. ACLS Advanced Cardiac Life Support"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issuing Body / Provider</Label>
                  <Input
                    placeholder="e.g. AHA / IAP"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    required
                  />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* File Attachment Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? "border-teal-500 bg-teal-50/60"
                    : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-6 w-6 text-teal-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Attached</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700">Click to Attach Certificate File (PDF / PNG / JPG)</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size 10MB</p>
                  </>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 text-white">Save &amp; Upload Certificate</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Life Support Certifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Certificate Title</TableHead>
                <TableHead className="text-xs font-semibold">Issuing Body</TableHead>
                <TableHead className="text-xs font-semibold">Attached File</TableHead>
                <TableHead className="text-xs font-semibold">Expiry Date</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3 text-xs font-bold text-slate-900">{c.name}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-700">{c.provider}</TableCell>
                  <TableCell className="py-3 text-xs text-teal-700 font-mono flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {c.fileName}
                  </TableCell>
                  <TableCell className="py-3 text-xs text-slate-600">{c.expiry}</TableCell>
                  <TableCell className="py-3">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> {c.status}
                    </Badge>
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
