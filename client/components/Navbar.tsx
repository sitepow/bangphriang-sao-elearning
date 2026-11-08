import { apiEndpoint, getAuth } from "@/helpers";
import { LogInIcon, MenuIcon, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Image,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@nextui-org/react";
import UserPanel from "./UserPanel";
import { openLoginForm } from "@/store/modalSlice";
import { useDispatch } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { ThemeSwitcher } from "./ThemeSwitcher";

export default function NavbarCustom({
  setEnableSidebar,
  onOpenProfileForm,
  onOpenWebSetting,
  onOpenRegisterForm,
}: any) {
  const [auth, setAuth] = useState<any>(null);
  const isMobileQuery = useMediaQuery({ maxWidth: 765 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  const dispatch = useDispatch();
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

  return (
    <Navbar maxWidth="full" isBordered>
      <NavbarBrand className="gap-2 sm:gap-5 ">
        {isMobileQuery && (
          <MenuIcon
            className="z-50 hover:scale-105 duration-300 cursor-pointer"
            onClick={() => {
              setEnableSidebar((previewValue: any) => !previewValue);
            }}
          />
        )}

        {settings?.isShowSiteTitle && (
          <div className="flex justify-center items-center space-x-2">
            {settings?.isLogoCircle ? (
              <div className="flex flex-wrap gap-2 items-center">
                <Image
                  src={`${apiEndpoint}/logo/logo.png`}
                  width={500}
                  height={500}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <Chip size="sm" variant="flat">
                  v2.0.0
                </Chip>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <Image
                  src={`${apiEndpoint}/logo/logo.png`}
                  width={500}
                  height={500}
                  alt=""
                  className="w-10 h-10"
                />
                <Chip size="sm" variant="flat">
                  v2.0.0
                </Chip>
              </div>
            )}
          </div>
        )}

        {!settings?.isShowSiteTitle && (
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex justify-center items-center gap-1">
              {settings?.isLogoCircle ? (
                <Avatar alt="logo" src={`${apiEndpoint}/logo/logo.png`} />
              ) : (
                <img
                  alt="logo"
                  src={`${apiEndpoint}/logo/logo.png`}
                  className="h-12"
                />
              )}

              {!isMobile && (
                <span className="font-bold px-1">{settings?.logoTitle}</span>
              )}
            </div>
            <Chip size="sm" variant="flat">
              v2.0.0
            </Chip>
          </div>
        )}
      </NavbarBrand>

      <NavbarContent justify="end">
        <ThemeSwitcher />

        {auth && (
          <UserPanel
            onOpenProfileForm={onOpenProfileForm}
            onOpenWebSetting={onOpenWebSetting}
            auth={auth}
          />
        )}
        {!auth && (
          <div className="space-x-2 flex justify-center items-center">
            <Button
              isIconOnly={isMobile ? true : false}
              startContent={<UserPlus />}
              variant="bordered"
              onClick={onOpenRegisterForm}
            >
              <span className="hidden md:block">สมัครสมาชิก</span>
            </Button>
            <Button
              isIconOnly={isMobile ? true : false}
              startContent={<LogInIcon />}
              className="bg-main text-white"
              onClick={() => {
                dispatch(openLoginForm());
              }}
            >
              <span className="hidden md:block">เข้าสู่ระบบ</span>
            </Button>
          </div>
        )}
      </NavbarContent>
    </Navbar>
  );
}
