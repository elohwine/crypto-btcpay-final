-- Delete deposits linked to seed-user (test data)
DELETE FROM "Deposit"
WHERE "userId" = 'seed-user';

-- Verify deletion
SELECT COUNT(*) as "Remaining seed-user deposits (Should be 0)"
FROM "Deposit"
WHERE "userId" = 'seed-user';
