import { useState } from "react";
import { Bill } from "@/lib/billing";
import Invoice from "./Invoice";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, FilePlus, Download, Loader2, Edit } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Props {
  bill: Bill;
  onBack: () => void;
  onNew: () => void;
  onEdit?: () => void;
}

const BillView = ({ bill, onBack, onNew, onEdit }: Props) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const node = document.getElementById("print-area");
    if (!node) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${bill.invoiceNo}_${bill.customer.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 px-3 md:py-10">
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 justify-between items-center no-print">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
          <Button variant="outline" onClick={onNew}>
            <FilePlus className="w-4 h-4 mr-2" /> New Bill
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="gradient-warm text-primary-foreground shadow-soft"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>
      <div className="shadow-elegant rounded-lg overflow-hidden">
        <Invoice bill={bill} />
      </div>
    </div>
  );
};

export default BillView;
