# Issues to be fixed

## 1. [Done]
- [x] `status` field in subscriptions should be enum not string and `billing_cycle_type` should be enum likes
```rust
enum BillingCycleType {
    Daily,
    Weekly,
    Monthly,
    Quarterly,
    HalfYearly,
    Yearly,
    Custom(i32),
}
```
and do not use `billing_cycle_days` field.
- [x] add start_date to the subscription model and the database table.

- [x] `currency` uses enum, for now only support `CNY` and `USD`, impl `FromStr` because it will be delivered from frontend.

- [x] `status` in `payment_records` should be enum too



Fixed all issues:
1. Created PostgreSQL enums for subscription_status, billing_cycle_type, currency_type, and payment_status
2. Added start_date field to subscriptions table
3. Updated Rust models to use proper enums with FromStr implementations
4. Implemented Custom(i32) variant for BillingCycleType to store custom days directly
5. Updated validation and service code to work with the new enum types

## 2. Code Format [Done]
- [x] create and update subscription should share some common functions, and we donot need the status change interface, just in the update subscription.
and the update subscription should be same model as create subscription, we can make sure the frontend dilivery the whole data.
- [x] and also return response when after creating or updating or just get subscription, you can extract the common part to a function.

## 3. Simplified Model [Done]
- [x] Simplified subscription model to use direct billing_cycle_days instead of BillingCycleType enum
- [x] Made created_at and updated_at fields optional in the model
- [x] Simplified database schema to remove enum types
- [x] Updated service layer to match the new model
- [x] Updated validation logic for the simplified model
