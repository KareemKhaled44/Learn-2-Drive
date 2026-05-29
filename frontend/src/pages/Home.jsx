import { Hero, PopularAcademies, Courses, Trainers, FAQs} from '../exports/index.js';

export default function Home() {
  return (
    <>
      <div className="relative font-[Inter] overflow-x-hidden min-h-screen bg-gradient-to-br from-[#22d3ee] via-[#1e3a8a] to-[#1e40af]">
        {/* overlay */}
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10 ">
          <div id="home">
            <Hero />
          </div>
          <div id="academies">
            <PopularAcademies />
          </div>
          <div id="courses">
            <Courses />
          </div>
          <div id="trainers">
            <Trainers />
          </div>
          <div id="faqs">
            <FAQs />
          </div>
        </div>
      </div>
    </>
  );
}