export default function changeToOption (data, label = 'label', key = 'value'){
    return data.map(item => {
        return {
            label: item[label],
            value: item[key].toString(),
            'code': item['code'],
            'grade': item['grade'],
            'isEndNode': item['isEndNode']
        }
    })
} 