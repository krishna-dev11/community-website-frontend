const stats = [
  { value: "22+", label: "Years of Experience" },
  { value: "5000+", label: "Students Trained" },
  { value: "90%", label: "Confidence Improvement" },
  { value: "100%", label: "Practical Sessions" },
];

const SocialStats = () => {
  return (
    <section className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div
            key={item.label}
            className="border border-white/10 bg-white/[0.03] rounded-2xl px-8 py-7 text-center"
          >
            <h2 className="text-white text-4xl font-bold">{item.value}</h2>
            <p className="text-gray-400 text-sm mt-2">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialStats;
