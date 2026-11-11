import {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import { Navigate, useNavigate } from 'react-router';

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;

    if (error && typeof error === "object") {
        const details = error as {message?: unknown; error?: unknown};
        if (typeof details.message === "string") return details.message;
        if (typeof details.error === "string") return details.error;
        if (details.error && typeof details.error === "object") {
            const nestedError = details.error as {message?: unknown};
            if (typeof nestedError.message === "string") return nestedError.message;
        }
    }

    return "Unknown error returned by Puter";
};

const Upload = () => {
    const {fs, ai, kv} = usePuterStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();
    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: {
        companyName: string,
        jobTitle: string,
        jobDescription: string,
        file: File
    }) => {
        setIsProcessing(true);
        setStatusText("Uploading your resume...");

        try {
            const uploadFile = await fs.upload([file]);
            if (!uploadFile) {
                throw new Error("Failed to upload the resume");
            }

            setStatusText("Converting your resume...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                throw new Error(imageFile.error ?? "Failed to create a resume preview");
            }

            setStatusText("Uploading your resume preview...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) {
                throw new Error("Failed to upload the resume preview");
            }

            setStatusText("Sending your resume and job details...");
            const response = await ai.feedback(
                uploadFile.path,
                prepareInstructions({companyName, jobTitle, jobDescription})
            );

            if (!response) {
                throw new Error("Fetch failed.");
            }

            const content = response.message.content;
            const feedbackText = typeof content === "string"
                ? content
                : content
                    .map((part) => typeof part === "string" ? part : part.text ?? "")
                    .join("")
                    .trim();
            const feedbackData = JSON.parse(feedbackText) as Feedback;
            if (typeof feedbackData.overallScore !== "number") {
                throw new Error("Error: Try again");
            }

            const data: Resume = {
                id: generateUUID(),
                resumePath: uploadFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                feedback: feedbackData,
            };

            const saved = await kv.set(`resume:${data.id}`, JSON.stringify({
                ...data,
                jobDescription,
            }));
            if (!saved) {
                throw new Error("Failed to save the analysis.");
            }

            setStatusText("Analysis completed successfully. redirecting...");
            // console.log(data);
            navigate(`/resume/${data.id}`);
        } catch (error) {
            setStatusText(`Analysis failed: ${getErrorMessage(error)}`);
        } finally {
            setIsProcessing(false);
        }

    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const companyName = String(formData.get("company-name") ?? "").trim();
        const jobTitle = String(formData.get("job-title") ?? "").trim();
        const jobDescription = String(formData.get("job-description") ?? "").trim();

        if (!file) {
            setStatusText("Select a PDF resume before analyzing.");
            return;
        }

        setStatusText("");
        void handleAnalyze({companyName, jobTitle, jobDescription, file});
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar/>
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream role</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="Analyzing resume"/>
                        </>
                    ) : (
                        <>
                            <h2>Drop your resume for ATS score and AI analysis.</h2>
                            {statusText && <p role="status">{statusText}</p>}
                        </>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" className="flex flex-col gap-4 mt-8" onSubmit={handleSubmit}>
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Google" id="company-name"></input>
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Ex.Software Devloper"
                                       id="job-title"></input>
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea name="job-description"
                                          placeholder="We are seeking a dynamic and experienced software devloper to join our devlopment team at Google. . ."
                                          id="job-description"></textarea>
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>
                            <button type="submit" className="primary-button">Analyze Resume</button>

                        </form>
                    )}
                </div>
            </section>
        </main>
    );



};

export default Upload;