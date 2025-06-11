---
`umi4` 中支持`htmlSuffix`、`dynamicRoot`功能。`AntdThemePlugin`插件不支持`mako`。

```js
# .umi.ts
import { defineConfig } from '@umijs/max';

export default defineConfig({
  plugins: [
    // htmlSuffix生成xxx.html文件，支持xxx.html路由
    '@fltools/umi-plugins/HtmlSuffixPlugin',
    // 支持任意目录部署，script.src、link.href中'/', './'开头的链接会被转换为相对html的路径
    // 启用后可通过window.routerBase（不带origin部分，如 /dir1/dir2）、window.publicPath（带origin部分，如 http://example.com/dir1/dir2）访问应用前缀
    '@fltools/umi-plugins/DynamicRootPlugin',
    // 解决antd样式覆盖问题问题，避免样式重复加载
    '@fltools/umi-plugins/AntdThemePlugin',
    // 过滤一些不需要的文件，比如用于过滤 (component|model|layout|service|util)[s]?、 . 或 _ 开头的文件或目录 等
    '@fltools/umi-plugins/ExcludeRoutePlugin',
  ],
})
```
