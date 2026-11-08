import React, { useEffect, useState } from "react";
import { FileImage } from "lucide-react";

export default function UploadImage({
  setImagePathFile,
  clearPreview,
  label,
}: any) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageDragging, setImageDragging] = useState(false);
  const [imageError, setImageError] = useState("");
  const uniqueId = `dropzone-file-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (clearPreview) {
      setImagePreview(null);
    }
  }, [clearPreview]);

  const validateFile = (file: File) => {
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (validTypes.includes(file.type)) {
      return true;
    } else {
      setImageError("Invalid file type. Please select a images file.");
      return false;
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader() as any;
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImagePathFile(file);
      setImageError("");
    } else {
      event.target.value = null;
    }
  };

  const handleDragOver = (event: any) => {
    event.preventDefault();
    setImageDragging(true);
  };

  const handleDragLeave = () => {
    setImageDragging(false);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    setImageDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && validateFile(file)) {
      const reader = new FileReader() as any;
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setImagePathFile(file);
      setImageError("");
    } else {
      setImageError("Invalid file type. Please select a images file.");
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* <div className="flex justify-start w-full">
        {label && <span>{label}</span>}
      </div> */}

      {imagePreview && (
        <img
          width={150}
          height={150}
          src={imagePreview}
          className="h-96 w-full object-cover mb-4 rounded-large shadow-medium"
        />
      )}

      <div
        className={`flex w-full items-center justify-center ${
          imageDragging ? "border-main" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label
          htmlFor={uniqueId}
          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-dashed border-2 dark:border-dark"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <FileImage size={35} className="opacity-50" />
            <p className="text-sm mt-5">คลิกเพื่ออัปโหลด{label}หรือลากและวาง</p>
            <p className="text-xs">(สูงสุดขนาดไฟล์ 50 MB)</p>
            {imageError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {imageError}
              </p>
            )}
          </div>
          <input
            id={uniqueId}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
