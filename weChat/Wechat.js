//该模块用于实现获取access_token
const tools = require('../uits/tools');
const rp = require('request-promise');
//用于access_token的存储与使用
function WeChat(config){

    //获取access_token凭证；该凭证是唯一的并且每两小时都会更新，在微信服务器中；
    //所以在存进文件之前应该对有效时间进行处理，在获取时应该对access_token进行有效性认证；如果有效直接在我本地文件中读取
    //如果已经过期将重新向微信服务器请求获取新的
    this.appID = config.appID;
    this.appsecret = config.appsecret;
    /*this.getAccessToken() //调用该方法后要么返回请求到的access-token要么 不存在
        .then((res)=>{
            return this.saveAccessToken(res);
        })*/
    /*1.首先先在本地读取文件access_token
            本地有：
                直接使用
            本地没有：
                重新向微信服务器发送请求，并存入本地
      2.对读取到的数据进行有效性认证
    * */
    return this.fetchAccessToken()
}
WeChat.prototype.fetchAccessToken = function(){
    //看看this中有没有凭证，有表示之前已经从微信服务器中获取过了---->判断是否过期 没有获取则再走后面的逻辑
    //较少调用getAccessToken()的次数
    if (this.access_token&&this.expires_in){
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }
    return this.getAccessToken()//返回一个promise对象，以及从本地读取到的数据
        .then(res=>{//进入该方法表示已经从本地拿到了数据，本地有access_token ===>判断access_token是否过期
            if (this.isValidAccessToken()) {
                return Promise.resolve(res);
            }else{
                return this.updateAccessToken()//返回从微信服务器中获取到的access_token
                /*.then(res=>{
                    return this.saveAccessToken(res);
                })*/
            }

        },err=>{//进入该回调表示本地没有数据要进行向微信服务器获取并且保存至本地
            return this.updateAccessToken()//返回从微信服务器中获取到的access_token
            /*.then(res=>{
                return this.saveAccessToken(res);
            })*/
        })
        .then(res=>{
            //无论是否从本地获取到东西都会走以下逻辑，
            // 绑给this读取之前想看看this中有没有，有表示之前已经从微信服务器中获取过了 没有则再走后面的逻辑
            this.access_token = res.access_token;
            this.expires_in = res.expires_in;
            return this.saveAccessToken(res);
        })
}
//实现access_token的有效性认证
WeChat.prototype.isValidAccessToken = function(data){//该方法是在本地获取到数据之后进行调用
    //1.对获取到的数据进行判断是否是 具有access_token  expires_in
    if (!data||!data.access_token||!data.expires_in) {//进入该判断表示数据不存在或不是有效的数据
        return false;
    }
    const now = Date.now();
    /*  if (now< data.expires_in) {//表示access_token没有过期
          return true;
      }else{
          return false;
      }*/
    return now<data.expires_in; //当没有过期的时候返回true否则返回false
}
//实现本地读取access_token的方法
WeChat.prototype.getAccessToken = function(){
    return tools.readFileAsync();//返回一个promise对象，以及读取到的数据
}
//实现将获取到的access-token写入一个文件夹中
WeChat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync(data)
}
//实现获取微信服务器访问接口的凭据
WeChat.prototype.updateAccessToken = function(){
    const url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential" +
        "&appid="+this.appID+"&secret="+this.appsecret+"";
    //向微信服务器发送请求需要引入；两个库  request  和request-promise
    return new Promise((resolve,reject)=>{
        rp({method:"GET",url,json:true})//该函数是一个异步函数  返回的是一个promise对象,向微信服务器发送请求拿到{access_token,expirse_in}
            .then((res)=>{
                const nowtime = Date.now();//得到当前事件距离格林时间的一个毫秒值
                const expires_in = nowtime+(res.expires_in-5*60)*1000;//将access_token de 过期时间提前5分钟
                res.expires_in = expires_in;
                console.log( res.expires_in)
                resolve(res);
            },(err)=>{
                reject(err);
            })
    })
}
module.exports = WeChat