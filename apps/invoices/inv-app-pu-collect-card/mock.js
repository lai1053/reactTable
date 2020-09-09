/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

const xxfpList=[
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "01",
            "fpzlMc": "增值税专用发票"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "03",
            "fpzlMc": "机动车销售发票"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "04",
            "fpzlMc": "增值税普通发票"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "05",
            "fpzlMc": "普通机打发票"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "07",
            "fpzlMc": "二手车销售发票"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "08",
            "fpzlMc": "纳税人检查调整"
        },
        {
            "nsrxz": "YBNSRZZS",
            "fplx": "xxfp",
            "fpzlDm": "09",
            "fpzlMc": "未开具发票"
        }
    ]

fetch.mock('/v1/biz/invoice/xxfp/XxfpCollect', (option) => {
    const a = parseInt(Math.random() * 10);
    if (a > 5) {
        if (a > 7) {
            return {
                "result": true, //成功：true
                "value": {
                    "yhId": "6637577178984448",
                    "dljgId": "6637577178984448",
                    "fplx": "xxfp",
                    "skssq": "201905",
                    "nsrzx": "YBNSRZZS",
                    "nsrsbh": "914408047349959168",
                    "sfcjcg": true, //ture成功、false 失败
                    "msg": "采集成功", //成功或失败提示语,
                    "dataList": [{
                        "fpzldm": "01", //发票种类代码 每个发票种类采集情况
                        "fpzlmc": "增值税专票发票", //发票种类名称
                        "fpzs_yrz": 5, //采集到汇总发票张数已认证 进项发票
                        "fpzs_wrz": 3, //采集到汇总发票张数未认证 进项发票
                        "fpzs_total": 8, //采集到汇总发票张数
                    }, {
                        "fpzldm": "02", //发票种类代码 每个发票种类采集情况
                        "fpzlmc": "增值税普通发票", //发票种类名称
                        "fpzs_yrz": 4, //采集到汇总发票张数已认证 进项发票
                        "fpzs_wrz": 6, //采集到汇总发票张数未认证 进项发票
                        "fpzs_total": 10, //采集到汇总发票张数
                    }]
                }
            }
        } else {
            return {
                "result": true, //成功：true
                "value": {
                    "yhId": "6637577178984448",
                    "dljgId": "6637577178984448",
                    "fplx": "xxfp",
                    "skssq": "201905",
                    "nsrzx": "YBNSRZZS",
                    "nsrsbh": "914408047349959168",
                    "sfcjcg": false, //ture成功、false 失败
                    "msg": "采集账号密码过期", //成功或失败提示语,
                    "dataList": []
                }
            }
        }
    }
    return { result: false, value: {}, error: { code: '504', message: '接口不可用' } }
})