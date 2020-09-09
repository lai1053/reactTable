import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { DataGrid, Icon } from 'edf-component'
import { Map, fromJS } from 'immutable'
import extend from './extend'
import config from './config'
import * as data from './data'
import moment from 'moment'
import { number } from 'edf-utils'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    //初始化
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        let currentOrg = this.metaAction.context.get('currentOrg'),
            option = {
                        periodDate: currentOrg.periodDate,
                        enabledYearMonth: currentOrg.enabledYear + '-' + currentOrg.enabledMonth
                     }

        injections.reduce('init', option)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        this.initLoadRpt()
    }

    initLoadRpt = async () => {
        let response = await this.webapi.periodExpenseRpt.init({})
        let currentOrg = this.metaAction.context.get('currentOrg')
        response.enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
        response.accountingStandards = currentOrg.accountingStandards

        console.log('启用年月：' + response.enabledYearMonth)
        if (response) {
            this.injections.reduce('initLoadRpt', response)
        }
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.onTabFocus)
        } 
    }

    load = async (isReloadDoc) => {


        let selectedYearMonth = this.getSelectedYearMonth(),
            option = {
                year: selectedYearMonth.year,
                month: selectedYearMonth.period,
                noDataNoDisplay: this.metaAction.gf('data.filter.noDisplayOnAccountNoHappen'),
                isReloadDoc: isReloadDoc == true ? true : false
            }

        let response = await this.webapi.periodExpenseRpt.query(option)
        let currentOrg = this.metaAction.context.get('currentOrg')
        response.enabledYearMonth = currentOrg.enabledYear + '-' + currentOrg.enabledMonth
        response.accountingStandards = currentOrg.accountingStandards

        if (response) {
            this.injections.reduce('load', response)
        }
    }

    //页签切换
    onTabFocus = () => {
        let isReloadDoc = true

        this.load(isReloadDoc)
    }
    //日期选择
    onDatePickerChange = (value) => {
        this.load()
    }

    onFieldChange = (path, oldValue, rowIndex) => (newValue) => {
        if (path == 'root.children.head.children.header-content.children.header.children.header-left.children.noDisplayOnAccountNoHappen') {
            this.metaAction.sf('data.filter.noDisplayOnAccountNoHappen', !this.metaAction.gf('data.filter.noDisplayOnAccountNoHappen'))

            this.load()
        }
    }

    getSelectedYearMonth = () => {
        let selectedYearMonth = moment(this.metaAction.gf('data.period')),
            year = selectedYearMonth.year(),
            period = selectedYearMonth.month() + 1

        return { year, period }
    }

    //导出
    export = async () => {
        let option = this.getOption()

        option.unfold = []
        this.webapi.periodExpenseRpt.export(option)
    }
    //打印
    print = async () => {
        let option = this.getOption()
        let tempWindow = window.open()
        option.tempWindow = tempWindow
        console.dir(option)
        this.webapi.periodExpenseRpt.print(option)
    }

    getOption = () => {
        let selectedYearMonth = this.getSelectedYearMonth(),
            option = {
                year: selectedYearMonth.year,
                month: selectedYearMonth.period,
                noDataNoDisplay: this.metaAction.gf('data.filter.noDisplayOnAccountNoHappen')
            },
            foldStatus = this.metaAction.gf('data.other.foldStatus'),
            periodExpenseCode = this.metaAction.gf('data.other.periodExpenseCode'),
            unfold = []

        if (foldStatus.get(periodExpenseCode.get('saleExpenseCode')) == data.UNFOLD) {
            unfold.push(periodExpenseCode.get('saleExpenseCode'))
        }
        if (foldStatus.get(periodExpenseCode.get('manageExpenseCode')) == data.UNFOLD) {
            unfold.push(periodExpenseCode.get('manageExpenseCode'))
        }
        if (foldStatus.get(periodExpenseCode.get('financeExpenseCode')) == data.UNFOLD) {
            unfold.push(periodExpenseCode.get('financeExpenseCode'))
        }

        option.unfold = unfold

        return option
    }

    shareClick = (e) => {
        switch (e.key) {
            case 'weixinShare':
                this.weixinShare()
                break;
            case 'mailShare':
                this.mailShare()
                break;
        }
    }

    weixinShare = async () => {
        let option = this.getOption()

        console.dir(option)
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/costOfPeriod/share',
                params: option
            })
        })
    }

    mailShare = async () => {
        let option = this.getOption()

        console.dir(option)
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: option,
                shareUrl: '/v1/gl/report/costOfPeriod/share',
                mailShareUrl: '/v1/gl/report/costOfPeriod/sendShareMail',
                printShareUrl: '/v1/gl/report/costOfPeriod/print',
                period: option.year+'.'+option.month+'-'+option.year+'.'+option.month
            })
        })
    }

    foldClick = (code, index) => {
        this.injections.reduce('setIconType', code, index)
    }

    drawColumns = () => {
        let list = this.metaAction.gf('data.list').toJS()
        let { Column, Cell } = DataGrid, cols = []
        let selectedYearMonth = moment(this.metaAction.gf('data.period')),
            year = selectedYearMonth.year(),
            month = selectedYearMonth.month() + 1,
            enabledYearMonth = this.metaAction.gf('data.other.disabledDate'),
            enabledYear = parseInt(this.metaAction.gf('data.other.disabledDate').split('-')[0]),
            enabledMonth = parseInt(this.metaAction.gf('data.other.disabledDate').split('-')[1])

        console.log('month:' + month + '  enabledMonth:' + enabledMonth)

        let col = <Column name={'code'} columnKey={'code'} width={73}
        header={<Cell name='header'>{'科目编码'}</Cell>}
        cell={(ps) => {
            let row = list[ps.rowIndex]

            if (row.code == '合计') {
                return <Cell align='left' className={'total'}>
                    <span title={list[ps.rowIndex]['code']}>{list[ps.rowIndex]['code']}</span>
                </Cell>
            } else {
                return <Cell align='left'>
                    <span title={list[ps.rowIndex]['code']}>{list[ps.rowIndex]['code']}</span>
                </Cell>
            }
          }}
        />
        cols.push(col)

        col = <Column name={'name'} columnKey={'name'} width={173}
        header={<Cell name='header'>{'科目名称'}</Cell>}
        cell={(ps) => {
            let iconType = this.metaAction.gf('data.other.iconType'),
                row = list[ps.rowIndex],
                conrrespondCodeIconType = iconType.get(row.code)

            if (ps.rowIndex == list.length-1) {
                return <Cell align='left' className={'total'}></Cell>
            } else if (row && row.parentCode == undefined && row.code != '合计') {
                return <Cell align='left'>
                  <div style={{with: '100%', height: '37px'}} onClick={() => this.foldClick(row.code, ps.rowIndex)}>
                    <Icon className='ttk-gl-app-period-expense-rpt-unfold'
                          fontFamily='edficon'
                          type={conrrespondCodeIconType}/>
                    <span title={row.name}>{row.name}</span>
                  </div>
                </Cell>
            } else {
                return <Cell align='left'>
                    <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span>{row.name}</span></div>
                </Cell>
            }
          }}
        />
        cols.push(col)

        if (enabledYear == year) {
            if (month >= 1 && enabledMonth < 2) {
                col = <Column name={'amount1'} columnKey={'amount1'} width={106} flexGrow={1}
                header={<Cell name='header'>{'1月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount1'])}>{this.formatRptAmount(list[ps.rowIndex]['amount1'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount1'])}>{this.formatRptAmount(list[ps.rowIndex]['amount1'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 2 && enabledMonth < 3) {
                col = <Column name={'amount2'} columnKey={'amount2'} width={106} flexGrow={1}
                header={<Cell name='header'>{'2月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1){
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount2'])}>{this.formatRptAmount(list[ps.rowIndex]['amount2'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount2'])}>{this.formatRptAmount(list[ps.rowIndex]['amount2'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 3 && enabledMonth < 4) {
                col = <Column name={'amount3'} columnKey={'amount3'} width={106} flexGrow={1}
                header={<Cell name='header'>{'3月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount3'])}>{this.formatRptAmount(list[ps.rowIndex]['amount3'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount3'])}>{this.formatRptAmount(list[ps.rowIndex]['amount3'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 4 && enabledMonth < 5) {
                col = <Column name={'amount4'} columnKey={'amount4'} width={106} flexGrow={1}
                header={<Cell name='header'>{'4月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount4'])}>{this.formatRptAmount(list[ps.rowIndex]['amount4'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount4'])}>{this.formatRptAmount(list[ps.rowIndex]['amount4'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 5 && enabledMonth < 6) {
                col = <Column name={'amount5'} columnKey={'amount5'} width={106} flexGrow={1}
                header={<Cell name='header'>{'5月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount5'])}>{this.formatRptAmount(list[ps.rowIndex]['amount5'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount5'])}>{this.formatRptAmount(list[ps.rowIndex]['amount5'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 6 && enabledMonth < 7) {
                col = <Column name={'amount6'} columnKey={'amount6'} width={106} flexGrow={1}
                header={<Cell name='header'>{'6月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount6'])}>{this.formatRptAmount(list[ps.rowIndex]['amount6'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount6'])}>{this.formatRptAmount(list[ps.rowIndex]['amount6'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 7 && enabledMonth < 8) {
                col = <Column name={'amount7'} columnKey={'amount7'} width={106} flexGrow={1}
                header={<Cell name='header'>{'7月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount7'])}>{this.formatRptAmount(list[ps.rowIndex]['amount7'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount7'])}>{this.formatRptAmount(list[ps.rowIndex]['amount7'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 8 && enabledMonth < 9) {
                col = <Column name={'amount8'} columnKey={'amount8'} width={106} flexGrow={1}
                header={<Cell name='header'>{'8月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount8'])}>{this.formatRptAmount(list[ps.rowIndex]['amount8'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount8'])}>{this.formatRptAmount(list[ps.rowIndex]['amount8'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 9 && enabledMonth < 10) {
                col = <Column name={'amount9'} columnKey={'amount9'} width={106} flexGrow={1}
                header={<Cell name='header'>{'9月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount9'])}>{this.formatRptAmount(list[ps.rowIndex]['amount9'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount9'])}>{this.formatRptAmount(list[ps.rowIndex]['amount9'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 10 && enabledMonth < 11) {
                col = <Column name={'amount10'} columnKey={'amount10'} width={106} flexGrow={1}
                header={<Cell name='header'>{'10月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount10'])}>{this.formatRptAmount(list[ps.rowIndex]['amount10'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount10'])}>{this.formatRptAmount(list[ps.rowIndex]['amount10'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 11 && enabledMonth < 12) {
                col = <Column name={'amount11'} columnKey={'amount11'} width={106} flexGrow={1}
                header={<Cell name='header'>{'11月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount11'])}>{this.formatRptAmount(list[ps.rowIndex]['amount11'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount11'])}>{this.formatRptAmount(list[ps.rowIndex]['amount11'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
            if (month >= 12 && enabledMonth < 13) {
                col = <Column name={'amount12'} columnKey={'amount12'} width={106} flexGrow={1}
                header={<Cell name='header'>{'12月'}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount12'])}>{this.formatRptAmount(list[ps.rowIndex]['amount12'])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex]['amount12'])}>{this.formatRptAmount(list[ps.rowIndex]['amount12'])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
        } else {
            let amountName, monthName

            for (var i = 1; i <= month; i++) {
                amountName = 'amount' + i
                monthName = i + '月'

                col = <Column name={`${amountName}`} columnKey={`${amountName}`} width={106} flexGrow={1}
                header={<Cell name='header'>{`${monthName}`}</Cell>}
                cell={(ps) => {
                      if (ps.rowIndex == list.length-1) {
                          return <Cell align='right' className={'total'}>
                              <span title={this.formatRptAmount(list[ps.rowIndex][`${amountName}`])}>{this.formatRptAmount(list[ps.rowIndex][`${amountName}`])}</span>
                          </Cell>
                      } else {
                          return <Cell align='right'>
                              <span title={this.formatRptAmount(list[ps.rowIndex][`${amountName}`])}>{this.formatRptAmount(list[ps.rowIndex][`${amountName}`])}</span>
                          </Cell>
                      }
                  }}
                />
                cols.push(col)
            }
        }


        col = <Column name={'sumAmount'} columnKey={'sumAmount'} width={106} flexGrow={1}
        header={<Cell name='header'>{'合计'}</Cell>}
        cell={(ps) => {
            if (ps.rowIndex == list.length-1) {
                return <Cell align='right' className={'total'}>
                    <span title={this.formatRptAmount(list[ps.rowIndex]['sumAmount'])}>{this.formatRptAmount(list[ps.rowIndex]['sumAmount'])}</span>
                </Cell>
            } else {
                return <Cell align='right'>
                    <span title={this.formatRptAmount(list[ps.rowIndex]['sumAmount'])}>{this.formatRptAmount(list[ps.rowIndex]['sumAmount'])}</span>
                </Cell>
            }
          }}
        />
        cols.push(col)

        return cols
    }

    formatRptAmount = (value) => {
        let ret = '0.00'
        if (value != 0) {
            ret = number.addThousPos(value)
        }

        return ret
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
