/**
 * 
 * @param {Array} data 原数组 
 * @param {string} label  转变为label的字段
 * @param {string} key 转变为value的字段 
 */
export default function changeToOption (data, label = 'label', key = 'value'){
    return data.map(item => {
        return {
            ...item,
            label: item[label],
            value: item[key].toString()
        }
    })
} 