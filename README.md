# task-management-mobile
# React Task Management App

## Overview
app for managing tasks with user authentication. Features include:
- User signup/login (JWT token stored in AsyncStorage)
- Add, view, edit, and delete tasks
- Form validation for tasks (name, due date)
- Protected routes for authenticated users

**Simulated Backend**: Uses local JSON data + AsyncStorage (no Node.js required).

---

## Tech Stack
### Core
- **Framework**: React Native (Expo)
- **Language**: TypeScript (preferred) / JavaScript
- **Navigation**: React Navigation (Stack)
- **State**: AsyncStorage + React Context (or Redux Toolkit)
- **UI**: React Native Paper / NativeBase (or custom components)

### Key Libraries
| Purpose          | Libraries                          |
|------------------|-----------------------------------|
| Forms            | Formik + Yup                      |
| Date Handling    | `date-fns` + `react-native-date-picker` |
| Storage          | `@react-native-async-storage/async-storage` |
| Auth Simulation  | JWT token generation (mock)       |

---

## Setup Instructions
### Prerequisites
- Node.js v18+
- Expo CLI (`npm install -g expo-cli`)
- Android Studio/Xcode (for emulators)

### Installation
1. npm install -g react-native-cli
2. npm install

Key Features
1. Authentication Flow
    Signup: Hashes password with react-native-bcrypt
    Login: Generates mock JWT token → stored in AsyncStorage
    Protected Routes: Redirects to login if no valid token

2. Task Management
Feature-Implementation Details
Add Task: Formik form with Yup validation
Edit/Delete: Swipeable cards with actions

Project Structure
src/
src/components/  # Reusable UI (Button, TaskCard)
src/contexts/    # Auth/Task state
src/screens/     # Auth + Task screens
src/data/        # users.json
src/utils/       # authHelpers, storageService
src/App.tsx      # Main entry with Navigation



 Assumptions
No real backend → tokens expire on app close
Password hashing uses react-native-bcrypt (mock)
All data persists locally via AsyncStorage


Evaluation Criteria Met
UI/UX: Clean Material Design-inspired UI
Code Structure: Modular components + TypeScript
State: Context + AsyncStorage sync
Navigation: Smooth stack transitions
Forms: Formik + Yup validation

result screenshort
