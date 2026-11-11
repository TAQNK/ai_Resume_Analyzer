
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
}

const formatSize = (bytes: number): string => {
    const units = ["KB", "MB", "GB"];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const selectedFile = acceptedFiles[0] ?? null;

            setFile(selectedFile);
            onFileSelect(selectedFile);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxSize: 5 * 1024 * 1024,
    });

    const handleRemove = () => {
        setFile(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full gradient-border">
            {file ? (
                // Selected-file section is outside the dropzone.
                <div className="uploader-selected-file">
                    <img
                        src="/images/pdf.png"
                        className="size-10"
                        alt="PDF file"
                    />

                    <div className="flex items-center space-x-3">
                        <div>
                            <p className="text-sm font-medium truncate max-w-xs text-gray-700">
                                {file.name}
                            </p>

                            <p className="text-sm text-gray-500">
                                {formatSize(file.size)}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="p-2 cursor-pointer"
                        aria-label="Remove selected file"
                        onClick={handleRemove}
                    >
                        <img
                            src="/icons/cross.svg"
                            alt=""
                            className="w-4 h-4"
                        />
                    </button>
                </div>
            ) : (
                // Click or drag a file into this section.
                <div {...getRootProps()}>
                    <input {...getInputProps()} />

                    <div className="space-y-4 cursor-pointer">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                            <img
                                src="/icons/info.svg"
                                alt="Upload"
                                className="size-20"
                            />
                        </div>

                        <p className="text-lg text-gray-500">
                            <span className="font-semibold">
                                {isDragActive
                                    ? "Drop your PDF here"
                                    : "Click to upload"}
                            </span>
                            {!isDragActive && " or drag and drop"}
                        </p>

                        <p className="text-lg text-gray-500">
                            PDF (max 5MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
