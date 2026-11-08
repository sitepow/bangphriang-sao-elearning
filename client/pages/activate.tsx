import ErrorNotification from "@/components/ErrorNotification";
import Layout from "@/components/Layout";
import { apiEndpoint, axiosInstance, getAuth } from "@/helpers";
import { getCookie, setCookie } from "cookies-next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Activate() {
  const [settings, setSettings] = useState<any>(null);
  const router = useRouter();
  const [auth, setAuth] = useState<any>(null);
  const { email, key } = router.query;
  const [verifyStatus, setVerifyStatus] = useState<any>();

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const apiVerifyEmail = async () => {
    try {
      const { data } = await axiosInstance.patch(
        `${apiEndpoint}/api/v1/auth/verifyCode`,
        {
          email,
          verifyCode: key,
        }
      );

      setVerifyStatus(data?.status);

      if (data?.status == "valid") {
        const newToken = await axiosInstance.post(
          `${apiEndpoint}/api/v1/auth/refreshToken`,
          {
            token: auth?.refreshToken,
          }
        );

        const authCookie = JSON.parse(getCookie("auth") as any);
        setCookie("auth", {
          ...authCookie,
          accessToken: newToken?.data?.accessToken,
        });

        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (error) {
      setVerifyStatus("invalid");
      console.log(error);
    }
  };

  useEffect(() => {
    apiVerifyEmail();
  }, [email, key]);

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

  return (
    <Layout>
      <NextSeo
        title={`ยืนยันที่อยู่อีเมล - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      {verifyStatus == "invalid" && (
        <ErrorNotification isError>
          เกิดข้อผิดพลาด ไม่สามารถยืนยันอีเมลนี้ได้
          คีย์ลับจากอีเมลไม่ถูกต้องหรือมีข้อผิดพลาดจากเซิฟเวอร์
          โปรดลองใหม่อีกครั้ง
        </ErrorNotification>
      )}

      {verifyStatus == "valid" && (
        <ErrorNotification isSuccess>
          ยืนยันที่อยู่อีเมลสำเร็จแล้ว ระบบกำลังพาท่านไปยังหน้าแรกของเว็บไซต์
        </ErrorNotification>
      )}
    </Layout>
  );
}
