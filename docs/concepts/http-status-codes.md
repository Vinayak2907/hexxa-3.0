# HTTP Status Codes in Hexa Backend API

## Exact Implementation Location
- **Express App Setup**: [`server/src/app.js`](file:///c:/Users/hardi/Hexa/server/src/app.js)
- **Task Routes & Controller**: [`server/src/routes/tasks.js`](file:///c:/Users/hardi/Hexa/server/src/routes/tasks.js)
- **Project Routes & Controller**: [`server/src/routes/projects.js`](file:///c:/Users/hardi/Hexa/server/src/routes/projects.js)

## RESTful HTTP Status Code Mapping

Hexa follows REST conventions by utilizing explicit HTTP status codes:

| HTTP Status Code | Description | Hexa API Endpoint | Reason for Selection |
|---|---|---|---|
| **200 OK** | Request succeeded | `GET /api/tasks`, `GET /api/projects`, `PUT /api/tasks/:id` | Standard success code for reading or updating resources with a response body. |
| **201 Created** | Resource created | `POST /api/tasks`, `POST /api/projects` | Signals successful creation of a new database entity. Returns the created resource object. |
| **204 No Content** | Action succeeded without payload | `DELETE /api/tasks/:id`, `DELETE /api/projects/:id` | Successful resource deletion where no body payload needs to be returned. |
| **400 Bad Request** | Invalid input parameters | `POST /api/tasks` with missing `title` or invalid `status` | Client sent malformed or invalid request body data. |
| **401 Unauthorized** | Authentication required | `GET /api/protected` without JWT bearer token | Client missing valid authentication header/token. |
| **403 Forbidden** | Authenticated but access denied | Modifying task belonging to another tenant | Authenticated user lacks permission to operate on the target resource. |
| **404 Not Found** | Resource does not exist | `GET /api/tasks/999` for non-existent ID | Requested database primary key entity does not exist. |
| **409 Conflict** | Resource state conflict | Creating user with duplicate email | Prevents unique constraint violations. |
| **500 Internal Error**| Server unexpected exception | Database crash or uncaught throw | Catches internal server errors; sanitizes stack traces before returning error JSON. |

## Antipattern Avoided
Hexa does NOT return `200 OK` with `{ success: false, error: "..." }`. Instead, response statuses align strictly with standard HTTP status protocol semantics.
