const stats = [
  { value: "22+", label: "Years of Experience" },
  { value: "5000+", label: "Students Trained" },
  { value: "90%", label: "Confidence Improvement" },
  { value: "100%", label: "Practical Sessions" },
];

const SocialStats = () => {
  return (
    <section className="bg-[var(--surface-elevated)] py-16 border-y border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="border border-[var(--border-subtle)] bg-[var(--surface)] rounded-2xl px-8 py-7 text-center"
          >
            <h2 className="text-[var(--text-primary)] text-4xl font-bold">{item.value}</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-2">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialStats;
