# SpendSmart API Documentation - OTP-Based Registration Flow

## Overview
The registration system now uses OTP (One-Time Password) verification via email. All email sending is done asynchronously, and OTP management uses caching for better performance.

## Authentication Flow

### 1. User Registration (Step 1: Send OTP)
**Endpoint:** `POST /api/auth/register`

**Description:** Initiates registration by sending an OTP to the user's email. User data is temporarily stored in memory.

**Request Body:**
```json
{
  "username": "johndoe",
  "firstname": "John",
  "middlename": "M",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA"
}
```

**Success Response (200 OK):**
```json
{
  "message": "OTP sent to your email. Please verify to complete registration.",
  "email": "john.doe@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - Username or email already exists
- `400 Bad Request` - Validation errors

**Notes:**
- OTP is valid for 10 minutes
- An email with the 6-digit OTP will be sent asynchronously
- User data is stored temporarily until OTP verification

---

### 2. Verify OTP (Step 2: Complete Registration)
**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Verifies the OTP and completes the registration. User is saved to the database and a success email is sent.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Success Response (201 Created):**
```json
{
  "message": "Registration completed successfully",
  "username": "johndoe"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired OTP
- `400 Bad Request` - No pending registration found

**Notes:**
- After successful verification, user is saved to database with `emailVerified = true`
- OTP and temporary registration data are removed
- Registration success email is sent asynchronously

---

### 3. Resend OTP
**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Generates and sends a new OTP. The old OTP is invalidated immediately.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "message": "New OTP sent to your email",
  "email": "john.doe@example.com"
}
```

**Error Responses:**
- `400 Bad Request` - No pending registration found for this email

**Notes:**
- Old OTP is immediately invalidated when new OTP is generated
- New OTP is also valid for 10 minutes
- Only one OTP is valid at a time per email

---

### 4. User Login
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates user and returns JWT token. Sends login notification email.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "johndoe",
  "email": "john.doe@example.com"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Email not verified

**Notes:**
- Users must verify their email before they can login
- Login notification email is sent asynchronously
- JWT token is returned for authenticated requests

---

## Email Templates

### 1. OTP Verification Email
- **Subject:** SpendSmart - Email Verification OTP
- **Content:** Contains 6-digit OTP with 10-minute validity
- **Sent:** During registration and OTP resend

### 2. Registration Success Email
- **Subject:** SpendSmart - Registration Successful
- **Content:** Welcome message with app features
- **Sent:** After successful OTP verification

### 3. Login Notification Email
- **Subject:** SpendSmart - Login Notification
- **Content:** Login timestamp and security alert
- **Sent:** After successful login

---

## Technical Implementation Details

### Asynchronous Processing
- All email sending operations are executed asynchronously using `@Async`
- Configured thread pool:
  - Core pool size: 5
  - Max pool size: 10
  - Queue capacity: 100

### Caching
- OTP data is cached using Spring Cache with `@Cacheable`, `@CachePut`, and `@CacheEvict`
- Cache type: Simple (in-memory)
- Cache name: `otpCache`

### OTP Management
- **Storage:** In-memory using `ConcurrentHashMap` (not in database)
- **Length:** 6 digits
- **Validity:** 10 minutes
- **Security:** Generated using `SecureRandom`
- **Invalidation:** Automatic on expiry or when new OTP is generated

### Data Flow
1. **Registration Request** → Generate OTP → Store in memory → Send email (async)
2. **Verify OTP** → Validate OTP → Save user to DB → Send success email (async) → Clean up memory
3. **Resend OTP** → Invalidate old OTP → Generate new OTP → Send email (async)
4. **Login** → Authenticate → Check email verification → Send notification (async) → Return token

---

## Testing the Flow

### Complete Registration Flow:
```bash
# Step 1: Register (sends OTP)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "firstname": "Test",
    "middlename": "M",
    "lastname": "User",
    "email": "test@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890",
    "street": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "country": "Test Country"
  }'

# Step 2: Check email for OTP (6-digit code)

# Step 3: Verify OTP
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# Optional: Resend OTP if needed
curl -X POST http://localhost:8080/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Step 4: Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

---

## Security Features

1. **OTP Expiration:** OTPs expire after 10 minutes
2. **Single Active OTP:** Only one OTP is valid per email at any time
3. **Email Verification Required:** Users cannot login without verifying email
4. **Secure OTP Generation:** Uses `SecureRandom` for cryptographically secure random numbers
5. **Password Hashing:** Passwords are hashed using BCrypt before storage
6. **JWT Authentication:** Secure token-based authentication for API access

---

## Database Changes

### User Entity
Added new field:
- `email_verified` (BOOLEAN, NOT NULL, DEFAULT false)

This field is set to `true` only after successful OTP verification.

---

## Configuration

### Email Configuration (application.properties)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Async Configuration
```properties
spring.task.execution.pool.core-size=5
spring.task.execution.pool.max-size=10
spring.task.execution.pool.queue-capacity=100
```

### Cache Configuration
```properties
spring.cache.type=simple
spring.cache.cache-names=otpCache
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK` - Successful operation
- `201 Created` - User successfully registered
- `400 Bad Request` - Validation errors or invalid data
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Email not verified
- `500 Internal Server Error` - Server-side errors

Error response format:
```json
{
  "error": "Error message description"
}
```
