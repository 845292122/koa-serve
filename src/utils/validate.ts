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
