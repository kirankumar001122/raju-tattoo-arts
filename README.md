# Raju Tattoo Arts — Full Stack Web Application

A full-stack, production-ready web application built for **Raju Tattoo Arts**, a professional tattoo studio. This project features a responsive React frontend with a luxury dark aesthetic, a Java Spring Boot REST API backend, and MySQL database integration with complete CRUD operations, Jakarta bean validations, global exception handling, and an interactive Admin Dashboard.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Setup](#database-setup)
6. [Backend Setup & Running](#backend-setup--running)
7. [Frontend Setup & Running](#frontend-setup--running)
8. [API Endpoints & Documentation](#api-endpoints--documentation)
9. [Assumptions and Limitations](#assumptions-and-limitations)
10. [Technical Interview Guide & Code Walkthrough](#technical-interview-guide--code-walkthrough)
    - [1. Backend Architecture](#1-backend-architecture)
    - [2. Database Explanation](#2-database-explanation)
    - [3. API Details & Workflows](#3-api-details--workflows)
    - [4. Booking Flow](#4-booking-flow)
    - [5. Contact Flow](#5-contact-flow)
    - [6. Status Update Flow](#6-status-update-flow)
    - [7. Validation Explanation](#7-validation-explanation)
    - [8. Exception Handling Explanation](#8-exception-handling-explanation)
    - [9. Why Controller → Service → Repository Architecture?](#9-why-controller--service--repository-architecture)
    - [10. Key Spring Boot Annotations Used](#10-key-spring-boot-annotations-used)
    - [11. 15 Technical Interview Questions & Simple Answers](#11-15-technical-interview-questions--simple-answers)
    - [12. Key Code Snippets You Should Personally Understand](#12-key-code-snippets-you-should-personally-understand)

---

## Project Overview

**Raju Tattoo Arts** is designed to provide a modern online experience for tattoo studio clients while equipping studio owners with a real-time admin portal to manage appointments and inquiries.

Key highlights:
- **Client Features**: Browse 7 studio services, view photo gallery, learn about hygiene practices, submit appointment requests with specific requirements (placement, size, design idea), and send direct contact inquiries.
- **Admin Dashboard**: Accessible at `/admin`, displaying live status metrics (Total, Pending, Confirmed, Completed, Cancelled), an interactive appointments table with inline status updates connected directly to MySQL, and client contact messages.

---

## Features

- **Responsive Modern UI**: Luxury dark aesthetic (`#0B0B0B` background, `#151515` cards, gold accent `#C9A227`, glassmorphism, responsive grid).
- **Online Booking System**: Interactive form submitting real data via Axios to Spring Boot REST endpoints.
- **Data Validation**: Client-side feedback and server-side Jakarta `@Valid` annotations (`@NotBlank`, `@Email`, `@NotNull`).
- **Global Error Handling**: Custom `@RestControllerAdvice` formatting JSON errors cleanly without exposing internal stack traces.
- **Status Management Workflow**: Allowed statuses (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) with strict validation (400 Bad Request on invalid status).
- **Admin Dashboard**: Real-time management interface to review bookings, update status, and view inquiries.
- **Clean Architecture**: Standard 4-tier Spring Boot architecture (Controller → Service → Repository → MySQL).

---

## Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM (`BrowserRouter`, `Routes`, `Route`)
- **HTTP Client**: Axios (configured in `src/services/api.js`)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Design System in `src/index.css`)

### Backend
- **Language**: Java 17 / 21
- **Framework**: Spring Boot 3.2.x
- **Web Layer**: Spring Web (`@RestController`, `@RequestMapping`, `@CrossOrigin`)
- **Data Access**: Spring Data JPA (`JpaRepository`, Hibernate ORM)
- **Validation**: Jakarta Bean Validation (`jakarta.validation.constraints`)
- **Build Tool**: Maven

### Database
- **Database Engine**: MySQL 8.x (`raju_tattoo` schema)
- **Driver**: MySQL Connector/J (`com.mysql.cj.jdbc.Driver`)

---

## Project Structure

```
raju-tattoo-arts/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/rajutattoo/
│   │   │   │   ├── RajuTattooApplication.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── BookingController.java
│   │   │   │   │   └── ContactController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── BookingService.java
│   │   │   │   │   └── ContactService.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── BookingRepository.java
│   │   │   │   │   └── ContactRepository.java
│   │   │   │   ├── entity/
│   │   │   │   │   ├── Booking.java
│   │   │   │   │   └── ContactEnquiry.java
│   │   │   │   └── exception/
│   │   │   │       ├── ResourceNotFoundException.java
│   │   │   │       └── GlobalExceptionHandler.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Contact.jsx
│   │   │   └── Admin.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Database Setup

1. Start your local **MySQL Server** (e.g. via MySQL Workbench, XAMPP, or Command Line).
2. Create a new database schema named `raju_tattoo`:
   ```sql
   CREATE DATABASE IF NOT EXISTS raju_tattoo;
   ```
3. Open `backend/src/main/resources/application.properties` and verify your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/raju_tattoo?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_LOCAL_MYSQL_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.format_sql=true
   ```

*Note: Hibernate `ddl-auto=update` will automatically generate the `bookings` and `contact_enquiries` database tables upon backend application startup.*

---

## Backend Setup & Running

1. Navigate to the `backend` directory:
   ```bash
   cd raju-tattoo-arts/backend
   ```
2. Run Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *(Or on Windows if Maven global binary is not in PATH, run `mvnw spring-boot:run`)*
3. The Spring Boot backend server will start on **`http://localhost:8080`**.

---

## Frontend Setup & Running

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd raju-tattoo-arts/frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web application in your browser at **`http://localhost:5173`**.

---

## API Endpoints & Documentation

Base URL: `http://localhost:8080/api`

### 1. Booking APIs

#### **POST `/api/bookings`**
Creates a new appointment request in MySQL database.
- **Request Headers**: `Content-Type: application.json`
- **Request Body**:
  ```json
  {
    "customerName": "Ramesh Kumar",
    "phone": "+91 9876543210",
    "email": "ramesh@example.com",
    "service": "Custom Tattoos",
    "appointmentDate": "2026-09-15",
    "appointmentTime": "14:30:00",
    "requirements": "Full forearm realistic lion portrait with crown",
    "additionalNotes": "First tattoo, sensitive skin"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "customerName": "Ramesh Kumar",
    "phone": "+91 9876543210",
    "email": "ramesh@example.com",
    "service": "Custom Tattoos",
    "appointmentDate": "2026-09-15",
    "appointmentTime": "14:30:00",
    "requirements": "Full forearm realistic lion portrait with crown",
    "additionalNotes": "First tattoo, sensitive skin",
    "status": "PENDING",
    "createdAt": "2026-08-20T14:30:00"
  }
  ```

#### **GET `/api/bookings`**
Fetches list of all bookings stored in MySQL.
- **Response (200 OK)**: Array of booking objects.

#### **GET `/api/bookings/{id}`**
Fetches a single booking by ID.
- **Response (200 OK)**: Single booking object.
- **Response (404 Not Found)**:
  ```json
  {
    "message": "Booking not found with id: 99",
    "status": 404,
    "timestamp": "2026-08-20T14:35:00"
  }
  ```

#### **PUT `/api/bookings/{id}/status`**
Updates booking status (Allowed values: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
- **Response (200 OK)**: Updated booking object.
- **Response (400 Bad Request)** (if invalid status provided):
  ```json
  {
    "message": "Invalid status: INVALID_STATUS. Allowed statuses are: PENDING, CONFIRMED, COMPLETED, CANCELLED",
    "status": 400,
    "timestamp": "2026-08-20T14:36:00"
  }
  ```

---

### 2. Contact APIs

#### **POST `/api/contact`**
Submits a client enquiry to MySQL database.
- **Request Body**:
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+91 9123456789",
    "message": "Hi, do you offer consultations on Sundays for sleeve design?"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "+91 9123456789",
    "message": "Hi, do you offer consultations on Sundays for sleeve design?",
    "createdAt": "2026-08-20T14:40:00"
  }
  ```

#### **GET `/api/contact`**
Fetches all contact enquiries.
- **Response (200 OK)**: Array of contact objects.

---

## Assumptions and Limitations

1. **Admin Authentication**: Authentication (JWT / Spring Security) is omitted in this baseline version as specified, allowing direct route access at `/admin` for interview clarity.
2. **Notifications**: Real-time SMS, WhatsApp, and email integrations are not wired in; booking creation stores status as `PENDING` for studio review.
3. **Placeholder Images**: High quality Unsplash imagery is used for sample tattoo artwork demonstrations.

---

## Technical Interview Guide & Code Walkthrough

### 1. Backend Architecture
The backend follows the clean 4-tier enterprise Spring Boot pattern:
1. **Controller Layer (`com.rajutattoo.controller`)**: Accepts HTTP requests, validates incoming payload JSON, maps endpoints, and returns standard HTTP status codes (`201 CREATED`, `200 OK`, `400 BAD REQUEST`, `404 NOT FOUND`).
2. **Service Layer (`com.rajutattoo.service`)**: Holds business logic (e.g. setting default status `PENDING`, setting timestamp `createdAt`, validating allowed status transitions).
3. **Repository Layer (`com.rajutattoo.repository`)**: Interfaces extending `JpaRepository` providing out-of-the-box CRUD methods without SQL boilerplate.
4. **Database Layer (MySQL)**: Persistent storage using JPA Entities (`Booking.java`, `ContactEnquiry.java`).

### 2. Database Explanation
- `bookings` table: Stores client appointment requests (`id`, `customer_name`, `phone`, `email`, `service`, `appointment_date`, `appointment_time`, `requirements`, `additional_notes`, `status`, `created_at`).
- `contact_enquiries` table: Stores general contact inquiries (`id`, `name`, `email`, `phone`, `message`, `created_at`).

### 3. API Details & Workflows
- **REST Principles**: Statetless JSON exchange over HTTP standard methods (`GET`, `POST`, `PUT`).
- **CORS**: Configured via `@CrossOrigin(origins = "*")` on controllers so React running on port 5173 can send asynchronous AJAX requests to Spring Boot on port 8080.

### 4. Booking Flow
1. User completes form on `/booking` page in React.
2. Axios triggers `POST http://localhost:8080/api/bookings` with payload.
3. `BookingController.createBooking` receives payload with `@Valid` annotation.
4. If validation fails, `GlobalExceptionHandler` intercepts and returns 400 Bad Request with field-by-field error map.
5. `BookingService` sets `status = "PENDING"` and `createdAt = LocalDateTime.now()`.
6. `BookingRepository` executes `INSERT INTO bookings ...` in MySQL.
7. Backend returns `201 CREATED` with full created `Booking` object.
8. React renders success confirmation banner with Booking ID.

### 5. Contact Flow
1. User enters name, email, phone, and message on `/contact`.
2. Axios triggers `POST http://localhost:8080/api/contact`.
3. `ContactService` sets `createdAt` and saves via `ContactRepository`.
4. Response `201 CREATED` confirms receipt and resets form state.

### 6. Status Update Flow
1. Studio admin selects new status (`CONFIRMED`, `COMPLETED`, `CANCELLED`) in Admin Dashboard (`/admin`).
2. Axios sends `PUT /api/bookings/{id}/status` with `{"status": "CONFIRMED"}`.
3. `BookingService.updateBookingStatus` checks if status is in allowed list (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
4. If invalid status, throws `IllegalArgumentException` caught by `GlobalExceptionHandler` (returns 400).
5. If valid, updates database record and returns updated booking object. UI updates row status dynamically.

### 7. Validation Explanation
- Applied using Jakarta Validation on JPA entities:
  - `@NotBlank`: Ensures string is not null and contains non-whitespace characters.
  - `@Email`: Validates email syntax format (`user@domain.com`).
  - `@NotNull`: Ensures non-null value for dates and times.

### 8. Exception Handling Explanation
- Uses `@RestControllerAdvice` class (`GlobalExceptionHandler`).
- `@ExceptionHandler(ResourceNotFoundException.class)` maps missing entity lookups to `404 NOT FOUND`.
- `@ExceptionHandler(MethodArgumentNotValidException.class)` formats bean validation errors into a clean JSON map:
  ```json
  {
    "message": "Validation failed",
    "errors": { "email": "Please enter a valid email address" }
  }
  ```
- No internal Java stack traces are exposed to frontend clients.

### 9. Why Controller → Service → Repository Architecture?
- **Separation of Concerns**: Controllers only handle HTTP networking, Services handle business rules, Repositories handle database SQL.
- **Maintainability & Testability**: Business logic can be unit-tested without mocking HTTP requests or running full web servers.
- **Reusability**: Service methods can be reused across different controllers or scheduled background jobs.

### 10. Key Spring Boot Annotations Used
- `@SpringBootApplication`: Combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`.
- `@RestController`: Marks class as REST endpoint handler where return values are written directly into HTTP response body as JSON.
- `@RequestMapping("/api/bookings")`: Maps base URL path to controller methods.
- `@Service`: Marks business logic layer bean for Spring dependency injection.
- `@Repository`: Marks Data Access Object component for Spring JPA persistence.
- `@Entity`: Marks Java class as JPA table mapping.
- `@Table(name = "...")`: Specifies underlying SQL table name.
- `@Id` & `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Defines auto-increment primary key.
- `@Valid`: Triggers bean validation on incoming request body objects.
- `@RestControllerAdvice` & `@ExceptionHandler`: Centralized global exception interception across all controllers.

---

### 11. 15 Technical Interview Questions & Simple Answers

#### **Q1: What is Spring Boot and why did you choose it over standard Spring Framework?**
*Answer*: Spring Boot provides starter dependencies, embedded Tomcat server, and auto-configuration, eliminating heavy XML configuration files so we can launch REST APIs quickly.

#### **Q2: Explain the flow of a booking request from React to MySQL.**
*Answer*: React Form → Axios `POST /api/bookings` → Spring `BookingController` → `BookingService` → `BookingRepository` JPA → MySQL database table `bookings`.

#### **Q3: What does `@RestController` do?**
*Answer*: It is a shorthand combination of `@Controller` and `@ResponseBody`. It tells Spring to render return objects directly into HTTP response bodies as JSON instead of looking for HTML views.

#### **Q4: How did you handle CORS in this project?**
*Answer*: Added `@CrossOrigin(origins = "*")` to controllers so that browser AJAX calls from React running on port 5173 can interact with Spring Boot running on port 8080 without cross-origin blockage.

#### **Q5: How does Spring Data JPA interact with MySQL without writing SQL queries?**
*Answer*: `BookingRepository` extends `JpaRepository<Booking, Long>`. Spring Data JPA generates proxy implementations at runtime for standard methods like `save()`, `findAll()`, and `findById()`.

#### **Q6: Why use DTOs or validation annotations like `@NotBlank`?**
*Answer*: Validation annotations guarantee data integrity at the API boundary, preventing bad or corrupt data (like empty names or invalid emails) from entering the database.

#### **Q7: What happens when an invalid status string is passed to update status API?**
*Answer*: `BookingService` checks against an allowed status array (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). If invalid, it throws `IllegalArgumentException`, which `GlobalExceptionHandler` converts into a 400 Bad Request JSON response.

#### **Q8: How did you handle 404 errors for non-existing booking IDs?**
*Answer*: `getBookingById()` uses `.orElseThrow(() -> new ResourceNotFoundException("..."))`. The global exception handler catches this custom exception and sends back a clean 404 response with timestamp.

#### **Q9: What is the purpose of `@RestControllerAdvice`?**
*Answer*: It allows consolidating exception handling across all controllers in a single class, preventing duplicate `try-catch` blocks inside controller methods.

#### **Q10: What is the difference between `ddl-auto=update` and `ddl-auto=create`?**
*Answer*: `create` drops existing tables and recreates schema on every application start (losing data). `update` inspects existing tables and modifies table structure without wiping data.

#### **Q11: Why did you use `LocalDate` and `LocalTime` instead of `java.util.Date`?**
*Answer*: `java.time` classes introduced in Java 8 are immutable, thread-safe, and cleanly separate calendar date (`appointmentDate`) from time of day (`appointmentTime`).

#### **Q12: What HTTP status code is returned when a booking is created successfully?**
*Answer*: `201 CREATED`, specified via `new ResponseEntity<>(created, HttpStatus.CREATED)`.

#### **Q13: How does Axios handle API errors on the frontend?**
*Answer*: In `src/services/api.js`, an Axios response interceptor intercepts error responses from Spring Boot and extracts error message objects (`error.response.data`), allowing React components to display friendly alert messages.

#### **Q14: How does the Admin Dashboard update status in real time?**
*Answer*: When an admin changes the status dropdown, React calls `updateBookingStatus(id, newStatus)` via Axios `PUT`. Upon success, React updates the local state array (`setBookings`), instantly updating the UI status badge without requiring a page reload.

#### **Q15: How can authentication be added to this architecture in the future?**
*Answer*: By introducing `spring-boot-starter-security`, creating a User entity with roles (`ROLE_ADMIN`), generating JWT tokens on login (`POST /api/auth/login`), and sending `Authorization: Bearer <token>` headers from Axios.

---

### 12. Key Code Snippets You Should Personally Understand

1. **`BookingController.java` — Status Update Endpoint**:
   ```java
   @PutMapping("/{id}/status")
   public ResponseEntity<Booking> updateBookingStatus(
           @PathVariable Long id,
           @RequestBody Map<String, String> statusRequest) {
       
       String newStatus = statusRequest.get("status");
       Booking updated = bookingService.updateBookingStatus(id, newStatus);
       return ResponseEntity.ok(updated);
   }
   ```
2. **`BookingService.java` — Allowed Status Validation**:
   ```java
   public Booking updateBookingStatus(Long id, String newStatus) {
       if (newStatus == null || !ALLOWED_STATUSES.contains(newStatus.toUpperCase())) {
           throw new IllegalArgumentException("Invalid status: " + newStatus);
       }
       Booking booking = getBookingById(id);
       booking.setStatus(newStatus.toUpperCase());
       return bookingRepository.save(booking);
   }
   ```
3. **`GlobalExceptionHandler.java` — Validation Mapping**:
   ```java
   @ExceptionHandler(MethodArgumentNotValidException.class)
   public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
       Map<String, Object> response = new HashMap<>();
       Map<String, String> errors = new HashMap<>();
       for (FieldError error : ex.getBindingResult().getFieldErrors()) {
           errors.put(error.getField(), error.getDefaultMessage());
       }
       response.put("message", "Validation failed");
       response.put("errors", errors);
       return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
   }
   ```
4. **`api.js` — Central Axios Service**:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   export const createBooking = (bookingData) => api.post('/bookings', bookingData);
   export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });
   ```X
