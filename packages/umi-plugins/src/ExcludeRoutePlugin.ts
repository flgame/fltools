const excludeFiles = [
  /\/(component|model|layout|service|util)[s]?\//, // 特定目录
  /^(component|model|layout|service|util)[s]?\//, // 特定目录
  /\/(component|model|layout|service|util)[s]?\.([jt]sx?)$/, // 特定文件
  /^(component|model|layout|service|util)[s]?\.([jt]sx?)$/, // 特定文件
  /\/[._].*/, // 以 . 或 _ 开头的文件或目录
  /^[._].*/, // 以 . 或 _ 开头的文件或目录
  /.*\.d\.ts$/, // .d.ts类型声明文件
  /.*\.(test|spec|e2e)\.(j|t)sx?$/, // 以 test.ts、spec.ts、e2e.ts 结尾的测试文件
];
export default (api: any) => {
  api.describe({
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo: any) => {
    let { conventionRoutes } = memo;
    if (!conventionRoutes) conventionRoutes = {};
    let { exclude } = conventionRoutes;
    if (!exclude) exclude = excludeFiles;
    else exclude = [...exclude, ...excludeFiles];

    conventionRoutes = {
      ...conventionRoutes,
      exclude,
    };

    return {
      ...memo,
      conventionRoutes,
    };
  });
};
