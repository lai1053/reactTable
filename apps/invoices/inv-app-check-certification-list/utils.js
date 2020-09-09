export function getCjMonth (peroid)  {
    const mon = parseInt(peroid.split('-')[1])
    const getMonth = (mon - 1) === 0 ? 12 : (mon -1)
    const getYear = peroid.split('-')[0]
    const calMonth = getMonth > 9 ? getMonth : `0${getMonth}` 
    const calYear = parseInt(getMonth) === 0 ? parseInt((getYear - 1)) : getYear
    const month = `${calYear}-${calMonth}`  
    return month 
}