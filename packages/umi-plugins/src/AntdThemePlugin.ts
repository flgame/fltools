const antdStyle = /^antd\/.*(\/style|\.css|\.less|\.sass|\.scss)/;
const antdTheme = ({ request }: any, callback: any) => {
  if (antdStyle.test(request)) {
    return callback(null, '{}');
  }
  return callback();
};
export default (api: any) => {
  api.describe({
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo: any) => {
    let { externals } = memo;
    if (!externals) externals = [];
    else if (!Array.isArray(externals)) {
      externals = [externals];
    }
    externals.push(antdTheme);
    return {
      ...memo,
      externals,
    };
  });
};
