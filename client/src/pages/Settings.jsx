import UploadCard from '../components/UploadCard';
import { useTheme } from '../context/ThemeContext.jsx';

const Settings = () => {
  const { theme, setTheme, currencyMode, setCurrencyMode } = useTheme();

  return (
    <div className="settings-content" aria-label="Settings Page">
      <h1 className="settings-heading">Application Configuration Settings</h1>

      <section className="panel" aria-labelledby="theme-settings-heading">
        <div className="panel-heading">
          <h2 id="theme-settings-heading">Visual Theme</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Configure the interface coloration system. Government Blue employs the official BLW colors.
        </p>
        <div className="theme-options">
          <button
            type="button"
            className={`theme-btn theme-btn-light ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Light Theme
          </button>
          <button
            type="button"
            className={`theme-btn theme-btn-dark ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Dark Slate Theme
          </button>
          <button
            type="button"
            className={`theme-btn theme-btn-gov-blue ${theme === 'gov-blue' ? 'active' : ''}`}
            onClick={() => setTheme('gov-blue')}
          >
            Government Blue
          </button>
        </div>
      </section>

      <section className="panel" aria-labelledby="currency-settings-heading">
        <div className="panel-heading">
          <h2 id="currency-settings-heading">Currency Denominator Mode</h2>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Choose whether to display values using the currency glyph or standard INR code text.
        </p>
        <div className="currency-options">
          <button
            type="button"
            className={`currency-btn ${currencyMode === 'symbol' ? 'active' : ''}`}
            onClick={() => setCurrencyMode('symbol')}
          >
            Symbol Mode (₹)
          </button>
          <button
            type="button"
            className={`currency-btn ${currencyMode === 'code' ? 'active' : ''}`}
            onClick={() => setCurrencyMode('code')}
          >
            ISO Code Mode (INR)
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
        <UploadCard kind="po" title="Purchase Orders Workbook Ingestion (BLW_PurchaseOrders*.xlsx)" />
        <UploadCard kind="bill" title="Voucher Expenditures Workbook Ingestion (BLW_BillExpenditureData*.xlsx)" />
      </div>
    </div>
  );
};

export default Settings;
