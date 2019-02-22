var wzUrl1001 = "https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=2018-10-01&leftTicketDTO.from_station=WHN&leftTicketDTO.to_station=ZZF&purpose_codes=ADULT";
var wzUrl0930 = "https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=2018-09-30&leftTicketDTO.from_station=WHN&leftTicketDTO.to_station=ZZF&purpose_codes=ADULT";
var zmUrl = "https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=2018-10-01&leftTicketDTO.from_station=ZZF&leftTicketDTO.to_station=MQF&purpose_codes=ADULT";
var wmUrl = "https://kyfw.12306.cn/otn/leftTicket/queryA?leftTicketDTO.train_date=2018-09-30&leftTicketDTO.from_station=WHN&leftTicketDTO.to_station=MQF&purpose_codes=ADULT";

function getInt(flag) {
	//var countWz = 0;
	var checkWZ = setInterval(function(){
		$.ajax({

			url: sortUrl(flag),
			type: 'GET',
			dataType: 'JSON',
			success: function (data) {
				//countWz ++;
				if(data.status == true){
					if(data.data.result) {
						var canCheck = false;
						for(var i=0;i<data.data.result.length;i++) {
							var arr = data.data.result[i].split("|");
							if(Number(arr[23]) > 1 || Number(arr[25]) > 1) {

								if(arr[0] && arr[8]<'04:00' && arr[9]<'09:00' && flag=="wz") {
									canCheck = true;
									break;
								} else if(arr[0] && arr[8]>'21:00' && arr[9]<'04:20' && flag=="wz0930") {
									canCheck = true;
									break;
								} else if(arr[0] && arr[8]>'07:00' && arr[8]<'11:00' && flag=="zm") {
									canCheck = true;
									break;
								} else if(arr[0] && arr[8]<'04:00' && arr[9]<'15:00' && flag=="wm") {
									canCheck = true;
									break;
								}
							}
						}
						if(canCheck) {
							alert("can ckeck "+flag);
							console.log("OK")
							clearInterval(checkWZ);
						}else {
							console.log("NO")
						}
					}
				}
			},
			error: function(err) {
				console.error(err);
				clearInterval(checkWZ);
			}
		})
	},200);
}

function sortUrl(flag) {
	switch(flag) {
		case "wz":
		return wzUrl1001;
		break;
		case "wz0930":
		return wzUrl0930;
		break;
		case "wm":
		return wmUrl;
		break;
		case "zm":
		return zmUrl;
		break;
	}
}

//getInt("wz")
//getInt("wz0930")
//getInt("zm")
//以上在https://kyfw.12306.cn/otn/index/init
//以下在https://kyfw.12306.cn/otn/leftTicket/init，需提前选好站和日期


//自动点击查询--begin

var ajaxBack = $.ajax;
var ajaxCount = 0;
$.ajax = function(setting){
  ajaxCount++;
  var cb = setting.complete;
  setting.complete = function(res){
    //if($.isFunction(cb)){cb.apply(setting.context, arguments);}
    ajaxCount--;
    if(ajaxCount==0 && $.isFunction(get101WhToZzSuccess)){
      get101WhToZzSuccess(res);
    }
  }
  ajaxBack(setting);
}

var allAjaxDone = function(){}

//10.01武汉-郑州
function get101WhToZzSuccess(data) {
	if(data.status == true){
		if(data.data.result) {
			var canCheck = false;
			for(var i=0;i<data.data.result.length;i++) {
				var arr = data.data.result[i].split("|");
				if(Number(arr[23]) > 1 || Number(arr[25]) > 1) {
					//if(arr[0] && arr[8]<'04:00' && arr[9]<'09:00' ) {
					if(arr[0] && arr[8]<'04:00' && arr[9]<'09:00' ) {
						canCheck = true;
						break;
					}
				}
			}
			if(canCheck) {
				alert("can ckeck 武汉-郑州");
				clearInterval(checkInterval);
			}
		}
	}
}

//10.01郑州-民权
function get101ZzToMqSuccess(data) {
	if(data.status == true){
		if(data.data.result) {
			var canCheck = false;
			for(var i=0;i<data.data.result.length;i++) {
				var arr = data.data.result[i].split("|");
				if(Number(arr[23]) > 1 || Number(arr[25]) > 1) {
					//if(arr[0] && arr[8]<'04:00' && arr[9]<'09:00' ) {
					if(arr[0] && arr[8]<'10:00' && arr[8]>'07:00' ) {
						canCheck = true;
						break;
					}
				}
			}
			if(canCheck) {
				alert("can ckeck 郑州-民权");
				clearInterval(checkInterval);
			}
		}
	}
}


var checkInterval = setInterval(function(){
	if($("#query_ticket")[0]) {
		$("#query_ticket").click();
	}
}, 1500);

//自动点击查询--end

//以上是查询
//以下是订票
//ajax
var Q = {
	choose_seats
	:
	"",
	dwAll
	:
	"N",
	key_check_isChange
	:
	"B7BFBDF68135A486300F94D80AF092AE71010C8008B7824D196170AC",
	leftTicketStr
	:
	"RyBkGBp%2BW2PdGf7taRL4LwrGBa2LuhV3LBcLN%2BZ1qthGk4ljq026l55tan0%3D",
	oldPassengerStr
	:
	"李家伟,1,411423199102107074,1_孙艳婷,1,411423199111207085,1_",
	passengerTicketStr
	:
	"1,0,1,李家伟,1,411423199102107074,13628615950,N_1,0,1,孙艳婷,1,411423199111207085,18338766897,N",
	purpose_codes
	:
	"00",
	randCode
	:
	"",
	roomType
	:
	"00",
	seatDetailType
	:
	"000",
	train_location
	:
	"Q6",
	whatsSelect
	:
	"1"
}


$.ajax({
    url: "/otn/confirmPassenger/confirmSingleForQueue",
    data: Q,
    type: "POST",
    dataType: "json",
    success: function(T) {
        /*if (T.status) {
            if (!T.data.submitStatus) {
                //D("出票失败!", false, "原因： " + T.data.errMsg + '<a id="xg_close_win_id" >点击修改</a>', false, "lose");
                $("#xg_close_win_id").click(function() {
                    closeWin("transforNotice_id", true);
                    $("#i-ok").css("display", "none")
                })
            } else {
                var S = new OrderQueueWaitTime(P,V,e);
                S.start()
            }
        } else {
            //D("订票失败!", true, "很抱歉！请关闭窗口重新预定车票", true, "lose")
        }*/
    },
    error: function(U, S, T) {
        //D("订票失败!", true, "很抱歉！网络忙，请关闭窗口稍后再试。", true, "lose");
        return
    }
})

passengerTicketStr=1%2C0%2C1%2C%E6%9D%8E%E5%AE%B6%E4%BC%9F%2C1%2C411423199102107074%2C13628615950%2CN_1%2C0%2C1%2C%E5%AD%99%E8%89%B3%E5%A9%B7%2C1%2C411423199111207085%2C18338766897%2CN&
oldPassengerStr=%E6%9D%8E%E5%AE%B6%E4%BC%9F%2C1%2C411423199102107074%2C1_%E5%AD%99%E8%89%B3%E5%A9%B7%2C1%2C411423199111207085%2C1_&
randCode=&
purpose_codes=00&
key_check_isChange=98A32E202A169250463CCCA2CA76F980004E1DB522011694048A0FA9&
leftTicketStr=jhHrFPfatC4l6yLcszqIzJjXo1%252FJc%252BCSzqJqYU1Af1%252BbigZ534AlHhN%252F%252FwA%253D&
train_location=W1&
choose_seats=&
seatDetailType=000&
whatsSelect=1&
roomType=00&
dwAll=N&
_json_att=&
REPEAT_SUBMIT_TOKEN=a1184b2e20e1917a9c66aef6d1f379f1

//页面