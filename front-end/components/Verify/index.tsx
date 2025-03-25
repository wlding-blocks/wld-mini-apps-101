"use client";
import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionErrorPayload,
  IVerifyResponse,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel; // Default: Orb
};

const verifyPayload: VerifyCommandInput = {
  action: "test-action-2", // This is your action ID from the Developer Portal
  signal: "",
  verification_level: VerificationLevel.Orb, // Orb | Device
};

export const VerifyBlock = () => {
  const [handleVerifyResponse, setHandleVerifyResponse] = useState<
    MiniAppVerifyActionErrorPayload | IVerifyResponse | null
  >(null);
  const [verified, setVerified] = useState<boolean>(false);

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      console.warn("Tried to invoke 'verify', but MiniKit is not installed.");
      return;
    }

    const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

    // no need to verify if command errored
    if (finalPayload.status === "error") {
      console.log("Command error");
      console.log(finalPayload);

      setHandleVerifyResponse(finalPayload);
      return finalPayload;
    }

    // Verify the proof in the backend
    const verifyResponse = await fetch(`/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
        action: verifyPayload.action,
        signal: verifyPayload.signal, // Optional
      }),
    });

    // TODO: Handle Success!
    const verifyResponseJson = await verifyResponse.json();

    if (verifyResponseJson.status === 200) {
      console.log("Verification success!");
      console.log(finalPayload);
      setVerified(true);
    }

    setHandleVerifyResponse(verifyResponseJson);
    return verifyResponseJson;
  }, []);

  return (
    <div className="flex flex-col items-center">
      {!handleVerifyResponse ? (
        <Button 
          onClick={handleVerify}
        >
          Verify with World ID
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {verified ? (
            <>
              <div className="text-green-600 font-medium">✓ Verified</div>
              <div className="bg-gray-100 p-4 rounded-md max-w-md overflow-auto">
                <pre className="text-xs">{JSON.stringify(handleVerifyResponse, null, 2)}</pre>
              </div>
            </>
          ) : (
            <>
              <div className="text-red-600 font-medium">✗ Verification Failed</div>
              <div className="bg-gray-100 p-4 rounded-md max-w-md overflow-auto">
                <pre className="text-xs">{JSON.stringify(handleVerifyResponse, null, 2)}</pre>
              </div>
            </>
          )}
          <Button
            onClick={() => setHandleVerifyResponse(null)}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
