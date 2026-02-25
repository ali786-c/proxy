import { createContext, useContext, useState, type ReactNode } from "react";

export interface PaymentGatewayState {
  stripe: boolean;
  paypal: boolean;
  crypto: boolean;
}

interface PaymentConfigContextValue {
  gateways: PaymentGatewayState;
  toggleGateway: (id: keyof PaymentGatewayState) => void;
  autoTopUpEnabled: boolean;
  setAutoTopUpEnabled: (v: boolean) => void;
}

const PaymentConfigContext = createContext<PaymentConfigContextValue | null>(null);

export function PaymentConfigProvider({ children }: { children: ReactNode }) {
  const [gateways, setGateways] = useState<PaymentGatewayState>({
    stripe: true,
    paypal: false,
    crypto: false,
  });
  const [autoTopUpEnabled, setAutoTopUpEnabled] = useState(false);

  const toggleGateway = (id: keyof PaymentGatewayState) => {
    setGateways((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PaymentConfigContext.Provider value={{ gateways, toggleGateway, autoTopUpEnabled, setAutoTopUpEnabled }}>
      {children}
    </PaymentConfigContext.Provider>
  );
}

export function usePaymentConfig() {
  const ctx = useContext(PaymentConfigContext);
  if (!ctx) throw new Error("usePaymentConfig must be used within PaymentConfigProvider");
  return ctx;
}
