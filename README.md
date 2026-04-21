# ⚡ Electricity Service System - Distributed Database Architecture

![Node.js](https://img.shields.io/badge/Node.js-v18+-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle_Database-Distributed-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-IoT_Data-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Enabled-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=for-the-badge&logo=redis&logoColor=white)

Final project for the **Distributed Database Systems** course. This system simulates a high-performance electricity service management platform featuring a **horizontal fragmentation architecture**, integrated with an **Event-Driven Asynchronous Billing Engine** and **Real-time Data Replication**.

---

## 📖 Table of Contents
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Installation & Deployment](#-installation--deployment)
- [Usage Guide](#-usage-guide)

---

## 🏗️ System Architecture

The core of this system relies on a hybrid distributed model to ensure load balancing, low latency, and data integrity across multiple geographical branches.

> **Note:** Replace the image path below with your actual image file once uploaded to Github.
> 
![System Architecture Diagram](./images/architecture.drawio.png) 
*Figure 1: High-level System Architecture illustrating the Master-Slave Oracle nodes, RabbitMQ Broker, and API Gateway.*

### Data Flow Overview:
1. **Client (Web/App):** Queries local branch databases directly (CN1, CN2, CN3, CN4) for lightning-fast read operations (Local Autonomy).
2. **API Gateway (Backend):** Routes write-heavy operations to the central message queue.
3. **RabbitMQ Broker:** Buffers incoming requests and events to prevent database lockups during peak times.
4. **Automated Workers:** Listens to queues, processes complex tiered-billing logic, fetches cached electricity rates, and executes batch inserts.

---

## 💻 Tech Stack

* **Backend & Workers:** Node.js, Express.js, node-cron
* **Relational Database (Core):** Oracle Database (Master Node & Branch Nodes)
* **NoSQL Database (Time-series):** MongoDB (Used for storing millions of IoT electrical meter readings)
* **Caching Layer:** Redis v4 (For static state pricing policies)
* **Message Broker:** RabbitMQ

---

## ✨ Key Features

* **Horizontal Database Fragmentation:** Dynamic routing of data to localized Oracle nodes based on the customer's branch code using advanced Oracle Triggers and DB Links.
* **Smart Tiered Billing Algorithm:** An automated engine that calculates monthly bills combining government-standard tiered pricing and customized contract quotas.
* **Historical Data Snapshotting:** Enforces strict accounting principles by permanently freezing rates and quotas (`kwDinhMuc`, `dongiaKW`) inside the Invoice records upon generation.
* **High-Throughput Batch Processing:** The `BillWorker` utilizes `executeMany()` and multithreading (Promise.all) to process and insert thousands of invoices and details seamlessly.
* **Active Database Mechanism:** Leverages Oracle PL/SQL Triggers to automatically compute and aggregate invoice totals from individual detail rows dynamically.

---

## 🚀 Installation & Deployment

### 1. Prerequisites
Make sure you have installed:
- Node.js (v18 or higher)
- Oracle Database (with properly configured DB Links for branches)
- MongoDB locally or via Atlas
- Redis server
- RabbitMQ server

### 2. Clone the repository
```bash
git clone [https://github.com/your-username/electricity-billing-system.git](https://github.com/your-username/electricity-billing-system.git)
cd electricity-billing-system
