import { Plugin } from 'vite'

interface Options {
  /** cdn地址前缀 */
  cdnPrefix: string
  /** public静态资源前缀，默认static，前后无需夹\/，如果是多级目录前缀，则写为“static\/cdn”,意思是将public下static里面cdn的资源都变成cdn链接 */
  staticPrefix: string
  /** Ignore file or dir rules. If you use empty string `''`, no files or dir will be ignored. Default '\*\*\/\*.html' '**\/*.html'*/
  ignore?: string[] | string
  /** 启用插件，默认为 true */
  enabled?: boolean
}

declare function vitePluginCdnLink(options: Options): Plugin

export { vitePluginCdnLink as default }
