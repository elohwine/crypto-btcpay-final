# Admin Access Migration

## SQL Migration to Grant Admin Access

Run this SQL command on the production database to grant admin access to the specified email addresses:

```sql
-- Add isAdmin column if it doesn't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Grant admin access to specified email addresses
UPDATE "User" SET "isAdmin" = true WHERE email IN ('mceeloh@gmail.com', 'sydten.co@gmail.com');
```

## Verification

After running the migration, verify admin access by:

1. Login as `mceeloh@gmail.com` or `sydten.co@gmail.com`
2. Navigate to `/admin` route
3. Verify access to all 4 tabs: Statistics, Users, Deposits, Webhooks
4. Test user management features:
   - Search users
   - View user details
   - Toggle admin status for test users

## Manual Migration via Fly.io Console

If needed, you can run the migration via Fly.io console:

```bash
# Connect to the database
flyctl postgres connect -a <your-postgres-app-name>

# Then run the SQL commands above
```

## Alternative: TypeScript Migration Script

If ts-node is available, you can run:

```bash
npx ts-node scripts/grant-admin.ts
```

This script is located at `/scripts/grant-admin.ts` and will:
- Find users by email
- Update their isAdmin status to true
- Provide feedback on success/failure
