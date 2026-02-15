import { getWithAuth, postWithAuth } from "@/lib/backend";

export type BillingDocumentType = "FACTURA" | "BOLETA";
export type BillingCustomerDocumentType = "RUC" | "DNI" | "OTRO";
export type BillingPaymentStatus = "PENDIENTE" | "PARCIAL" | "PAGADO" | "VENCIDO";

export type BillingInvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  igv: number;
  total: number;
};

export type BillingInvoice = {
  id: string;
  documentType: BillingDocumentType;
  serie: string;
  numero: string;
  customerName: string;
  customerDocumentType: BillingCustomerDocumentType;
  customerDocumentNumber: string;
  issueDate: string | null;
  dueDate: string | null;
  subtotal: number;
  igv: number;
  total: number;
  paidAmount: number;
  balance: number;
  paymentStatus: BillingPaymentStatus;
  status: string;
  source: string;
  items: BillingInvoiceItem[];
  cpeStatus?: "ACEPTADO" | "RECHAZADO" | "ERROR" | null;
  cpeProvider?: string | null;
  cpeTicket?: string | null;
  cpeCode?: string | number | null;
  cpeDescription?: string | null;
  cpeError?: string | null;
  cpeLastAttemptAt?: string | null;
  cpeAcceptedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type BillingPayment = {
  id: string;
  amount: number;
  paymentDate: string | null;
  note: string;
  createdAt: string | null;
  createdBy?: string;
};

export type BillingEmitCpeResult = {
  status: "ACEPTADO" | "RECHAZADO";
  provider: string;
  ticket: string | null;
  cdr?: {
    code?: string | number | null;
    description?: string | null;
    zipBase64?: string | null;
  };
};

const toQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const result = query.toString();
  return result ? `?${result}` : "";
};

export const createBillingInvoice = (payload: {
  businessId: string;
  documentType: BillingDocumentType;
  serie: string;
  numero: string;
  customerName: string;
  customerDocumentType: BillingCustomerDocumentType;
  customerDocumentNumber: string;
  issueDate: string;
  dueDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
}) => {
  return postWithAuth<{ ok: true; invoice: BillingInvoice }>("/billing/invoices", payload);
};

export const listBillingInvoices = (params: {
  businessId: string;
  documentType?: BillingDocumentType;
  paymentStatus?: BillingPaymentStatus;
  limit?: number;
}) => {
  return getWithAuth<{ ok: true; invoices: BillingInvoice[] }>(
    `/billing/invoices${toQuery(params)}`
  );
};

export const listBillingPayments = (params: { businessId: string; invoiceId: string }) => {
  const { invoiceId, businessId } = params;
  return getWithAuth<{ ok: true; payments: BillingPayment[] }>(
    `/billing/invoices/${encodeURIComponent(invoiceId)}/payments${toQuery({ businessId })}`
  );
};

export const registerBillingPayment = (payload: {
  businessId: string;
  invoiceId: string;
  amount: number;
  paymentDate?: string;
  note?: string;
}) => {
  const { invoiceId, ...body } = payload;
  return postWithAuth<{
    ok: true;
    paymentId: string | null;
    paidAmount: number;
    balance: number;
    paymentStatus: BillingPaymentStatus;
  }>(`/billing/invoices/${encodeURIComponent(invoiceId)}/payments`, body);
};

export const markBillingInvoicePaid = (payload: {
  businessId: string;
  invoiceId: string;
  paymentDate?: string;
  note?: string;
}) => {
  const { invoiceId, ...body } = payload;
  return postWithAuth<{
    ok: true;
    paymentId: string | null;
    paidAmount: number;
    balance: number;
    paymentStatus: BillingPaymentStatus;
  }>(`/billing/invoices/${encodeURIComponent(invoiceId)}/mark-paid`, body);
};

export const emitBillingCpe = (payload: { businessId: string; invoiceId: string }) => {
  const { invoiceId, businessId } = payload;
  return postWithAuth<{
    ok: true;
    result: BillingEmitCpeResult | null;
    invoice: BillingInvoice;
  }>(`/billing/invoices/${encodeURIComponent(invoiceId)}/emit-cpe`, { businessId });
};
