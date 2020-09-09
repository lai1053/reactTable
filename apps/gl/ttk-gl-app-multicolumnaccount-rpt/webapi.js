/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'
export default {
    multiAccount: {
        /**
         * 初始化
         */
        init: () => fetch.post('/v1/gl/report/multiAccount/init', {}),
        /**
         * 获取直接下级或辅助项列表
         */
        findSecondList: (option) => fetch.post('/v1/gl/report/multiAccount/findSecondList', option),
        /**
         * 查询
         */
        query: (option) => fetch.post('/v1/gl/report/multiAccount/query', option),        
        
        /**
         * 打印
         */
        print: (option) => fetch.printPost('/v1/gl/report/multiAccount/print', option),
        /**
         * 导出
         */
        export: (option) => fetch.formPost('/v1/gl/report/multiAccount/export', option), 
        /**
         * 获取页码 请求参数：
            {
            moduleKey: '你的 app 名',
            resourceKey: ' app 组件名（为了到时候多个 grid 拓展）',
            }
        */
        getPage: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
		/**
		 * 设置页码：请求参数：
		[{
				moduleKey: '你的 app 名',
				resourceKey: 'app 组件名（为了到时候多个 grid 拓展)',
				settingKey: 要设置的pageSize,
				settingValue: 要设置的pageSize
				}]
		 */
        setCurPage: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
      
    }
}