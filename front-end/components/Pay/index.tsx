"use client";
import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { Button, Input, Select } from "@worldcoin/mini-apps-ui-kit-react";
import { useState } from "react";

const sendPayment = async (recipientAddress: string, selectedToken: Tokens, amount: number) => {
  try {
    // Send payment details to initiate the payment
    const res = await fetch(`/api/initiate-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientAddress,
        token: selectedToken,
        amount
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to initiate payment");
    }

    const { id } = await res.json();

    const payload: PayCommandInput = {
      reference: id,
      to: recipientAddress,
      tokens: [
        {
          symbol: selectedToken,
          token_amount: tokenToDecimals(amount, selectedToken).toString(),
        },
      ],
      description: "Thanks for the coffee! ☕",
    };
    
    if (MiniKit.isInstalled()) {
      return await MiniKit.commandsAsync.pay(payload);
    }
    return null;
  } catch (error: unknown) {
    console.log("Error sending payment", error);
    return null;
  }
};

const handlePay = async (
  recipientAddress: string,
  selectedToken: Tokens,
  amount: number,
  setStatus: (status: string | null) => void
) => {
  if (!MiniKit.isInstalled()) {
    setStatus("MiniKit is not installed");
    return;
  }

  if (!recipientAddress) {
    setStatus("Please enter a recipient address");
    return;
  }

  if (amount <= 0) {
    setStatus("Please enter a valid amount");
    return;
  }

  setStatus("Processing payment...");
  const sendPaymentResponse = await sendPayment(recipientAddress, selectedToken, amount);
  const response = sendPaymentResponse?.finalPayload;

  if (!response) {
    setStatus("Payment failed");
    return;
  }

  if (response.status === "success") {
    try {
      const res = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: response }),
      });
      
      if (!res.ok) {
        throw new Error("Payment confirmation failed");
      }
      
      const payment = await res.json();
      if (payment.success) {
        setStatus("Thank you for the coffee! ☕");
      } else {
        setStatus("Payment confirmation failed");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setStatus("Payment confirmation failed");
    }
  } else {
    setStatus("Payment failed");
  }
};

export const PayBlock = () => {
  const [recipientAddress, setRecipientAddress] = useState(process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || "");
  const [selectedToken, setSelectedToken] = useState<Tokens>(Tokens.WLD);
  const [amount, setAmount] = useState<number>(0.5);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold">Buy me a coffee ☕</h3>
      <p className="text-center text-gray-600 mb-4">
        Enjoyed this app? Buy me a coffee! 🎉 Or change the address to support someone else!
      </p>

      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Recipient Address</label>
          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Token</label>
            <Select
              value={selectedToken}
              onChange={(value) => setSelectedToken(value as Tokens)}
              options={[
                { label: "WLD", value: Tokens.WLD },
                { label: "USDC", value: Tokens.USDCE }
              ]}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              value={amount.toString()}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.5"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={() => handlePay(recipientAddress, selectedToken, amount, setStatus)}
        className="w-full mt-2"
      >
        Buy Coffee
      </Button>

      {status && (
        <div className={`mt-2 text-center ${status.includes("Thank you") ? "text-green-600" : "text-red-600"}`}>
          {status}
        </div>
      )}
    </div>
  );
};
