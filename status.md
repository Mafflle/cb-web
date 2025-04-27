# 📄 Order and Payment Enums

## 🎯 Enum: `order_status`

Represents **the current state of the order** (food preparation and delivery process).

| Status               | When to use it                                                        |
|----------------------|-----------------------------------------------------------------------|
| `pending_confirmation` | Order placed by user, waiting for restaurant to accept. |
| `confirmed`          | Restaurant has accepted the order. |
| `in_preparation`     | Restaurant has started preparing the food. |
| `out_for_delivery`   | Rider has picked up the order and is on the way. |
| `delivered`          | Order has been delivered to the customer successfully. |
| `cancelled`          | Order was cancelled by restaurant or customer before delivery. |
| `failed`             | Order failed due to unexpected problems (e.g., system errors, no available delivery). |
| `refunded`           | Order has been refunded after cancellation or delivery failure. |

---

## 🎯 Enum: `payment_status`

Represents **the payment state** for the order.

| Status    | When to use it                                                        |
|-----------|-----------------------------------------------------------------------|
| `pending` | Payment has not been completed yet. (e.g., waiting for transfer confirmation) |
| `paid`    | Payment has been successfully received. |
| `failed`  | Payment attempt failed (e.g., card declined, bank error). |
| `refunded` | Payment has been refunded to the customer. |

---

# ⚡ Summary

- `order_status` tracks the **food and delivery process**.
- `payment_status` tracks the **money process**.
- Both statuses **move independently**.  
  (Example: an order can be `delivered` but `refunded` later.)

---

# Notes
- When creating a new order:  
  - `order_status` = `pending_confirmation`
  - `payment_status` = `pending`
- Status should be **updated step-by-step** as order progresses.
- ENUM values should only **expand**, never removed (Postgres restriction).

---

# Typical Order and Payment Status Transitions

| Action/Event                   | New `order_status`        | New `payment_status`  |
|---------------------------------|----------------------------|------------------------|
| Customer places order           | `pending_confirmation`    | `pending`              |
| Customer completes payment      | (no change)               | `paid`                 |
| Restaurant accepts the order    | `confirmed`               | (no change)            |
| Food preparation starts         | `in_preparation`          | (no change)            |
| Rider picks up the order        | `out_for_delivery`        | (no change)            |
| Order successfully delivered    | `delivered`               | (no change)            |
| Restaurant cancels order        | `cancelled`               | Refund if needed (update `payment_status` to `refunded`) |
| Payment failure after attempt   | `cancelled`               | `failed`               |
| Manual refund processed         | (no change) or `refunded` | `refunded`             |

✅ This table shows typical movement from one state to another. Not all transitions are mandatory — some may be skipped based on your business logic.

