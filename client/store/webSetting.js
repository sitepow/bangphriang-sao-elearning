import { createSlice } from "@reduxjs/toolkit";
import {
  Home,
  Award,
  Users,
  List,
  FileText,
  Box,
  Book,
  FileQuestion,
  MoveUpLeft,
  DatabaseZap,
  Folder,
} from "lucide-react";

const initialState = {
  adminMenu: [
    { title: "หน้าแรก", url: "/admin", icon: <Home className="text-gray" /> },
    {
      title: "กลับไปยังหน้าบ้าน",
      url: "/",
      icon: <MoveUpLeft className="text-gray" />,
    },
    {
      title: "มอบใบประกาศนียบัตร",
      url: "/admin/certification",
      icon: <Award className="text-gray" />,
    },
    {
      title: "จัดการข้อมูล",
      url: "",
      icon: <DatabaseZap className="text-gray" />,
      subCategories: [
        {
          title: "ผู้ใช้งาน",
          url: "/admin/user",
          disabled: true,
          icon: <Users className="text-gray" />,
        },
        {
          title: "หมวดหมู่",
          url: "/admin/category",
          icon: <List className="text-gray" />,
        },
        {
          title: "บทความ",
          url: "/admin/content",
          icon: <FileText className="text-gray" />,
        },
        {
          title: "คลังข้อสอบ",
          url: "/admin/question",
          icon: <Box className="text-gray" />,
        },
        {
          title: "บทเรียน",
          url: "/admin/course",
          icon: <Book className="text-gray" />,
        },
      ],
    },
  ],
  userMenu: [
    { title: "หน้าแรก", url: "/", icon: <Home className="text-gray" /> },
    {
      title: "คู่มือการใช้งาน",
      url: "/docs",
      icon: <FileQuestion className="text-gray" />,
    },
    {
      title: "บทเรียนทั้งหมด",
      url: "/course",
      icon: <Folder className="text-gray" />,
    },
    {
      title: "บทความทั้งหมด",
      url: "/content",
      icon: <Folder className="text-gray" />,
    },
  ],
};

const webSettingSlice = createSlice({
  name: "webSetting",
  initialState,
  reducers: {
    updateUserMenu: (state, action) => {
      state.userMenu = [...state.userMenu, ...action.payload];
    },
  },
});

export const { updateUserMenu } = webSettingSlice.actions;
export default webSettingSlice.reducer;
