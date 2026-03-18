export const VI = {
  // Page
  title: "Truy Xuất Dữ Liệu Chứng Khoán",
  subtitle: "Nhập thông tin để tạo báo cáo lịch sử giao dịch.",

  // Form
  symbolLabel: "Mã chứng khoán",
  symbolPlaceholder: "VD: VNM, FPT, HPG",
  startDateLabel: "Ngày bắt đầu",
  endDateLabel: "Ngày kết thúc",
  datePlaceholder: "DD/MM/YYYY",
  sourceLabel: "Nguồn dữ liệu",
  sourceVndirect: "VNDirect",
  sourceSsi: "SSI",
  sourceDnse: "DNSE",
  sourceBoth: "Cả ba",
  submitButton: "Tạo Báo Cáo",

  // Loading
  loadingTitle: "Đang tải dữ liệu...",
  initConnection: "Đang khởi tạo kết nối...",
  fetchingData: (symbol: string) =>
    `Đang tải dữ liệu cho ${symbol}...`,
  fetchComplete: (symbol: string, count: number) =>
    `Hoàn tất tải ${symbol} [${count} bản ghi]`,
  fetchError: (symbol: string, message: string) =>
    `Lỗi khi tải ${symbol}: ${message}`,
  authOk: "Xác thực thành công [OK]",

  // Report
  tableSymbol: "Mã CK",
  tableCompanyName: "Tên công ty",
  tableExchange: "Sàn",
  tableDate: "Ngày",
  tableOpenPrice: "Giá mở cửa",
  tableClosePrice: "Giá đóng cửa",
  tableSource: "Nguồn",
  periodHigh: "Giá cao nhất",
  periodLow: "Giá thấp nhất",
  recordCount: "Số bản ghi",
  extract: "Xuất dữ liệu",

  // Extract Modal
  extractTitle: "Xuất Dữ Liệu",
  extractDesc: "Chọn định dạng tệp để xuất dữ liệu.",
  downloadButton: "Tải Xuống",

  // Errors
  noData: "Không tìm thấy dữ liệu.",
  invalidSymbol: "Mã chứng khoán không hợp lệ.",
  networkError: "Lỗi kết nối mạng.",
} as const;
