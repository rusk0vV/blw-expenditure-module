const Overview = () => (
  <article className="overview-content" aria-label="Project Overview">
    <header className="overview-header">
      <h1>Expenditure Analysis Dashboard</h1>
      <p>Banaras Locomotive Works (BLW) | Ministry of Railways, Government of India</p>
    </header>

    <section className="panel" aria-labelledby="purpose-heading">
      <h2 id="purpose-heading" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.25rem', display: 'inline-block' }}>
        Purpose & Background
      </h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
        This module provides a centralized, data-driven interface for analyzing departmental expenditure at Banaras Locomotive Works, located in Varanasi, Uttar Pradesh. BLW is one of India's premier locomotive manufacturing units under Indian Railways, managing large-scale budgets across multiple critical departments.
      </p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        By replacing legacy, static spreadsheet reports with a dynamic, filterable dashboard, this application enables finance officers, department heads, and management to track, audit, and compare actual spends against budgeted allocations and leverage machine learning to anticipate upcoming budgetary requirements.
      </p>
    </section>

    <div className="overview-card-grid">
      <section className="overview-card" aria-labelledby="key-features-heading">
        <h3 id="key-features-heading">Key Features</h3>
        <ul>
          <li><strong>Aggregated Dashboard</strong>: Real-time summaries of total expenditure, average quarterly spending, and top departmental heads.</li>
          <li><strong>Synchronized Filters</strong>: Drill-down on expenditure insights by financial year, quarter, and specific budget allocation codes.</li>
          <li><strong>Data Visualizations</strong>: Dynamic interactive charting including quarterly bars, horizontal head rankings, and percentage distribution donuts.</li>
          <li><strong>Predictive Projections</strong>: Time-series forecasting running Random Forest Regressor models dynamically over raw historical coordinates.</li>
        </ul>
      </section>

      <section className="overview-card" aria-labelledby="data-source-heading">
        <h3 id="data-source-heading">Data Ingestion Contract</h3>
        <p>
          Data is sourced directly from Excel (.xlsx) workbooks exported by the Finance Department:
        </p>
        <ul>
          <li><strong>Purchase Orders</strong>: Raw PO details parsed and upserted using PO numbers as unique identifiers.</li>
          <li><strong>Bill Expenditure Data</strong>: Raw vouchers parsed and mapped using CO numbers as unique identifiers.</li>
          <li><strong>Summary Aggregation</strong>: Ingestion drops and rebuilds pre-aggregated summaries, immediately reflecting updates on the dashboard.</li>
        </ul>
      </section>
    </div>

    <section className="panel" aria-labelledby="tech-stack-heading">
      <h2 id="tech-stack-heading" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.25rem', display: 'inline-block' }}>
        Technology Stack
      </h2>
      <table className="tech-table">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Technology</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Frontend</strong></td>
            <td>React 18 + Vite</td>
            <td>Client UI application scaffolding</td>
          </tr>
          <tr>
            <td><strong>Charting</strong></td>
            <td>Recharts</td>
            <td>Interactive vector data visualizations</td>
          </tr>
          <tr>
            <td><strong>HTTP Client</strong></td>
            <td>Axios</td>
            <td>API routing communication</td>
          </tr>
          <tr>
            <td><strong>Backend</strong></td>
            <td>Node.js + Express</td>
            <td>REST API routing and Excel ingestion server</td>
          </tr>
          <tr>
            <td><strong>Database</strong></td>
            <td>MongoDB + Mongoose</td>
            <td>Document data persistence layer</td>
          </tr>
          <tr>
            <td><strong>Excel Processing</strong></td>
            <td>SheetJS (xlsx)</td>
            <td>Workbook parsing and extraction service</td>
          </tr>
          <tr>
            <td><strong>ML Microservice</strong></td>
            <td>Python + Flask</td>
            <td>Time-series regression forecasting API</td>
          </tr>
          <tr>
            <td><strong>ML Classifier</strong></td>
            <td>scikit-learn (RandomForest)</td>
            <td>Expenditure projection models</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer className="panel" style={{ textAlign: 'center', borderStyle: 'dashed' }} aria-label="Project Team Information">
      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
        Developed by interns: Ali, Vedansh, and Priyanshu [BLW IT Department — 2025–26]
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Banaras Locomotive Works, Varanasi, India | Ministry of Railways, Government of India
      </p>
    </footer>
  </article>
);

export default Overview;
