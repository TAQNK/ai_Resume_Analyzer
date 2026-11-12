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
          <h1>Get your next dream role</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resume found . Upload your new resume to get started.</h2>
          ) : (
             <h2>Review your submissions and check AI-powered feedback</h2>
          )}
        {loadingResumes && (
          <div className="flex flex-col item-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
            </div>
        )} 
        </div>
        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">Upload Resume</Link>
          </div>
        )}
      </section>
    </main>
  );
}
