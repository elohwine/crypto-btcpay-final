-- Check Deposits
SELECT 
  COUNT(*) FILTER (WHERE "createdAt" > '2025-11-23 10:14:14') as "Deposits After Switch (Mainnet)",
  COUNT(*) FILTER (WHERE "createdAt" <= '2025-11-23 10:14:14') as "Deposits Before Switch (Testnet)"
FROM "Deposit";

-- Check Webhooks
SELECT 
  COUNT(*) FILTER (WHERE "createdAt" > '2025-11-23 10:14:14') as "Webhooks After Switch (Mainnet)",
  COUNT(*) FILTER (WHERE "createdAt" <= '2025-11-23 10:14:14') as "Webhooks Before Switch (Testnet)"
FROM "WebhookEvent";

-- Check Users
SELECT 
  COUNT(*) as "Users Created After Switch"
FROM "User"
WHERE "createdAt" > '2025-11-23 10:14:14';

-- List Users Created After Switch (to check for test accounts)
SELECT email, "createdAt"
FROM "User"
WHERE "createdAt" > '2025-11-23 10:14:14'
ORDER BY "createdAt" DESC;
