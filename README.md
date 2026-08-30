# Janus

基于 Cloudflare Workers 的 HMAC 签名反向代理。携带合法 `d` + `t` 的请求会验签后转发至目标源站；访问 Worker 根路径（无 `d` / `t`）时展示内嵌工具页，所有转换均在浏览器本地完成，密钥不会上传到服务器。

## 功能概览

| 模式 | 触发条件 | 说明 |
|------|----------|------|
| 工具主页 | GET，且缺少 `d` 或 `t` | 链接转换、VLESS 订阅转换 |
| 代理转发 | 请求带 `d` + `t` | 验签后替换 `host:port`，路径与查询参数透传 |

## 代理机制

| 参数 | 含义 |
|------|------|
| `d` | destination，原始目标的 `host:port` |
| `t` | `HMAC-SHA256(SECRET_KEY, d)` 的十六进制字符串 |

示例：访问

```text
https://janus.example.com/index.html?d=example.com:8080&t=<hmac_hex>
```

Worker 验签后转发至 `https://example.com:8080/index.html`（去掉 `d` / `t`，其余路径与查询参数不变）。

> 回源协议固定为 HTTPS（`d` 中不含协议信息，协议取自 Worker 入站请求）。目标须为 HTTPS 源站。

同一 `host:port` 下，相对路径的资源与链接可继续通过 Worker 访问（URL 中保留相同的 `d` / `t`）。页面内若使用指向源站的绝对 URL，则会直连源站、不经过 Worker。

## 工具页

### 链接转换

粘贴完整目标 URL（如 `https://example.com:8080/index.html`），生成 Worker 域名下的等价链接：

- 域名换为 Worker 域名，路径与查询参数保持不变
- `d` 仅含原始 `host:port`，`t` 对其签名

### 订阅转换

粘贴 `vless://` 链接（每行一条）或 base64 订阅内容，本地改写为经 Janus 代理的 VLESS 链接。仅支持 VLESS 协议；转换后使用当前 Worker 域名作为代理地址。

### URL 参数

工具页支持以下查询参数（加载后自动从地址栏移除）：

| 参数 | 说明 |
|------|------|
| `key` | 预填密钥（与 Worker 环境变量 `SECRET_KEY` 一致） |
| `tab` | 打开指定标签页：`url`（链接转换）或 `sub`（订阅转换） |

```text
https://janus.example.com/?key=your_secret
https://janus.example.com/?tab=url
https://janus.example.com/?key=your_secret&tab=sub
```

**请勿将带 `key` 的链接分享给他人。**

## 部署

1. Cloudflare Dashboard → Workers → Create
2. 粘贴 **`worker.obf.js`**（推荐）或 `worker.js`
3. Settings → Variables → Secret：`SECRET_KEY`
4. Settings → **Compatibility date** ≥ `2024-09-02`（支持非标出站端口）
5. 绑定自定义域名

## 非标端口

- 目标须为**直连源站**（DNS 灰云），且 HTTPS 证书链完整可信
- 橙云（Proxied）目标仅支持 Cloudflare 反代端口：`443` / `2053` / `2083` / `2087` / `2096` / `8443`

## 文件

```text
janus/
├── worker.obf.js   # 推荐部署（规避源码敏感关键字）
└── worker.js       # 可读源码
```

## 与 Prism 的关系

[Prism](https://github.com/vevc/prism) 为 Cloudflare Snippets 轻量版（默认 443，无内嵌工具页）；Janus 为 Workers 完整版，支持非标端口与内嵌工具页。
