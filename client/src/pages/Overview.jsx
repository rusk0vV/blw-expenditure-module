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

    <section className="panel" aria-labelledby="faq-heading">
      <h2 id="faq-heading" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.25rem', display: 'inline-block' }}>
        Frequently Asked Questions & Troubleshooting
      </h2>
      <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        <div className="faq-item">
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            How do I ingest new expenditure workbooks?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Navigate to the <strong>Settings</strong> page, then drag and drop or select your Purchase Orders (<code>BLW_PurchaseOrders*.xlsx</code>) or Voucher Expenditure (<code>BLW_BillExpenditureData*.xlsx</code>) files. The application will parse, validate, and update the metrics in real time.
          </p>
        </div>

        <div className="faq-item">
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            What is a CO6 Claim and how does it differ from a Purchase Order (PO)?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            A <strong>Purchase Order (PO)</strong> represents an official financial commitment or contract sanctioned for procurement. A <strong>CO6 Claim</strong> is a vendor voucher/bill registered for actual payment disbursements against executed jobs or supplies.
          </p>
        </div>

        <div className="faq-item">
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            What does the forecasting "Confidence Level" mean?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            The machine learning engine assigns confidence based on variance metrics and continuous sequence availability. High confidence implies multiple years of continuous historical quarters without significant spending anomalies.
          </p>
        </div>

        <div className="faq-item">
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            What should I check if an Excel upload fails?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
            Ensure the Excel file retains its original columns (e.g., CO Number, Party Name, PO Number, Net Value). Modifying structure, headers, or saving as an incompatible CSV format will cause ingestion failures.
          </p>
        </div>
      </div>
    </section>

    <footer className="panel" style={{ textAlign: 'center', borderStyle: 'dashed' }} aria-label="Project Team Information">
      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
        Developed by: Ali Sayeed [BLW IT Department — 2025–26]
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Banaras Locomotive Works, Varanasi, India | Ministry of Railways, Government of India
      </p>
    </footer>
  </article>
);

export default Overview;
