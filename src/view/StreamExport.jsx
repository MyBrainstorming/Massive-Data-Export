import React, { useState } from "react";
import axios from "axios";

/**
 * 流式导出全部数据为CSV（适合大数据量，边下边写）
 * 注意：前端流式导出需要后端支持流式响应（如text/csv或application/octet-stream），json-server原生不支持真正的流式下载，这里做前端实现演示。
 */
const StreamExport = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // 这里假设后端支持直接返回CSV流（如Content-Type: text/csv）
      const response = await axios.get("http://localhost:3000/users", {
        responseType: "blob", // 以二进制流方式接收
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stream_export.csv";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("导出失败，请重试");
      console.error("流式导出出错：", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        {exporting ? "流式导出中..." : "流式导出全部数据"}
      </button>
    </div>
  );
};

export default StreamExport; 