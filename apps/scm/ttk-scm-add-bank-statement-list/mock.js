/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData
//对账单导入
/**
 * @api {POST} brImport/import import
 * @apiName import
 * @apiGroup brImport
 * @apiVersion 1.0.0
 * @apiDescription 对账单导入，开发者：XXX
 * @apiParamExample {json} 请求示例
 *     {
 *       "accessUrl": "f2871545683314688.xls", -- 文件名，文件上传接口返回的文件名称，newName
 *       "oldName":"233.xls",-- 文件名，文件上传接口返回的文件名称，oldName
 *       "bankAccountId":1,  --账号id
 *       "isRepeatImport":true --允许重复导入
 *       "fileId":xxxx -- 文件ID
 *       "orgId":xxxx -- 机构ID
}
 * @apiErrorExample {json} 重复导入数据提示
 *     {
 *       "result": false,
 *       "error": {
 *         "code": "71106", //通过code判断是否弹提示窗
 *         "message": "当前帐户对应月份存在数据，是否导入？"
 *       }
 *     }
 * @apiSuccessExample {json} 全部成功返回数据示例
 *     {
 *       "result": true,
 *       "value": {
 *           "successCount":10         // 导入成功条数
 *       }
 *     }
 *
 * @apiSuccessExample {json} 部分成功返回数据示例
 *     {
 *       "result": true,
 *       "value": {
 *           "successCount":10         // 导入成功条数
 *           "errorCount":10           // 导入失败条数
 *        "markedExcelFileName":"xx.xls"         // excel 标识失败原因信息的 excel 文件名
 *       }
 *     }
 *
 * @apiError (Error) {Object} data 错误描述信息
 * @apiErrorExample {json} 错误返回数据示例
 *     {
 *       "result": false,
 *       "error": {
 *           "code": "50000",
 *           "message": "系统内部错误"
 *       }
 *     }
 * */