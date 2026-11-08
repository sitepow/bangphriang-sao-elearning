import { useEffect, useState } from "react";
import {
  convertTimestamp,
  truncateText,
  axiosInstance,
  getAuth,
  apiEndpoint,
} from "@/helpers";
import { useRouter } from "next/router";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Pagination,
  Avatar,
  AvatarGroup,
} from "@nextui-org/react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import React from "react";
import { NextSeo } from "next-seo";
import Certification from "@/components/Certification";

export default function CertificationPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any>();
  const [auth, setAuth] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    setAuth(getAuth());
    apiGetCourseLogs(currentPage);
  }, []);

  useEffect(() => {
    if (auth?.role == "admin") {
      router.push("/admin");
    }
  }, [router, auth]);

  const apiGetCourseLogs = async (page?: any) => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/log/certification?page=${
          page || currentPage
        }`
      );

      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout isAdmin>
      <NextSeo
        title={`มอบใบประกาศนียบัตร - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      <Header label={"มอบใบประกาศนียบัตร"} />

      <Table>
        <TableHeader>
          <TableColumn>รูปภาพ</TableColumn>
          <TableColumn>ชื่อบทเรียน</TableColumn>
          <TableColumn>ชื่อผู้เรียน</TableColumn>
          <TableColumn>อีเมลผู้เรียน</TableColumn>
          <TableColumn>สถานะบทเรียน</TableColumn>
          <TableColumn>สถานะการมอบใบประกาศนียบัตร</TableColumn>
          <TableColumn>วันที่เข้าเรียน</TableColumn>
          <TableColumn>
            <span>เมนูจัดการ</span>
          </TableColumn>
        </TableHeader>
        <TableBody className={`divide-y`}>
          {users?.data?.map((item: any, index: any) => {
            return (
              <TableRow key={index}>
                <TableCell>
                  <AvatarGroup>
                    <Avatar
                      src={
                        item?.lessions?.imagePath
                          ? `${apiEndpoint}/images/${item?.lessions?.imagePath}`
                          : "/images/no-image.jpg"
                      }
                      alt="content-image"
                    />
                    <Avatar
                      src={
                        item?.users?.imagePath
                          ? `${apiEndpoint}/images/${item?.users?.imagePath}`
                          : "/images/no-image.jpg"
                      }
                      alt="content-image"
                    />
                  </AvatarGroup>
                </TableCell>
                <TableCell className="min-w-52 xl:min-w-40">
                  {truncateText(item?.lessions?.title, 85)}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item?.users?.name ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item?.users?.email ?? "-"}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.status === "complete" ? (
                    <Chip color="success" size="sm" variant="flat">
                      สำเร็จการศึกษาแล้ว
                    </Chip>
                  ) : item.status === "unComplete" ? (
                    <Chip color="danger" size="sm" variant="flat">
                      ไม่ผ่านการศึกษา
                    </Chip>
                  ) : (
                    <Chip color="warning" size="sm" variant="flat">
                      กำลังดำเนินการ
                    </Chip>
                  )}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {item.status === "unComplete" ? (
                    <Chip color="danger" size="sm" variant="flat">
                      ไม่สามารถส่งมอบได้
                    </Chip>
                  ) : item.isSendCertification ? (
                    <Chip color="success" size="sm" variant="flat">
                      ส่งมอบเรียบร้อยแล้ว
                    </Chip>
                  ) : (
                    <Chip color="warning" size="sm" variant="flat">
                      ยังไม่ได้รับการส่งมอบ
                    </Chip>
                  )}
                </TableCell>
                <TableCell className="min-w-40 xl:min-w-32">
                  {convertTimestamp(item.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    {item.status == "complete" && (
                      <Certification isAdmin item={item} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-end">
        <Pagination
          showControls
          total={users?.allPages}
          initialPage={1}
          onChange={async (e) => {
            setCurrentPage(e);
            await apiGetCourseLogs(e);
          }}
        />
      </div>
    </Layout>
  );
}
