import React, { Component } from 'react'
import { wrapper } from 'edf-meta-engine'
import appInfo from './index'

@wrapper(appInfo)
export default class C extends Component {
	render() {
		let appInfo = this.props.initData,
			name = '智能财税',
			companyName = '智能财税',
			companyNameShort = '智能财税'
		if (appInfo) {
			name = appInfo.name
			companyName = appInfo.companyName
			companyNameShort = appInfo.companyNameShort
		}
		return (<section className='agreement'>
			<h1>金财互联数据服务协议</h1>
			<p>《金财互联数据服务协议》（以下简称“本协议”）是用户（以下简称“您”）与金财互联数据服务平台（以下简称“本平台”）的所有者金财互联数据服务有限公司 （以下简称“金财”）之间就本平台服务等相关事项所订立的相关权利义务规范，请您仔细阅读本协议，您签订协议后，本协议即构成对双方有约束力的法律文件。</p>
			<p>若您已经注册为本平台用户，即表示您已充分阅读、理解并同意自己与金财订立本协议，且您自愿受本协议的条款约束。</p>
			<h4>特别提示：</h4>
			<h4>在使用本平台服务之前，您应当认真阅读并遵守本协议，请您务必审慎阅读、充分理解各条款内容，特别是免除或者限制责任的条款、争议解决和法律适用条款。免除或者限制责任的条款可能将以加粗字体显示，您应重点阅读。如您对协议有任何疑问的，应向本平台客服咨询。</h4>
			<h4>一、定义</h4>
			<p>在本协议中所使用的下列词语，除非另有定义，应具有以下含义：</p>
			<p>1.本平台:在无特别说明的情况下，均指"金财互联数据服务"的服务平台。</p>
			<p>2.用户：指具有完全民事行为能力的金财互联数据服务平台各项服务的使用者。</p>
			<p>3.金财互联数据服务：指将金财互联数据服务能力部分开放给开发者使用的平台。</p>
			<p>4.平台运营数据：是指在用户通过本平台使用平台服务期间，用户所提交的或在本平台生成的或在使用服务中通过平台流转的任何数据或信息，包括但不限于用户登录数据等数据。平台运营数据是金财互联数据服务的商业秘密且归本平台所有。</p>
			<h4>二、注册与账户</h4>
			<h4>2.1、主体资格</h4>
			<p>2.1.1 只有符合下列条件之一的自然人或法人或非法人组织才能注册成为本平台用户，可以使用本平台的服务：</p>
			<p>（1） 年满十八周岁，并具有民事权利能力和民事行为能力的自然人；</p>
			<p>（2） 限制民事行为能力人应经过其监护人的同意；</p>
			<p>（3） 根据中国法律、法规、行政规章成立并合法存续的具有法人资格的机关、企事业单位、社团组织，或其他非法人组织。不符合法律法规规定设立的组织无论通过何种方式已经注册为本平台用户的，其与本平台之间的协议自始无效，本平台一经发现，有权立即终止对该用户的服务，并追究其使用本平台服务的一切法律责任。</p>
			<p>2.1.2 若您不具备前述主体资格，则您应承担因此而导致的一切后果，且金财有权注销或永久冻结您的账户，并向您索偿相应损失。</p>
			<h4>2.2、注册信息</h4>
			<p>2.2.1 您应当向本平台提供真实准确的注册信息，包括但不限于明确的联系地址和联系电话及所在单位，并提供真实姓名、身份证号或企业单位名称及营业执照。保证本平台可以通过上述联系方式与您进行联系。同时，您也应当在相关资料实际变更时及时更新有关注册资料。</p>
			<p>2.2.2 金财有权对您的注册资料进行审查，对存在任何问题或怀疑的注册资料，金财有权发出通知询问并要求您做出解释、改正。金财有权对上述资料进行验证，验证结果不实或不通过的，金财有权拒绝您的注册或终止对您的服务。</p>
			<p>2.2.3 您需通过本平台的实名认证，方可获得本平台提供的服务。</p>
			<h4>2.3、账号管理</h4>
			<p>2.3.1 您在注册账户时，不得在账号名称、简介等注册信息中出现如下违法和不良信息：</p>
			<p>（1）违反宪法或法律法规规定的；</p>
			<p>（2）危害国家安全,泄露国家秘密,颠覆国家政权,破坏国家统一的；</p>
			<p>（3）损害国家荣誉和利益的,损害公共利益的；</p>
			<p>（4）煽动民族仇恨、民族歧视,破坏民族团结的；</p>
			<p>（5）破坏国家宗教政策,宣扬邪教和封建迷信的；</p>
			<p>（6）散布谣言,扰乱社会秩序,破坏社会稳定的；</p>
			<p>（7）散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</p>
			<p>（8）侮辱或者诽谤他人,侵害他人合法权益的；</p>
			<p>（9）含有法律、行政法规禁止的其他内容的。</p>
			<p>金财有权通过软件程序或安排专业人员对您提交的账号名称、头像和简介等注册信息进行审核，若您的注册信息包含有上述违法和不良信息的，金财有权不予注册，并通知您修改上述信息。</p>
			<p>2.3.2 若金财发现您已有的注册账号是以虚假信息骗取账号名称注册的，或您的账号名称、头像、简介等注册信息存在上述违法和不良信息的，金财有权立即暂停您使用的账号并要求您在3个工作日内予以改正。若您拒不改正，金财有权注销您已经注册的账号。在此情况下，给您造成的任何损失，金财不承担任何责任。</p>
			<p>2.3.3 若金财发现您已有的注册账号是冒用关联机构或社会名人而注册的，金财有权立即暂停您使用的账号，并要求您提供相关证据，如在3个工作日内无法提供相关证据的，金财有权注销您已经注册的账号，并向互联网信息内容主管部门报告您的违法行为。</p>
			<p>2.3.4 如果您的账号被注销，金财没有义务向您返还任何数据，您应确保您通过本平台传输的所有数据均有备份，若因您未留有备份而造成的损失，本平台不承担任何责任。</p>
			<p>2.3.5 您在使用本平台的服务时，您已同意遵守和维护中华人民共和国法律法规、社会主义制度、国家利益、公民合法权益、公共秩序、社会道德风尚和信息真实七条底线。</p>
			<p>2.3.6 您在使用本平台服务中，若您发现任何人出现上述违法行为的，您有权向金财进行举报投诉。对于您的举报，金财将及时进行处理。</p>
			<h4>2.4、账户安全</h4>
			<p>2.4.1 您有权根据需要更改登录账户密码。</p>
			<p>2.4.2 您应妥善保管您的用户账号和密码，且须对在用户账号密码下发生的所有活动（包括但不限于发布需求信息、网上点击同意各类协议、规则等）承担责任。因您的过错导致的任何损失由您自行承担，该过错包括但不限于：遗忘或泄漏密码，密码被他人破解，您使用的计算机被他人侵入。</p>
			<p>2.4.3 用户不得以任何形式擅自转让或授权他人使用自己在本平台的用户账户。</p>
			<h4>三、服务内容</h4>
			<p>3.1 本平台为用户提供财税相关数据接口的平台，开发者可以通过本平台获得报税通道能力及法律权限范围内可见的相关数据。</p>
			<p>3.2 您一经注册成功，即表示您已充分阅读、理解并同意您与金财订立的各项协议，且您自愿受协议的条款约束。</p>
			<h4>四、服务的中断和终止</h4>
			<p>4.1 如发生以下情形，本平台有权无需征得您的同意终止对您的服务、限制您的活动、向您核实有关资料、发出警告通知、暂时中止、无限期中止及拒绝向您提供服务：</p>
			<p>（1）您存在违法或违反本协议和本平台相关规则，或在本平台上有其他不当行为；</p>
			<p>（2）本平台发现您的注册资料中主要内容是虚假的；</p>
			<p>（3）本协议终止或更新时，您未确认新的协议的；</p>
			<p>（4）存在其他用户或其他第三方通知本平台，认为您的行为存在违法或不当行为，并提供相关证据，而本平台无法联系到您核证或验证您向本平台提供的任何资料；</p>
			<p>（5）存在其他用户或其他第三方通知本平台，认为您的行为存在违法或不当行为，并提供相关证据。本平台以普通非专业人员的知识水平标准对相关内容进行判别，可以明显认为这些内容或行为可能对本平台用户或本平台造成财务损失或法律责任。</p>
			<p>（6）其它本平台认为需终止服务的情况。</p>
			<p>4.2 金财可自行全权决定，在发出通知或不发出通知的情况下，随时停止提供全部或部分服务。服务终止后，金财没有义务为您保留原账户中或与之相关的任何信息与数据，或转发任何未曾阅读或发送的信息给您或第三方。</p>
			<p>4.3 用户在被本平台终止提供服务后，再一次直接或间接或以他人名义注册为本平台用户的，金财有权再次单方面终止为该用户提供服务。</p>
			<h4>五、不可抗力</h4>
			<p>因不可抗力或者其他意外事件，使得本协议的履行不可能、不必要或者无意义的，双方均不承担责任，且金财有权终止本协议的服务。本协议所称之不可抗力意指不能预见、不能避免并不能克服的客观情况，不可抗力和意外事件包括但不限于自然灾害、战争、台风、水灾、火灾、雷击或地震、罢工、暴动、停电、法定疾病、网络崩溃、黑客攻击、网络病毒、电信部门技术管制、政府行为或任何其它自然或人为造成的灾难等客观情况。</p>
			<h4>六、数据使用与隐私保护</h4>
			<h4>6.1、数据使用</h4>
			<p>6.1.1 您应确保您通过本平台传输的数据在本地服务器上留有备份，因您未留有备份而造成的损失，本平台不予承担责任。</p>
			<p>6.1.2 用户访问企业数据时，需通过本平台进行中转，本平台有权对用户数据予以存储，以便分析用户是否违规获取企业数据。</p>
			<p>6.1.3 金财及与金财有关联关系的企业有权对用户数据及平台运营数据进行大数据分析。金财有权为本合同之目的使用上述数据。金财可利用上述数据（敏感信息除外）及分析结论为用户提供新的产品和服务。</p>
			<p>6.1.4 本平台将采用适当的技术措施、内部控制等手段保证用户数据的安全，防止意外丢失、泄露、被第三方更改。除如下情形外，本平台不得披露或向第三方提供用户数据：</p>
			<p>（1）事先获得了您的授权；</p>
			<p>（2）根据法律、法规的规定或司法机关、行政机关的通知或要求；</p>
			<p>（3）在法律允许范围内的其他金财认为合理且必要的情况。</p>
			<p> 金财仅允许有必要知晓这些信息的金财员工、合作伙伴访问您的信息，并为此设置了严格的访问权限控制和监控机制。我们同时要求可能接触到您的信息的所有人员履行相应的保密义务。如果未能履行这些义务，可能会被追究法律责任或被中止与金财的合作关系。</p>
			<h4>6.2、隐私保护</h4>
			<p>6.2.1 您在使用本平台服务时，请妥善保护自己的个人或法人信息，仅在必要的情形下向他人提供。</p>
			<p>6.2.2 如果您发现自己的个人或法人信息泄密，尤其是用户账户及密码发生泄露，请您立即联络本平台客服，以便我们采取相应措施。</p>
			<p>6.2.3 信息披露：您的个人或法人信息将在下述情况下部分或全部被披露：</p>
			<p>（1） 经您同意，向第三方披露；</p>
			<p>（2） 若您是合法的知识产权使用权人并提起投诉，应被投诉人要求，向被投诉人披露，以便双方处理可能的权利纠纷；</p>
			<p>（3） 根据法律的有关规定，或者行政、司法机关的要求，向第三方或者行政、司法机关披露；</p>
			<p>（4） 若您出现违反中国有关法律或者网站规定的情况，需要向第三方披露；</p>
			<p>（5） 为提供你所要求的服务，而必须和第三方分享您的个人或法人信息；</p>
			<p>（6） 其它本平台根据法律或者网站规定认为合适的披露。</p>
			<p> 您了解并同意，在收集您的信息后，我们将通过技术手段对数据进行去标识化处理，去标识化处理的信息将无法识别您的身份，在此情况下我们有权使用已经去标识化的信息，对用户数据库进行分析并予以商业化的利用。</p>
			<p>6.2.4 本平台关于用户的隐私保护详细规定请见本平台《隐私权政策》。</p>
			<h4>七、知识产权</h4>
			<p>7.1 本平台及本平台所使用的任何相关软件、程序、内容，包括但不限于数据接口、图片、档案、资料、网站构架、网站版面的安排、网页设计、经由本平台或广告商向用户呈现的广告或资讯，均由金财或其它权利人依法享有相应的知识产权，包括但不限于著作权、商标权、专利权或其它专属权利等，受到相关法律的保护。未经金财或权利人明示授权，用户保证不修改、出租、出借、出售、散布本平台及本平台所使用的上述任何资料和资源，或根据上述资料和资源制作成任何种类产品。</p>
			<p>7.2 您不得经由非本平台所提供的界面使用本平台。</p>
			<p>7.3 未经本平台书面允许，用户不得将本平台的任何资料以及在平台上所展示的任何信息作商业性利用。</p>
			<h4>八、免责声明与责任限制</h4>
			<p>当您接受本协议时，您应当明确了解并同意：</p>
			<p>8.1 本平台不能随时预见到任何技术上的问题或其他困难。该等困难可能会导致数据损失或其他服务中断。本平台是在现有技术基础上提供的通道服务，不对数据的业务准确性负责。本平台不保证以下事项∶</p>
			<p>（1）本平台将符合所有用户的要求。</p>
			<p>（2）本平台不受干扰、能够随时保持数据提供的及时性、安全可靠性或免于出错。</p>
			<p>（3）本服务使用权的取得结果是正确或可靠的。</p>
			<p>（4）通过本平台提交的数据是绝对正确的。</p>
			<p>（5）通过本平台返回的业务数据是绝对正确的。</p>
			<p>（6）本平台接受用户申请新接口的需求，但不保证在开放过程当中因各种技术问题或其他困难而终止接口开放。</p>
			<p>8.2 是否经由本平台获取或插入或开放任何数据，由您自行考虑、衡量并且自负风险，因获取或插入、开放任何数据而导致您的任何损失，您应负完全责任。</p>
			<p>8.3 基于以下非本平台自身原因而造成的利润、商誉、资料、数据损失或其它无形损失，本平台不承担任何直接、间接、附带、特别、衍生性或惩罚性赔偿（即使本平台已被告知前款赔偿的可能性）：</p>
			<p>（1）第三方对用户提出的索赔要求；</p>
			<p>（2）因用户的疏忽或不当操作所引起的；</p>
			<p>（3）用户传输的数据遭到未获授权的存取或变更；</p>
			<p>（4）本平台中任何第三方之声明或行为；</p>
			<p>（5）因用户终端应用或设备原因引起的；</p>
			<p>（6）本平台其它相关事宜。</p>
			<p>8.4 您同意本平台在没有重大过失或恶意的情况下无需向您在使用本服务时对您在数据传输中的迟延、不准确、错误或疏漏、丢失及因此而致使的损害承担责任。</p>
			<p>8.5 本平台如因自身或其他原因关停而终止服务的，本平台仅需提前在本平台上发布关停公告即可终止本平台服务，并无需对您承担任何责任。企业应与开发者协商好应用数据的相关事宜。您应确保您传输的数据皆有备份，若因您未留有备份而造成的任何损失，本平台不予承担任何责任。</p>
			<h4>九、保密</h4>
			<p>双方保证在对讨论、签订、执行本协议中所获悉的属于对方的且无法自公开渠道获得的文件及资料（包括但不限于商业秘密、公司计划、运营活动、财务信息、技术信息、经营信息及其他商业秘密）予以保密。未经该资料和文件的原提供方同意，另一方不得向第三方泄露该商业秘密的全部或者部分内容。但法律、法规、行政规章另有规定或者双方另有约定的除外。</p>
			<h4>十、争议解决</h4>
			<p>10.1 本协议及其规则的有效性、履行和与本协议及其规则效力有关的所有事宜，将受中华人民共和国法律管辖，任何争议仅适用中华人民共和国法律。</p>
			<p>10.2 本协议签订地为中国广东省广州市。因本协议所引起的与金财的任何纠纷或争议，协议各方首先应友好协商解决，协商不成的，各方在此完全同意将纠纷或争议提交金财所在地人民法院诉讼解决。</p>
			<h4>十一、完整协议</h4>
			<p>11.1 您对本协议理解和认同，您即对本协议所有组成部分的内容理解并认同，一旦您使用本服务，您和金财即受本协议所有组成部分的约束。</p>
			<h4>十二、金财互联数据服务平台对本服务协议包括基于本服务协议制定的各项规则拥有最终解释权。</h4>


		</section>)
	}
}
