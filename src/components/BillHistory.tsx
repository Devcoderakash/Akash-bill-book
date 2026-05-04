import { useState } from "react";
import { Bill, deleteBill, formatINR, getBills } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Trash2 } from "lucide-react";

interface Props {
  onView: (b: Bill) => void;
}

const BillHistory = ({ onView }: Props) => {
  const [bills, setBills] = useState<Bill[]>(() => getBills());

  if (bills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No bills saved yet.
      </p>
    );
  }

  const handleDelete = (id: string) => {
    deleteBill(id);
    setBills(getBills());
  };

  return (
    <div className="space-y-2">
      {bills.slice(0, 10).map((b) => (
        <Card key={b.id} className="p-3 flex items-center justify-between gap-3 hover:shadow-soft transition">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{b.invoiceNo}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                b.type === "GST" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {b.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {b.customer.name} · {new Date(b.date).toLocaleDateString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold tabular-nums text-primary">{formatINR(b.total)}</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => onView(b)}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BillHistory;
