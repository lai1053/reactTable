export const createPrintStyle = size => {
  const style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = `
  @media screen {
    .print-wrapper {
      display: none;
    }
  }

  @page{
    size: ${size || "A4 landscape"};
  }
  
  @media print {
    body * {
      visibility: hidden;
    }
    .print-wrapper,
    .print-wrapper * {
      visibility: visible !important;
      -webkit-print-color-adjust: exact;
    }
    .print-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }`;
  return document.head.appendChild(style);
};
