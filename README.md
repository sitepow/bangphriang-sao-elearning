<div align="center">

# 🏫 Bang Phriang SAO E-Learning Platform

**An advanced digital education and e-learning management platform developed for the Bang Phriang Subdistrict Administrative Organization (SAO).**  
Engineered with a modern client-server architecture to provide seamless online courses, interactive rich-text learning materials, multimedia streaming, and detailed reporting.

[![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![UI Library](https://img.shields.io/badge/UI-NextUI%20%7C%20Tailwind%20CSS-purple?style=flat-square)](https://nextui.org/)
[![State Management](https://img.shields.io/badge/State-Redux%20Toolkit-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Deployment-success?style=flat-square)](#)

[Overview](#-executive-summary) •
[Key Features](#-key-features) •
[Tech Stack](#-tech-stack-matrix) •
[Project Structure](#-project-structure) •
[Getting Started](#-getting-started)

---

</div>

## 📌 Executive Summary

**Bang Phriang SAO E-Learning** is an institutional e-learning web platform designed to facilitate digital transformation for local government education services. 

The application provides a robust learning management environment where students and citizens can access online courses, view instructional video streams, generate PDF completion certificates, and track learning analytics through interactive charts and administrative dashboards.

---

## ⚡ Key Features

- **Interactive Course Player**: Built-in support for online lessons, rich-text lesson editing via Jodit/Editor.js, and integrated video streaming (`next-video`).
- **Data Visualization & Analytics**: Comprehensive administrative dashboards powered by **Chart.js**, **ApexCharts**, and **React ApexCharts** to track user progress and system statistics.
- **Certificate & Report Generation**: Automated PDF report rendering using `@react-pdf/renderer` and `jspdf` for course completion certificates.
- **Multi-Role User Management**: Secure authentication using JSON Web Tokens (JWT), cookie management (`cookies-next`), and state handling via **Redux Toolkit**.
- **Responsive & Modern UI**: Styled with **Tailwind CSS** and **NextUI** components supporting dynamic light/dark themes.

---

## 🏛️ Tech Stack Matrix

| Layer / Domain | Technologies & Libraries | Role & Responsibility |
| :--- | :--- | :--- |
| **Framework & UI** | Next.js 15, React 18, NextUI, Tailwind CSS | Server-side rendering, responsive layouts, and modern component design |
| **State & Data Fetching** | Redux Toolkit, React Redux, SWR, Axios | Global state management, API request handling, and server-state caching |
| **Editors & Rich Text** | Jodit React, React Editor JS | Rich-text content editing for course modules and announcements |
| **Charts & Visualization** | Chart.js, ApexCharts, React ApexCharts | Interactive statistics, progress tracking, and administrative data analysis |
| **Document & Media** | `@react-pdf/renderer`, `jspdf`, `next-video` | PDF certificate generation, export utilities, and optimized video streaming |
| **Backend & Security** | Node.js, Express (Server), JWT, Multer, Next-Connect | RESTful API routing, file upload middleware, and secure authentication |

---

## 🗂️ Project Structure

```text
