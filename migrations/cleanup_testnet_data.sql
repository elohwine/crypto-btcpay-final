-- Delete Testnet Webhooks
DELETE FROM "WebhookEvent"
WHERE "createdAt" <= '2025-11-23 10:14:14';

-- Delete Testnet Deposits
DELETE FROM "Deposit"
WHERE "createdAt" <= '2025-11-23 10:14:14';

-- Verify Deletion
SELECT 
  COUNT(*) as "Remaining Deposits (Should be 15)",
  (SELECT COUNT(*) FROM "WebhookEvent") as "Remaining Webhooks (Should be 0)"
FROM "Deposit";
