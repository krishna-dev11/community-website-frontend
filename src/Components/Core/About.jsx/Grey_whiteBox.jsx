import { Link } from 'react-router-dom'
import Hieghlightedtext from '../Home/Hieghlightedtext'

const academyFeatures = [
  {
    id: 1,
    heading1: "Convenient Batches for",
    heading2: "Every Schedule",
    description: "Morning and evening batches are available so students and professionals can learn without disturbing their daily routine.",
    btnText: "View Batches",
    link: "/courses"
  },
  {
    id: 2,
    heading1: "Daily Speaking",
    heading2: "Practice",
    description: "Students participate in daily conversation sessions to remove hesitation and build confidence."
  },
  {
    id: 3,
    heading1: "Interview &",
    heading2: "Personality Training",
    description: "Special sessions for interview preparation, group discussion, and personality development."
  },
  {
    id: 4,
    heading1: "Language Lab",
    heading2: "Learning",
    description: "Audio-visual language lab sessions to improve pronunciation and listening skills."
  }
];

const Grey_whiteBox = () => {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {academyFeatures.map((item) => (
          item.id === 1 ? (
            <div className="lg:col-span-2 flex flex-col justify-center p-6 md:p-8" key={item.id}>
              <h3 className="text-[var(--text-primary)] text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                {item.heading1} <br/>
                <Hieghlightedtext data={item.heading2} color="text-gradient" />
              </h3>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-8 max-w-md font-normal">{item.description}</p>
              <Link to={item.link}>
                <button className="btn-primary">
                  {item.btnText}
                </button>
              </Link>
            </div>
          ) : (
            <div key={item.id} className="ka-card p-8 rounded-[2.2rem] flex flex-col justify-between group">
              <div>
                <div className="mb-6">
                  <p className="text-[var(--text-primary)] text-lg sm:text-xl font-bold tracking-tight">{item.heading1}</p>
                  <p className="text-[var(--accent-primary)] text-lg sm:text-xl font-bold tracking-tight">{item.heading2}</p>
                </div>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed group-hover:text-[var(--text-primary)] transition-colors">
                  {item.description}
                </p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export default Grey_whiteBox