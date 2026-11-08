import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonStar, Sun } from "lucide-react";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useNextTheme();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setChecked(theme === "dark");
    }
  }, [theme, mounted]);

  const handleChange = () => {
    const newTheme = checked ? "light" : "dark";
    setTheme(newTheme);
    setChecked(!checked);
  };

  if (!mounted) return null;

  return (
    <div
      className="flex space-x-2"
      onClick={handleChange}
      style={{ cursor: "pointer" }}
    >
      {!checked ? <Sun /> : <MoonStar />}
    </div>
  );
};
