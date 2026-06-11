export const LoadingBlock = () => <div className="skeleton" aria-label="Loading" />;

export const ErrorBanner = ({ message }) => (
  <div className="error-banner" role="alert">
    {message || 'Something went wrong while loading this section.'}
  </div>
);

export const EmptyState = () => (
  <div className="empty-state">No data available for the selected filters.</div>
);
