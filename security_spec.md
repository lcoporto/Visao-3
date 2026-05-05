# Security Specification - AutoStock Solutions

## Data Invariants
1. A part movement must be linked to a valid part ID.
2. A service order must have a status.
3. Stock quantity cannot be negative (except for Admins adjusting inventory).
4. Appointments must have a customer name and date.

## The "Dirty Dozen" Payloads (Test Scenarios)
1. **Identity Spoofing**: Attempt to create a movement using another user's `userId`.
2. **State Shortcutting**: Attempt to update a Service Order status from 'open' directly to 'completed' without 'in-progress' (if we enforce state machine).
3. **Ghost Fields**: Attempt to add `isAdmin: true` to a user document or part.
4. **Invalid IDs**: Attempt to use `../../../etc/passwd` as a part ID.
5. **PII Leak**: Non-admin user trying to list all customer phone numbers (if we had a users collection with PII).
6. **Denial of Wallet**: Sending a 10MB string in the `notes` field of a Service Order.
7. **Negative Inventory**: Regular user trying to set a part's `quantity` to -50.
8. **Unauthorized Deletion**: Regular user trying to delete a locked Service Order (completed).
9. **Fake Timestamp**: Client sending a `createdAt` date from 1999.
10. **Market Price Manipulation**: Regular user trying to update `marketPrices` which should be system-updated or admin-only.
11. **Orphaned Movement**: Creating a movement for a `partId` that doesn't exist.
12. **Blanket Read**: Unauthorized user trying to list all `serviceOrders`.

## Test Runner
(This is a conceptual mapping for `firestore.rules.test.ts`)
- `test('movement.userId must match auth.uid')`
- `test('part.quantity must be >= 0 for non-admins')`
- `test('status transitions follow OS lifecycle')`
- `test('ids must match isValidId() regex')`
