Smart Inventory Postman collection

- Collection: SmartInventory.postman_collection.json
- Environment: SmartInventory.postman_environment.json

How to use

1. Open Postman and import the collection file `SmartInventory.postman_collection.json`.
2. Import the environment `SmartInventory.postman_environment.json` and select it.
3. Set `baseUrl` to your API base URL (e.g., `http://localhost:8000`).
4. To authenticate: use `POST /api/login` and copy the returned token into the `bearerToken` environment variable.
5. Use the grouped folders (Authentication, Inventory CRUD, Expiry & Stock Monitoring, Reports, External Integrations, Alerts & Notifications) to explore endpoints.

Notes

- Protected endpoints require `Authorization: Bearer {{bearerToken}}`.
- Bodies in the collection contain example payloads; adjust fields to match your API schema.
