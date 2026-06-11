const StatCard = ({ label, value, sub }) => (
  <section className="stat-card">
    <span>{label}</span>
    <strong>{value}</strong>
    {sub ? <small>{sub}</small> : null}
  </section>
);

export default StatCard;
