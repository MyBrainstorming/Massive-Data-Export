import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Mock from 'mockjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成手机号
const generatePhone = () => {
  const prefixes = ['133', '135', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '187', '188'];
  const prefix = Mock.Random.pick(prefixes);
  const suffix = Mock.Random.string('number', 8);
  return prefix + suffix;
};

// 生成公司名
const generateCompany = () => {
  const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉'];
  const types = ['科技', '网络', '信息', '电子', '通信', '软件'];
  const suffixes = ['有限公司', '股份有限公司', '集团'];
  return Mock.Random.pick(prefixes) + Mock.Random.pick(types) + Mock.Random.pick(suffixes);
};

// 生成单个用户数据
const generateUser = (id) => {
  const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省'];
  const cities = {
    '北京市': ['朝阳区', '海淀区', '丰台区', '西城区'],
    '上海市': ['浦东新区', '徐汇区', '静安区', '黄浦区'],
    '广东省': ['广州市', '深圳市', '珠海市', '东莞市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '绍兴市'],
    '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
    '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市'],
    '湖北省': ['武汉市', '宜昌市', '襄阳市', '十堰市']
  };

  const province = Mock.Random.pick(provinces);
  const city = Mock.Random.pick(cities[province]);
  const districts = ['东区', '西区', '南区', '北区', '中心区'];
  const district = Mock.Random.pick(districts);

  return {
    id: id.toString(),
    name: Mock.Random.cname(),
    age: Mock.Random.integer(18, 60),
    email: Mock.Random.email(),
    phone: generatePhone(),
    address: `${province}${city}${district}`,
    company: generateCompany(),
    department: Mock.Random.pick(['技术部', '市场部', '销售部', '人事部', '财务部']),
    position: Mock.Random.pick(['工程师', '经理', '总监', '主管', '专员']),
    salary: Mock.Random.integer(5000, 50000),
    joinDate: Mock.Random.date('yyyy-MM-dd'),
    status: Mock.Random.pick(['在职', '离职', '休假']),
  };
};

// 生成指定数量的用户数据
const generateUsers = (count) => {
  console.log(`开始生成 ${count} 条用户数据...`);
  const users = Array.from({ length: count }, (_, index) => generateUser(index + 1));
  console.log('用户数据生成完成！');
  return users;
};

// 生成数据库文件
const generateDatabase = () => {
  try {
    console.log('开始生成数据库...');
    const users = generateUsers(1000); // 生成1000条用户数据
    const db = { users };
    
    // 确保目录存在
    const dirPath = path.dirname(path.join(__dirname, '../db.json'));
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // 将数据写入文件
    const filePath = path.join(__dirname, '../db.json');
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    console.log(`数据库生成成功！已写入 ${users.length} 条用户数据到 ${filePath}`);
  } catch (error) {
    console.error('生成数据库时出错：', error);
  }
};

// 执行生成
console.log('开始执行数据生成脚本...');
generateDatabase();
console.log('脚本执行完成！'); 