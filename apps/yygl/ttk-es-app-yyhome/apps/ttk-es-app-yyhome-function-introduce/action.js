import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

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
            <div className="wrapper">
                <div className="helpDocument">
                    <div className="content">
                        <div className="aticle">
                            <div className="cons">
                                <h2>1.【客户资料】优化内容</h2>
                                <p>（1）新增【手机号验证码登录】，适用江西省客户。</p>
                                <p>（2）新增【授权人登录】，适用北京市客户。</p>
                                <p>（3）新增个税申报登录方式【个税实名登录】，适用全国客户。</p>
                                <p>（4）优化【导入客户】功能，支持失败记录的下载。</p>
                                <h2>2.【账套管理】</h2>
                                <p>（1）优化批量导账功能。</p>
                                <p>（2）新增纳税人身份变更功能。</p>
                                <p>功能路径： “账套管理-账套信息”，点击“纳税人身份”的编辑按钮，选择纳税人身份，确认新身份有效期。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p1.png" alt=""/></p>
                                <h2>3.【批量-财务报表】</h2>
                                <p>更新财务报表公式。</p>
                                <h2>4.【业务-进项模块】</h2>
                                <p>增强了【凭证习惯-凭证摘要】功能，新增自定义摘要。</p>
                                <h2>5.【业务-销项模块】</h2>
                                <p>增强了【凭证习惯-凭证摘要】功能，新增自定义摘要。</p>
                                <h2>6.【存货】优化内容</h2>
                                <p>（1）完工入库单、成本分配表新增【删除】功能。</p>
                                <p>（2）支持存货期初模板多次使用。</p>
                                <p>（3）成本分配表支持当期未发生制造费用。</p>
                                <p>（4）解决生产领料、结转生产成本、结转主营业务成本尾差问题。</p>
                                <p>（5）优化收发存明细表的本年累计行的计算规则。</p>
                                <h2>7.【个税】增加实名登录方式</h2>
                                <p>（1）在【客户资料】，通过新增或导入可维护个税的实名登录账号信息。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p2.png" alt=""/></p>
                                <p>（2）在【批量-税务申报-个人所得税】，也可以通过“设置密码”来维护，可单个设置，也可批量设置（更多-设置密码）。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p3.png" alt=""/></p>
                                <h2>8.【山东，青岛】附加税批量申报上线</h2>
                                <p>支持附加税批量申报，进入路径为“批量-税务申报-附加税申报”，自动带出计税依据，自动生成申报表，无需打开报表，直接多户批量申报。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p4.png" alt=""/></p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p5.png" alt=""/></p>
                                <h2>9.【福建】增加“其他申报”功能</h2>
                                <p>增加“其他申报”模块，此模块支持除“申报缴款”模块外的税种，例如非核定税种，环保税，通用申报等。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p6.png" alt=""/></p>
                                <h2>10.【申报凭证】增加同步其他渠道申报凭证功能</h2>
                                <p>【批量-申报凭证】，本系统申报的税种，自动生成凭证，其他渠道申报的，可通过“同步凭证”同步电子税务局凭证，支持单个下载和批量下载。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p7.png" alt=""/></p>
                                <h2>11.【山东、青海】增加“勾选认证”功能</h2>
                                <p>（1）支持单企业勾选认证，进入路径为“单户-税务申报-发票认证-勾选认证2.0”。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p8.png" alt=""/></p>
                                <p>（2）支持批量签名，进入路径为“批量-勾选认证”。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p9.png" alt=""/></p>
                                <h2>12.【财务核算】资产负债表增加“税表重分类”功能</h2>
                                <p>税表重分类功能，支持“税表重分类”和“税表不重分类”两种方式。</p>
                                <p>税表重分类，默认应交税费公式：</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p24.png" alt=""/></p>
                                <p>税表不重分类，应交税费的默认公式：</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p25.png" alt=""/></p>
                                <h2>13.【财务核算】凭证导入支持跨月</h2>
                                <p>（1）先下载凭证导入模板，编辑跨年/跨月的凭证，下载模板路径：财务核算-凭证-导入-凭证导入。</p>
                                <p>（2）点开凭证页面，进行凭证导入，如图：</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p26.png" alt=""/></p>
                                <h2>14.【财务核算】凭证—打印优化设置</h2>
                                <p>【凭证】页面，点击“打印”按钮，设置打印制单人和审核人</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p27.png" alt=""/></p>
                                <h2>15.【财务核算】账簿—总账、明细账、余额表优化打印设置</h2>
                                <p>【账簿】页面，点击“打印”按钮，设置打印制表人和打印时间</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p28.png" alt=""/></p>
                                <h2>16.【财务核算】报表—打印设置优化</h2>
                                <p>【报表】页面，点击“打印”按钮，设置打印制表人、财务负责人、打印报表时间</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p29.png" alt=""/></p>
                                <h2>17.【财务核算】支持批量修改凭证制单人、审核人</h2>
                                <p>【凭证】页面，点击“更多-批量修改制单人”，先选择日期，再进行批量修改。</p>
                                <p style={{textAlign: "center"}}><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/p30.png" alt=""/></p>
                            </div>
                        </div>
                    </div>
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