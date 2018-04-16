//该模块用于实现根据消息的不同类型来进行回复
const tpl = require('./tpl')
module.exports = (message)=>{
    let content = "";
    if (message.MsgType === "text"){//文本消息的处理
        if (message.Content === "1"){//如果输入的内容为1
            content = "您确认提取金额5555吗？\n回复2确认\n 回复任意键进入其他服务"
        }else if ( message.Content === "2") {//如果输入的内容为2  返回的消息
            content = "确认提取成功"
        }else if (message.Content.match(3)) {//如果输入的内容中存在3
            content = "提取成功"
        }else if (message.Content){//输入的内容存在，非以上条件的
            content = "输入内容无服务"
        }
    }else if (message.MsgType === 'location'){//微信中点 +  中有一个‘位置’ 点那个会发送的消息类型
        content = '纬度:' + message.Location_X + '\n经度:' + message.Location_Y +
            '\n地图缩放：' + message.Scale + '地理位置信息：'+message.Label
    }else if (message.MsgType === "event"){//消息是事件类型时的情况
        switch (message.Event){//获取事件
            case "subscript": //表示关注订阅号的事件
                    content = "感谢您的关注"
                break
            case "SCAN"://用户已关注时的事件推送
                content = '用户已关注时的事件推送'
                break
            case "LOCATION": //这个是关注后会有个弹窗是否上报地理位置，同意后每次进入公众号会话时，都会在进入时上报地理位置
                content = '纬度:' + message.Latitude + '\n经度:' + message.Longitude + '\n精度：' + message.Precision
                break
            case "CLICK"://点击自定义菜单后，微信会把点击事件推送给开发者  点击菜单弹出子菜单，不会产生上报。
                content = message.EventKey
                break
            case "unsubscript"://取消订阅号时微信时
                console.log("用户无情取关！")
                break
            default:
                break
        }
    }
    let options = {}
    options.fromUserName = message.FromUserName;//将微信服务器端请求的FromUserName也就是  用户的微信号
    options.toUserName = message.ToUserName //表示的是开发者的微信号
    options.createTime = Date.now()
    options.msgType = 'text'/*message.MsgType*/;
    options.content = content;//对消息处理的内容
    return tpl(options);//调用模块的方法  将响应的消息转换为xml格式
}
