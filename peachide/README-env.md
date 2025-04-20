# PeachIDE 环境变量配置

本文档说明如何配置PeachIDE的环境变量，以支持不同的开发和部署场景。

## 环境变量文件

PeachIDE使用以下环境变量文件：

- `.env.local`: 本地开发环境变量，不会被提交到版本控制
- `.env.development`: 开发环境变量
- `.env.production`: 生产环境变量
- `.env`: 默认环境变量，适用于所有环境

## 认证模式配置

### NEXT_PUBLIC_MOCK_AUTH

控制是否启用模拟认证模式。

- `true`: 启用模拟认证，所有用户无需登录即可访问所有页面（开发和测试环境使用）
- `false`: 禁用模拟认证，需要真实的用户认证（生产环境使用）

```env
# 开发环境示例
NEXT_PUBLIC_MOCK_AUTH=true

# 生产环境示例
NEXT_PUBLIC_MOCK_AUTH=false
```

## 使用说明

1. 复制`.env.example`文件并重命名为`.env.local`
2. 根据需要修改环境变量值
3. 重启应用服务器以使更改生效

## 注意事项

- 以`NEXT_PUBLIC_`开头的环境变量可以在浏览器端访问
- 不要在版本控制中提交包含敏感信息的环境变量文件
- 在不同环境部署时，确保设置了正确的环境变量 