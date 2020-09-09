/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

fetch.mock('/v1/news/query', (option) => {
    return {
        result: true, value: [
            {
                id: 1,
                title: '定期定额征收规定事项',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isTop: true,
                isHot: false,
                order: 0
            },
            {
                id: 2,
                title: '定期定额征收规定事项2',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isHot: true,
                order: 1
            },
            {
                id: 3,
                title: '定期定额征收规定事项3',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isHot: true,
                order: 2
            },
            {
                id: 4,
                title: '定期定额征收规定事项4',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isHot: false,
                order: 3
            },
            {
                id: 5,
                title: '定期定额征收规定事项5',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isHot: false,
                order: 4
            },
            {
                id: 6,
                title: '定期定额征收规定事项6',
                src: 'http://www.ttkteam.com/news/1.html',
                img: 'https://avatars2.githubusercontent.com/u/37540303?s=400&u=9de24e566c827a02fccd5f81b268ec0a5b5633fb&v=4',
                createTime: '2018-05-12',
                clickNum: '99',
                isHot: false,
                order: 5
            }

        ]
    }
})
