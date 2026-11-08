import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import {
  ArrowUpRight,
  CircleCheck,
  CircleX,
  DatabaseZap,
  FilePieChart,
  Folder,
  Folders,
  HelpCircle,
  LogOut,
  Mail,
  Settings,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { apiEndpoint, axiosInstance, getAuth } from "@/helpers";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Select,
  SelectItem,
  Spinner,
  Switch,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import {
  errorRequire,
  regexHexColor,
  errorHexColor,
  errorEmail,
  regexEmail,
} from "@/helpers/regex";
import axios from "axios";
import { HexColorPicker } from "react-colorful";
import { useForm, Controller } from "react-hook-form";
import UploadImage from "./UploadImage";
import { closeEmailForm, openEmailForm } from "@/store/modalSlice";
import { deleteCookie } from "cookies-next";
import Image from "next/image";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  subCategories?: MenuItem[];
  disabled?: boolean;
  icon?: React.ComponentType;
}

export default function SidebarCustom({
  isAdmin,
}: {
  isAdmin: any;
  setEnableSidebar: any;
  isMobile: any;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [decodeToken, setDecodeToken] = useState<any>(null);
  const adminMenu = useSelector((state: any) => state.webSetting.adminMenu);
  const userMenu = useSelector((state: any) => state.webSetting.userMenu);
  const [fetchedUserMenu, setFetchedUserMenu] = useState<MenuItem[]>([]);
  const swapMenu = isAdmin ? adminMenu : fetchedUserMenu;
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const {
    register: registerSettingForm,
    handleSubmit: handleSubmitSettingForm,
    reset: resetSettingForm,
    watch: watchSettingForm,
    control: controlSettingForm,
    formState: { errors: errorsSettingForm },
  } = useForm();

  const [imagePathFile, setImagePathFile] = useState<string | null>(null);
  const [imageBannerPathFile, setImageBannerPathFile] = useState<string | null>(
    null
  );
  const isOpenEmailForm = useSelector(
    (state: any) => state.modal.isOpenEmailForm
  );
  const isShowSiteTitle = watchSettingForm("isShowSiteTitle", false);
  const [isHasStripe, setIsHasStripe] = useState();

  const apiGetIsHasStripe = async () => {
    try {
      const { data } = await axiosInstance.get(`${apiEndpoint}/checkHasStripe`);

      setIsHasStripe(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/get-settings");
        const data = await response.json();

        resetSettingForm(data);
        resetEmailForm({ email: data?.email, key: data?.key });
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, [resetSettingForm]);

  const apiUpdateWebsite = async (data: any) => {
    await fetch("/api/update-website", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    });
  };

  const {
    isOpen: isOpenVersionViwer,
    onOpen: onOpenVersionViwer,
    onClose: onCloseVersionViwer,
  } = useDisclosure();

  const {
    isOpen: isOpenWebSetting,
    onOpen: onOpenWebSetting,
    onClose: onCloseWebSetting,
  } = useDisclosure();

  const {
    register: registerEmailForm,
    handleSubmit: handleSubmitEmailForm,
    reset: resetEmailForm,
    watch: watchEmailForm,
    formState: { errors: errorsEmailForm },
  } = useForm();

  const EmailSettingModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenEmailForm}
        onClose={() => {
          dispatch(closeEmailForm());
        }}
      >
        <ModalContent>
          <ModalHeader>การตั้งค่าอีเมลที่ใช้ในการส่งข้อความ</ModalHeader>
          <ModalBody>
            <span>
              ** อีเมลของคุณต้องเปิดการใช้งาน 2FA หรือการยืนยัน 2 ขั้นตอนไว้ด้วย
              ไม่เช่นนั้นจะขอรหัสผ่านที่มีความปลอดภัยน้อยมาใช้งานในระบบส่งข้อความอีเมล
              ไม่ได้ **
            </span>
            <Image
              src={"/images/gmail.png"}
              width={500}
              height={500}
              alt="gmail"
              className="w-full h-full"
            />

            <Input
              size="sm"
              variant="bordered"
              label="อีเมล"
              {...registerEmailForm("email", {
                required: {
                  value: true,
                  message: errorRequire(),
                },
                pattern: {
                  value: regexEmail(),
                  message: errorEmail(),
                },
              })}
              isInvalid={!!errorsEmailForm.email}
              errorMessage={`${errorsEmailForm.email?.message}`}
            ></Input>
            <Input
              size="sm"
              variant="bordered"
              label="รหัสผ่านที่มีความปลอดภัยน้อย **ไม่ใช่รหัสผ่านที่ใช่เข้าอีเมล**"
              {...registerEmailForm("key", {
                required: {
                  value: true,
                  message: errorRequire(),
                },
              })}
              isInvalid={!!errorsEmailForm.key}
              errorMessage={`${errorsEmailForm.key?.message}`}
            ></Input>
            <Link
              href="https://myaccount.google.com/apppasswords"
              target="_blank"
              className="w-fit"
            >
              <span className="cursor-pointer hover:underline">
                ต้องการรหัสผ่านที่มีความปลอดภัยน้อยจากอีเมล?
              </span>
            </Link>
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSubmitEmailForm(async (data) => {
                  try {
                    await apiUpdateWebsite({
                      ...watchSettingForm(),
                      email: data?.email,
                      key: data?.key,
                    });
                    router.reload();
                  } catch (error) {
                    console.log(error);
                  }
                })}
                startContent={<CircleCheck />}
                className="bg-main text-white"
              >
                บันทึกข้อมูล
              </Button>

              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  dispatch(closeEmailForm());
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const WebSettingModal = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenWebSetting}
        onClose={() => {
          onCloseWebSetting();
        }}
      >
        <ModalContent>
          <ModalHeader>การตั้งค่าเว็บไซต์</ModalHeader>

          <ModalBody>
            <form className="space-y-2">
              <UploadImage
                setImagePathFile={setImageBannerPathFile}
                label="รูปภาพแบนเนอร์"
              />

              <Select
                size="sm"
                variant="bordered"
                required
                {...registerSettingForm("bgPosition", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsSettingForm.bgPosition}
                errorMessage={`${errorsSettingForm.bgPosition?.message}`}
                label="ตำแหน่งรูปภาพแบนเนอร์"
              >
                <SelectItem key="bg-top">บนสุด</SelectItem>
                <SelectItem key="bg-center">ตรงกลาง</SelectItem>
                <SelectItem key="bg-bottom">ข้างล่าง</SelectItem>
              </Select>

              {isShowSiteTitle && (
                <UploadImage
                  setImagePathFile={setImagePathFile}
                  label="รูปภาพโลโก้"
                />
              )}
              <div className="flex gap-2">
                <Switch {...registerSettingForm("isShowSiteTitle")}>
                  ใช้โลโก้เป็นรูปภาพ
                </Switch>
                <Switch {...registerSettingForm("isLogoCircle")}>
                  ทำโลโก้เป็นวงกลม
                </Switch>
              </div>
              {!isShowSiteTitle && (
                <Input
                  size="sm"
                  variant="bordered"
                  {...registerSettingForm("logoTitle")}
                  isInvalid={!!errorsSettingForm.logoTitle}
                  errorMessage={`${errorsSettingForm.logoTitle?.message}`}
                  labelPlacement="inside"
                  label="โลโก้ตัวหนังสือ"
                />
              )}
              <Input
                size="sm"
                variant="bordered"
                {...registerSettingForm("siteTitle")}
                isInvalid={!!errorsSettingForm.siteTitle}
                errorMessage={`${errorsSettingForm.siteTitle?.message}`}
                labelPlacement="inside"
                label="ชื่อเว็บไซต์"
              />
              <Textarea
                size="sm"
                variant="bordered"
                {...registerSettingForm("siteDescription")}
                isInvalid={!!errorsSettingForm.siteDescription}
                errorMessage={`${errorsSettingForm.siteDescription?.message}`}
                labelPlacement="inside"
                label="รายละเอียดเว็บไซต์"
                minRows={10}
              />
              {isHasStripe && (
                <Switch {...registerSettingForm("isCourseMustPaid")}>
                  ใช้ระบบบทเรียนต้องชำระเงิน
                </Switch>
              )}
              <div className="flex gap-2 sm:gap-5 ">
                <Input
                  size="sm"
                  variant="bordered"
                  {...registerSettingForm("certificationApprove")}
                  isInvalid={!!errorsSettingForm.certificationApprove}
                  errorMessage={`${errorsSettingForm.certificationApprove?.message}`}
                  labelPlacement="inside"
                  label="ชื่อผู้อนุมัติใบประกาศนียบัตร"
                />

                <Input
                  size="sm"
                  variant="bordered"
                  {...registerSettingForm("certificationApprovePosition")}
                  isInvalid={!!errorsSettingForm.certificationApprovePosition}
                  errorMessage={`${errorsSettingForm.certificationApprovePosition?.message}`}
                  labelPlacement="inside"
                  label="ตำแหน่งผู้อนุมัติใบประกาศนียบัตร"
                />
              </div>
              <div className="flex">
                <Input
                  size="sm"
                  variant="bordered"
                  {...registerSettingForm("main", {
                    required: {
                      value: true,
                      message: errorRequire(),
                    },
                    pattern: {
                      value: regexHexColor(),
                      message: errorHexColor(),
                    },
                  })}
                  isInvalid={!!errorsSettingForm.main}
                  errorMessage={`${errorsSettingForm.main?.message}`}
                  labelPlacement="inside"
                  label="สีเว็บไซต์"
                />

                <div className="w-full flex justify-center">
                  <Controller
                    control={controlSettingForm}
                    name="main"
                    defaultValue={settings?.main}
                    render={({ field: { onChange, value } }) => (
                      <HexColorPicker color={value} onChange={onChange} />
                    )}
                  />
                </div>
              </div>
            </form>
          </ModalBody>

          <ModalFooter>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSubmitSettingForm(async (data) => {
                  try {
                    if (imagePathFile) {
                      await axios.post(
                        `${apiEndpoint}/api/v1/user/upload/logo`,
                        { imagePathFile },
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                    }

                    if (imageBannerPathFile) {
                      await axios.post(
                        `${apiEndpoint}/api/v1/user/upload/banner`,
                        { imagePathFile: imageBannerPathFile },
                        {
                          headers: {
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                    }

                    await apiUpdateWebsite({
                      ...data,
                      email: watchEmailForm("email"),
                      Key: watchEmailForm("key"),
                    });
                    router.reload();
                  } catch (error) {
                    console.log(error);
                  }
                })}
                startContent={<CircleCheck />}
                className="bg-main text-white"
              >
                บันทึกข้อมูล
              </Button>

              <Button
                startContent={<CircleX />}
                variant="bordered"
                onClick={() => {
                  onCloseWebSetting();
                }}
              >
                ยกเลิก
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  const VersionViewer = () => {
    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenVersionViwer}
        onClose={() => {
          onCloseVersionViwer();
        }}
      >
        <ModalContent>
          <ModalHeader>เวอร์ชั่นและการอัพเดต</ModalHeader>

          <ModalBody>
            <ScrollShadow className="p-1 max-h-[550px] space-y-2 overflow-hidden hover:overflow-y-auto">
              <Card
                className="border-b  dark:border-darkdark:border-dark"
                shadow="none"
              >
                <CardHeader>เวอร์ชั่น 2.0.0</CardHeader>
                <CardBody>
                  <ul>
                    <li>- ปรับ Layout ใหม่ + Banner หน้าแรก</li>
                    <li>
                      - เพิ่มการแบ่งประเภทบทเรียนแบบฟรีและเสียเงิน +
                      เพิ่มระบบการชำระเงินผ่านบริการ Stripe
                      โดยจะเปิดได้ต้องมีคีย์ใน Backend
                      ของระบบจึงจะใช้งานฟีเจอร์นี้ได้
                    </li>
                    <li>
                      - แก้การแสดงคะแนนและข้อสอบในหน้าสรุปผลการเรียน +
                      แยกการแสดงออกจากหน้า Index + ดูประวัติการส่งคำตอบ
                    </li>
                    <li>- ปรับปรุงประสิทธิภาพของระบบ และอื่นๆ...</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="border-b  dark:border-dark" shadow="none">
                <CardHeader>เวอร์ชั่น 1.5.2</CardHeader>
                <CardBody>
                  <ul>
                    <li>- แก้ขนาดหน้าจอในหน้าบทความให้มีขนาดอยู่ที่ 80%</li>
                    <li>- เพิ่มวิธีการใช้งานระบบสำหรับผู้ใช้งาน</li>
                    <li>
                      - เพิ่มคู่มือการใช้งานระบบแอดมิน .pdf
                      ให้เจ้าหน้าที่ดาว์นโหลดในแผงควบคุมผู้ใช้งาน
                    </li>
                    <li>
                      - แก้รูปเปลี่ยนตามเนื้อหาที่กดก่อนหน้า เมื่อแก้ไขบทเรียน,
                      บทความ
                    </li>
                    <li>
                      - ย้าย ThemeSwitcher จาก Sidebar ไปไว้ใน Navbar
                      พร้อมใช้การกดไอคอนเพื่อสลับธีม
                    </li>
                    <li>
                      - เพิ่มเมนูกลับไปที่หน้าบ้าน ใน Sidebar
                      ของแผงควบคุมผู้ใช้งาน
                    </li>
                    <li>
                      - เพิ่มปุ่ม ปิด-เปิด การแสดงชื่อเว็บไซต์ใน Sidebar และหน้า
                      Index จากการตั้งค่าระบบ
                    </li>
                    <li>- แก้ UX/UI ExportReport ในหน้า Index ของแอดมิน</li>
                    <li>
                      - เพิ่ม Redux, Slice ในการแชร์ตัวแปรกันเพื่อใช้เปิด Modal
                      Login, จากการกดปุ่มเข้าสู่ระบบในหน้าบทเรียน,
                      บทความ(ความคิดเห็น)
                    </li>
                    <li>
                      - เพิ่มไอคอนใหม่ๆใน Sidebar เปลี่ยนจากการแสดงไอคอน Folder
                      ไปเป็นการแสดงไอคอนที่สื่อความหมายกับเมนู
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="border-b  dark:border-dark" shadow="none">
                <CardHeader>เวอร์ชั่น 1.5.1</CardHeader>
                <CardBody>
                  <ul>
                    <li>- แก้ Hydration Sidebar ในหน้าจอมือถือ</li>
                    <li>
                      - เพิ่ม Export Report, ส่งออกข้อมูลบทเรียน,
                      ส่งออกข้อมูลสมาชิก,
                      ส่งออกข้อมูลการเข้าอบรมบทเรียนของสมาชิก
                    </li>
                    <li>
                      - เพิ่มฟิลด์ courseLogId ในตาราง QuestionLog, ContentLog
                      เพื่อใช้โยงหาความสัมพันธ์
                    </li>
                    <li>
                      - แก้ Course เช็ค Complete ด้วยเงื่อนไขจาก avgPass
                      ที่แอดมินกำหนด
                    </li>
                    <li>- แก้ Comment Reply ต้องมี Auth ก่อนถึงจะตอบกลับได้</li>
                    <li>
                      - แก้ Course สามารถไม่ผ่านและเรียนซ้ำใหม่ได้ +
                      การดึงสถานะของเนื้อหาของข้อมูลชุดใหม่ของ log มาให้ตรงกัน
                    </li>
                    <li>
                      -
                      แก้การแสดงประวัติการเข้าเรียนบทเรียนในหน้าหลักของผู้ใช้งาน
                    </li>
                    <li>
                      - แก้ Export Report เพิ่มการคำนวนคะแนนก่อน, หลังเรียน
                      ในส่งออกข้อมูลการเข้าอบรมบทเรียนของสมาชิก
                    </li>
                    <li>
                      - แก้การตั้งค่าในระบบไม่เปลี่ยนแปลงเมื่อระบบรันอยู่ในโหมด
                      Production
                    </li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="border-b  dark:border-dark" shadow="none">
                <CardHeader>เวอร์ชั่น 1.5.0</CardHeader>
                <CardBody>
                  <ul>
                    <li>- แก้ตั้งค่าเว็บไซต์อัพโหลดรูปภาพไม่ได้</li>
                    <li>
                      - แก้มอบเกียติบัตรกดส่ง Email ไม่ได้ + ฟิลเตอร์สถานะข้อมูล
                    </li>
                    <li>- แก้บทความกดใส่ลิ้งค์รูปภาพไม่ได้ JoditEditor</li>
                    <li>- Pagination ของหน้าต่างๆยังไม่ครบ</li>
                    <li>
                      - แก้บทเรียนบั๊กไม่รอ api ทำงานให้เสร็จก่อน,
                      ปุ่มกดลงทะเบียนเรียน (auto subscribe)
                    </li>
                    <li>
                      - แก้ถ้าลบวิดีโอออกจากระบบ
                      ผู้ใช้งานจะผ่านเนื้อหานั้นไม่ได้
                    </li>
                    <li>- เพิ่มปุ่มย้อนกลับจากบทความไปยังบทเรียนที่เปิดมา</li>
                    <li>- เพิ่ม Footer ดึงข้อมูลจากการตั้งค่าระบบ</li>
                    <li>- ย้ายโลโก้ไปใช้รูปจาก api หรือจากการตั้งค่าระบบ</li>
                    <li>- เพิ่มระบบการนับจำนวนการเปิดอ่านบทความ, บทเรียน</li>
                    <li>- เพิ่มระบบความคิดเห็นในบทความ</li>
                    <li>- แก้เกียติบัตรตัวหนังสือสีขาวเมื่ออยู่ในโหมดมือ</li>
                    <li>
                      - แก้ถ้าเข้าระบบด้วย Role ผู้ดูแลระบบจะเด้งไปหน้า /admin
                      ทันที
                    </li>
                    <li>- แก้ UX/UI การ์ดสรุปผลหน้าจอหลัก</li>
                    <li>- เพิ่ม Header ในหน้า Index user, admin</li>
                    <li>
                      - แก้ถ้าเปิดบทความ, บทเรียน ที่ไม่มีอยู่จริงจะให้แสดงหน้า
                      404 Page Not Found
                    </li>
                    <li>- แก้ Sidebar ถ้าอยู่ในจอมือถือให้แสดงเต็มจอ</li>
                    <li>- เพิ่ม Loading ในหน้าจอต่างๆ + ปุ่มกด</li>
                    <li>- แก้ระยะเวลาวิดีโอเป็นรูปแบบ H:M:S</li>
                    <li>- และอื่นๆ...</li>
                  </ul>
                </CardBody>
              </Card>

              <Card className="border-b  dark:border-dark" shadow="none">
                <CardHeader>เวอร์ชั่น 1.0.0</CardHeader>
                <CardBody>
                  <ul>
                    <li>- ขึ้นโปรเจ็ค วางระบบฐานข้อมูล, โครงสร้างไฟล์ต่างๆ</li>
                  </ul>
                </CardBody>
              </Card>
            </ScrollShadow>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getUserMenu = async () => {
    try {
      const { data } = await axiosInstance.get(
        `${apiEndpoint}/api/v1/category/main/noPagi`
      );
      const newCategoryData = data?.map((item: any) => {
        const hasSubCategories =
          item.subCategories && item.subCategories.length > 0;
        return {
          ...item,
          title: `หมวดหมู่ ${item?.title}`,
          isMargin: true,
          url: `/category/main/${item.id}`,
          subCategories: hasSubCategories
            ? [
                ...item.subCategories.map((subItem: any) => ({
                  ...subItem,
                  url: `/category/sub/${subItem.id}`,
                })),
              ]
            : [],
        };
      });

      setFetchedUserMenu([...userMenu, ...newCategoryData]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    setDecodeToken(getAuth());
    getUserMenu();
  }, []);

  if (!mounted) return null;

  return (
    <>
      {VersionViewer()}
      {WebSettingModal()}
      {EmailSettingModal()}

      <Sidebar className="border-none ">
        <div
          className="flex flex-col justify-center items-center text-center cursor-pointer space-y-2"
          onClick={() => router.push("/")}
        ></div>

        {isLoading && (
          <div className="w-full flex flex-col items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isLoading && (
          <div className="flex flex-col h-screen justify-between">
            <Menu className={`mt-2 h-[70vh]`}>
              <ScrollShadow
                className={`max-h-[85vh] overflow-hidden hover:overflow-y-auto border-b  dark:border-dark`}
              >
                {swapMenu?.map((item: any, index: number) =>
                  item?.subCategories && item?.subCategories.length > 0 ? (
                    <SubMenu
                      icon={
                        item.icon ? item.icon : <Folder className="text-gray" />
                      }
                      key={index}
                      className={`${item?.isMargin ? "ml-2.5" : ""}`}
                      label={item.title}
                      onClick={() => router.push(item.url)}
                    >
                      {item.subCategories.map(
                        (subItem: any, subIndex: number) => (
                          <MenuItem
                            disabled={
                              decodeToken?.role == "superAdmin"
                                ? false
                                : subItem.disabled
                            }
                            onClick={() => router.push(subItem.url)}
                            icon={
                              subItem.icon ? (
                                subItem.icon
                              ) : (
                                <Folder className="text-gray" />
                              )
                            }
                            key={subIndex}
                          >
                            {subItem.title}
                          </MenuItem>
                        )
                      )}
                    </SubMenu>
                  ) : (
                    <MenuItem
                      disabled={
                        decodeToken?.role == "superAdmin"
                          ? false
                          : item.disabled
                      }
                      onClick={() => {
                        router.push(item.url);
                      }}
                      key={index}
                      className={`${item?.isMargin ? "ml-2.5" : ""}`}
                      icon={
                        item.icon ? (
                          item.icon
                        ) : (
                          <Folders className="text-gray" />
                        )
                      }
                    >
                      {item.title}
                    </MenuItem>
                  )
                )}

                {decodeToken && decodeToken?.role == "user" && (
                  <MenuItem
                    icon={<FilePieChart className="text-gray" />}
                    onClick={() => {
                      router.push("/summary");
                    }}
                  >
                    ผลการเรียนของฉัน
                  </MenuItem>
                )}

                {decodeToken &&
                  decodeToken?.role == "user" &&
                  settings?.isCourseMustPaid && (
                    <MenuItem
                      icon={<DatabaseZap className="text-gray" />}
                      onClick={() => {
                        router.push("/library");
                      }}
                    >
                      คลังเนื้อหาที่ฉันซื้อ
                    </MenuItem>
                  )}

                {decodeToken?.role !== "user" && decodeToken && (
                  <MenuItem
                    icon={<Settings className="text-gray" />}
                    onClick={async () => {
                      await apiGetIsHasStripe();
                      onOpenWebSetting();
                    }}
                  >
                    ตั้งค่าเว็บไซต์
                  </MenuItem>
                )}

                {decodeToken?.role !== "user" && decodeToken && (
                  <MenuItem
                    icon={<Mail className="text-gray" />}
                    onClick={async () => {
                      dispatch(openEmailForm());
                    }}
                  >
                    ตั้งค่าการส่งอีเมล
                  </MenuItem>
                )}

                {router.pathname.slice(0, 6) !== "/admin" &&
                  decodeToken?.role !== "user" &&
                  decodeToken && (
                    <MenuItem
                      icon={<ArrowUpRight className="text-gray" />}
                      onClick={() => {
                        router.push("/admin");
                      }}
                    >
                      ไปที่แผงควบคุมผู้ใช้งาน
                    </MenuItem>
                  )}

                {decodeToken && decodeToken?.role !== "user" && (
                  <MenuItem
                    icon={<HelpCircle className="text-gray" />}
                    onClick={onOpenVersionViwer}
                  >
                    เวอร์ชั่นและการอัพเดต
                  </MenuItem>
                )}

                {decodeToken && (
                  <MenuItem
                    icon={<LogOut className="text-gray" />}
                    onClick={() => {
                      deleteCookie("auth");
                      router.reload();
                    }}
                  >
                    ออกจากระบบ
                  </MenuItem>
                )}
              </ScrollShadow>
            </Menu>
          </div>
        )}
      </Sidebar>
    </>
  );
}
