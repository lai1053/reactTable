import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    timer = null

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setCancelLister) {
            // this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

    }

    load = async ()=>{

    }

    renderIntroduceChildren = () =>{
        return (
            <div className="mainWrapper">
                <div className="banner"></div>
                <div className="cons">
                    <h2>我们的亮点</h2>
                    <ul className="ulLIst">
                        <li>
                            <div className="listOne"></div>
                            <h4>账套取数</h4>
                            <p>直接从财务账套批量取数</p>
                            <p>自动生成所得税年报数据</p>
                            <p>自动生成财务报表年报数据</p>
                        </li>
                        <li>
                            <div className="listTwo"></div>
                            <h4>导入取数</h4>
                            <p>支持导入余额表</p>
                            <p>自动生成所得税年报</p>
                            <p>减少数据录入</p>
                        </li>
                        <li>
                            <div className="listThree"></div>
                            <h4>风险扫描</h4>
                            <p>内置风险识别模型</p>
                            <p>快速风险诊断</p>
                            <p>一键生成风险报告</p>
                        </li>
                    </ul>
                    <hr/>
                    <h2>操作指引</h2>
                    <dl>
                        <dt className="dt1"><span>1</span>登录金财代帐，进入汇算清缴界面</dt>
                        <dd>
                            <p>路径一：进入【首页-汇算清缴】；</p>
                            <p style={{textAlign: 'center'}}><div className="pic pic1"></div></p>
                            <p>路径二：进入【单户-税务申报-汇算清缴】。</p>
                            <p style={{textAlign: 'center'}}><div className="pic pic2"></div></p>
                        </dd>
                        <dt className="dt2"><span>2</span>先完成基础设置</dt>
                        <p>【基本信息】，完成初始化；</p>
                        <p>【智能选表】，系统会结合企业历史申报数据、根据企业属性，智能选取应填报表单。</p>
                        <p>ps：只有基础设置完成后，才能进行后面的步骤。</p>
                        <p style={{textAlign: 'center'}}><div className="pic pic3"></div></p>
                        <dt className="dt3"><span>3</span>取数</dt>
                        <p>可以直接从账套取数，也可以通过导入余额表的方式取数；</p>
                        <p>取数完成后，自动生成所得税年报和财务报表年报数据；</p>
                        <p>ps：不进行取数，也可以直接填写申报表并申报。</p>
                        <dt className="dt4"><span>4</span>填写申报</dt>
                        <p>打开申报表，自动带入期初数据和账套数据，您可直接编辑报表；</p>
                        <p>确认无误后，直接在线提交申报。</p>
                        <dt className="dt5"><span>5</span>风险扫描</dt>
                        <p>报表填写完毕后，建议您先进行风险扫描后再申报，为您规避风险。</p>
                        <p>风险扫描完成后，自动生成风险报告，供您备查。</p>
                        <dt className="dt6"><span>6</span>缴纳税款</dt>
                        <p>提交申报成功后，即可在线缴纳税款，快速便捷。</p>
                        <dt  className="dt7"><span>7</span>更新申报状态</dt>
                        <p>申报完成，可以批量更新所得税申报状态和财务报表申报状态。</p>
                        <dt className="dt8"><span>8</span>查询申报结果</dt>
                        <p>前往【单户-税务申报-申报查询】，输入查询条件，可以查询、下载、打印已申报企业所得税和财务报表年度报表。</p>
                        <p style={{textAlign: 'center'}}><div className="pic pic4"></div></p>
                        <dt className="dt9"><span>9</span>作废</dt>
                        <p>前往【单户-税务申报-申报作废】，已申报未缴款，或0申报客户，可以作废后重新申报。</p>
                        <dt className="dt10"><span>10</span>更正</dt>
                        <p>前往【单户-税务申报-申报更正】，已缴款，可以在线更正。</p>
                        <p className="p2"><div className="jiantou"></div>快来扫码开通使用吧！<div className="jiantou2"></div></p>
                        <p style={{textAlign: 'center'}}><div className="pic pic5"></div></p>
                    </dl>
                </div>
            </div>
        )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}