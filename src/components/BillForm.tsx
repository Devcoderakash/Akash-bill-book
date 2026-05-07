import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, FileText, Printer, Save } from "lucide-react";
import {
  Bill,
  BillType,
  Customer,
  Product,
  calcBill,
  formatINR,
  generateInvoiceNo,
  productTotal,
  saveBill,
  updateBill,
} from "@/lib/billing";
import { toast } from "sonner";

interface Props {
  type: BillType;
  initialBill?: Bill;
  onBack: () => void;
  onGenerated: (bill: Bill) => void;
}

const emptyProduct = (): Product => ({
  id: crypto.randomUUID(),
  name: "",
  hsn: "",
  rate: 0,
  qty: 1,
});

const formatDateForInput = (d?: string) => {
  const dateObj = d ? new Date(d) : new Date();
  return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

const BillForm = ({ type, initialBill, onBack, onGenerated }: Props) => {
  const [customer, setCustomer] = useState<Customer>(
    initialBill ? initialBill.customer : {
      prefix: "Mr.",
      name: "",
      mobile: "",
      address: "",
      gstNumber: "",
    }
  );
  const [products, setProducts] = useState<Product[]>(
    initialBill ? initialBill.products : [emptyProduct()]
  );
  const [invoiceNo, setInvoiceNo] = useState<string>(
    initialBill ? initialBill.invoiceNo : generateInvoiceNo()
  );
  const [date, setDate] = useState<string>(formatDateForInput(initialBill?.date));
  const [bankDetails, setBankDetails] = useState<{ accountNo: string; ifsc: string }>(
    initialBill?.bankDetails || { accountNo: "7184276999", ifsc: "IDIB000K735" }
  );

  const totals = useMemo(() => calcBill(products, type), [products, type]);

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const addProduct = () => setProducts((p) => [...p, emptyProduct()]);
  const removeProduct = (id: string) =>
    setProducts((p) => (p.length > 1 ? p.filter((x) => x.id !== id) : p));

  const validate = (): string | null => {
    if (!invoiceNo.trim()) return "Bill number is required";
    if (!date) return "Date is required";
    if (!customer.name.trim()) return "Customer name is required";
    if (!customer.mobile.trim()) return "Mobile number is required";
    if (!/^\d{10}$/.test(customer.mobile.trim()))
      return "Enter a valid 10-digit mobile number";
    if (!customer.address.trim()) return "Address is required";
    if (type === "GST" && !customer.gstNumber?.trim())
      return "GST number is required for GST bill";
    const valid = products.every((p) => p.name.trim() && p.rate > 0 && p.qty > 0);
    if (!valid) return "All products need name, rate and quantity";
    return null;
  };

  const handleGenerate = () => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const bill: Bill = {
      id: initialBill ? initialBill.id : crypto.randomUUID(),
      invoiceNo: invoiceNo.trim(),
      type,
      date: new Date(date + "T00:00:00").toISOString(),
      customer,
      bankDetails,
      products,
      ...totals,
    };
    if (initialBill) {
      updateBill(bill);
      toast.success("Bill updated successfully");
    } else {
      saveBill(bill);
      toast.success("Bill generated successfully");
    }
    onGenerated(bill);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← Back
          </button>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">
            {initialBill ? "Edit" : "New"} {type === "GST" ? "GST" : "Normal"} Bill
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          AAKASH FURNITURE
        </div>
      </div>

      {/* Customer */}
      <Card className="p-5 md:p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Bill & Customer Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNo">Bill Number *</Label>
            <Input
              id="invoiceNo"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="e.g. INV-001"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="billDate">Date *</Label>
            <Input
              id="billDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cname">Customer Name *</Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={customer.prefix || "Mr."}
                onChange={(e) => setCustomer({ ...customer, prefix: e.target.value })}
              >
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="M/s.">M/s.</option>
              </select>
              <Input
                id="cname"
                className="flex-1"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cmob">Mobile *</Label>
            <Input
              id="cmob"
              inputMode="numeric"
              maxLength={10}
              value={customer.mobile}
              onChange={(e) =>
                setCustomer({ ...customer, mobile: e.target.value.replace(/\D/g, "") })
              }
              placeholder="10-digit mobile"
            />
          </div>
          <div>
            <Label htmlFor="caddr">Address *</Label>
            <Input
              id="caddr"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Address"
            />
          </div>
          {type === "GST" && (
            <div>
              <Label htmlFor="cgst">GST Number *</Label>
              <Input
                id="cgst"
                value={customer.gstNumber}
                onChange={(e) =>
                  setCustomer({ ...customer, gstNumber: e.target.value.toUpperCase() })
                }
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Bank Details */}
      <Card className="p-5 md:p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Shop Bank Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="accountNo">Account Number</Label>
            <Input
              id="accountNo"
              value={bankDetails.accountNo}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNo: e.target.value })}
              placeholder="A/C No"
            />
          </div>
          <div>
            <Label htmlFor="ifsc">IFSC Code</Label>
            <Input
              id="ifsc"
              value={bankDetails.ifsc}
              onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
              placeholder="IFSC Code"
            />
          </div>
        </div>
      </Card>

      {/* Products */}
      <Card className="p-5 md:p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Products</h3>
          <Button onClick={addProduct} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {/* Header for desktop */}
          <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
            <div className="col-span-4">Product Name</div>
            <div className="col-span-2">HSN</div>
            <div className="col-span-2 text-right">Rate (₹)</div>
            <div className="col-span-1 text-right">Qty</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {products.map((p, idx) => (
            <div
              key={p.id}
              className="grid grid-cols-12 gap-2 items-center bg-muted/40 p-3 rounded-md"
            >
              <Input
                className="col-span-12 md:col-span-4 bg-background"
                placeholder={`Product ${idx + 1} name`}
                value={p.name}
                onChange={(e) => updateProduct(p.id, { name: e.target.value })}
              />
              <Input
                className="col-span-12 md:col-span-2 bg-background"
                placeholder="HSN"
                value={p.hsn || ""}
                onChange={(e) => updateProduct(p.id, { hsn: e.target.value })}
              />
              <Input
                className="col-span-4 md:col-span-2 bg-background text-right"
                type="number"
                min={0}
                placeholder="Rate"
                value={p.rate || ""}
                onChange={(e) => updateProduct(p.id, { rate: parseFloat(e.target.value) || 0 })}
              />
              <Input
                className="col-span-3 md:col-span-1 bg-background text-right"
                type="number"
                min={1}
                placeholder="Qty"
                value={p.qty || ""}
                onChange={(e) => updateProduct(p.id, { qty: parseInt(e.target.value) || 0 })}
              />
              <div className="col-span-3 md:col-span-2 text-right font-medium tabular-nums flex items-center justify-end">
                {formatINR(productTotal(p))}
              </div>
              <div className="col-span-2 md:col-span-1 flex justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeProduct(p.id)}
                  disabled={products.length === 1}
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Totals */}
      <Card className="p-5 md:p-6 shadow-soft">
        <div className="ml-auto max-w-sm space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">{formatINR(totals.subtotal)}</span>
          </div>
          {type === "GST" && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CGST (9%)</span>
                <span className="font-medium tabular-nums">{formatINR(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SGST (9%)</span>
                <span className="font-medium tabular-nums">{formatINR(totals.sgst)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between pt-3 border-t text-lg font-bold">
            <span>Total</span>
            <span className="tabular-nums text-primary">{formatINR(totals.total)}</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} className="gradient-warm text-primary-foreground shadow-soft">
          <Save className="w-4 h-4 mr-2" />
          {initialBill ? "Update Bill" : "Generate Bill"}
        </Button>
      </div>
    </div>
  );
};

export default BillForm;
