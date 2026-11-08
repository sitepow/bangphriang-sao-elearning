import React, { useState } from "react";
import { FileVideo } from "lucide-react";

export default function UploadVideo({ setVideoPathFile, label }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [videoDragging, setDragging] = useState(false);
  const [videoError, setVideoError] = useState("");

  const validateFile = (file: File) => {
    const validTypes = ["video/mp4", "video/mkv", "video/avi", "video/mov"];
    if (validTypes.includes(file.type)) {
      return true;
    } else {
      setVideoError("Invalid file type. Please select a video file.");
      return false;
    }
  };

  const onFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setPreview(URL.createObjectURL(file));

      setVideoPathFile(file);
      setVideoError("");
    } else {
      event.target.value = "";
    }
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setPreview(URL.createObjectURL(file));

      setVideoPathFile(file);
      setVideoError("");
    } else {
      setVideoError("Invalid file type. Please select a video file.");
    }
  };

  return (
    <div className="w-full">
      {/* {label && <span>{label}</span>} */}
      {preview && (
        <video
          src={preview}
          controls
          className="h-96 w-full object-cover mb-4 rounded-large"
        />
      )}
      <div
        className={`flex w-full items-center justify-center ${
          videoDragging ? "border-main" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          htmlFor="dropzone-file"
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-dashed border-2 dark:border-dark"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <FileVideo size={35} className="opacity-50" />
            <p className="mt-5 text-sm">คลิกเพื่ออัปโหลด{label}หรือลากและวาง</p>
            <p className="text-xs">(สูงสุดขนาดไฟล์ 50 GB)</p>
            {videoError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {videoError}
              </p>
            )}
          </div>
          <input
            type="file"
            id="dropzone-file"
            className="hidden"
            accept="video/*"
            onChange={onFileChange}
          />
        </label>
      </div>
    </div>
  );
}
