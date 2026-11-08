export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full p-5 items-center text-center flex justify-center border-t bg-white z-50  dark:bg-[#000000] dark:border-dark">
      © {currentYear} e-Learning Pro 2.0 All rights reserved.
    </div>
  );
}
