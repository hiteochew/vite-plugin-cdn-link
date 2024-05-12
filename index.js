import color from "picocolors";
import { globSync } from "glob";
import fs from "fs";
import path from "path";

import { normalizePath } from "vite";

export default function vitePluginCdnLink(options) {
  let baseConfig = "/";
  let buildConfig = {};

  if (options.enabled !== void 0 && !options.enabled) {
    return;
  }

  return {
    name: "vite-plugin-cdn-link",
    enforce: "post",
    apply: "build",
    configResolved(config) {
      baseConfig = config.base;
      buildConfig = config.build;
    },

    closeBundle: {
      sequential: true,
      order: "post",
      async handler() {
        if (!/^[http|\/\/]/i.test(options.cdnPrefix)) {
          throw Error("[vite-plugin-cdn-link] cdnPrefix must be a url");
        }

        const outDirPath = normalizePath(
          path.resolve(normalizePath(buildConfig.outDir))
        );
        const ssrClient = buildConfig.ssrManifest;
        const ssrServer = buildConfig.ssr;

        const files = globSync("**", {
          nodir: true,
          dot: true,
          absolute: true,
          cwd: outDirPath,
          ignore:
            // custom ignore
            options.ignore !== undefined
              ? options.ignore
              : // ssr client ignore
              ssrClient
              ? ["**/ssr-manifest.json"]
              : // ssr server ignore
              ssrServer
              ? ["**"]
              : // default ignore
                "",
        });

        console.log(
          "\n开始替换cdn链接：" +
            (ssrClient ? " (ssr client)" : ssrServer ? " (ssr server)" : "") +
            "\n"
        );

        const startTime = new Date().getTime();
        let count = { file: 0, replace: 0 };

        for (const fileFullPath of files) {
          const filePath = normalizePath(fileFullPath);
          const ourDirFilePath = filePath.split(outDirPath)[1]; // eg: '/assets/vendor.bfb92b77.js'
          const fileContent = fs.readFileSync(filePath, "utf8");
          const regex = new RegExp(`["|'](\/${options.staticPrefix ?? "static"}\/[^"|']+)`, 'g');
          const newContent = fileContent.replace(
            regex,
            //`${options.cdnPrefix}$1"`
            (match, p1) => {
              //console.log(`${match},${p1},${options.cdnPrefix}${p1},`)
              count.replace++;
              return `${options.cdnPrefix}${p1}`;
            }
          );
          if (newContent !== fileContent) {
            fs.writeFileSync(filePath, newContent, "utf8");
            count.file++;
            console.log(
              `Updated: ${color.green(buildConfig.outDir + ourDirFilePath)}`
            );
          }
        }

        const duration = (new Date().getTime() - startTime) / 1000;

        console.log(
          `\n更新 ${count.file} 个文件:，共替换 ${
            count.replace
          } 处，用时 ${duration.toFixed(2)}秒\n`
        );
      },
    },
  };
}
