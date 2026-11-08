import React, { useRef, useEffect, useState } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { ArrowDownCircle, RefreshCcw, Send } from "lucide-react";
import { apiEndpoint, axiosInstance, toThaiDate } from "@/helpers";
import axios from "axios";
import { convertToPDFClient, convertToPDFServer } from "@/helpers/convertToPDF";
import { useRouter } from "next/router";

const Certification = ({ courseTitle, user, date, isAdmin, item }: any) => {
  const [isClient, setIsClient] = useState(false);
  const certificationRef = useRef(null);
  const router = useRouter();
  const [apiLoading, setApiLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/get-settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadPDF = async () => {
    if (certificationRef.current && isClient) {
      const element = certificationRef.current as any;
      element.classList.remove("hidden");

      if (isAdmin) {
        setApiLoading(true);
        try {
          const pdfBlob = await convertToPDFServer(
            element,
            "certification.pdf"
          );
          element.classList.add("hidden");

          const formData = new FormData();
          formData.append("file", pdfBlob, "certification.pdf");
          formData.append("toEmail", item?.users?.email);
          formData.append("toName", item?.users?.name);
          formData.append("courseName", item?.lessions?.title);
          formData.append("fromCompany", settings?.siteTitle);
          formData.append("fromEmail", settings?.email);
          formData.append("key", settings?.key);

          await axios.post(`${apiEndpoint}/email`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          await axiosInstance.patch(
            `${apiEndpoint}/api/v1/course/log/${item?.id}`,
            {
              isSendCertification: 1,
            }
          );

          alert(
            "สำเร็จ ส่งใบประกาศนียบัตรให้กับผู้ใช้งานในอีเมลที่ท่านเลือกเรียบร้อยแล้ว อาจจะใช้เวลาประมาน 1 - 2 นาทีในการแจ้งเตือนอีเมลผู้ใช้งาน"
          );
          router.reload();
        } catch (error) {
          setApiLoading(false);
          console.error("Error sending PDF to server:", error);
        }
      } else {
        await convertToPDFClient(element, "certification.pdf");
        element.classList.add("hidden");
      }
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={`flex flex-col`}>
      <div className={`flex justify-center`}>
        <div
          ref={certificationRef}
          className="relative shadow-medium overflow-hidden max-h-[210mm] hidden"
        >
          <img
            src="/images/certification.png"
            style={{ width: "100%", height: "100%" }}
          />

          <div className="absolute w-full h-full text-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col justify-between p-40 text-center items-center text-black">
            <span className="text-3xl font-bold mt-10">
              {settings?.siteTitle}
            </span>

            <div className="flex flex-col text-center gap-2 sm:gap-5 ">
              <span className="opacity-75">
                ขอมอบใบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า
              </span>
              <span className="text-3xl font-bold">
                {isAdmin ? item?.users?.name : user}
              </span>
            </div>

            <div className="flex flex-col text-center gap-2 opacity-75 w-[80%]">
              <span>
                ได้สำเร็จการเรียนรู้{" "}
                {isAdmin ? item?.lessions?.title : courseTitle}
              </span>
              <span>
                ให้ ณ วันที่ {toThaiDate(isAdmin ? item?.createdAt : date)}
              </span>
            </div>
            <div className="flex items-end w-full justify-end">
              <div className="flex flex-col text-center gap-2 sm:gap-5 ">
                <span>
                  {settings?.certificationApprove ||
                    "______________________________________"}
                </span>
                <span className="opacity-75">
                  {settings?.certificationApprovePosition
                    ? `(${settings?.certificationApprovePosition})`
                    : "(___________________________)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex justify-center`}>
        {isAdmin && (
          <Tooltip
            content={
              item?.status === "complete" && item?.isSendCertification
                ? "ส่งมอบอีกครั้ง"
                : "ส่งมอบในอีเมล"
            }
          >
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={apiLoading}
              onClick={handleDownloadPDF}
            >
              {item?.status === "complete" && !item?.isSendCertification && (
                <Send className=" hover:scale-110 cursor-pointer text-default-400 active:opacity-50" />
              )}

              {item?.status === "complete" && item?.isSendCertification && (
                <RefreshCcw className=" hover:scale-110 cursor-pointer text-default-400 active:opacity-50" />
              )}
            </Button>
          </Tooltip>
        )}

        {!isAdmin && (
          <Button
            onClick={handleDownloadPDF}
            startContent={<ArrowDownCircle />}
            className="bg-main text-white w-fit"
          >
            ดาว์นโหลดใบประกาศนียบัตร
          </Button>
        )}
      </div>
    </div>
  );
};

export default Certification;
