/**
 * 
 * @param {Array} data 原数组 
 * @param {string} label  转变为label的字段
 * @param {string} key 转变为value的字段 
 */
export default function changeToOption (data, name = 'label', id = 'value'){
    return data.map(item => {
        return {
            label: item[name],
            value: item[id].toString(),
            key: item[id].toString(),
            children: item.children.map(item => {
                return{
                    label: item[name],
                    value: item[id].toString(),
                    key: item[id].toString()
                }
            })
        }
    })
} 