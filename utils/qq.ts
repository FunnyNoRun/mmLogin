/*
 * QQ 群相关的硬编码常量（招新群 1026975200）。
 * Nuxt 会自动导入 utils/ 下的具名导出。
 */

export const GROUP_ID = '1026975200'

/** PC 端：打开 QQ 群资料卡的深链接 */
export const GROUP_LINK_PC =
    'tencent://groupwpa/?subcmd=all&param=7B22' +
    '67726F757055696E223A2231303236393735323030222C2274696D655374616D70223A313738333632363237303831342C22617574684B6579223A227A49756E334B30577077314E633659792B75314378326C384957676356315758436E34624B4570753264516346766A4732567775566461583248354C527A4168222C2261757468223A22227D' +
    '&jump_from='

/** 移动端：打开 QQ 群资料卡的深链接 */
export const GROUP_LINK_MOBILE =
    'mqqapi://card/show_pslcard?src_type=app&version=1&uin=1026975200&card_type=group&wSourceSubID=1027&authSig=zIun3K0Wpw1Nc6Yy+u1Cx2l8IWgcV1WXCn4bKEpu2dQcFvjG2VwuVdaX2H5LRzAh'

/** 简单的移动端判断（仅客户端有效） */
export function isMobileUA(): boolean {
    if (import.meta.server) return false
    return /android|iphone|ipad|ipod|harmony|mobile/i.test(navigator.userAgent)
}
