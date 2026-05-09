export type BillType = "GST" | "NORMAL";

export interface Product {
  id: string;
  name: string;
  size?: string;
  hsn?: string;
  rate: number;
  qty: number;
}

export interface Customer {
  prefix?: string;
  name: string;
  mobile: string;
  address: string;
  gstNumber?: string;
}

export interface BankDetails {
  accountNo: string;
  ifsc: string;
}

export interface Bill {
  id: string;
  invoiceNo: string;
  type: BillType;
  date: string;
  customer: Customer;
  bankDetails?: BankDetails;
  products: Product[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(isFinite(n) ? n : 0);

export const productTotal = (p: Product) => (p.rate || 0) * (p.qty || 0);

export const calcBill = (products: Product[], type: BillType) => {
  const subtotal = products.reduce((s, p) => s + productTotal(p), 0);
  const cgst = type === "GST" ? subtotal * 0.09 : 0;
  const sgst = type === "GST" ? subtotal * 0.09 : 0;
  const total = subtotal + cgst + sgst;
  return { subtotal, cgst, sgst, total };
};

const STORAGE_KEY = "aakash_bills";
const COUNTER_KEY = "aakash_invoice_counter";

export const generateInvoiceNo = () => {
  const current = parseInt(localStorage.getItem(COUNTER_KEY) || "1000", 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  const year = new Date().getFullYear();
  return `AF-${year}-${next}`;
};

export const saveBill = (bill: Bill) => {
  const bills = getBills();
  bills.unshift(bill);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills.slice(0, 200)));
};

export const updateBill = (bill: Bill) => {
  const bills = getBills();
  const index = bills.findIndex((b) => b.id === bill.id);
  if (index !== -1) {
    bills[index] = bill;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } else {
    saveBill(bill);
  }
};

export const getBills = (): Bill[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const deleteBill = (id: string) => {
  const bills = getBills().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
};
