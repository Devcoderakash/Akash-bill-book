import { Bill, formatINR, productTotal } from "@/lib/billing";

interface Props {
  bill: Bill;
}

function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero Only';
  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return 'Amount too large';

  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != '00') ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return 'Rupees ' + str.trim() + ' Only.';
}

const Invoice = ({ bill }: Props) => {
  const isGST = bill.type === "GST";
  const dateStr = new Date(bill.date).toLocaleDateString("en-IN", {
    day: '2-digit', month: '2-digit', year: '2-digit'
  });

  const roundedTotal = Math.round(bill.total);
  const roundingOff = (roundedTotal - bill.total).toFixed(2);

  // Pad products to fill empty rows
  const MIN_ROWS = 8;
  const paddedProducts = [...bill.products];
  while (paddedProducts.length < MIN_ROWS) {
    paddedProducts.push({ id: `empty-${paddedProducts.length}`, name: "", size: "", rate: 0, qty: 0 });
  }

  return (
    <div id="print-area" className="bg-white text-black p-4 max-w-5xl mx-auto font-sans text-[13px] leading-tight">
      <div className="border-[2px] border-black flex flex-col">
        {/* Header Grid */}
        <div className="grid grid-cols-[1.2fr_auto_1fr] border-b-[2px] border-black divide-x-[2px] divide-black">
          {/* Consignor */}
          <div className="p-2">
            <p className="font-semibold">Consignor:-</p>
            <p className="font-bold text-base mt-1">AAKASH FURNITURE</p>
            <p>Owner name- Rakesh Lodhi</p>
            <p>Shop No. 2, Aakash Furniture,</p>
            <p>Kolar Road, BHOPAL (MP)</p>
            <p>Mobile no.- 9111092001, 9926174823</p>
            {isGST && <p>GSTIN :- 23ALVPL7961R2ZW</p>}
          </div>

          {/* Invoice Info & Bank */}
          <div className="p-2 flex flex-col items-center justify-start min-w-[240px]">
            <div className="w-full text-left mb-2">
              <p className="font-semibold text-[15px]">INVOICE NO : {bill.invoiceNo}</p>
              <p className="mt-1">DATE: {dateStr}</p>
            </div>
            <div className="w-full text-left mt-auto pt-2">
              <p className="font-semibold">Bank Details:</p>
              <p>A/C- {bill.bankDetails?.accountNo || "7184276999"},</p>
              <p>IFS Code- {bill.bankDetails?.ifsc || "IDIB000K735"}</p>
            </div>
          </div>

          {/* Consignee */}
          <div className="p-2">
            <p className="font-semibold">Consignee:-</p>
            <p className="font-bold text-base mt-1">{bill.customer.prefix || "Mr."} {bill.customer.name}</p>
            <p className="whitespace-pre-wrap">{bill.customer.address}</p>
            <p>PH NO:- {bill.customer.mobile}</p>
            {isGST && bill.customer.gstNumber && (
              <p>GSTIN : {bill.customer.gstNumber}</p>
            )}
          </div>
        </div>

        {/* Product Table */}
        <table className="w-full border-collapse text-center table-fixed">
          <thead>
            <tr className="border-b-[2px] border-black divide-x-[2px] divide-black bg-white">
              <th className="py-1 px-1 font-semibold w-[5%]">S.No</th>
              <th className="py-1 px-1 font-semibold w-[10%]">HSN</th>
              <th className="py-1 px-1 font-semibold">Product</th>
              <th className="py-1 px-1 font-semibold w-[10%]">Size</th>
              <th className="py-1 px-1 font-semibold w-[10%]">Rate</th>
              <th className="py-1 px-1 font-semibold w-[6%]">QTY</th>
              <th className="py-1 px-1 font-semibold w-[10%]">Sub Total</th>
              {isGST && (
                <>
                  <th className="py-1 px-1 font-semibold w-[9%]">CGST<br />(9%)</th>
                  <th className="py-1 px-1 font-semibold w-[9%]">SGST<br />(9%)</th>
                </>
              )}
              <th className="py-1 px-1 font-semibold w-[12%]">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y-[1px] divide-black">
            {paddedProducts.map((p, i) => {
              const isEmpty = !p.name;
              const pTotal = isEmpty ? 0 : productTotal(p);
              const cgstAmt = isGST && !isEmpty ? pTotal * 0.09 : 0;
              const sgstAmt = isGST && !isEmpty ? pTotal * 0.09 : 0;
              const rowVal = pTotal + cgstAmt + sgstAmt;

              return (
                <tr key={p.id} className="divide-x-[2px] divide-black h-[28px]">
                  <td className="px-1">{isEmpty ? "" : i + 1}</td>
                  <td className="px-1">{p.hsn || ""}</td>
                  <td className="px-1 text-left">{p.name}</td>
                  <td className="px-1">{p.size || ""}</td>
                  <td className="px-1">{isEmpty ? "" : p.rate.toFixed(2)}</td>
                  <td className="px-1">{isEmpty ? "" : p.qty}</td>
                  <td className="px-1">{isEmpty ? "" : pTotal.toFixed(2)}</td>
                  {isGST && (
                    <>
                      <td className="px-1">{isEmpty ? "" : cgstAmt.toFixed(2)}</td>
                      <td className="px-1">{isEmpty ? "" : sgstAmt.toFixed(2)}</td>
                    </>
                  )}
                  <td className="px-1">{isEmpty ? "" : rowVal.toFixed(2)}</td>
                </tr>
              );
            })}

            {/* Subtotal row */}
            <tr className="divide-x-[2px] divide-black font-bold h-[28px]">
              <td colSpan={isGST ? 9 : 7} className="px-2 py-1"></td>
              <td className="px-1">{bill.total.toFixed(2)}</td>
            </tr>
            {/* Rounding Off */}
            <tr className="divide-x-[2px] divide-black h-[28px]">
              <td colSpan={isGST ? 7 : 5} className="text-left px-2 py-1">Amount Chargeable (in words)</td>
              <td colSpan={2} className="text-left px-2 py-1">Rounding Off</td>
              <td className="px-1">{roundingOff}</td>
            </tr>
            {/* Invoice Amount */}
            <tr className="divide-x-[2px] divide-black font-bold h-[28px]">
              <td colSpan={isGST ? 7 : 5} className="text-left px-2 py-1">{numberToWords(roundedTotal)}</td>
              <td colSpan={2} className="text-left px-2 py-1">Invoice amount</td>
              <td className="px-1">{roundedTotal}</td>
            </tr>
          </tbody>
        </table>

        {/* Declaration */}
        <div className="p-2 border-t-[2px] border-black">
          <div className="flex justify-between">
            <div className="text-xs w-[65%]">
              <p className="font-bold text-[13px] mb-1">Declaration</p>
              <p>
                We declare that, this invoice shows the actual price of the goods described. Interest @24% P.A applicable if invoice amount not paid within 15 days from the date of invoice. All subject to Bhopal Jurisdiction.
                {!isGST && " In this GST will not include."}
              </p>
            </div>
            <div className="text-right w-[30%] flex flex-col justify-between">
              <p className="font-bold">For AAKASH FURNITURE</p>
              <p className="mt-10">Prop.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
