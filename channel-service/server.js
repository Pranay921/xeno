const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || "http://localhost:3000/api/receipts";

// Mock helper to send webhook callbacks to the CRM
async function triggerCallback(communicationId, status) {
  try {
    console.log(`[SIMULATOR] Sending callback status: "${status}" for communicationId: ${communicationId}`);
    const response = await fetch(CRM_CALLBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communicationId, status }),
    });
    if (!response.ok) {
      console.error(`[SIMULATOR] Callback failed with status code ${response.status}`);
    }
  } catch (err) {
    console.error(`[SIMULATOR] Error sending callback to CRM:`, err.message);
  }
}

app.post("/send", (req, res) => {
  const { communicationId, customerId, channel, message } = req.body;

  if (!communicationId || !customerId || !channel || !message) {
    return res.status(400).json({ error: "Missing required simulation fields" });
  }

  console.log(`[SIMULATOR] Received outbound message for dispatch:
    - ID: ${communicationId}
    - Channel: ${channel}
    - Message preview: "${message.slice(0, 40)}..."`);

  // Instantly return 200 OK to simulate asynchronous queue pickup
  res.status(202).json({ status: "queued", communicationId });

  // Outward Event Simulation loop
  const rand = Math.random();

  if (rand < 0.05) {
    // 5% chance: Outright failure
    setTimeout(() => triggerCallback(communicationId, "failed"), 1000);
  } else {
    // 1. Mark as Delivered (95% chance)
    setTimeout(() => {
      triggerCallback(communicationId, "delivered");

      // 2. Mark as Opened (70% chance of delivered)
      if (Math.random() < 0.7) {
        setTimeout(() => {
          triggerCallback(communicationId, "opened");

          // 3. Mark as Clicked (40% chance of opened)
          if (Math.random() < 0.4) {
            setTimeout(() => {
              triggerCallback(communicationId, "clicked");

              // 4. Mark as Converted (20% chance of clicked)
              if (Math.random() < 0.2) {
                setTimeout(() => {
                  triggerCallback(communicationId, "converted");
                }, 1500); // Converted 1.5s after click
              }
            }, 1200); // Clicked 1.2s after open
          }
        }, 1000); // Opened 1s after delivery
      }
    }, 500); // Delivered 500ms after sent
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "Channel Simulation Service" });
});

app.listen(PORT, () => {
  console.log(`[SIMULATOR] Running on port ${PORT}`);
  console.log(`[SIMULATOR] Configured CRM Callback endpoint: ${CRM_CALLBACK_URL}`);
});
