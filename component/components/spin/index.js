import React from 'react'
import { Spin } from 'antd'
import classNames from 'classnames'

export default function SpinfirmComponent(props) {
	let className = classNames({
		'mk-spin': true,
		[props.className]: !!props.className,
	})
	let delay = props.delay || 2000,
			spinning = props.spinning || false

	return <Spin {...props} spinning={spinning} delay={delay} className={className} />
}
