# Admin Guardrails & Inviolable Non-Regression Rules

## 1. Zero-Regression Policy
- Any administrative enhancements, table updates, or form additions MUST NOT break existing merchant operations or corrupt frontend-consumed data.

## 2. Inviolable Admin Rules
1. **Catalog Integrity**: Products saved or updated in admin must match the data structure expected by the frontend (e.g. `price`, `originalPrice`, `colors`, `sizes`, `category`, `mainCategory`, `images`, `isStockAvailable`).
2. **Media Uploads**: Product media uploads must be routed to the backend `/api/upload` endpoint so assets are stored in `/uploads` on port `5000`.
3. **Currency & Metrics**: All monetary metrics and product pricing fields must use `₹` (INR).
4. **Port Alignment**: Runs on port `5173` and communicates with backend API on `http://localhost:5000`.
