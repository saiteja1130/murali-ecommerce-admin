# Admin Agent Instructions & Strict Non-Regression Mandate

Merchant dashboard application (`murali-ecommerce-admin`) built with **React** and **Vite**.

---

## 🚨 MANDATORY ZERO-REGRESSION POLICY
**No administrative change may break merchant workflows or corrupt data consumed by the customer storefront.**

### Inviolable Admin Rules:
1. **Catalog Integrity**: All saved product and category structures must conform to the fields expected by `murali-ecommerce-frontend`.
2. **Media Uploads**: Images must be sent as multipart form data to backend `/api/upload` to reside in `/uploads` on port `5000`.
3. **Currency**: Strictly format pricing and monetary metrics with `₹` (INR).
4. **Port Alignment**: Runs on port `5173` connecting to backend on `http://localhost:5000`.

Refer to `.memorybank/guardrails.md` for complete rules.
