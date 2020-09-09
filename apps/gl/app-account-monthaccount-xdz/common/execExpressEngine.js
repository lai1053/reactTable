import { calculate, number } from 'edf-utils'

/**
 * 分数类处理
 */
class ExpressFraction {
    static create(num, den = 1) {
        if (num instanceof ExpressFraction) {
            return num;
        } else if (/(-?\d+)\/(\d+)/.test(num)) {

            return new ExpressFraction(parseInt(RegExp.$1), parseInt(RegExp.$2))
        } else {
            if (/\.(\d+)/.test(num)) {
                num = num * Math.pow(10, RegExp.$1.length);
                den = den * Math.pow(10, RegExp.$1.length);
            }
            if (/\.(\d+)/.test(den)) {
                num = num * Math.pow(10, RegExp.$1.length);
                den = den * Math.pow(10, RegExp.$1.length);
            }
            return new ExpressFraction(num || 0, den)
        }
    }
    constructor(num = 0, den = 1) {
        if (den < 0) {
            num = -num;
            den = -den;
        }
        if (den === 0) {
            throw '分母不能为0'
        }

        let g = getMaxgcd(Math.abs(num), den)
        this.num = num / g;
        this.den = den / g;
    }

    /**
     * 加
     * @param {} o
     */
    add(o) {        
        const numberLeft = this.num / this.den
        const numberRight = o.num / o.den
        let calcOpResult = calculate.add(number.toFixedLocal(numberLeft, 6), number.toFixedLocal(numberRight, 6))
        if (calcOpResult == 0) {
            return new ExpressFraction(0, this.den * o.den)
        }
        return new ExpressFraction(this.num * o.den + o.num * this.den, this.den * o.den)
    }
    /**
     * 减
     * @param {*} o 
     */
    sub(o) {
        const numberLeft = this.num / this.den
        const numberRight = o.num / o.den
        let calcOpResult = calculate.sub(number.toFixedLocal(numberLeft, 6), number.toFixedLocal(numberRight, 6))
        if (calcOpResult == 0) {
            return new ExpressFraction(0, this.den * o.den)
        }
        return new ExpressFraction(this.num * o.den - o.num * this.den, this.den * o.den)
    }
    /**
     * 乘
     * @param {*} o 
     */
    multiply(o) {
        return new ExpressFraction(this.num * o.num, this.den * o.den);
    }
    /**
     * 除
     * @param {*} o 
     */
    divide(o) {
        return new ExpressFraction(this.num * o.den, this.den * o.num);
    }
    /**
     * 等于
     * @param {*} o 
     */
    equal(o) {
        return this.num * o.den === this.den * o.num;
    }
    getResult() {        
        return this.den != 0 ? this.num / this.den : 0
    }
}

/**
    *求两个数a、b的最大公约数
    * @param {} a
    * @param {*} b
*/
function getMaxgcd(a, b) {
    if (a % b == 0)
        return b;
    return (b, a % b);
}

/**
 * 解析数学表达式 (优先级需要加（）来标识，否则无法解析)
 * @param {(((P0+P1)*0.2)/2.14)-P2} formula
 * @param {{ P0: '5.344566', P1: '4.563578', P2: '3.101201' }} obj
 */
function execExpressEngine(formula, obj) {
    //局部变量
    const tempObj = Object.assign({
        _0: 0
    }, obj);
    //计算缓存
    const keyCache = {};
    let index = 1;
    //清理空格
    formula = formula.replace(/ /g, '');
    //解析数字
    formula = formula.replace(/(^|[(*+/-])(\d+\.\d+|\d+)/g, function (m, p1, p2) {
        if (keyCache[p2]) {
            return p1 + keyCache[p2];
        }
        const key = keyCache[p2] = '_' + index++;
        tempObj[key] = ExpressFraction.create(p2);
        return p1 + key;
    })

    function getKey(p1, p2, p3) {

        const keyC = p1 + p2 + p3;
        if (keyCache[keyC]) {
            return keyCache[keyC];
        }
        const key = keyCache[keyC] = '_' + index++;
        const fA = ExpressFraction.create(tempObj[p1])
        const fB = ExpressFraction.create(tempObj[p3])
        if (p2 === '*') {
            tempObj[key] = fA.multiply(fB);
        } else if (p2 === '/') {
            tempObj[key] = fA.divide(fB);
        } else if (p2 === '+') {
            tempObj[key] = fA.add(fB);
        } else if (p2 === '-') {
            tempObj[key] = fA.sub(fB);
        }

        return key;
    }

    function run(s) {
        //子表达式
        if (/\(([^\(]+?)\)/.test(s)) {
            s = s.replace(/\(([^\(]+?)\)/g, function (m, p1, p2) {
                return run(p1);
            })
        }
        //负号
        s = s.replace(/([*/+]|^)-(\w+)/g, function (m, p1, p2) {
            return getKey('_0', '-', p2);
        })

        //返回
        if (/(^\w+$)/.test(s)) {
            return RegExp.$1;
        }

        //乘法、除法、加法、减法
        const expArr = ['*', '/', '+', '-'];
        for (let i = 0; i < expArr.length; i++) {
            const p = expArr[i];
            const reg = new RegExp('(\\w+)[' + p + '](\\w+)');
            while (reg.test(s)) {
                s = s.replace(reg, function (m, p1, p2) {
                    return getKey(p1, p, p2);
                })
            }
        }

        //返回
        if (/(^\w+$)/.test(s)) {
            return RegExp.$1;
        }

        return run(s);
    }

    return tempObj[run(formula)]
}
module.exports = execExpressEngine;