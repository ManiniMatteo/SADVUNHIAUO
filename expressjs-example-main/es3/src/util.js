const uuid = (len) => {

    let res = "";
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++) {
        res += alpha.charAt(Math.random() * alpha.length)
    }
    return res
}


module.exports = { uuid }