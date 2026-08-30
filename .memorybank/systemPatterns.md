# System Patterns (murali-ecommerce-admin)

## 1. Directory Structure
```
murali-ecommerce-admin
 ├── src/
 │    ├── components/ (Reusable UI tables, forms, modals, file uploaders)
 │    ├── pages/ (Dashboard, Products, Categories, Orders, Settings)
 │    └── utils/ (API helpers, currency formatting)
 ├── index.html
 ├── vite.config.js
 └── package.json
```

## 2. API Communication
- Connects to backend at `http://localhost:5000/api`.
- Form data / Multer multipart requests for uploading product images.
