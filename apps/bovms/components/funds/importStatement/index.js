import React from 'react'
import { DatePicker } from "antd"
import moment from 'moment'
import ImportPopup from './importPopup'

class ImportStatement extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            yearPeriod: props.yearPeriod,
            startValue: null,
            endValue: null,
            step: 1,
        }
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {};
    }
    componentDidMount() {
    }

    handleDateChange(e) {
        this.metaAction.sf('data.filterData.yearPeriod', e)
        this.props.initPage(e)
    }

    async import() {
        let { yearPeriod } = this.state
        let res = await this.metaAction.modal('show', {
            title: '导入银行对账单',
            width: 1000,
            footer: false,
            style: { top: 25 },
            wrapClassName: 'bovms-batch-subject-setting',
            children: (
                <ImportPopup
                    yearPeriod={yearPeriod}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.store}
                    initPage={this.props.initPage}
                />
            )
        })
    }

    disabledStartDate = startValue => {
        return startValue.valueOf() < new Date(moment(this.metaAction.gf('data.accountInfo.enabledYearAndMonth')).subtract(1, "month").format('YYYY-MM-DD').substr(0, 7)).valueOf() ||
            startValue.valueOf() > new Date().valueOf()
    };

    render() {
        const { yearPeriod } = this.state

        return (
            <div className='bovms-app-guidePage'>
                <div className='bovms-app-guidePage-upSecretKey'>
                    <div className='bovms-app-guidePage-heda'>
                        <span className='label-item header-item'>
                            <lable>会计月份：</lable>
                            <DatePicker.MonthPicker value={yearPeriod} format='YYYY-MM' onChange={this.handleDateChange.bind(this)}  disabledDate={this.disabledStartDate}></DatePicker.MonthPicker>
                        </span>
                    </div>
                    <div className='bovms-app-guidePage-qupiao-wrap'>
                        <div className='bovms-app-funds-upSecretKeyContent' onClick={this.import.bind(this)}></div>
                        <div className='bovms-app-guidePageImgdivPuchase'></div>
                    </div>
                </div>
            </div>
        )
    }

}
export default ImportStatement