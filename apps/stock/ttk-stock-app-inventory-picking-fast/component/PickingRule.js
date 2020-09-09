import React, { Fragment, memo, useState, useEffect} from 'react'
import {Table} from 'edf-component'
import {number as utilsNumber} from 'edf-utils'
import Spin from '../../components/common/Spin'

export default memo((props) => {
    const [columns, setColumns] = useState([
        {
            title: '成本项目',
            dataIndex: 'name',
            width: 120,
            textAlign: 'left',
            ellipsis: true,
        },
        {
            title: '序号',
            dataIndex: 'index',
            width: 80,
            textAlign: 'center',
            ellipsis: true,
        },
        {
            title: '期初余额',
            dataIndex: 'lastAmount',
            width: 150,
            textAlign: 'right',
            ellipsis: true,
        },
        {
            title: '本期借方发生额',
            dataIndex: 'currentAmount',
            width: 150,
            textAlign: 'right',
            ellipsis: true,
        },
        {
            title: '本期结转',
            dataIndex: 'currentCost',
            width: 150,
            textAlign: 'right',
            ellipsis: true,
        },
    ])
    const [scrollProps, setScrollProps] = useState({x: 800, y: 200})
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        initPage()
    }, [])

    async function initPage() {
        dealColumns()

        await getData()

        // dealScrollProps()

    }

    function dealColumns() {
        const cols = columns.map((el, i) => {
            return {
                title: el.title,
                dataIndex: el.dataIndex,
                width: el.width,
                render: (text, row, idx) => {
                    let obj = {
                        children: text,
                        props: {
                            style: {
                                textAlign: el.textAlign
                            },
                            title: i > 1 && typeof text === 'number' ? utilsNumber.format(text, 2) : text
                        },
                    }
                    if(i > 1) {
                        if(typeof(text) === 'number') {
                            obj.children = text ? utilsNumber.format(text, 2) : ''
                        } 
                    }
                    if(row.name == '应领料金额') {
                        obj.props.style = {
                            ...obj.props.style,
                            background: '#fff6ea',
                            fontWeight: 700
                        }
                    }
                    return obj
                }
            }
        })
        setColumns(cols)
    }

    // function dealScrollProps() {
    //     if(list && list.length) {
    //         let y = 37 * list.length || 5 * 37
    //         y = y > 400 && 400
    //         setScrollProps({
    //             ...scrollProps,
    //             y
    //         })
    //     }
    // }

    async function getData() {
        setLoading(true)
        let res = await props.webapi.getProductShareList({period: props.period, isProductShare: true})
        if(res && res.productShareDtoList.length) {
            let list = res.productShareDtoList, sum = 0
            list[0] = ({
                ckNum: 0,
                code: "income",
                cost: 0,
                currentAmount: '--',
                currentBalance: 0,
                currentCost: res.carryOverCost,
                inventoryCode: "",
                isCompletion: false,
                isVoucher: false,
                lastAmount: '--',
                name: "完工入库",
                num: 0,
                price: 0,
                qzNum: 0,
            })
            list.forEach((el, i) => {
                el.index = i + 1
                if(i > 0) {
                    el.currentCost = el.lastAmount + el.currentAmount
                    sum += el.currentCost
                }
            })
            list.push({
                ckNum: 0,
                code: "amount",
                cost: 0,
                currentAmount: '--',
                currentBalance: 0,
                currentCost: res.carryOverCost - sum,
                inventoryCode: "",
                isCompletion: false,
                isVoucher: false,
                lastAmount: '--',
                name: "应领料金额",
                num: 0,
                price: 0,
                qzNum: 0,
                index: '5=1-2-3-4'
            })
            setList(res.productShareDtoList)
        }
        setLoading(false)
    }

    return (
        <Fragment>
            <Spin loading={loading} />
            <Table
                className='picking-fast-rule-table'
                columns={columns}
                dataSource={list}
                bordered
                pagination={false}
                emptyShowScroll={true}
                scroll={list.length ? {} : { x: '100%' }}
                style={{height: scrollProps.y + 37 + 'px'}}
            />
        </Fragment>
    )
})