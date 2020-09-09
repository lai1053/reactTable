/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData


fetch.mock('/v1/biz/invoice/queryAccount', (option) => {
    return {"result":true,
        "value":{
        "skssq":"201905",
            "khRangeList":[{"rangeType":"all","rangeName":"全公司","rangeDesc":"最高权限"},{"rangeType":"109947_002","rangeName":"部门","rangeDesc":"部门权限"},{"rangeType":"self","rangeName":"个人"}],
            "list": [{
                "qyId": "111111",
                "khmc": "111112",
                "nsrsbh": "111113",
                "mneCod": "111114",
                "djxh": "111115",
                "sqldse": "111116",
                "xxfpfs": "111117",
                "xxhjje": "111118",
                "xxhjse": "111119",
                "xxcjzt": "111120",
                "xxcjztmsg": "111121",
                "jxfpfsyrz": "111122",
                "jxhjjeyrz": "111123",
                "jxhjseyrz": "111124",
                "jxfpfswrz": "111125",
                "jxhjjewrz": "111126",
                "jxhjsewrz": "111127",
                "jxcjzt": "111128",
                "jxcjztmsg": "111129",
                "ygse": "111130",
                "khRangeLis": "111131",
                "rangeType": "111132",
                "rangeName": "111133",
                "rangeDesc": "111134",
                "jxSeMsg": "01月份：份数（2）金额（1278）税额（12）;02月份：份数（2）金额（1278）税额（12）;03月份：份数（2）金额（1278）税额（12）",
                "xxSeMsg": "01月份：份数（2）金额（12780）税额（12）;02月份：份数（20）金额（1278）税额（112）;03月份：份数（2）金额（1278）税额（12"
            }, {
                "qyId": "211111",
                "khmc": "211112",
                "nsrsbh": "211113",
                "mneCod": "211114",
                "djxh": "211115",
                "sqldse": "211116",
                "xxfpfs": "211117",
                "xxhjje": "211118",
                "xxhjse": "211119",
                "xxcjzt": "211120",
                "xxcjztmsg": "211121",
                "jxfpfsyrz": "211122",
                "jxhjjeyrz": "211123",
                "jxhjseyrz": "211124",
                "jxfpfswrz": "211125",
                "jxhjjewrz": "211126",
                "jxhjsewrz": "211127",
                "jxcjzt": "211128",
                "jxcjztmsg": "211129",
                "ygse": "211130",
                "khRangeLis": "211131",
                "rangeType": "211132",
                "rangeName": "211133",
                "rangeDesc": "211134",
                "jxSeMsg": "01月份：份数（2）金额（1278）税额（12）;02月份：份数（2）金额（1278）税额（12）;03月份：份数（2）金额（1278）税额（12）",
                "xxSeMsg": "01月份：份数（2）金额（12780）税额（12）;02月份：份数（20）金额（1278）税额（112）;03月份：份数（2）金额（1278）税额（12）"
            }, {
                "qyId": "311111",
                "khmc": "311112",
                "nsrsbh": "311113",
                "mneCod": "311114",
                "djxh": "311115",
                "sqldse": "311116",
                "xxfpfs": "311117",
                "xxhjje": "311118",
                "xxhjse": "311119",
                "xxcjzt": 1,
                "xxcjztmsg": "311121",
                "jxfpfsyrz": "311122",
                "jxhjjeyrz": "311123",
                "jxhjseyrz": "311124",
                "jxfpfswrz": "311125",
                "jxhjjewrz": "311126",
                "jxhjsewrz": "311127",
                "jxcjzt": "311128",
                "jxcjztmsg": "311129",
                "ygse": "311130",
                "khRangeLis": "311131",
                "rangeType": "311132",
                "rangeName": "311133",
                "rangeDesc": "311134",
                "jxSeMsg": "01月份：份数（2）金额（1278）税额（12）;02月份：份数（2）金额（1278）税额（12）;03月份：份数（2）金额（1278）税额（12",
                "xxSeMsg": "01月份：份数（2）金额（12780）税额（12）;02月份：份数（20）金额（1278）税额（112）;03月份：份数（2）金额（1278）税额（12"
            }],
            "page":{"pageSize":30,"currentPage":1,"totalPage":1,"totalCount":0}}}
})
