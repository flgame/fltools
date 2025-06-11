import type { IApi, IRoute } from 'umi';
import { dirname } from 'path';

const IS_WIN = process.platform === 'win32';
function isHtmlRoute(route: IRoute) {
  const is404 = route.absPath === '/*';
  if (
    // skip layout
    !route.isLayout &&
    !route.path.endsWith('.html') &&
    // skip dynamic route for win, because `:` is not allowed in file name
    (!IS_WIN || !route.path.includes('/:')) && // skip `*` route, because `*` is not working for most site serve services
    (!route.path.includes('*') || // except `404.html`
      is404)
  ) {
    return true;
  }
  return false;
}
function getHtmlPath(path: string) {
  if (!path) {
    return path;
  }
  if (path === '/*') {
    return '/404.html';
  }
  if (path === '/') {
    return `${path}index.html`;
  }

  // eslint-disable-next-line no-param-reassign
  if (path.endsWith('/')) path = path.slice(0, -1);
  return `${path}.html`;
}

export default (api: IApi) => {
  api.describe({
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo) => {
    return {
      ...memo,
      exportStatic: {
        ...memo.exportStatic,
        htmlSuffix: true,
      },
    };
  });

  // export routes to html files
  api.modifyExportHTMLFiles(async (files) => {
    for (const file of files) {
      const path = dirname(file.path);
      if (path === '.' || path === '/') continue;
      file.path = `${path}.html`;
    }
    return files;
  });

  api.modifyPaths((paths) => {
    return paths;
  });
  api.modifyRoutes((routes: Record<string, IRoute>) => {
    // copy / to /index.html and /xxx to /xxx.html or /xxx/index.html
    for (let key of Object.keys(routes)) {
      const route = routes[key];
      if (isHtmlRoute(route)) {
        key = `${key}.html`;
        // eslint-disable-next-line no-param-reassign
        routes[key] = {
          ...route,
          path: getHtmlPath(route.path),
          isLayout: true,
        };
      }
    }
    return routes;
  });
};
