# AAKASH FURNITURE - Bill Book Application

This is a modern, fast, and simple web application built for **AAKASH FURNITURE** to manage and generate invoices efficiently. It supports generating both GST and non-GST (Normal) bills with a beautifully formatted layout ready for printing.

## 🚀 Features

- **GST & Normal Billing**: Seamlessly switch between creating GST and Normal invoices.
- **Auto-Calculations**: Automatically calculates Subtotal, SGST (9%), CGST (9%), and Total Amount based on product rates and quantities.
- **Auto-Incrementing Invoice Numbers**: Keeps track of invoice numbers and auto-increments them for every new bill.
- **Bank Details Integration**: Easily add and modify shop bank account details directly on the invoice.
- **Amount in Words**: Dynamically converts the total numeric invoice amount into words to match standard Indian billing formats.
- **Instant Print Ready**: Generates a strictly formatted, boxed layout invoice that fits perfectly on A4 paper for instant printing.
- **Local Storage**: Automatically saves recent bills locally in your browser so you never lose track.

## 🛠 Tech Stack

- **React** with **TypeScript**: For building robust, reusable UI components.
- **Vite**: For a lightning-fast development experience and optimized production build.
- **Tailwind CSS**: For quick and highly customizable styling without writing custom CSS.
- **shadcn/ui**: For beautiful, accessible, and ready-to-use UI components.

## 📦 How to Run the Project

1. **Install Dependencies**:
   Ensure you have [bun](https://bun.sh/) installed, then run:
   ```bash
   bun install
   ```

2. **Start the Development Server**:
   ```bash
   bun run dev
   ```
   The application will start, and you can view it in your browser (typically at `http://localhost:8080/`).

## 💼 Workflow

1. **Start Screen**: Choose whether you want to generate a new **GST Bill** or a **Normal Bill**. You can also view your recent bills from the dashboard.
2. **Fill Details**: 
   - Add/Edit the Invoice Number (Auto-filled by default).
   - Enter Customer details (Name, Mobile, Address, GSTIN if applicable).
   - Modify the default Shop Bank Details if needed.
3. **Add Products**: Add the products sold, including the HSN code, rate, and quantity. The app will calculate subtotals and taxes instantly.
4. **Generate & Save**: Click **Generate Bill**. This saves the bill locally.
5. **Print**: The app takes you to the invoice preview screen which is formatted exactly to the required shop layout. Simply click the **Print** button or use `Ctrl+P` (or `Cmd+P`) to print the invoice for the customer.
