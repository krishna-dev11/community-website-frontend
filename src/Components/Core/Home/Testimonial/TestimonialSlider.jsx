const testimonials = [
  {
    name: "Bold Voice Student",
    message:
      "The practical speaking sessions helped me become more confident in interviews and daily conversations.",
  },
  {
    name: "Working Professional",
    message:
      "The training is simple, consistent, and focused on real communication instead of only grammar.",
  },
  {
    name: "College Learner",
    message:
      "I improved my fluency through regular practice, mentoring, and confidence-building activities.",
  },
];

const TestimonialSlider = () => {
  return (
    <section className="bg-black py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <p className="text-gray-300 text-sm leading-6">{testimonial.message}</p>
            <h3 className="text-white font-semibold mt-5">{testimonial.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSlider;
