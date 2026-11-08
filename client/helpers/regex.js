const regexThaiID = () => {
  return /^\d{13}$/;
};

const validateThaiID = (id) => {
  if (!regexThaiID().test(id)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  const checkDigit = (11 - (sum % 11)) % 10;

  return checkDigit === parseInt(id.charAt(12));
};

const errorThaiID = () => {
  return "รูปแบบบัตรประชาชนไม่ถูกต้อง";
};

const regexEmail = () => {
  return /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
};

const errorEmail = () => {
  return "รูปแบบอีเมลไม่ถูกต้อง";
};

const regexPhone = () => {
  return /^\d{10}$/;
};

const errorPhone = () => {
  return "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
};

const checkEmpty = () => {
  return /\S/;
};

const errorPasswordNotMatch = () => {
  return "รหัสผ่านไม่ตรงกัน";
};

const errorRequire = () => {
  return "ฟิลด์นี้ไม่สามารถเว้นว่างได้";
};

const regexHexColor = () => {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/;
};

const errorHexColor = () => {
  return "รูปแบบสีไม่ถูกต้อง";
};

export {
  regexThaiID,
  errorThaiID,
  regexEmail,
  errorEmail,
  validateThaiID,
  regexPhone,
  errorPhone,
  errorPasswordNotMatch,
  errorRequire,
  checkEmpty,
  regexHexColor,
  errorHexColor,
};
