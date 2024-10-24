/**
 * 从错误字符串中提取错误信息
 *
 * 该函数旨在从给定的错误字符串中解析出具体的错误信息字符串
 * 它假设错误字符串是包含错误信息的JSON数组格式如果解析失败或格式不匹配，
 * 则返回一个默认的错误信息字符串
 *
 * @param errorString 包含错误信息的字符串，预期为JSON数组格式
 * @returns {string} 提取的错误信息字符串
 */
export const extractErrorMessage = (errorString: string) => {
  let jsonArr = JSON.parse(errorString)
  if (Array.isArray(jsonArr) && jsonArr.length > 0) {
    let obj = jsonArr[0]
    if (obj && obj.message) {
      return obj.message
    } else {
      return '参数验证错误:' + errorString
    }
  }
}
