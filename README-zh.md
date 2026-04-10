项目根目录执行全量编译：pnpm build
只编译 chrome-extension 主扩展：pnpm -F chrome-extension build

**`pnpm build`**（项目根目录）：
   - 触发 **turbo.json** 中定义的所有 build 任务                                   
   - 会按依赖顺序构建**所有工作区**（chrome-extension、packages/*、pages/* 等）
   - 时间较长，但能确保所有包都最新

**`pnpm -F chrome-extension build`**： 
   - 只构建 **chrome-extension** 这一个工作区
   - 如果它依赖的其他包（如 packages/ui、packages/storage）已经构建过或有缓存，则直接使用
   - 时间较短，适合快速验证单个包的修改
   
   简单说：
   - `pnpm build` = 全量构建
   - `pnpm -F <workspace> build` = 单独构建某个包

chrome-extension 里面放的是源代码
dist 里面是打包好的，导入Chrome使用