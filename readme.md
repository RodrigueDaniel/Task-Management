# Task Management System (MERN Stack)

## Project Overview
The Task Management System is a full-stack web application developed using the MERN stack.
The application helps users create, manage, and track tasks efficiently through a centralized platform.

This project is developed as part of an Engineering Internship to gain hands-on experience
with real-world full-stack application development.

---

## Objectives
- Understand MERN stack architecture
- Design a structured backend system
- Implement RESTful APIs
- Follow industry-standard project structure
- Gain practical full-stack development experience

---

## Problem Statement
Managing daily tasks manually or across multiple platforms can be inefficient.
This project aims to provide a centralized task management system where users
can create, update, view, and delete tasks easily.

---

## Project Scope

### In Scope
- User-based task management
- Task creation, update, deletion, and retrieval
- Backend API development
- Database integration using MongoDB

### Out of Scope
- Payment gateway integration

---

## Technology Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Tools:** Git, GitHub, VS Code

---

## System Requirements

### Software Requirements
- Node.js (v18 or above)
- npm
- React.js
- MongoDB / MongoDB Atlas
- Git
- Visual Studio Code

### Hardware Requirements
- Minimum 8 GB RAM
- Stable internet connection

---

## High-Level Architecture
The application follows the MERN architecture where the frontend communicates
with the backend via REST APIs. The backend processes requests and interacts
with MongoDB using Mongoose for data persistence.

---
---

# MERN Stack Architecture

## MongoDB (Database Layer)
MongoDB is a NoSQL, document-oriented database used to store application data.

- Stores data in JSON-like documents
- Flexible schema design
- High scalability and performance
- Used to persist user and task data

---

## Express.js (Application Layer)
Express.js is a lightweight backend framework built on Node.js.
- Handles HTTP requests and responses
- Defines RESTful API routes
- Manages middleware for authentication, validation, and error handling
- Acts as a bridge between frontend and database

---

## React.js (Presentation Layer)

React.js is a frontend JavaScript library used to build user interfaces.

- Component-based architecture
- Efficient UI rendering using Virtual DOM
- Handles user interactions and state management
- Communicates with backend APIs to fetch and update data

DOM -> The DOM represents the page structure, while the Virtual DOM tracks changes and efficiently updates the real DOM

## Node.js (Runtime Environment)

Node.js is a JavaScript runtime that allows execution of JavaScript on the server side.

- Handles backend logic
- Supports asynchronous and non-blocking operations
- Enables scalable server-side development
- Works with Express.js to build APIs