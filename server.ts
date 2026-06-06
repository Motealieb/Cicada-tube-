/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup body parsing middleware for JSON bodies
  app.use(express.json());

  // Pi Network access token verification endpoint
  app.post("/api/pi-login", async (req: express.Request, res: express.Response): Promise<any> => {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: "No access token provided" });
    }

    try {
      console.log(`Verifying Pi Network accessToken with API: Bearer ${accessToken.substring(0, 10)}...`);
      const response = await fetch("https://api.minepi.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Pi API returned non-200:", response.status, text);
        return res.status(401).json({ error: "Failed to validate access token with Pi Network", details: text });
      }

      const userData = await response.json();
      console.log("Successfully authenticated Pi User:", userData.username);
      return res.json({ success: true, user: userData });
    } catch (error: any) {
      console.error("Pi authentication verification error:", error);
      return res.status(500).json({ error: "Server verification failed", details: error.message });
    }
  });

  // Verify if the API key is configured and output a log warning
  if (!process.env.PI_NETWORK_API_KEY) {
    console.warn("⚠️ [Pi Network] PI_NETWORK_API_KEY is not configured in your environment variables. App will use simulation/sandbox testing bypasses. Set this variable for real blockchain ledger actions.");
  }

  // POST /api/pi-payments/approve - Approve a Pi payment
  app.post("/api/pi-payments/approve", async (req: express.Request, res: express.Response): Promise<any> => {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: "No paymentId provided" });
    }

    const apiKey = process.env.PI_NETWORK_API_KEY;
    if (!apiKey) {
      console.warn("PI_NETWORK_API_KEY not configured. Simulating approval for sandbox testing.");
      return res.json({
        success: true,
        simulated: true,
        message: "Payment approved in simulated sandbox mode (PI_NETWORK_API_KEY not configured)."
      });
    }

    try {
      console.log(`Approving payment ${paymentId} with Pi API...`);
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Pi API approve payment returned non-200:", response.status, text);
        return res.status(response.status).json({ error: "Pi payment approval failed", details: text });
      }

      const approvalData = await response.json();
      console.log("Pi payment approved successfully:", paymentId, approvalData);
      return res.json({ success: true, payment: approvalData });
    } catch (error: any) {
      console.error("Pi payment approval error:", error);
      return res.status(500).json({ error: "Payment approval server error", details: error.message });
    }
  });

  // POST /api/pi-payments/complete - Complete a Pi payment
  app.post("/api/pi-payments/complete", async (req: express.Request, res: express.Response): Promise<any> => {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) {
      return res.status(400).json({ error: "Missing paymentId or txid" });
    }

    const apiKey = process.env.PI_NETWORK_API_KEY;
    if (!apiKey) {
      console.warn("PI_NETWORK_API_KEY not configured. Simulating completion for sandbox testing.");
      return res.json({
        success: true,
        simulated: true,
        message: "Payment completed in simulated sandbox mode (PI_NETWORK_API_KEY not configured)."
      });
    }

    try {
      console.log(`Completing payment ${paymentId} with transaction TXID ${txid}...`);
      const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Pi API complete payment returned non-200:", response.status, text);
        return res.status(response.status).json({ error: "Pi payment completion failed", details: text });
      }

      const completionData = await response.json();
      console.log("Pi payment completed successfully:", paymentId, completionData);
      return res.json({ success: true, payment: completionData });
    } catch (error: any) {
      console.error("Pi payment completion error:", error);
      return res.status(500).json({ error: "Payment completion server error", details: error.message });
    }
  });

  // POST /api/pi-payments/incomplete - Incomplete payment recovery
  app.post("/api/pi-payments/incomplete", async (req: express.Request, res: express.Response): Promise<any> => {
    const { payment } = req.body;
    if (!payment || !payment.id) {
      return res.status(400).json({ error: "Missing payment object or id" });
    }

    const paymentId = payment.id;
    const txid = payment.transaction?.txid;
    const apiKey = process.env.PI_NETWORK_API_KEY;

    if (!apiKey) {
      console.warn("PI_NETWORK_API_KEY not configured. Simulating incomplete payment recovery.");
      return res.json({
        success: true,
        recovered: true,
        simulated: true,
        message: "Incomplete payment recovered in simulated sandbox mode (PI_NETWORK_API_KEY not configured)."
      });
    }

    try {
      console.log(`Checking/Recovering incomplete payment ${paymentId}...`);

      let isApproved = payment.status?.developer_approved || false;
      if (!isApproved) {
        console.log(`Payment ${paymentId} is not approved. Attempting to approve first...`);
        const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
        });
        if (approveRes.ok) {
          isApproved = true;
          console.log(`Payment ${paymentId} approved successfully in recovery.`);
        } else {
          const text = await approveRes.text();
          console.error(`Approval fell short on recovery: ${text}`);
        }
      }

      let isCompleted = payment.status?.transaction_completed || false;
      if (isApproved && !isCompleted && txid) {
        console.log(`Payment ${paymentId} has a txn but is not completed. Submitting completion...`);
        const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txid }),
        });
        if (completeRes.ok) {
          isCompleted = true;
          console.log(`Payment ${paymentId} completed successfully on recovery.`);
        } else {
          const text = await completeRes.text();
          console.error(`Completion fell short on recovery: ${text}`);
        }
      }

      return res.json({
        success: true,
        paymentId,
        status: { isApproved, isCompleted }
      });
    } catch (error: any) {
      console.error("Pi incomplete payment recovery error:", error);
      return res.status(500).json({ error: "Incomplete payment recovery error", details: error.message });
    }
  });

  // Vite middleware development setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
