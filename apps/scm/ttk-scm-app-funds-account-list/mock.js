/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

/** 
 * 分类别返回
 * "xianjin": [
      {
        "bankAccountTypeId": 3000050001,
        "bankName": "",
        "beginningBalance": 0,
        "helpCode": "XJ",
        "isDefault": 0,
        "isEnable": 0,
        "name": "现金",
        "latestAmount": 55.55,
        "code": "XJ",
        "id": 4,
        "ts": "2018-03-29 16:04:27.0",
        "attachments": [],
        "details": []
      }
    ],
    "weixin": [
      {
        "bankAccountTypeId": 3000050003,
        "bankName": "",
        "beginningBalance": 0,
        "helpCode": "444",
        "isDefault": 0,
        "isEnable": 0,
        "name": "444",
        "latestAmount": 55.55,
        "code": "YGD",
        "id": 4501138863401984,
        "ts": "2018-05-04 09:15:33.0",
        "attachments": [],
        "details": []
      },
      {
        "bankAccountTypeId": 3000050003,
        "bankName": "",
        "beginningBalance": 0,
        "helpCode": "WX1",
        "isDefault": 0,
        "isEnable": 0,
        "name": "微信1",
        "latestAmount": 55.55,
        "code": "YGDF001",
        "id": 4496651722696704,
        "ts": "2018-05-03 14:14:17.0",
        "attachments": [],
        "details": []
      }
    ],
    "yinhang": [
      {
        "bankAccountTypeId": 3000050002,
        "bankName": "",
        "beginningBalance": 0,
        "helpCode": "333",
        "isDefault": 0,
        "isEnable": 0,
        "name": "333",
        "latestAmount": 55.55,
        "code": "YGDF005",
        "id": 4501134998481920,
        "ts": "2018-05-04 09:14:34.0",
        "attachments": [],
        "details": []
      }
    ],
    "zhifubao": [
      {
        "bankAccountTypeId": 3000050004,
        "bankName": "",
        "beginningBalance": 0,
        "helpCode": "ZFB",
        "isDefault": 0,
        "isEnable": 0,
        "name": "支付宝",
        "latestAmount": 55.55,
        "code": "YGDF002",
        "id": 4496652406237184,
        "ts": "2018-05-03 14:14:28.0",
        "attachments": [],
        "details": []
      }
    ]
 */