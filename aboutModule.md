# aboutModule.md — BLW Expenditure Analysis Module

---

## Module Name

**Expenditure Analysis Dashboard**
Banaras Locomotive Works (BLW) | Ministry of Railways, Government of India

---

## Purpose

This module provides a centralized, data-driven interface for analyzing departmental expenditure at BLW. It enables finance officers, department heads, and management to:

- Track total and head-wise expenditure across quarters and financial years
- Identify the highest spending departments at a glance
- Visualize spending patterns through interactive charts
- Forecast next-quarter expenditure using machine learning models
- Compare actual expenditure against budgeted allocations

The dashboard replaces manual Excel-based reporting with an automated, visual, and filterable interface.

---

## Background

Banaras Locomotive Works, located in Varanasi, Uttar Pradesh, is one of India's premier locomotive manufacturing units under Indian Railways. The institution manages large-scale departmental budgets across heads such as Infrastructure, Salaries, Materials, Maintenance, and Operations.

Historically, expenditure tracking has relied on static Excel reports shared across departments. This module digitizes that workflow, providing a single source of truth that can be updated by uploading revised Excel sheets at any time.

---

## Data Source

All expenditure data is sourced from official Excel (.xlsx) sheets maintained by the Finance Department at BLW. These sheets contain:

- Financial Year and Quarter
- Head Code and Head Name (budget classification)
- Actual Amount Spent (₹)
- Budget Allocated (₹)

Data is ingested into the system via the **Settings > Upload Data** feature. The system processes uploaded files, maps them to the database schema, and immediately reflects updated values across all dashboard views.

---

## Key Features

### Dashboard
The landing page provides an at-a-glance summary of expenditure metrics. Filters allow drill-down by Year, Quarter, and Head Code, dynamically updating all charts and stat cards simultaneously.

### Stat Cards
Four headline metrics are displayed prominently:
- **Total Expenditure** — sum of all amounts for the selected filter
- **Highest Spending Head** — the budget head with maximum expenditure
- **Average Quarterly Expenditure** — total ÷ number of distinct quarters
- **Total Budget Heads** — count of distinct head codes in the dataset

### Charts
Three visualization panels provide graphical insight:
- **Quarterly Expenditure** — bar chart comparing spend across quarters
- **Head-wise Expenditure** — horizontal bar chart ranking departments by spend
- **Expenditure Distribution** — donut chart showing each head's percentage share

### Expenditure Forecast
A machine learning model (Random Forest Regressor) trained on historical quarterly data predicts the expected expenditure for the next quarter. It also computes the quarter-over-quarter growth rate. This section helps management anticipate budgetary needs in advance.

### Overview Page
A static informational page describing the module, its data sources, technology stack, and contact information for the intern/maintainer.

### Settings Page
Allows customization of:
- **Theme** — Light, Dark, or Government Blue (BLW official colors)
- **Currency Display** — ₹ symbol or "INR" text
- **Data Upload** — Upload new or revised Excel sheets to refresh the dataset

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React (Vite) | UI framework |
| Charting | Recharts | Data visualizations |
| Routing | React Router v6 | Page navigation |
| HTTP Client | Axios | API communication |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Data persistence |
| Excel Parsing | xlsx (SheetJS) | Data ingestion from .xlsx files |
| Forecasting | Python + Flask | ML microservice |
| ML Model | scikit-learn (RandomForestRegressor) | Expenditure prediction |

---

## Module Scope (What It Does NOT Do)

This module is analytical and read-oriented. It does not:
- Create or modify financial records directly (only ingest from Excel)
- Integrate with live SAP or IPSAS accounting systems
- Handle user authentication or role-based access (out of scope for this internship project)
- Process non-expenditure data (procurement, payroll, etc.)

---

## Internship Context

This module was developed as part of an internship project at BLW. It is a prototype intended to demonstrate the feasibility of a digital expenditure analysis interface. The codebase follows standard MERN stack conventions and is structured for handoff to BLW's IT department for further development and potential production deployment.

---

## Maintainer

Developed by: Ali, Vedansh, Priyanshu [Interns, BLW — 2025–26]
Stack: MERN + Python/Flask
Project Type: Internal Tool / Internship Project
Institution: Banaras Locomotive Works, Varanasi
Ministry: Ministry of Railways, Government of India
