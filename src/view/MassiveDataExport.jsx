//分批异步多并发导出
import React, { useState } from "react";
import axios from "axios"; // 引入 axios
/**
 * 模拟后端分页接口
 * @param {number} page - 当前页码，从 0 开始
 * @param {number} pageSize - 每页记录数
 * @returns {Promise<Array<Object>>} - 模拟返回的数据
 */
const mockFetchData = async (page, pageSize) => {
  // 使用 axios 发送 GET 请求
  // 假设后端接口地址为 /api/data
  console.log();
  
  try {
    const response = await axios.get("http://localhost:3000/users", { params: { _start: page * pageSize, _limit: pageSize } });
    return response.data
  } catch (error) {
    console.log("请求数据时出错：", error);
    return [];// 返回空数组以避免导出时出错
  }
};

/**
 * 将对象数组转换为 CSV 字符串
 * @param {Array<Object>} data - 待导出的数据
 * @returns {string} - CSV 字符串
 */
const convertToCSV = (data) => {
  // 如果数据为空，则返回空字符串
  if (!data.length) return "";

  // 获取列头，即数据对象的键，用逗号拼接成字符串
  // 例如：[{ id: 1, name: "Item 1", value: "0.12" }] -> "id,name,value"
  const headers = Object.keys(data[0]).join(",");

  // 对于每一行数据，获取其值并用逗号拼接成字符串；然后对所有行重复这个过程
  // 例如：[{ id: 1, name: "Item 1", value: "0.12" }] -> ["1,Item 1,0.12"]
  const rows = data.map((row) => Object.values(row).join(","));

  // 将列头和所有行的字符串数组拼接成一个完整的 CSV 字符串，用换行符分隔
  // 例如：["id,name,value", "1,Item 1,0.12"] -> "id,name,value\n1,Item 1,0.12"
  return [headers, ...rows].join("\n");
};

/**
 * 并发执行任务（带有并发限制）
 * @param {Array<Function>} tasks - 每个任务是一个返回 Promise 的函数
 * @param {number} concurrency - 最大并发数
 * @returns {Promise<Array<any>>} - 所有任务的结果（按顺序）
 */
const runWithConcurrency = async (tasks, concurrency) => {
  const results = []; // 用于存储所有任务的结果
  let index = 0;      // 任务的索引

  // 定义一个异步函数来执行下一个任务
  const runNext = async () => {
    // 如果当前索引已经超过了任务数组的长度，说明所有任务已经执行完毕，直接返回
    if (index >= tasks.length) return;

    // 获取当前任务的索引并递增
    // 这里使用 currentIndex 临时保存当前索引是为了确保结果数组的顺序与任务的顺序一致
    const currentIndex = index++;

    // 执行当前任务，并等待其完成
    // 这里 tasks[currentIndex]() 是一个返回 Promise 的函数
    const result = await tasks[currentIndex]();

    // 将任务的结果存储到结果数组中，确保结果的顺序与任务的顺序一致
    results[currentIndex] = result;

    // 递归调用 runNext，以便在当前任务完成后继续执行下一个任务
    // 这样可以确保在并发限制内尽可能多地执行任务
    await runNext();
  };

  // 启动指定数量的并发任务，最多启动 concurrency 个任务
  // 使用 Array.from 创建一个长度为 concurrency 的数组，并为每个元素分配一个 runNext 函数
  const workers = Array.from({ length: concurrency }, runNext);

  // 使用 Promise.all 等待所有并发任务完成
  // 这里 workers 是一个包含多个 runNext 函数的数组，Promise.all 会等待所有这些函数执行完毕
  await Promise.all(workers);

  // 返回所有任务的结果数组
  return results;
};

/**
 * 导出组件
 */
const ExportComponent = () => {
  // 使用 useState 钩子定义 exporting 状态，用于控制导出按钮的状态
  // 初始状态为 false，表示未开始导出
  const [exporting, setExporting] = useState(false);

  /**
   * 处理导出按钮点击事件
   */
  const handleExport = async () => {
    // 设置 exporting 为 true，表示导出已经开始
    setExporting(true);

    // 设置导出配置参数
    // 假设总数据量为 1000 条记录
    const total = 1000;
    // 每批条数为 200
    const pageSize = 200;
    // 计算总共需要多少批，使用 Math.ceil 确保如果有余数也会多算一批
    const pages = Math.ceil(total / pageSize);
    // 同时最多 3 个请求（即并发数为 3）
    const concurrency = 3;

    // 创建分页任务数组，每个任务返回一批数据
    // 使用 Array.from 创建一个长度为 pages 的数组，并为每个元素分配一个返回 Promise 的函数
    // 这些函数会在调用时实际获取数据
    const tasks = Array.from({ length: pages }, (_, i) => () => mockFetchData(i, pageSize));

    // 并发执行所有任务，结果是每页的数据组成的二维数组
    // 使用 runWithConcurrency 函数并发执行任务，并设置最大并发数为 3
    const results = await runWithConcurrency(tasks, concurrency);
    console.log("results", results.flat());
    
    // 合并所有批次的数据
    // 使用 flat 方法将二维数组转换为一维数组，即所有页面的数据合并成一个数组
    const flatData = results.flat();

    // 将合并后的数据转换为 CSV 字符串
    const csvContent = convertToCSV(flatData);

    // 创建 Blob 对象，并创建下载链接
    // Blob 对象表示不可变的原始数据的类文件对象
    // 第一个参数是一个包含 CSV 内容的数组，第二个参数指定了 Blob 的 MIME 类型
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // 使用 URL.createObjectURL 创建一个指向 Blob 对象的 URL
    // 这个 URL 可以用于下载文件
    const url = URL.createObjectURL(blob);

    // 创建一个临时的 <a> 元素并设置其 href 属性为 CSV 文件的 URL
    // 设置 download 属性指定下载的文件名
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_data.csv";

    // 将临时的 <a> 元素添加到文档中，以确保它可以被点击
    document.body.appendChild(a);

    // 触发 <a> 元素的点击事件，开始下载 CSV 文件
    a.click();

    // 清理 URL 和临时元素
    // 使用 URL.revokeObjectURL 释放 URL 对象，防止内存泄漏
    URL.revokeObjectURL(url);

    // 从文档中移除临时的 <a> 元素
    document.body.removeChild(a);

    // 设置 exporting 为 false，表示导出已经完成
    setExporting(false);
  };

  // 返回组件的 JSX 结构
  return (
    <div className="p-4">
      {/* 导出按钮 */}
      <button
        // 设置按钮的点击事件处理函数为 handleExport
        onClick={handleExport}
        // 如果正在导出，则禁用按钮
        disabled={exporting}
        // 设置按钮的样式类
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {/* 根据 exporting 状态显示按钮文本 */}
        {exporting ? "导出中..." : "导出数据"}
      </button>
    </div>
  );
};

// 导出 ExportComponent 组件作为默认导出
export default ExportComponent;
