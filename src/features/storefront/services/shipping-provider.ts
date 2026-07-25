export interface ShippingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
}

export interface ShippingRequest {
  destinationPostalCode: string;
  destinationCity: string;
  destinationState: string;
  weightGrams?: number;
  itemsCount: number;
}

export interface ShippingProvider {
  name: string;
  getOptions(request: ShippingRequest): Promise<ShippingOption[]>;
  createWaybill(orderId: string, shippingOptionId: string): Promise<string>;
}

export class RajaOngkirProvider implements ShippingProvider {
  name = "RajaOngkir";
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RAJAONGKIR_API_KEY || "";
    // Using pro endpoint as example, switch to starter/basic based on account
    this.baseUrl = "https://pro.rajaongkir.com/api";
  }

  async getOptions(request: ShippingRequest): Promise<ShippingOption[]> {
    try {
      // Stub mapping: In real app, we must map destinationCity to RajaOngkir City ID
      // using their /city endpoint or a local database cache.
      const origin = process.env.STORE_CITY_ID || "501"; // Default Yogyakarta
      const destination = "114"; // Stub: Denpasar
      const weight = request.weightGrams || 1000;
      
      const response = await fetch(`${this.baseUrl}/cost`, {
        method: "POST",
        headers: {
          key: this.apiKey,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          origin,
          originType: "city",
          destination,
          destinationType: "city",
          weight: weight.toString(),
          courier: "jne", // Example hardcoded courier
        }),
      });
      
      const data = await response.json();
      
      if (data.rajaongkir?.status?.code !== 200) {
        console.error("RajaOngkir error:", data.rajaongkir?.status?.description);
        return [];
      }

      const results = data.rajaongkir.results[0];
      if (!results) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return results.costs.map((cost: any) => ({
        id: `rajaongkir_${results.code}_${cost.service}`,
        name: `${results.name} ${cost.service}`,
        description: cost.description,
        price: cost.cost[0].value,
        estimatedDays: cost.cost[0].etd,
      }));
    } catch (error) {
      console.error("Failed to fetch shipping options from RajaOngkir:", error);
      return [];
    }
  }

  async createWaybill(orderId: string, _shippingOptionId: string): Promise<string> {
    console.log("Creating waybill for option:", _shippingOptionId);
    // RajaOngkir API is primarily for checking costs and tracking. 
    // Creating waybills is usually handled by the courier's direct API or a 3PL like Biteship/Shipper.
    // For RajaOngkir, sellers usually input the AWB manually after dropping off the package.
    return `PENDING_AWB_${orderId}`;
  }
}

export class BiteshipProvider implements ShippingProvider {
  name = "Biteship";
  async getOptions(): Promise<ShippingOption[]> { throw new Error("Not implemented"); }
  async createWaybill(): Promise<string> { throw new Error("Not implemented"); }
}

export class ShipperProvider implements ShippingProvider {
  name = "Shipper";
  async getOptions(): Promise<ShippingOption[]> { throw new Error("Not implemented"); }
  async createWaybill(): Promise<string> { throw new Error("Not implemented"); }
}
