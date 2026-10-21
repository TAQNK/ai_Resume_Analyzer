import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import {resumes} from "../../constants";
import ResumeCard from "~/components/ResumeCard";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumain" },
    { name: "description", content: "Your dream job at your door step!!" },
  ];
}

export default function Home() {
  return (

      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Get your next dream role</h1>
            <h2>Review your submissions and check AI-powered feedback</h2>
          </div>
            {resumes.length > 0 && (
                <div className="resumes-section">
                    {resumes.map((resume) =>(
                        <ResumeCard key={resume.id} resume={resume}/>
                    ))}
                </div>

            )}
        </section>



      </main>
  );
}
