#### 租房水费电费计算系统，目前为v1版本，体验地址：https://dgr.wisincrease.com/

##### 当前实现： 1.电费计算 2.水费计算 3.动态选择数据本地或云端存储

##### 未来: 1.社区支持，支持点赞、评论等 2.计算结果密码授权访问等功能 3.其他（暂时没有想到）

# 前端
## 技术：React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

All shadcn/ui components have been downloaded under `@/components/ui`.

## Commands

**Install Dependencies**

```shell
pnpm i
```

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
Pnpm run build
```

# 服务端
#### 目录：server
**注意事项：**
```shell
目前使用的是mongodb，需要使用服务端请修改db.js中如下两个为你的地址
// MongoDB connection URI
const uri = "mongodb://root:CydubPI3ZaKGjPM2@192.168.0.17:27017";
// Database name
const dbName = 'rental_utilities_calculator';
```