import React from 'react'
//import { Steps } from 'antd'
import classNames from 'classnames'
import Step from './step'
function StepsComponent(props) {
	let className = classNames({
		'mk-steps': true,
		[props.className]: !!props.className
	})
	return <Step {...props} className={className} />
}

//StepsComponent.Step = Steps.Step
export default StepsComponent