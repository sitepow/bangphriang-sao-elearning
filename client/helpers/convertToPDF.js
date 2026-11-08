const convertToPDFClient = async (element, filename = "document.pdf") => {
  const { default: html2pdf } = await import("html2pdf.js");

  const options = {
    margin: 0,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  await html2pdf().from(element).set(options).save();
};

const convertToPDFServer = async (element, filename = "document.pdf") => {
  const { default: html2pdf } = await import("html2pdf.js");

  const options = {
    margin: 0,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };

  return new Promise((resolve, reject) => {
    html2pdf()
      .from(element)
      .set(options)
      .outputPdf("blob")
      .then(resolve)
      .catch(reject);
  });
};

export { convertToPDFClient, convertToPDFServer };
