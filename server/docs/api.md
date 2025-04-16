# Link Local B2B API Documentation

## Base URL

All API endpoints are prefixed with: `/api`

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

#### Register Business User

- **URL**: `/auth/business/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "business_name": "ABC Traders",
    "area": "Downtown",
    "street": "Main Street",
    "category": "Electronics",
    "email": "john@example.com",
    "password": "securepassword",
    "phone_no": "1234567890"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "Business user registered successfully",
    "userId": 1,
    "token": "JWT_TOKEN"
  }
  ```

#### Register Delivery Agent

- **URL**: `/auth/delivery/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securepassword",
    "contact_number": "9876543210",
    "area": "Downtown",
    "vehicle_type": "Motorcycle",
    "vehicle_number": "AB1234",
    "license_no": "DL123456"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "Delivery agent registered successfully",
    "agentId": 1,
    "token": "JWT_TOKEN"
  }
  ```

#### Business User Login

- **URL**: `/auth/business/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Login successful",
    "user": {
      "businessman_id": 1,
      "name": "John Doe",
      "business_name": "ABC Traders",
      "email": "john@example.com",
      "area": "Downtown",
      "type": "business"
    },
    "token": "JWT_TOKEN"
  }
  ```

#### Delivery Agent Login

- **URL**: `/auth/delivery/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Login successful",
    "user": {
      "agent_id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "area": "Downtown",
      "type": "delivery"
    },
    "token": "JWT_TOKEN"
  }
  ```

#### Get Current User

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "type": "business",
      // Additional fields based on user type
    }
  }
  ```

## Product Endpoints

#### Get All Products

- **URL**: `/products`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**:
  - `category` (optional): Filter by product category
  - `area` (optional): Filter by business area
- **Success Response**: `200 OK`
  ```json
  {
    "products": [
      {
        "product_id": 1,
        "product_name": "Product A",
        "price": 100.00,
        "quantity_available": 50,
        "description": "Product description",
        "image_url": "https://example.com/image.jpg",
        "businessman_id": 1,
        "business_name": "ABC Traders"
      }
    ]
  }
  ```

#### Get Product by ID

- **URL**: `/products/:id`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: `200 OK`
  ```json
  {
    "product_id": 1,
    "product_name": "Product A",
    "price": 100.00,
    "quantity_available": 50,
    "description": "Product description",
    "image_url": "https://example.com/image.jpg",
    "businessman_id": 1,
    "business_name": "ABC Traders",
    "area": "Downtown",
    "street": "Main Street",
    "category": "Electronics"
  }
  ```

#### Create Product

- **URL**: `/products`
- **Method**: `POST`
- **Auth Required**: Yes (Business only)
- **Request Body**:
  ```json
  {
    "product_name": "New Product",
    "price": 200.00,
    "quantity_available": 30,
    "description": "Product description",
    "image_url": "https://example.com/image.jpg"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "Product created successfully",
    "product": {
      "product_id": 2,
      "product_name": "New Product",
      "price": 200.00,
      "quantity_available": 30,
      "description": "Product description",
      "image_url": "https://example.com/image.jpg"
    }
  }
  ```

#### Update Product

- **URL**: `/products/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Business only, owner of product)
- **Request Body** (all fields optional):
  ```json
  {
    "product_name": "Updated Product",
    "price": 250.00,
    "quantity_available": 25,
    "description": "Updated description",
    "image_url": "https://example.com/new-image.jpg"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Product updated successfully",
    "product": {
      "product_id": 2,
      "product_name": "Updated Product",
      "price": 250.00,
      "quantity_available": 25,
      "description": "Updated description",
      "image_url": "https://example.com/new-image.jpg"
    }
  }
  ```

#### Delete Product

- **URL**: `/products/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Business only, owner of product)
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

## Order Endpoints

#### Create Order

- **URL**: `/orders`
- **Method**: `POST`
- **Auth Required**: Yes (Business only)
- **Request Body**:
  ```json
  {
    "supplying_businessman_id": 2,
    "product_id": 1,
    "quantity_requested": 10
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "message": "Order created successfully",
    "order": {
      "order_id": 1,
      "status": "Requested",
      "delivery_status": "Pending",
      "total_amount": 1000.00,
      "created_at": "2025-04-12T10:30:00Z"
    }
  }
  ```

#### Get Order by ID

- **URL**: `/orders/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Business owner or Delivery agent assigned)
- **Success Response**: `200 OK`
  ```json
  {
    "order_id": 1,
    "status": "Accepted",
    "delivery_status": "Assigned",
    "total_amount": 1000.00,
    "ordering_business": {
      "businessman_id": 1,
      "business_name": "ABC Traders",
      "area": "Downtown",
      "street": "Main Street"
    },
    "supplying_business": {
      "businessman_id": 2,
      "business_name": "XYZ Suppliers",
      "area": "Uptown",
      "street": "Market Road"
    },
    "products": [
      {
        "product_id": 1,
        "product_name": "Product A",
        "quantity_requested": 10,
        "unit_price": 100.00,
        "subtotal": 1000.00
      }
    ],
    "delivery_agent": {
      "agent_id": 1,
      "name": "Jane Smith",
      "contact_number": "9876543210"
    },
    "created_at": "2025-04-12T10:30:00Z",
    "updated_at": "2025-04-12T11:15:00Z"
  }
  ```

#### Update Order Status

- **URL**: `/orders/:id/status`
- **Method**: `PATCH`
- **Auth Required**: Yes (Role-based permissions)
- **Request Body**:
  ```json
  {
    "status": "Accepted"
  }
  ```
  Or:
  ```json
  {
    "delivery_status": "PickedUp"
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Order status updated successfully",
    "order": {
      "order_id": 1,
      "status": "Accepted",
      "delivery_status": "Pending"
    }
  }
  ```

#### Get Business Orders

- **URL**: `/orders/business/orders`
- **Method**: `GET`
- **Auth Required**: Yes (Business only)
- **Query Parameters**:
  - `type`: Either "ordering" or "supplying" (default: both)
  - `status` (optional): Filter by order status
- **Success Response**: `200 OK`
  ```json
  {
    "orders": [
      {
        "order_id": 1,
        "status": "Accepted",
        "delivery_status": "Assigned",
        "total_amount": 1000.00,
        "ordering_business": {
          "business_name": "ABC Traders"
        },
        "supplying_business": {
          "business_name": "XYZ Suppliers"
        },
        "created_at": "2025-04-12T10:30:00Z"
      }
    ]
  }
  ```

#### Assign Delivery Agent

- **URL**: `/orders/assign-delivery`
- **Method**: `POST`
- **Auth Required**: Yes (Business only, supplier)
- **Request Body**:
  ```json
  {
    "order_id": 1,
    "agent_id": 1
  }
  ```
- **Success Response**: `200 OK`
  ```json
  {
    "message": "Delivery agent assigned successfully",
    "order": {
      "order_id": 1,
      "delivery_status": "Assigned"
    }
  }
  ```

#### Get Delivery Orders

- **URL**: `/orders/delivery/orders`
- **Method**: `GET`
- **Auth Required**: Yes (Delivery only)
- **Query Parameters**:
  - `status` (optional): Filter by delivery status
- **Success Response**: `200 OK`
  ```json
  {
    "orders": [
      {
        "order_id": 1,
        "delivery_status": "Assigned",
        "pickup_business": {
          "business_name": "XYZ Suppliers",
          "area": "Uptown",
          "street": "Market Road"
        },
        "delivery_business": {
          "business_name": "ABC Traders",
          "area": "Downtown",
          "street": "Main Street"
        },
        "assigned_at": "2025-04-12T11:15:00Z"
      }
    ]
  }
  ```

## Error Responses

### Standard Error Format

All API errors follow this format:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

### Validation Error Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "field1": "Error message for field1",
    "field2": "Error message for field2"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error