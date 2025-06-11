import type { IApi } from 'umi';
import { Mustache } from '@umijs/utils';

const EXP_URL = /^(http:|https:)?\/\//;

interface ILinkNode {
  attribs: {
    href: string;
  };
}
interface IScriptNode {
  attribs: {
    src: string;
  };
}

/**
 * 格式化url，去掉多余的//，兼容//a.com//////b.html、protocol:////a.com//b.html
 * @param {*} url 需要格式化的链接
 * @returns string
 */
function normalizeURL(url: string) {
  if (url) {
    let i = url.indexOf('?');
    const j = url.indexOf('#');
    let n = Math.min(i, j);
    if (n === -1) n = Math.max(i, j);
    if (n === -1) n = url.length;
    let s1 = url.substring(0, n);
    const s2 = url.substring(n);
    let sp = '';
    n = 0;
    if (s1.substring(0, 2) === '//') {
      n = 1;
    } else {
      i = s1.indexOf(':/');
      if (i >= 0) {
        n = i + 2;
      }
    }
    if (n > 0) {
      sp = s1.substring(0, n);
      s1 = s1.substring(n);
    }
    // eslint-disable-next-line no-param-reassign
    url = sp + s1.replace(/\/\/*/g, '/') + s2;
  }
  return url;
}

function updateLinks(links: ILinkNode[], base: string) {
  for (const link of links) {
    const {
      attribs: { href },
    } = link;
    if (!href || EXP_URL.test(href)) continue;
    link.attribs.href = normalizeURL(base + href);
  }
}
function updateScripts(scripts: IScriptNode[], base: string) {
  for (const script of scripts) {
    const {
      attribs: { src },
    } = script;
    if (!src || EXP_URL.test(src)) continue;
    script.attribs.src = normalizeURL(base + src);
  }
}
export default (api: IApi) => {
  api.describe({
    enableBy: api.EnableBy.register,
  });

  api.modifyConfig((memo) => {
    return {
      ...memo,
      runtimePublicPath: true,
      exportStatic: {
        ...memo.exportStatic,
        dynamicRoot: true,
      },
    };
  });

  api.modifyHTML(($, { path }) => {
    const {
      exportStatic: { htmlSuffix },
    } = api.config;

    let pathS = path;
    const isSlash = pathS.endsWith('/');
    if (pathS === '/404') {
      // do nothing
    }
    // keep the relative path same for route /xxx and /xxx.html
    else if (htmlSuffix && isSlash) {
      pathS = pathS.slice(0, -1);
    }
    // keep the relative path same for route /xxx/ and /xxx/index.html
    else if (!htmlSuffix && !isSlash) {
      pathS += '/';
    }

    const pathN = Math.max(pathS.split('/').length - 1, 1);
    const routerBaseStr = `location.pathname.split('/').slice(0, -${pathN}).concat('').join('/')`;
    const publicPathStr = `location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase`;

    let base = './';
    const arr = pathS.replace(/\/\/+/g, '/').split('/');
    if (arr && arr.length > 2) {
      base = `${[...new Array(arr.length - 2)].map(() => '..').join('/')}/`;
    }
    updateLinks(Array.from($('link[href]')), base);
    updateScripts(Array.from($('script[src]')), base);
    $('head').prepend(`
<script>
window.routerBase = ${routerBaseStr};
if(!window.publicPath) {
  window.publicPath = ${publicPathStr};
}
</script>
    `);
    return $;
  });

  api.onGenerateFiles(async () => {
    const htmlData = api.appData?.exportHtmlData || [];

    api.writeTmpFile({
      path: 'core/dynamicRootRuntimePlugin.ts',
      content: Mustache.render(
        `
export function modifyContextOpts(memo: any) {
  return {
    ...memo,
    basename: window.routerBase || memo.basename,
  }
}
      `.trim(),
        {
          ignorePaths: JSON.stringify(
            htmlData
              .filter(({ prerender }: any) => prerender === false)
              .map(({ route }: any) => route.path),
          ),
        },
      ),
      noPluginDir: true,
    });
  });
  api.addRuntimePlugin(() => {
    return [`@@/core/dynamicRootRuntimePlugin.ts`];
  });
};
