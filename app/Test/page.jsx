'use client'
import Invoice from "./InvoicePDF";

export default function InvoicePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <Invoice />
    </div>
  );
}
