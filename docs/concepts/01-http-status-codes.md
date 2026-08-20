# Concept 1: Semantic HTTP Status Codes in REST APIs

## Definition
HTTP status codes are 3-digit standardized integers returned by a web server to indicate the outcome of a client's HTTP request. Hexa follows strict RESTful HTTP status code semantics.

---

## Hexa Endpoint & HTTP Status Mapping Matrix

| Status Code | Description | Endpoint Example | Controller / Service Location | Why Used |
| :--- | :--- | :--- | :--- | :--- |
| **200 OK** | Successful retrieval / update | `GET /api/tasks` <br> `PUT /api/tasks/:id` | [`server/src/controllers/taskController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/taskController.js) | Standard response for successful read and update operations. |
| **201 Created** | Resource created successfully | `POST /api/tasks` <br> `POST /api/auth/register` | [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js#L65) | Indicates new user or task resource successfully instantiated. |
| **204 No Content** | Successful deletion with no body | `DELETE /api/tasks/:id` | [`server/src/controllers/taskController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/taskController.js) | Item permanently deleted; no response body required. |
| **400 Bad Request** | Request validation error | `POST /api/tasks` (missing title) | [`server/src/controllers/taskController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/taskController.js) | Client submitted invalid JSON payload or missing fields. |
| **401 Unauthorized** | Authentication failure | `POST /api/auth/login` (bad password) | [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js#L99) | Credentials unverified or authentication token absent. |
| **404 Not Found** | Resource missing | `GET /api/projects/999` | [`server/src/controllers/projectController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/projectController.js) | Requested record ID does not exist in PostgreSQL. |
| **409 Conflict** | Resource state collision | `POST /api/auth/register` (duplicate email) | [`server/src/controllers/authController.js`](file:///c:/Users/hardi/Hexa/server/src/controllers/authController.js#L34) | Attempting to register an email already present in `users` table. |
| **500 Server Error** | Unexpected exception | Global Error Middleware | [`server/src/middleware/errorHandler.js`](file:///c:/Users/hardi/Hexa/server/src/middleware/errorHandler.js) | Unhandled backend server exception caught by Express error middleware. |

---

## Viva Reviewer Questions & Answers

**Q: Why does POST /api/auth/register return 201 instead of 200?**  
**A**: 201 Created is the semantically correct HTTP status code when an API request successfully creates a new entity in the database (`users` record).

**Q: What HTTP status code is returned when deleting a task?**  
**A**: 204 No Content, signifying successful deletion without sending unnecessary payload data back to the client.