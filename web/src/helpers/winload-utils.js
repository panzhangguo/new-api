// 自定义防抖函数

export function deepCopy(obj) {
    //不是引用类型就不拷贝
    if (!(obj instanceof Object)) return obj
    //如果形参obj是数组，就创建数组，如果是对象就创建对象
    let objCopy = obj instanceof Array ? [] : {}

    for (let key in obj) {
        if (obj instanceof Object) {
            objCopy[key] = deepCopy(obj[key])
        } else {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = obj[key]
            }
        }
    }
    return objCopy
}  
