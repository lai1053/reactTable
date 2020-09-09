import React from 'react'
import StepOne from './stepOne'
import StepTwo from './stepTwo'
import StepThree from '../batchSubjectSetting'

import stepImg1 from '../../../img/funds-step-1.png'
import stepImg2 from '../../../img/funds-step-2.png'
import stepImg3 from '../../../img/funds-step-3.png'

class importPopup extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            startValue: null,
            endValue: null,
            step: 1,

        }
        this.importParams = {}
        this.stepTwoData = {}
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.store = props.store || {};

    }
    onCancel = e => {
        e && e.preventDefault && e.preventDefault();
        this.props.closeModal && this.props.closeModal();
    }

    closeModal = (e) => {
        this.props.closeModal && this.props.closeModal();
    }

    stepOneNext = async (params) => {
        //解析银行对账单
        let res = await this.props.webapi.funds.parseBankStatement(params);
        this.importParams = params
        if (res) {
            if (res.parseSuccess === 1) {
                this.stepTwoData = res;
                this.setState({
                    step: 2,
                })
            } else {
                this.metaAction.toast('error', res.errorMessageList.join())
            }
        }
    }

    stepTwoPrev = () => {
        this.setState({
            step: 1
        })
    }
    async handleImport(data) {
        let params = {
            yearPeriod: parseInt(this.metaAction.gf('data.filterData.yearPeriod').replace('-', '')),
            bankAcctId: this.importParams.bankAcctId,
            flowfundList: data
        }
        let res = await this.props.webapi.funds.saveBankStatement(params);

        this.setState({
            step: 3,
        })


    }

    componentWillUnmount() {
        this.props.initPage(this.metaAction.gf('data.filterData.yearPeriod'))
    }

    render() {
        const { step } = this.state

        let imgClass= `bovms-app-fund-invoce-range-popup-img stepImg${step}`
        return (
            <div className='bovms-app-guidePage-invoce-range-popup bovms-app-guidePage-fund-popup'>
                <div className={imgClass}  style={{ paddingBottom: '24px' }}>
                    {/* {step === 1 && <img src={stepImg1}></img>}
                    {step === 2 && <img src={stepImg2}></img>}
                    {step === 3 && <img src={stepImg3}></img>} */}
                </div>

                {/* 步骤一用显示隐藏是为了不传参数保留住现在的状态 */}
                {/* <div style={step === 1 ? { display: 'block' } : { display: 'none' }}>
                    <StepOne
                        onNext={this.stepOneNext}
                        metaAction={this.metaAction}
                        webapi={this.webapi}
                        store={this.store}
                        onCancel={this.closeModal}>
                    </StepOne>
                </div> */}
                {step === 1 && <StepOne
                    onNext={this.stepOneNext}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    store={this.store}
                    onCancel={this.closeModal}>
                </StepOne>}
                {/*选发票*/}
                {step === 2 &&
                    <StepTwo
                        {...this.stepTwoData}
                        webapi={this.webapi}
                        onPrev={this.stepTwoPrev}
                        onCancel={this.closeModal}
                        metaAction={this.metaAction}
                        onImport={this.handleImport.bind(this)}
                    ></StepTwo>}

                {step === 3 && <div className='bovms-batch-subject-setting'>
                    <StepThree
                        isSelectedAll={'Y'}
                        store={this.store}
                        webapi={this.props.webapi}
                        onCancel={this.closeModal}
                        metaAction={this.props.metaAction}
                        bankAcctId={this.importParams.bankAcctId}
                    />
                </div>}
            </div>
        )
    }

}
export default importPopup