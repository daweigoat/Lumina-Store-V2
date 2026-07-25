// @ts-expect-error midtrans-client lacks types
import midtransClient from "midtrans-client";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  initializePayment(request: PaymentRequest): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<boolean>;
  refundPayment(transactionId: string, amount: number): Promise<PaymentResponse>;
}

export class MidtransProvider implements PaymentProvider {
  name = "Midtrans";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private snap: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    });
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transaction = await this.snap.createTransaction({
        transaction_details: {
          order_id: request.orderId,
          gross_amount: request.amount,
        },
        customer_details: {
          first_name: request.customerName,
          email: request.customerEmail,
        },
      });

      return {
        success: true,
        transactionId: request.orderId,
        paymentUrl: transaction.redirect_url,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Midtrans initialization failed",
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const statusResponse = await this.snap.transaction.status(transactionId);
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      if (transactionStatus === "capture") {
        return fraudStatus === "accept";
      }
      return transactionStatus === "settlement";
    } catch (error) {
      console.error("Midtrans verification error:", error);
      return false;
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResponse> {
    try {
      // In Midtrans, refund is usually done via Core API, this is a stub for the interface
      const refundResponse = await this.snap.transaction.refund(transactionId, {
        amount,
        reason: "Customer requested refund",
      });
      return {
        success: true,
        transactionId: refundResponse.id || transactionId,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: error instanceof Error ? error.message : "Midtrans refund failed",
      };
    }
  }
}

// Stub for Stripe
export class StripeProvider implements PaymentProvider {
  name = "Stripe";
  async initializePayment(): Promise<PaymentResponse> { throw new Error("Not implemented"); }
  async verifyPayment(): Promise<boolean> { throw new Error("Not implemented"); }
  async refundPayment(): Promise<PaymentResponse> { throw new Error("Not implemented"); }
}

// Stub for Xendit
export class XenditProvider implements PaymentProvider {
  name = "Xendit";
  async initializePayment(): Promise<PaymentResponse> { throw new Error("Not implemented"); }
  async verifyPayment(): Promise<boolean> { throw new Error("Not implemented"); }
  async refundPayment(): Promise<PaymentResponse> { throw new Error("Not implemented"); }
}
