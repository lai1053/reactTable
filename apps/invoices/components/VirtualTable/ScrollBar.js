import React, { useMemo } from "react"
import debounce from "lodash.debounce"
// import { throttle } from "edf-utils"

export default function ScrollBar(props) {
    const {
        prefixCls,
        direction,
        barRef,
        onScroll,
        width,
        height,
        maxWidth,
        maxHeight,
        delay,
        ...other
    } = props
    const debounceScroll = debounce(onScroll, delay || 37)
    const handleScroll = e => {
        const { scrollLeft, scrollTop } = e.currentTarget || {}
        if (!onScroll) return
        if (direction === "vertical") {
            debounceScroll(scrollTop || 0)
        } else {
            onScroll(scrollLeft || 0)
        }
    }
    return useMemo(() => {
        return (
            <div
                {...other}
                className={`${prefixCls}-body-scroll-bar ${direction}`}
                onScroll={handleScroll}
                ref={barRef}
                style={{
                    maxHeight,
                    maxWidth,
                    width: direction === "vertical" ? 11 : "auto",
                }}>
                <div style={{ width, height }}></div>
            </div>
        )
    }, [maxHeight, maxWidth, width, height, direction])
}
