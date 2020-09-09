export function TransSubject(subject, calcDict){

    if (subject.isCalc == true) {
        subject.AuxAccCalcInfo = genAuxAccCalcInfo(subject, calcDict)
    }
    subject.balanceDirectionName = subject.balanceDirection=== 1 ? '贷':'借'

    return subject
}

export function genAuxAccCalcInfo(subject, calcDict){
    let retStr,
        calcDictKeys = ['isCalcCustomer','isCalcSupplier','isCalcProject','isCalcDepartment','isCalcPerson','isCalcInventory','isExCalc1','isExCalc2','isExCalc3','isExCalc4','isExCalc5','isExCalc6','isExCalc7','isExCalc8','isExCalc9','isExCalc10'],
        value = calcDictKeys.filter((item)=>{
            if(subject[item] == true){
                retStr =  retStr ? retStr + calcDict[item] + '/' : calcDict[item] + '/'
            }
        })

    if(retStr && retStr.endsWith('/')){
        retStr = retStr.substring(0, retStr.length - 1)
    }

		return retStr
}