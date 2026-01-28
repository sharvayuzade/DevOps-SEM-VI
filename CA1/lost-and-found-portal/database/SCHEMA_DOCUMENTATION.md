# Database Schema Documentation
## Lost & Found Portal - Symbiosis Institute of Technology, Nagpur

## Overview
This document explains the normalized database schema design following **Third Normal Form (3NF)** principles.

---

## Normalization Explanation

### First Normal Form (1NF)
- ✅ All columns contain atomic (indivisible) values
- ✅ Each column has a unique name
- ✅ No repeating groups or arrays
- ✅ Primary keys defined for all tables

### Second Normal Form (2NF)
- ✅ Satisfies 1NF
- ✅ All non-key attributes fully depend on the primary key
- ✅ No partial dependencies (no composite keys with partial dependencies)

### Third Normal Form (3NF)
- ✅ Satisfies 2NF
- ✅ No transitive dependencies
- ✅ Non-key attributes don't depend on other non-key attributes
- ✅ Role-specific data separated into dedicated tables (students, staff)

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   ┌─────────────────┐                                                        │
│   │   auth.users    │  (Supabase Authentication)                            │
│   │   ───────────   │                                                        │
│   │   id (PK)       │                                                        │
│   │   email         │                                                        │
│   │   password_hash │                                                        │
│   └────────┬────────┘                                                        │
│            │                                                                  │
│            │ 1:1 (Foreign Key)                                               │
│            ▼                                                                  │
│   ┌─────────────────┐                                                        │
│   │     users       │  (Base User Profile)                                   │
│   │   ───────────   │                                                        │
│   │   id (PK, FK)   │──────────────────────────────────┐                    │
│   │   email         │                                   │                    │
│   │   full_name     │                                   │                    │
│   │   role          │                                   │                    │
│   │   created_at    │                                   │                    │
│   └────────┬────────┘                                   │                    │
│            │                                            │                    │
│     ┌──────┴──────┐                                     │                    │
│     │             │                                     │                    │
│     ▼             ▼                                     │                    │
│ ┌─────────┐  ┌─────────┐                               │                    │
│ │students │  │  staff  │                               │                    │
│ │─────────│  │─────────│                               │                    │
│ │id (PK,  │  │id (PK,  │                               │                    │
│ │   FK)   │  │   FK)   │                               │                    │
│ │student_ │  │depart-  │                               │                    │
│ │   id    │  │  ment   │                               │                    │
│ │semester │  │employee_│                               │                    │
│ └─────────┘  │   id    │                               │                    │
│              └─────────┘                               │                    │
│                                                         │ 1:N (Foreign Key) │
│                                                         │                    │
│                                                         ▼                    │
│                                              ┌─────────────────┐            │
│                                              │   found_items   │            │
│                                              │   ───────────   │            │
│                                              │   id (PK)       │            │
│                                              │   uploaded_by   │            │
│                                              │      (FK)       │            │
│                                              │   item_name     │            │
│                                              │   description   │            │
│                                              │   image_url     │            │
│                                              │   found_location│            │
│                                              │   found_date    │            │
│                                              │   found_time    │            │
│                                              │   deposited_    │            │
│                                              │     location    │            │
│                                              │   status        │            │
│                                              └─────────────────┘            │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Descriptions

### 1. `users` (Parent Table)
**Purpose:** Stores common user information for both students and staff

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK → auth.users | Unique identifier linked to Supabase Auth |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| role | VARCHAR(10) | NOT NULL, CHECK | Either 'student' or 'staff' |
| profile_image_url | TEXT | NULLABLE | URL to profile image |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 2. `students` (Child Table - Student-Specific)
**Purpose:** Stores student-specific information (extends users table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK → users | Links to users table |
| student_id | VARCHAR(20) | UNIQUE, NOT NULL | Student's enrollment ID |
| semester | INTEGER | NOT NULL, CHECK (1-8) | Current semester |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 3. `staff` (Child Table - Staff-Specific)
**Purpose:** Stores staff-specific information (extends users table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, FK → users | Links to users table |
| department | VARCHAR(100) | NOT NULL | Department name |
| employee_id | VARCHAR(20) | UNIQUE, NULLABLE | Employee ID (optional) |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### 4. `found_items` (Main Data Table)
**Purpose:** Stores information about found items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated unique ID |
| uploaded_by | UUID | NOT NULL, FK → users | User who uploaded the item |
| item_name | VARCHAR(100) | NOT NULL | Name of the found item |
| description | TEXT | NULLABLE | Detailed description |
| image_url | TEXT | NOT NULL | URL to item image in storage |
| found_location | VARCHAR(200) | NOT NULL | Where item was found |
| found_date | DATE | NOT NULL | Date when item was found |
| found_time | TIME | NOT NULL | Time when item was found |
| deposited_location | VARCHAR(200) | NOT NULL | Where item is stored |
| status | VARCHAR(20) | DEFAULT 'available' | available/claimed/expired |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

---

## Relationships

### 1. `auth.users` → `users` (1:1)
- Supabase authentication table links to our custom users table
- On user signup, a record is created in both tables
- Cascade delete ensures data consistency

### 2. `users` → `students` (1:1)
- One-to-one relationship for student role users
- Created only when user role is 'student'
- Contains student-specific data (student_id, semester)

### 3. `users` → `staff` (1:1)
- One-to-one relationship for staff role users
- Created only when user role is 'staff'
- Contains staff-specific data (department, employee_id)

### 4. `users` → `found_items` (1:N)
- One user can upload many found items
- Each found item belongs to exactly one user
- `uploaded_by` foreign key references `users.id`

---

## Row Level Security (RLS) Policies

### users table
- **SELECT:** All users can view all profiles
- **INSERT:** Users can only insert their own profile
- **UPDATE:** Users can only update their own profile

### students table
- **SELECT:** Anyone can view student info
- **INSERT:** Students can insert their own info
- **UPDATE:** Students can update their own info

### staff table
- **SELECT:** Anyone can view staff info
- **INSERT:** Staff can insert their own info
- **UPDATE:** Staff can update their own info

### found_items table
- **SELECT:** Anyone can view all items
- **INSERT:** Authenticated users can insert items
- **UPDATE:** Users can only update their own items
- **DELETE:** Users can only delete their own items

---

## Indexes

| Table | Index Name | Column(s) | Purpose |
|-------|------------|-----------|---------|
| users | idx_users_email | email | Fast login lookups |
| users | idx_users_role | role | Filter by role |
| students | idx_students_student_id | student_id | Fast student lookups |
| staff | idx_staff_department | department | Filter by department |
| found_items | idx_found_items_status | status | Filter by status |
| found_items | idx_found_items_found_date | found_date DESC | Sort by date |
| found_items | idx_found_items_uploaded_by | uploaded_by | Filter by uploader |

---

## Views

### `student_profiles`
Combines `users` and `students` tables for complete student information.

### `staff_profiles`
Combines `users` and `staff` tables for complete staff information.

### `found_items_with_uploader`
Combines `found_items` and `users` tables to show items with uploader details.

---

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL script
5. Create storage bucket:
   - Go to **Storage**
   - Create new bucket named `item-images`
   - Set it as **Public** bucket
   - Apply the storage policies from the schema

---

## Best Practices Implemented

1. **UUID Primary Keys:** Globally unique, secure, and distributed-friendly
2. **Cascade Deletes:** Maintains referential integrity automatically
3. **Check Constraints:** Validates data at database level
4. **Timestamps:** Automatic tracking of record creation/updates
5. **Indexes:** Optimized for common query patterns
6. **Views:** Simplified queries for complex joins
7. **RLS Policies:** Security at database level
