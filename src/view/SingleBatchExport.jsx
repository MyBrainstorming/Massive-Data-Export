import React, { useState } from "react";
import axios from "axios";

/**
 * 一次性获取所有数据并导出为CSV
 */
const fetchAllData = async () => {
  try {
    // 直接获取全部数据（假设json-server支持）
    const response = await axios.get("http://localhost:3000/users");
    return response.data;
  } catch (error) {
    console.error("请求数据时出错：", error);
    return [];
  }
};

const convertToCSV = (data) => {
  if (!data.length) return "";
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) => Object.values(row).join(","));
  return [headers, ...rows].join("\n");
};

const SingleBatchExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const data = await fetchAllData();
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_data.csv";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setExporting(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {exporting ? "导出中..." : "一次性导出全部数据"}
      </button>
    </div>
  );
};

export default SingleBatchExport; 