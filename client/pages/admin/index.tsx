import SumCard from "@/components/SumCard";
import Layout from "@/components/Layout";
import {
  Book,
  CircleCheck,
  CircleX,
  FilePieChart,
  GraduationCap,
  User,
  UserCog2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiEndpoint, axiosInstance, convertDateToThai } from "@/helpers";
import { NextSeo } from "next-seo";
import Header from "@/components/Header";
import {
  Button,
  Card,
  DateRangePicker,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { errorRequire } from "@/helpers/regex";
import axios from "axios";

export default function AdminIndex() {
  const [sumCard, setSumCard] = useState<any>();
  const [courseDropdown, setCourseDropdown] = useState<any>();
  const [courseDateRange, setCourseDateRange] = useState<any>({
    start: null,
    end: null,
  });

  const [userDateRange, setUserDateRange] = useState<any>({
    start: null,
    end: null,
  });

  const [courseLogDateRange, setCourseLogDateRange] = useState<any>({
    start: null,
    end: null,
  });

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

  const exportToXLSX = (data: any[], title: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses");
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const {
    register: registerCourseReport,
    handleSubmit: handleSubmitCourseReport,
  } = useForm();

  const { register: registerUserReport, handleSubmit: handleSubmitUserReport } =
    useForm();

  const {
    register: registerCourseLogReport,
    handleSubmit: handleSubmitCourseLogReport,
    formState: { errors: errorsCourseLogReport },
  } = useForm();

  const apiGetCourseDropdown = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/course/log/dropdown`
      );

      setCourseDropdown(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiGetSumCard = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/user/sum/dashboard`
      );

      setSumCard(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    apiGetSumCard();
    apiGetCourseDropdown();
  }, []);

  return (
    <Layout isAdmin>
      <NextSeo
        title={`ภาพรวม - ${settings?.siteTitle}`}
        description={settings?.siteTitle}
      />

      <Header label={"สรุปภาพรวมของเว็บไซต์"} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5 ">
        <SumCard
          label={"สมาชิกทั้งหมด"}
          value={sumCard?.userTotal}
          icon={Users}
          suffix={"คน"}
        />
        <SumCard
          label={"ผู้ใช้งาน"}
          value={sumCard?.notAdminTotal}
          icon={User}
          suffix={"คน"}
        />
        <SumCard
          label={"ผู้ดูแลระบบ"}
          value={sumCard?.adminTotal}
          icon={UserCog2}
          suffix={"คน"}
        />
        <SumCard
          label={"ผู้ใช้งานที่ยังเปิดการใช้งานอยู่"}
          value={sumCard?.userActiveTotal}
          icon={CircleCheck}
          suffix={"คน"}
        />
        <SumCard
          label={"ผู้ใช้งานที่ปิดการใช้งาน"}
          value={sumCard?.userDeactiveTotal}
          icon={CircleX}
          suffix={"คน"}
        />
        <SumCard
          label={"บทเรียน"}
          value={sumCard?.courseTotal}
          icon={GraduationCap}
          suffix={"รายการ"}
        />
        <SumCard
          label={"บทเรียนที่ยังเปิดการใช้งานอยู่"}
          value={sumCard?.courseActiveTotal}
          icon={CircleCheck}
          suffix={"รายการ"}
        />
        <SumCard
          label={"บทเรียนที่ปิดการใช้งาน"}
          value={sumCard?.courseDeactiveTotal}
          icon={CircleX}
          suffix={"รายการ"}
        />
        <SumCard
          label={"บทความทั้งหมด"}
          value={sumCard?.contentTotal}
          icon={Book}
          suffix={"รายการ"}
        />
      </div>

      <div className="grid xl:grid-cols-3 gap-2 sm:gap-5  flex-grow">
        <div className="flex flex-col gap-2 sm:gap-5 ">
          <Header label={"ส่งออกข้อมูลบทเรียน"} isAdmin />
          <Card className="p-5" shadow="sm">
            <form
              onSubmit={handleSubmitCourseReport(async (data) => {
                try {
                  const startDate = `${courseDateRange?.start?.year}-${courseDateRange?.start?.month}-${courseDateRange?.start?.day}`;
                  const endDate = `${courseDateRange?.end?.year}-${courseDateRange?.end?.month}-${courseDateRange?.end?.day}`;

                  const courseResponse = await axiosInstance.get(
                    `${apiEndpoint}/api/v1/course?isNotPagi=true${
                      data?.status == "activate"
                        ? "&isActive=true"
                        : data?.status !== "all"
                        ? "&isActive=disactivate"
                        : ""
                    }${
                      courseDateRange?.start &&
                      courseDateRange?.end &&
                      `&startDate=${startDate}&endDate=${endDate}`
                    }`
                  );

                  const mapCourseData = (data: any[]) => {
                    return data.map((course: any) => ({
                      ID: course.id,
                      ชื่อบทเรียน: course.title,
                      จำนวนการเปิดอ่าน: course.countView,
                      คำอธิบาย: course.description,
                      สถานะ:
                        course.status == "activate"
                          ? "เปิดการใช้งานอยู่"
                          : "ปิดการใช้งาน",
                      วันที่สร้าง: convertDateToThai(course.createdAt),
                      วันที่อัพเดต: convertDateToThai(course.updatedAt),
                      ผู้ใช้สร้าง: course.users.name,
                    }));
                  };

                  const mappedData = mapCourseData(courseResponse?.data?.data);
                  exportToXLSX(mappedData, "รายงานข้อมูลบทเรียน");
                } catch (error) {
                  console.log(error);
                }
              })}
              className="flex flex-col gap-2 sm:gap-5 "
            >
              <div className="flex flex-wrap gap-2 sm:gap-5 ">
                <DateRangePicker
                  size="sm"
                  variant="bordered"
                  onChange={(range: any) => {
                    setCourseDateRange(range);
                  }}
                  label="ช่วงเวลาของข้อมูล **ไม่บังคับ"
                />

                <Select
                  size="sm"
                  variant="bordered"
                  required
                  {...registerCourseReport("status")}
                  defaultSelectedKeys={["all"]}
                  label="สถานะบทเรียน **ไม่บังคับ"
                >
                  <SelectItem key="all">ทั้งหมด</SelectItem>
                  <SelectItem key="activate">เปิดการใช้งาน</SelectItem>
                  <SelectItem key="deactivate">ปิดการใช้งาน</SelectItem>
                </Select>
              </div>

              <Button
                startContent={<FilePieChart />}
                type="submit"
                className="w-fit bg-main text-white"
              >
                Export XLSX
              </Button>
            </form>
          </Card>
        </div>

        <div className="flex flex-col gap-2 sm:gap-5 ">
          <Header label={"ส่งออกข้อมูลสมาชิก"} />
          <Card className="p-5" shadow="sm">
            <form
              onSubmit={handleSubmitUserReport(async (data) => {
                try {
                  const startDate = `${userDateRange?.start?.year}-${userDateRange?.start?.month}-${userDateRange?.start?.day}`;
                  const endDate = `${userDateRange?.end?.year}-${userDateRange?.end?.month}-${userDateRange?.end?.day}`;

                  const userResponse = await axiosInstance.get(
                    `${apiEndpoint}/api/v1/user?isNotPagi=true${
                      userDateRange?.start &&
                      userDateRange?.end &&
                      `&startDate=${startDate}&endDate=${endDate}'`
                    }&name=${data?.name}`
                  );

                  const mapCourseData = (data: any[]) => {
                    return data.map((user: any) => ({
                      ID: user.id,
                      เลขประจำตัวประชาชน: user.personalId,
                      ประวัตโดยย่อ: user.shortDescription,
                      "ชื่อ-นามสกุล": user.name,
                      อีเมล: user.email,
                      สถานะ:
                        user.status == "activate"
                          ? "เปิดการใช้งานอยู่"
                          : "ปิดการใช้งาน",
                      สิทธิ์การใช้งาน:
                        user.role == "user" ? "ผู้ใช้งาน" : "เจ้าหน้าที่แอดมิน",
                      วันที่สร้าง: convertDateToThai(user.createdAt),
                      วันที่อัพเดต: convertDateToThai(user.updatedAt),
                    }));
                  };

                  const mappedData = mapCourseData(userResponse?.data?.data);
                  exportToXLSX(mappedData, "รายงานข้อมูลสมาชิก");
                } catch (error) {
                  console.log(error);
                }
              })}
              className="flex flex-col gap-2 sm:gap-5 "
            >
              <div className="flex flex-wrap gap-2 sm:gap-5 ">
                <Input
                  size="sm"
                  variant="bordered"
                  label="ชื่อ-นามสกุล **ไม่บังคับ"
                  labelPlacement="inside"
                  {...registerUserReport("name")}
                />

                <DateRangePicker
                  size="sm"
                  variant="bordered"
                  onChange={(range: any) => {
                    setUserDateRange(range);
                  }}
                  label="ช่วงเวลาของข้อมูล **ไม่บังคับ"
                />
              </div>

              <Button
                type="submit"
                startContent={<FilePieChart />}
                className="w-fit bg-main text-white"
              >
                Export XLSX
              </Button>
            </form>
          </Card>
        </div>

        <div className="flex flex-col gap-2 sm:gap-5 ">
          <Header label={"ส่งออกข้อมูลการอบรมบทเรียน"} />
          <Card className="p-5" shadow="sm">
            <form
              onSubmit={handleSubmitCourseLogReport(async (data) => {
                try {
                  const startDate = `${courseLogDateRange?.start?.year}-${courseLogDateRange?.start?.month}-${courseLogDateRange?.start?.day}`;
                  const endDate = `${courseLogDateRange?.end?.year}-${courseLogDateRange?.end?.month}-${courseLogDateRange?.end?.day}`;

                  const courseLogResponse = await axios.get(
                    `${apiEndpoint}/api/v1/course/log/report?courseId=${
                      data?.courseId
                    }${
                      courseLogDateRange?.start &&
                      courseLogDateRange?.end &&
                      `&startDate=${startDate}&endDate=${endDate}`
                    }
              ${data?.status && `&status=${data?.status}`}`
                  );

                  const mapCourseData = (data: any[]) => {
                    return data.map((course: any) => ({
                      ID: course.id,
                      ชื่อบทเรียน: course.lessions.title,
                      ไอดีผู้ใช้เรียน: course.users.id,
                      ชื่อผู้ใช้เรียน: course.users.name,
                      อีเมลผู้ใช้เรียน: course.users.email,
                      "สถานะการส่งมอบใบประกาศนียบัตร์ใน Email":
                        course.isSendCertification
                          ? "ส่งมอบแล้ว"
                          : "ยังไม่ได้รับการส่งมอบ",
                      สถานะ:
                        course.status == "complete"
                          ? "ผ่านการอบรม"
                          : course.status == "unComplete"
                          ? "ไม่ผ่านการอบรม"
                          : "กำลังเรียนอยู่",
                      คะแนนก่อนเรียน: course.beforeLearningScore,
                      คะแนนหลังเรียน: course.afterLearningScore,
                      วันที่เข้าเรียน: convertDateToThai(course.createdAt),
                    }));
                  };

                  const mappedData = mapCourseData(courseLogResponse?.data);
                  exportToXLSX(mappedData, "รายงานข้อมูลการเข้าอบรมบทเรียน");
                } catch (error) {
                  console.log(error);
                }
              })}
              className="flex flex-col gap-2 sm:gap-5 "
            >
              <div className="flex flex-wrap gap-2 sm:gap-5 ">
                <Select
                  size="sm"
                  variant="bordered"
                  {...registerCourseLogReport("courseId", {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                  })}
                  isInvalid={!!errorsCourseLogReport.courseId}
                  errorMessage={`${errorsCourseLogReport.courseId?.message}`}
                  required
                  label="ชื่อบทเรียน"
                >
                  {courseDropdown?.map((item: any) => {
                    return <SelectItem key={item.id}>{item.title}</SelectItem>;
                  })}
                </Select>
                <DateRangePicker
                  size="sm"
                  variant="bordered"
                  onChange={(range: any) => {
                    setCourseLogDateRange(range);
                  }}
                  label="ช่วงเวลาของข้อมูล **ไม่บังคับ"
                />

                <Select
                  size="sm"
                  variant="bordered"
                  required
                  {...registerCourseLogReport("status")}
                  defaultSelectedKeys={["all"]}
                  label="สถานะการเรียน **ไม่บังคับ"
                >
                  <SelectItem key="all">ทั้งหมด</SelectItem>
                  <SelectItem key="pass">ผ่าน</SelectItem>
                  <SelectItem key="notpass">ไม่ผ่าน</SelectItem>
                </Select>
              </div>

              <Button
                type="submit"
                startContent={<FilePieChart />}
                className="w-fit bg-main text-white"
              >
                Export XLSX
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
