// 获取url里面的内容
var url = decodeURI(location.href).split('?')[1].split('&');

// 获取聊天内容框
var chatContent = document.getElementsByClassName('chat-content')[0];

// 获取聊天输入框
var editBox = document.getElementsByClassName('edit-box')[0];

// 获取聊天输入框发送按钮
var editButton = document.getElementsByClassName('edit-button')[0];

// 获取用户名栏
var userName = document.getElementsByClassName('user-name')[0];

// 获取在线人数栏
var onlineCount = document.getElementsByClassName('online-count')[0];

// 把登录页面的名称放在右侧
userName.innerHTML = url[1].split('=')[1];
var userImg = document.getElementsByClassName('user-img')[0];

// 把登录页面的头像放在右侧
userImg.src = 'img/' + url[0].split('=')[1];
var logOut = document.getElementsByClassName('log-out')[0];

// 发送按钮绑定点击事件
editButton.addEventListener('click', sendMessage);

// 登出按钮绑定点击事件
logOut.addEventListener('click', closePage);

// 绑定Enter键和发送事件
/*document.onkeydown = function (event) {
    var e = event || window.event;
    if (e && e.keyCode === 13) {
        if (editBox.value !== '') {
            editButton.click();
        }
    }
};*/

// 关闭页面
function closePage() {
    var userAgent = navigator.userAgent;
    if (userAgent.indexOf("Firefox") != -1 || userAgent.indexOf("Chrome") != -1) {
        window.location.href = "about:blank";
    } else {
        window.opener = null;
        window.open("", "_self");
        window.close();
    }
}
// socket部分
var socket = io();

window.onload=function(){
    socket.emit('new_connection',userName.textContent);
}

// 当接收到消息并且不是本机时生成聊天气泡
socket.on('message', function (information) {
    if (information.name !== userName.textContent) {
        createOtherMessage(information);
    }
});

socket.on('oldmessage', function (list,username) {
    if (username==userName.textContent){
        for (var i=0;i<list.length;i++){
            var information = {
                name: list[i].user_name,
                chatContent: list[i].message_content,
                img: list[i].user_profile,
                time: list[i].message_time
            };
            if (information.name==userName.textContent) createMyMessage(information);
            else createOtherMessage(information);
        }
        show_history();
    }
});

// 当接收到有人连接进来
socket.on('connected', function (onlinecount) {
    console.log(onlinecount);
    onlineCount.innerHTML = 'Online:' + onlinecount;
});

// 当接收到有人断开后
socket.on('disconnected', function (onlinecount) {
    console.log(onlinecount);
    onlineCount.innerHTML = 'Online:' + onlinecount;
});


function show_history(){
    var history = document.createElement('div');
    history.innerHTML="----------history messages above----------";
    history.style.textAlign="center";
    history.style.marginTop="30px";
    history.style.marginBottom="30px";
    chatContent.appendChild(history);
}
// 发送本机的消息
function sendMessage() {
    if (editBox.value != '') {
        var date=getdate();
        var myInformation = {
            name: userName.textContent,
            chatContent: editBox.value,
            img: userImg.src,
            time: date
        };

        socket.emit('message', myInformation);
        createMyMessage(myInformation);
        editBox.value = '';
    }

};

// 生成本机的聊天气泡
function createMyMessage(information) {
    var myMessageBox = document.createElement('div');
    myMessageBox.className = 'my-message-box';

    var messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    var span = document.createElement('span');
    var text = document.createElement('textarea');
    text.innerHTML = information.chatContent;
    text.style.height=countheight(information.chatContent);
    span.appendChild(text);
    messageContent.appendChild(span);
    myMessageBox.appendChild(messageContent);

    var arrow = document.createElement('div')
    arrow.className = 'message-arrow';
    myMessageBox.appendChild(arrow);


    var userInformation = document.createElement('div');
    userInformation.className = 'user-information';
    var userChatImg = document.createElement('img');
    userChatImg.className = 'user-chat-img';
    userChatImg.src = information.img;
    var userChatName = document.createElement('div');
    userChatName.className = 'user-chat-name';
    userChatName.innerHTML = information.name;
    userInformation.appendChild(userChatImg);
    userInformation.appendChild(userChatName);
    myMessageBox.appendChild(userInformation);
    chatContent.appendChild(myMessageBox);

    var date = document.createElement('div');
    var oDate = getdate();
    date.innerHTML=oDate;
    date.style.textAlign="right";
    chatContent.appendChild(date);

    chatContent.scrollTop = chatContent.scrollHeight;
}

// 生成其他用户的聊天气泡
function createOtherMessage(information) {
    var otherMessageBox = document.createElement('div');
    otherMessageBox.className = 'other-message-box';

    var otherUserInformation = document.createElement('div');
    otherUserInformation.className = 'other-user-information';
    var userChatImg = document.createElement('img');
    userChatImg.className = 'user-chat-img';
    userChatImg.src = information.img;
    var userChatName = document.createElement('span');
    userChatName.className = 'user-chat-name';
    userChatName.innerHTML = information.name;
    otherUserInformation.appendChild(userChatImg);
    otherUserInformation.appendChild(userChatName);
    otherMessageBox.appendChild(otherUserInformation);

    var otherMessageArrow = document.createElement('div');
    otherMessageArrow.className = 'other-message-arrow';
    otherMessageBox.appendChild(otherMessageArrow);

    var otherMessageContent = document.createElement('div');
    otherMessageContent.className = 'other-message-content';
    
    var span = document.createElement('span');
    var text = document.createElement('textarea');
    text.innerHTML = information.chatContent;
    text.style.height=countheight(information.chatContent);
    span.appendChild(text);
    otherMessageContent.appendChild(span);
    otherMessageBox.appendChild(otherMessageContent);
    chatContent.appendChild(otherMessageBox);

    var date = document.createElement('div');
    //var oDate = getdate();
    date.innerHTML=information.time;
    date.style.textAlign="left";
    chatContent.appendChild(date);

    chatContent.scrollTop = chatContent.scrollHeight;
}

function countheight(str)
{
    var res=0;
    var i;
    var count=0;
    for (i=0;i<str.length;i++){
        if (str[i]=='\n' || count==20) {
            count=0;
            res++;
        }
        else count++;
    }
    return res*20+ 20 +"px";
}

function getdate(){
    var oDate=new Date();
    var oYear=oDate.getFullYear();
    var oMonth=oDate.getMonth()+1;
    var oDay=oDate.getDate();
    var oHours=oDate.getHours();
    var oMinute=oDate.getMinutes();
    var oSeconds=oDate.getSeconds();
    var timeValue=oYear+"-"+zero(oMonth)+"-"+zero(oDay)+" "+zero(oHours)+":"+zero(oMinute)+":"+zero(oSeconds);
    return timeValue;
}

function zero(num){
    return num>=10?num:"0"+num;
}