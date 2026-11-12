import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";

import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumain" },
    { name: "description", content: "Your dream job at your door step!!" },
  ];
}

const onboardingSteps = [
  {
    step: "01",
    title: "Upload Your Resume",
    subtitle: "Start with your story.",
    description:
      "Upload your existing resume in PDF format and let our platform extract your professional information to get started.",
    points: [
      "Upload your resume in PDF format.",
      "Extract skills, education and experience.",
      "Prepare your profile for AI analysis.",
    ],
    icon: (
      <>
        <path d="M7 3.75h7l5 5v11.5A1.75 1.75 0 0 1 17.25 22h-10A1.75 1.75 0 0 1 5.5 20.25V5.5A1.75 1.75 0 0 1 7.25 3.75Z" />
        <path d="M14 4v5h5M8.5 14l2.25 2.25L15.5 11.5" />
      </>
    ),
  },
  {
    step: "02",
    title: "AI-Powered Analysis",
    subtitle: "Let AI understand your potential.",
    description:
      "Powered by Puter AI, our analyzer evaluates your resume, identifies strengths and weaknesses, and generates personalized feedback based on your career goals.",
    points: [
      "Analyze resume content and structure.",
      "Identify missing skills and weak sections.",
      "Generate intelligent, personalized feedback.",
    ],
    icon: (
      <>
        <path d="M12 3.5a4 4 0 0 0-7.5 1.9A4.5 4.5 0 0 0 5 14a4 4 0 0 0 7 2.5V3.5Z" />
        <path d="M12 3.5a4 4 0 0 1 7.5 1.9A4.5 4.5 0 0 1 19 14a4 4 0 0 1-7 2.5M12 7v14m-3-7 3-2 3 2" />
        <path d="m3 10-1.5 1m20-1 1.5 1M7 2 6 1m11 1 1-1" />
      </>
    ),
  },
  {
    step: "03",
    title: "Your Personalized Report",
    subtitle: "Turn insights into opportunities.",
    description:
      "Get a detailed report with actionable suggestions to improve your resume, strengthen your skills and become a stronger candidate for your dream role.",
    points: [
      "Discover your resume's strengths and weaknesses.",
      "Identify areas that need improvement.",
      "Get actionable recommendations to stand out.",
    ],
    icon: (
      <>
        <path d="M4 19V5m0 14h16" />
        <path d="m7 15 4-4 3 2 5-6" />
        <path d="M15.5 7H19v3.5" />
      </>
    ),
  },
];

export default function Home() {
  const { auth, kv } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const paresedResumes = resumes?.map((resume) => {
        return JSON.parse(resume.value) as Resume;
      });
      console.log("paresed resume "+ paresedResumes);
      setResumes(paresedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  } , []);
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col items-center justify-center">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="text-gradient">Get your next dream role</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2> Upload your  resume to get started.</h2>
          ) : (
             <h2>Review your submissions and check AI-powered feedback</h2>
          )}
        {loadingResumes && (
          <div className="flex flex-col item-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
            </div>
        )} 
        </div>
        {!loadingResumes && resumes.length === 0 && (
          <section className="onboarding-steps" aria-label="How it works">
            {onboardingSteps.map((step) => (
              <article className="onboarding-card" key={step.step}>
                <div className="onboarding-card-heading">
                  <span className="onboarding-step-number">{step.step}</span>
                  <h3>{step.title}</h3>
                </div>
                <div className="onboarding-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    {step.icon}
                  </svg>
                </div>
                <div className="onboarding-card-copy">
                  <h4>{step.subtitle}</h4>
                  <p>{step.description}</p>
                  <ul>
                    {step.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </section>
        )}
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">Start your analysis here</Link>
          </div>
        )}
      </section>
    </main>
  );
}
