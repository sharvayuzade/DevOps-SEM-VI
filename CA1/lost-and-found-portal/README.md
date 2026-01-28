# 🔍 SIT Nagpur Lost & Found Portal

A full-stack web application for Symbiosis Institute of Technology, Nagpur that enables students and staff to report and recover lost belongings on campus.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?logo=supabase)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Directory Structure](#-directory-structure)
5. [Database Schema](#-database-schema)
6. [Supabase Setup](#-supabase-setup)
7. [Running Locally](#-running-locally)
8. [Usage Guide](#-usage-guide)
9. [API Reference](#-api-reference)
10. [Contributing](#-contributing)

---

## 🎯 Project Overview

The Lost & Found Portal is designed to help the SIT Nagpur campus community:

- **Students** can report found items with photos and details
- **Staff & Students** can browse and search for lost belongings
- **Secure authentication** with email/password via Supabase
- **Real-time updates** when new items are added

### Problem Solved

Lost items on campus often go unclaimed because there's no centralized system. This portal bridges that gap by providing a digital platform where found items are cataloged with images and location details.

---

## ✨ Features

### Authentication & Authorization
- ✅ Secure email/password authentication via Supabase
- ✅ Two user roles: **Student** and **Staff**
- ✅ Role-specific registration forms
- ✅ Protected routes based on authentication status
- ✅ Persistent sessions with auto-refresh tokens

### Lost & Found Item Management
- ✅ **Image upload** to Supabase Storage
- ✅ Detailed item information (name, description, location)
- ✅ Date and time tracking
- ✅ Deposit location specification
- ✅ Status tracking (Available, Claimed, Expired)

### Items Listing
- ✅ Responsive card-based layout
- ✅ Real-time search functionality
- ✅ Filter by status (Available, Claimed, Expired)
- ✅ Sort by date or name
- ✅ Real-time updates via Supabase subscriptions

### User Features
- ✅ Personal dashboard with statistics
- ✅ Profile management
- ✅ View own uploads
- ✅ Mark items as claimed
- ✅ Delete own items

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js 18** | UI library for building components |
| **React Router 6** | Client-side routing |
| **Bootstrap 5** | CSS framework for responsive design |
| **Bootstrap Icons** | Icon library |
| **React Toastify** | Toast notifications |

### Backend (BaaS)
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend as a Service |
| **Supabase Auth** | User authentication |
| **Supabase Database** | PostgreSQL database |
| **Supabase Storage** | File/image storage |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Relational database |
| **Row Level Security** | Data access control |

---

## 📁 Directory Structure

```
lost-and-found-portal/
├── public/
│   └── index.html              # Main HTML template
├── database/
│   ├── schema.sql              # Complete SQL schema
│   └── SCHEMA_DOCUMENTATION.md # Database documentation
├── src/
│   ├── components/             # Reusable React components
│   │   ├── Navbar.js           # Navigation bar
│   │   ├── Footer.js           # Page footer
│   │   ├── ItemCard.js         # Found item card display
│   │   ├── ProtectedRoute.js   # Auth route wrapper
│   │   └── LoadingSpinner.js   # Loading indicator
│   ├── config/
│   │   └── supabase.js         # Supabase client configuration
│   ├── context/
│   │   └── AuthContext.js      # Authentication state management
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js        # Login page
│   │   │   └── Signup.js       # Registration page
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── ItemsListing.js     # Browse all items
│   │   ├── UploadItem.js       # Report found item
│   │   └── Profile.js          # User profile
│   ├── styles/
│   │   └── App.css             # Custom styles
│   ├── App.js                  # Main app component
│   └── index.js                # App entry point
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐          ┌─────────────────┐
│   auth.users    │          │     users       │
│   (Supabase)    │ 1:1      │   (Custom)      │
│   ───────────   │─────────▶│   ───────────   │
│   id (PK)       │          │   id (PK, FK)   │
│   email         │          │   email         │
│   password_hash │          │   full_name     │
└─────────────────┘          │   role          │
                             └────────┬────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │ 1:1             │ 1:1             │ 1:N
                    ▼                 ▼                 ▼
            ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐
            │  students   │   │    staff    │   │   found_items   │
            │ ─────────── │   │ ─────────── │   │   ───────────   │
            │ id (PK, FK) │   │ id (PK, FK) │   │   id (PK)       │
            │ student_id  │   │ department  │   │   uploaded_by   │
            │ semester    │   │ employee_id │   │   item_name     │
            └─────────────┘   └─────────────┘   │   description   │
                                                │   image_url     │
                                                │   found_location│
                                                │   deposited_loc │
                                                │   status        │
                                                └─────────────────┘
```

### Tables

#### 1. `users` - Base User Information
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Links to auth.users |
| email | VARCHAR(255) | Unique email address |
| full_name | VARCHAR(100) | User's full name |
| role | VARCHAR(10) | 'student' or 'staff' |
| created_at | TIMESTAMP | Account creation date |

#### 2. `students` - Student-Specific Data
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | Links to users.id |
| student_id | VARCHAR(20) | Enrollment ID |
| semester | INTEGER | Current semester (1-8) |

#### 3. `staff` - Staff-Specific Data
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | Links to users.id |
| department | VARCHAR(100) | Department name |
| employee_id | VARCHAR(20) | Employee ID (optional) |

#### 4. `found_items` - Found Items Data
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated ID |
| uploaded_by | UUID (FK) | User who uploaded |
| item_name | VARCHAR(100) | Item name |
| description | TEXT | Optional details |
| image_url | TEXT | Storage URL |
| found_location | VARCHAR(200) | Where found |
| found_date | DATE | Date found |
| found_time | TIME | Time found |
| deposited_location | VARCHAR(200) | Where deposited |
| status | VARCHAR(20) | available/claimed/expired |

### Normalization (3NF)

This schema follows **Third Normal Form**:

1. **1NF**: All values are atomic, unique column names, primary keys defined
2. **2NF**: All non-key attributes fully depend on primary key
3. **3NF**: No transitive dependencies - role-specific data separated

---

## 🔧 Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details:
   - **Name**: `sit-nagpur-lost-found`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
4. Wait for project to be created

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy entire contents of `database/schema.sql`
4. Click "Run" to execute

### Step 3: Create Storage Bucket

1. Go to **Storage** in sidebar
2. Click "Create a new bucket"
3. Name it: `item-images`
4. Check "Public bucket"
5. Click "Create bucket"

### Step 4: Configure Storage Policies

Run these SQL queries in SQL Editor:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

-- Allow public viewing
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- Allow users to delete own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Step 5: Get API Keys

1. Go to **Settings** > **API**
2. Copy:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon/public key** → `REACT_APP_SUPABASE_ANON_KEY`

### Step 6: Enable Email Auth

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled
3. (Optional) Configure email templates in **Email Templates**

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase** account and project (see setup above)

### Installation Steps

1. **Clone/Navigate to the project**
   ```bash
   cd CA1/lost-and-found-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   
   Edit `.env` file:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Start development server**
   ```bash
   npm start
   ```

6. **Open browser**
   
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build output will be in the `build/` directory.

---

## 📖 Usage Guide

### For Students

1. **Sign Up**
   - Click "Get Started" or navigate to `/signup`
   - Select "Student" role
   - Fill in Student ID, Name, Semester, Email, Password
   - Verify email if required

2. **Report Found Item**
   - Login and navigate to "Report Item"
   - Upload a clear photo of the item
   - Fill in item name and description
   - Specify where you found it
   - Select date and time
   - Choose where you deposited the item
   - Submit

3. **Manage Your Items**
   - Go to Profile > My Uploads
   - Mark items as "Claimed" when owner collects
   - Delete items if needed

### For Staff

1. **Sign Up**
   - Select "Staff" role
   - Fill in Name, Department, Email, Password

2. **Browse Items**
   - View all found items on dashboard
   - Search by name, location, or description
   - Filter by status

---

## 📚 API Reference

### Authentication

```javascript
// Sign Up
const { signUp } = useAuth();
await signUp({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe',
  role: 'student',
  roleData: { studentId: 'SIT2024001', semester: 5 }
});

// Login
const { login } = useAuth();
await login('user@example.com', 'password123');

// Logout
const { logout } = useAuth();
await logout();
```

### Database Operations

```javascript
import { supabase } from './config/supabase';

// Fetch all items
const { data, error } = await supabase
  .from('found_items')
  .select('*, users:uploaded_by(full_name)')
  .order('created_at', { ascending: false });

// Insert new item
const { error } = await supabase
  .from('found_items')
  .insert({
    uploaded_by: userId,
    item_name: 'Water Bottle',
    // ... other fields
  });

// Update item status
const { error } = await supabase
  .from('found_items')
  .update({ status: 'claimed' })
  .eq('id', itemId);
```

### Storage Operations

```javascript
// Upload image
const { data, error } = await supabase.storage
  .from('item-images')
  .upload(`${userId}/${filename}`, file);

// Get public URL
const { data } = supabase.storage
  .from('item-images')
  .getPublicUrl(filePath);
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is created for educational purposes at Symbiosis Institute of Technology, Nagpur.

---

## 👥 Authors

- **SIT Nagpur Students** - DevOps CA1 Project

---

## 🙏 Acknowledgments

- Symbiosis Institute of Technology, Nagpur
- Supabase Team for the amazing BaaS platform
- React.js and Bootstrap communities

---

<p align="center">
  Made with ❤️ at SIT Nagpur
</p>
