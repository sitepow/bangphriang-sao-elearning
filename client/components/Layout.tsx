"use client";
import Sidebar from "./Sidebar";
import { CircleCheck, CircleX, LogInIcon } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import { apiEndpoint, axiosInstance, getAuth } from "@/helpers";
import { useRouter } from "next/router";
import { getCookie, setCookie } from "cookies-next";
import axios from "axios";
import CryptoJS from "crypto-js";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Switch,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import {
  checkEmpty,
  errorEmail,
  errorPasswordNotMatch,
  errorRequire,
  errorThaiID,
  regexEmail,
  validateThaiID,
} from "@/helpers/regex";
import { useForm } from "react-hook-form";
import UploadImage from "./UploadImage";
import { useMediaQuery } from "react-responsive";
import ErrorNotification from "./ErrorNotification";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import {
  closeLoginForm,
  closeVerifyForm,
  openEmailForm,
  openVerifyForm,
} from "@/store/modalSlice";

type LayoutProps = {
  children?: ReactNode;
  isAdmin?: Boolean;
  removePadding?: Boolean;
};

export default function Layout({
  children,
  isAdmin,
  removePadding,
}: LayoutProps) {
  const router = useRouter();
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [enableSidebar, setEnableSidebar] = useState(true);
  const [apiError, setApiError] = useState<any>();
  const [apiLoading, setApiLoading] = useState<any>(false);
  const [auth, setAuth] = useState<any>(null);
  const [setting, setSetting] = useState<any>();
  const isMobileQuery = useMediaQuery({ maxWidth: 766 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isVerifyError, setIsVerifyError] = useState(false);
  const isOpenLoginForm = useSelector(
    (state: any) => state.modal.isOpenLoginForm
  );
  const isOpenVerifyForm = useSelector(
    (state: any) => state.modal.isOpenVerifyForm
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const storedCountdown = localStorage.getItem("emailCountdown");
    if (storedCountdown) {
      setEmailCountdown(parseInt(storedCountdown, 10));
    }
  }, []);

  useEffect(() => {
    if (emailCountdown > 0) {
      const interval = setInterval(() => {
        setEmailCountdown((prev) => {
          const newCountdown = prev - 1;
          localStorage.setItem("emailCountdown", newCountdown.toString());
          return newCountdown;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [emailCountdown]);

  const handleResendEmail = async () => {
    if (emailCountdown === 0) {
      try {
        setApiLoading(true);
        await axios.post(`${apiEndpoint}/sendEmailVerify`, {
          toEmail: auth?.email,
          fromCompany: setting?.siteTitle,
          fromEmail: setting?.email,
          key: setting?.key,
        });

        setEmailCountdown(60);
        localStorage.setItem("emailCountdown", "60");
        setApiLoading(false);
      } catch (error: any) {
        setApiLoading(false);
        console.log(error);
        setApiError(error?.response?.data);
      }
    }
  };

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/get-settings");
        const data = await response.json();
        setSetting(data);
        document.documentElement.style.setProperty("--main-color", data.main);
        document.documentElement.style.setProperty("--navi-color", data.navi);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setEnableSidebar(false);
    } else {
      setEnableSidebar(true);
    }
  }, [isMobile]);

  const {
    isOpen: isOpenProfileForm,
    onOpen: onOpenProfileForm,
    onClose: onCloseProfileForm,
  } = useDisclosure();

  const {
    isOpen: isOpenRegisterForm,
    onOpen: onOpenRegisterForm,
    onClose: onCloseRegisterForm,
  } = useDisclosure();

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    if (isAdmin) {
      if (!getCookie("auth")) {
        router.push("/");
      }

      if (auth?.role == "user") {
        router.push("/");
      }
    }
  }, [router, auth, isAdmin]);

  const ProfileModal = () => {
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [imagePathFile, setImagePathFile] = useState();

    const initForm = {
      name: "",
      shortDescription: "",
      password: "",
      confirmPassword: "",
    };

    const {
      register: registerProfileForm,
      reset: resetProfileForm,
      getValues: getValuesProfileForm,
      handleSubmit: handleSubmitProfileForm,
      formState: { errors: errorsProfileForm },
    } = useForm();

    const apiGetUser = async () => {
      try {
        const { data } = await axiosInstance.get(
          `${apiEndpoint}/api/v1/user/${auth.id}`
        );

        resetProfileForm(data);
      } catch (error) {
        console.log(error);
      }
    };

    const apiUpdateUser = async (data?: any) => {
      setIsLoadingApi(true);

      try {
        await axiosInstance.patch(
          `${apiEndpoint}/api/v1/user/${auth.id}`,
          { ...data, imagePathFile },
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        resetProfileForm(initForm);
        await apiGetUser();
        onCloseProfileForm();
        setIsLoadingApi(false);
        router.reload();
      } catch (error) {
        setIsLoadingApi(false);
        console.log(error);
      }
    };

    useEffect(() => {
      if (auth) {
        apiGetUser();
      }
    }, [auth, router]);

    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenProfileForm}
        onClose={() => {
          onCloseProfileForm();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>ตั้งค่าโปรไฟล์ส่วนตัว</ModalHeader>
          <ModalBody>
            <form
              className="space-y-2"
              onSubmit={handleSubmitProfileForm(async (data) => {
                await apiUpdateUser(data);
              })}
            >
              <UploadImage setImagePathFile={setImagePathFile} />

              <Textarea
                size="sm"
                variant="bordered"
                label="แนะนำตัวสั้นๆ"
                labelPlacement="inside"
                rows={10}
                {...registerProfileForm("shortDescription")}
                isInvalid={!!errorsProfileForm.shortDescription}
                errorMessage={`${errorsProfileForm.shortDescription?.message}`}
              />

              <Input
                size="sm"
                variant="bordered"
                label="ชื่อ-นามสกุล"
                {...registerProfileForm("name", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsProfileForm.name}
                errorMessage={`${errorsProfileForm.name?.message}`}
                labelPlacement="inside"
              />

              <Switch
                checked={isChangePassword}
                onChange={() => {
                  setIsChangePassword(!isChangePassword);
                }}
              >
                เปลี่ยนรหัสผ่าน
              </Switch>

              {isChangePassword && (
                <>
                  <Input
                    size="sm"
                    variant="bordered"
                    {...registerProfileForm("password", {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                      pattern: {
                        value: checkEmpty(),
                        message: errorRequire(),
                      },
                    })}
                    type="password"
                    label="รหัสผ่าน"
                  />

                  <Input
                    size="sm"
                    variant="bordered"
                    isInvalid={!!errorsProfileForm.confirmPassword}
                    errorMessage={`${errorsProfileForm.confirmPassword?.message}`}
                    {...registerProfileForm("confirmPassword", {
                      required: {
                        value: true,
                        message: errorRequire(),
                      },
                      pattern: {
                        value: checkEmpty(),
                        message: errorRequire(),
                      },
                      validate: (value) => {
                        const { password } = getValuesProfileForm();
                        return value === password || errorPasswordNotMatch();
                      },
                    })}
                    label="รหัสผ่านอีกครั้ง"
                    type="password"
                  />
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <CircleCheck />}
                  type="submit"
                  className="bg-main text-white"
                >
                  บันทึกข้อมูล
                </Button>

                <Button
                  startContent={<CircleX />}
                  variant="bordered"
                  onClick={() => {
                    setIsLoadingApi(false);
                    onCloseProfileForm();
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const VerifyCodeModal = () => {
    const {
      register: registerVerifyCodeForm,
      handleSubmit: handleSubmitVerifyCodeForm,
      formState: { errors: errorsVerifyCodeForm },
    } = useForm();

    return (
      <Modal
        scrollBehavior="inside"
        size="2xl"
        isOpen={isOpenVerifyForm}
        onClose={() => {
          dispatch(closeVerifyForm());
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>ยืนยันที่อยู่อีเมลของฉัน</ModalHeader>
          <ModalBody>
            <form
              className="space-y-2"
              onSubmit={handleSubmitVerifyCodeForm(async (data) => {
                try {
                  setIsVerifyError(false);
                  const verifyCodeData = await axiosInstance.patch(
                    `${apiEndpoint}/api/v1/auth/verifyCode`,
                    { ...data, email: auth?.email }
                  );

                  if (verifyCodeData?.data?.status == "invalid") {
                    setIsVerifyError(true);
                    return;
                  }

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

                  dispatch(closeVerifyForm());
                  router.reload();
                } catch (error) {
                  console.log(error);
                }
              })}
            >
              {isVerifyError && (
                <ErrorNotification isError>
                  เกิดข้อผิดพลาด ไม่สามารถยืนยันอีเมลนี้ได้
                  คีย์ลับที่ได้จากอีเมลไม่ถูกต้องหรือมีข้อผิดพลาดจากเซิฟเวอร์
                  โปรดลองใหม่อีกครั้ง
                </ErrorNotification>
              )}
              <Input
                size="sm"
                variant="bordered"
                label="คีย์ลับที่ได้จากอีเมล"
                {...registerVerifyCodeForm("verifyCode", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsVerifyCodeForm.verifyCode}
                errorMessage={`${errorsVerifyCodeForm.verifyCode?.message}`}
                labelPlacement="inside"
              />

              <span className="opacity-80">
                ระบบได้ส่งอีเมลไปหาคุณแล้ว เพื่อใช้ในการยืนยันตัวตน
                โดยคุณสามารถกดลิงค์ยืนยันตัวตนจากอีเมลหรือจะนำคีย์ยืนยันตัวตนกลับมากรอกในช่องด้านบนก็ได้ตามความสะดวก
              </span>
              <div>
                <span>
                  คุณไม่พบอีเมลที่ส่งจากระบบหรือไม่?{" "}
                  <span
                    className={`text-main hover:underline font-bold cursor-pointer ${
                      emailCountdown > 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => {
                      if (!apiLoading) {
                        handleResendEmail();
                      }
                    }}
                  >
                    ส่งอีเมลหาฉันอีกครั้ง{" "}
                    {emailCountdown > 0 && `(${emailCountdown} วินาที)`}
                  </span>
                </span>
                <br />
                <span>
                  หรือต้องการเปลี่ยนบัญชีหรือไม่?{" "}
                  <span
                    className="text-main hover:underline cursor-pointer font-bold"
                    onClick={async () => {
                      try {
                        await axios.post("/api/user/logout");
                        router.reload();
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    ออกจากระบบ
                  </span>
                </span>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <CircleCheck />}
                  type="submit"
                  className="bg-main text-white"
                >
                  ยืนยันอีเมล
                </Button>

                <Button
                  startContent={<CircleX />}
                  variant="bordered"
                  onClick={() => {
                    dispatch(closeVerifyForm());
                    setIsLoadingApi(false);
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const LoginModal = () => {
    const {
      register: registerMainForm,
      handleSubmit: handleSubmitMainForm,
      formState: { errors: errorsMainForm },
    } = useForm();

    const [isError, setIsError] = useState(false);

    const apiLogin = async (formData?: any) => {
      setIsLoadingApi(true);
      setIsError(false);

      try {
        const { data } = await axios.post(
          `${apiEndpoint}/api/v1/auth/login`,
          formData
        );

        setCookie(
          "auth",
          {
            id: data.id,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
          {
            maxAge: 24 * 60 * 60,
            path: "/",
          }
        );

        if (data?.role == "admin" || data?.role == "superAdmin") {
          router.push("/admin");
        } else {
          router.reload();
        }
        dispatch(closeLoginForm());
      } catch (error) {
        setIsError(true);
        setIsLoadingApi(false);
        console.log(error);
      }
    };

    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenLoginForm}
        onClose={() => {
          dispatch(closeLoginForm());
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>เข้าสู่ระบบ</ModalHeader>

          <ModalBody>
            <form
              onSubmit={handleSubmitMainForm(async (data) => {
                await apiLogin(data);
              })}
              className="space-y-2"
            >
              {isError && (
                <ErrorNotification isError>
                  เกิดข้อผิดพลาด ไม่สามารถเข้าสู่ระบบได้
                  เนื่องจากรหัสผ่านหรืออีเมลไม่ถูกต้อง โปรดลองใหม่อีกครั้ง
                  แต่ถ้าหากคุณไม่ได้ลืมรหัสผ่านและไม่สามารถเข้าสู่ระบบได้
                  ก็มีโอกาสที่บัญชีนี้กำลังถูกระงับอยู่
                  เนื่องมาจากเหตุผลของเจ้าหน้าที่ดูแลระบบ
                </ErrorNotification>
              )}

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("email", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: regexEmail(),
                    message: errorEmail(),
                  },
                })}
                isInvalid={!!errorsMainForm.email}
                errorMessage={`${errorsMainForm.email?.message}`}
                label="อีเมล"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("password", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.password}
                errorMessage={`${errorsMainForm.password?.message}`}
                label="รหัสผ่าน"
                labelPlacement="inside"
                type="password"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <LogInIcon />}
                  type="submit"
                  className="bg-main text-white"
                >
                  เข้าสู่ระบบ
                </Button>

                <Button
                  startContent={<CircleX />}
                  variant="bordered"
                  onClick={() => {
                    setIsLoadingApi(false);
                    dispatch(closeLoginForm());
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  const RegisterModal = () => {
    const {
      register: registerMainForm,
      handleSubmit: handleSubmitMainForm,
      getValues: getValuesMainForm,
      formState: { errors: errorsMainForm },
    } = useForm();

    const [isError, setIsError] = useState(false);

    const apiRegister = async (formData?: any) => {
      setIsError(false);
      setIsLoadingApi(true);

      try {
        const verifyCode = CryptoJS.lib.WordArray.random(15).toString();

        const { data } = await axios.post(
          `${apiEndpoint}/api/v1/auth/register`,
          { ...formData, verifyCode }
        );

        setCookie("auth", {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        await axios.post(`${apiEndpoint}/sendEmailVerify`, {
          toEmail: formData?.email,
          verifyCode,
          fromCompany: setting?.siteTitle,
          fromEmail: setting?.email,
          key: setting?.key,
        });

        router.reload();
      } catch (error) {
        setIsError(true);
        setIsLoadingApi(false);
        console.log(error);
      }
    };

    return (
      <Modal
        scrollBehavior="inside"
        isOpen={isOpenRegisterForm}
        onClose={() => {
          onCloseRegisterForm();
          setIsLoadingApi(false);
        }}
      >
        <ModalContent>
          <ModalHeader>สมัครสมาชิก</ModalHeader>
          <ModalBody>
            <form
              onSubmit={handleSubmitMainForm(async (data) => {
                await apiRegister(data);
              })}
              className="space-y-2 flex flex-col"
            >
              {isError && (
                <ErrorNotification isError>
                  เกิดข้อผิดพลาด ไม่สามารถสมัครสมาชิกได้
                  เนื่องจากข้อผิดพลาดจากเซิร์ฟเวอร์หรืออีเมลถูกสมัครไปแล้ว
                  โปรดลองใหม่อีกครั้ง
                </ErrorNotification>
              )}

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("name", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.name}
                errorMessage={`${errorsMainForm.name?.message}`}
                label="ชื่อ-นามสกุล"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("email", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: regexEmail(),
                    message: errorEmail(),
                  },
                })}
                isInvalid={!!errorsMainForm.email}
                errorMessage={`${errorsMainForm.email?.message}`}
                name="email"
                label="อีเมล"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                {...registerMainForm("personalId", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  validate: (value) => validateThaiID(value) || errorThaiID(),
                })}
                isInvalid={!!errorsMainForm.personalId}
                errorMessage={`${errorsMainForm.personalId?.message}`}
                label="เลขที่บัตรประชาชน"
                labelPlacement="inside"
              />

              <Input
                size="sm"
                variant="bordered"
                label="รหัสผ่าน"
                {...registerMainForm("password", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                })}
                isInvalid={!!errorsMainForm.password}
                errorMessage={`${errorsMainForm.password?.message}`}
                labelPlacement="inside"
                type="password"
              />

              <Input
                size="sm"
                variant="bordered"
                isInvalid={!!errorsMainForm.confirmPassword}
                errorMessage={`${errorsMainForm.confirmPassword?.message}`}
                {...registerMainForm("confirmPassword", {
                  required: {
                    value: true,
                    message: errorRequire(),
                  },
                  pattern: {
                    value: checkEmpty(),
                    message: errorRequire(),
                  },
                  validate: (value) => {
                    const { password } = getValuesMainForm();
                    return value === password || errorPasswordNotMatch();
                  },
                })}
                label="รหัสผ่านอีกครั้ง"
                labelPlacement="inside"
                type="password"
              />

              <div className="flex justify-end space-x-2">
                <Button
                  isLoading={isLoadingApi}
                  startContent={!isLoadingApi && <LogInIcon />}
                  type="submit"
                  className="bg-main text-white"
                >
                  สมัครสมาชิก
                </Button>

                <Button
                  startContent={<CircleX />}
                  variant="bordered"
                  onClick={() => {
                    setIsLoadingApi(false);
                    onCloseRegisterForm();
                  }}
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <div className={`flex flex-col w-full justify-center items-center h-full`}>
      {ProfileModal()}
      {LoginModal()}
      {RegisterModal()}
      {VerifyCodeModal()}

      <Navbar
        setEnableSidebar={setEnableSidebar}
        onOpenProfileForm={onOpenProfileForm}
        onOpenRegisterForm={onOpenRegisterForm}
        className="fixed top-0 left-0 w-full z-50"
      />

      <div className="flex w-full min-h-screen">
        {enableSidebar && (
          <div className="sticky top-[64px] h-[calc(100vh-64px)]">
            <Sidebar
              isAdmin={isAdmin}
              setEnableSidebar={setEnableSidebar}
              isMobile={isMobile}
            />
          </div>
        )}

        <main
          className={`${
            !removePadding && "p-3.5 lg:p-5"
          } flex flex-col gap-3.5 sm:gap-5 ${
            !enableSidebar ? "w-full" : "w-[calc(100vw-250px)]"
          }`}
        >
          {!isMobile || (isMobile && !enableSidebar) ? (
            <>
              {(!setting?.email || !setting?.key) &&
                auth &&
                auth?.role !== "user" && (
                  <ErrorNotification isError>
                    ขณะนี้ยังไม่มีการตั้งค่าอีเมลที่ใช้ส่งหาผู้ใช้งาน
                    โปรดตั้งค่าการส่งอีเมลของท่านด้วย
                    มีผลอย่างมากในการส่งรหัสยืนยันอีเมลและใบประกาศนียบัตร{" "}
                    <span
                      className="underline cursor-pointer"
                      onClick={() => {
                        dispatch(openEmailForm());
                      }}
                    >
                      ตั้งค่าการส่งอีเมล
                    </span>
                  </ErrorNotification>
                )}

              {auth?.status == "pending" && (
                <ErrorNotification isWarning>
                  โปรดยืนยันอีเมลของคุณ
                  หากไม่ดำเนินการจะไม่สามารถลงทะเบียนเรียนในบทเรียนต่างๆได้{" "}
                  <span
                    onClick={() => {
                      dispatch(openVerifyForm());
                    }}
                    className="underline cursor-pointer"
                  >
                    ยืนยันอีเมลของฉัน
                  </span>{" "}
                </ErrorNotification>
              )}

              {children}
            </>
          ) : null}

          {(!isMobile || (isMobile && !enableSidebar)) && <Footer />}
        </main>
      </div>
    </div>
  );
}
