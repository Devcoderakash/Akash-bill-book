import { useState } from "react";
import { Bill, BillType } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Receipt, Sofa } from "lucide-react";
import BillForm from "@/components/BillForm";
import BillView from "@/components/BillView";
import BillHistory from "@/components/BillHistory";
import ThemeToggle from "@/components/ThemeToggle";

type View = "home" | "form" | "view";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [billType, setBillType] = useState<BillType>("NORMAL");
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const startBill = (type: BillType) => {
    setBillType(type);
    setIsEditing(false);
    setCurrentBill(null);
    setView("form");
  };

  const startEdit = () => {
    if (currentBill) {
      setBillType(currentBill.type);
      setIsEditing(true);
      setView("form");
    }
  };

  const handleGenerated = (bill: Bill) => {
    setCurrentBill(bill);
    setView("view");
    setHistoryKey((k) => k + 1);
  };

  if (view === "form") {
    return (
      <div className="min-h-screen gradient-soft">
        <header className="border-b bg-background/60 backdrop-blur sticky top-0 z-10 no-print">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sofa className="w-5 h-5 text-primary" />
              <span className="font-bold">AAKASH FURNITURE</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <BillForm 
          type={billType} 
          initialBill={isEditing && currentBill ? currentBill : undefined}
          onBack={() => setView("home")} 
          onGenerated={handleGenerated} 
        />
      </div>
    );
  }

  if (view === "view" && currentBill) {
    return (
      <div className="min-h-screen gradient-soft">
        <BillView
          bill={currentBill}
          onBack={() => setView("home")}
          onNew={() => setView("home")}
          onEdit={startEdit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="w-5 h-5 text-primary" />
            <span className="font-bold">AAKASH FURNITURE</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Receipt className="w-3.5 h-3.5" />
            Billing System
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            AAKASH FURNITURE
          </h1>
          <p className="text-muted-foreground mt-2">
            Shop No. 2, Kolar Road, Bhopal (M.P.)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <Card
            onClick={() => startBill("GST")}
            className="p-7 cursor-pointer hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary group"
          >
            <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-1">GST Bill</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tax invoice with 9% CGST + 9% SGST applied to subtotal.
            </p>
            <Button className="w-full gradient-warm text-primary-foreground">
              Create GST Bill
            </Button>
          </Card>

          <Card
            onClick={() => startBill("NORMAL")}
            className="p-7 cursor-pointer hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 border-2 hover:border-accent group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Normal Bill</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Quick invoice without GST. Just subtotal and total.
            </p>
            <Button variant="outline" className="w-full">
              Create Normal Bill
            </Button>
          </Card>
        </div>

        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recent Bills
          </h3>
          <BillHistory
            key={historyKey}
            onView={(b) => {
              setCurrentBill(b);
              setView("view");
            }}
          />
        </section>
      </main>
    </div>
  );
};

export default Index;
