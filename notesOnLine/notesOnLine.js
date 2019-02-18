/*
*在线批注插件
*2018-10-15-Lijw
*/

(function() {
	var nol = {}
	/*nol.oncontextmenu=function(e){
		e.preventDefault();

		var menu=document.querySelector("#menu");

		if(!menu[0]) {
			initContentextMenu();
		}

		menu.style.left=e.clientX+'px';
		menu.style.top=e.clientY+'px';

		menu.style.width='125px';
	}

	nol.onclick=function(e){
		document.querySelector('#menu').style.height=0;
	}

	initContentextMenu = function() {
		var contentextMenuHtml = "<div>"
	}*/	
	var urlParams = new URLSearchParams(location.search)
	if(!urlParams.get("type") || 'view' == urlParams.get("type")) {
		return;
	}

	nol.noteColorStyle = "red";
	nol.curPageNum = 1;
	nol.elType = 0;
	nol.elStart = false;
	nol.elEnd = true;
	nol.doesList = [];
	nol.undoList = [];
	nol.contentList = [];
	nol.nowSteps = [];
	nol.backContent = [];
	nol.nowSavePage = 0;
	if(location.href.indexOf("filePreview") > 0) {
		nol.attId = location.href.substring(location.href.indexOf("filePreview") + 12, location.href.indexOf("?type"))
	} else {
		nol.attId = urlParams.get("id")
	}
	//window.opener = null;
	var documentType = $("body").attr("type");

	//初始化
	nol.init = function() {
		if($(".menu_first")[0]) {
			return;
		}
		switch (documentType) {
			case "img":
			//图片转canvas
			var containDiv = document.createElement("div")
			//使菜单不随页面滚动
			containDiv.setAttribute("class", "img_container")
			document.body.setAttribute("class", "img_doc_body")
			containDiv.style.overflowY = "auto";
			document.body.appendChild(containDiv);
			var c = document.createElement("canvas");
			containDiv.append(c);
			var imgInterval = setInterval(function() {
				if($("img").length > 0) {
					//var img = new Image();
					var img = new Image();
					img.src = $("img")[0].src;
					img.onload = function() {
						c.width = $("img")[0].width;
						c.height = $("img")[0].height;
						var ctx = c.getContext("2d");
						ctx.drawImage(img, 0, 0, $("img")[0].width, $("img")[0].height);
						nol.beforeSave(c);
						//nol.save(c, ctx, 0)
						
						$("img")[0].style.display = "none"
					};
					//img.src = $("img")[0].src;
					clearInterval(imgInterval)
				}
			}, 500)
			break;

			case "txt":
			//文档转canvas？？
			var iframe = document.getElementById("indexIframe");    
	        if (iframe.attachEvent) {    
	            iframe.attachEvent("onload", function() {    
	                nol.initTxt()
	            });    
	        } else {    
	            iframe.onload = function() {
	            	nol.initTxt()
	            };    
	        }
			break;

			case "office":
			break;
		}
		//.////图标资源
		var nolContentHtml = 
		'<div class="menu_first">' + 
		'	<div class="tool_class">' + 
		'		<span>工具</span>' + 
		'		<ul>' + 
		'			<li class="tool_line">添加直线</li>' + 
		'			<li class="tool_square">添加方框</li>' + 
		'			<li class="tool_text">添加文字</li>' + 
		'		</ul>' + 
		'	</div>' + 
		'	<div class="operation_class">' + 
		'		<span>操作</span>' + 
		'		<ul>' + 
		'			<li class="undo disabled">撤销</li>' + 
		'			<li class="redo disabled">重做</li>' + 
		'			<li class="clear disabled" title="恢复到本次载入时状态">全部清除</li>' + 
		'			<li class="saveAsImg disabled">保存批注</li>' + 
		'		</ul>' + 
		'	</div>' + 
		'</div>' + 
		'<div class="cover_class">' +
		// 文档用
		'<div class="translating_class">正在生成第 <b>1</b> 页</div>' +
		'</div>' + 
		'<div class="choose_class"></div>' + 
		'<div class="text_class">' + 
		'	<textarea style="resize:none"></textarea>' + 
		'	<div class="text_buttons">' + 
		'		<button class="layui-btn layui-btn-small layui-btn-normal text_confirm">确定</button>' + 
		'		<button class="layui-btn layui-btn-small layui-btn-danger text_cancel">取消</button>' +
		'	</div>' + 
		'</div>'
		/*if (documentType == 'office') {
			var initOfficeInterval = setInterval(function() {
				// 等待加载完成，将事件绑定写入一个方法进行使用
				if (document.getElementById("indexIframe").contentWindow.PDFViewerApplication && document.getElementById("indexIframe").contentWindow.PDFViewerApplication.pdfDocument) {
					$("body").append(nolContentHtml);
					clearInterval(initOfficeInterval)
				}
			}, 200)
		} else {*/
			$("body").append(nolContentHtml);
		//}

		//工具
		$(".tool_class li").bind("click", function() {
			switch (this.className) {
				case "tool_line":
				//方框
					nol.chooseElement(1);
					break;
				case "tool_square":
				//直线
					nol.chooseElement(2);
					break;
				case "tool_text":
				//文字
					nol.chooseElement(3);
					break;
				default:
					break;
			}
		});
		//操作
		$(".operation_class li").bind("click", function() {
			if(this.className.indexOf("disabled") > 0) {
				return;
			}
			switch (this.className) {
				case "undo":
				//方框
					nol.undo();
					break;
				case "redo":
				//直线
					nol.redo();
					break;
				case "clear":
				//文字
					nol.clear();
					break;
				case "saveAsImg":
				//文字
					nol.saveAsImg();
					break;
				default:
					break;
			}
		});
		//菜单拖拽
		var menuFocus = false;
		var menuMoveStart;
		var startLeft;
		var startTop
		$(".menu_first").bind("mousedown", function(e) {
			menuFocus = true;
			menuMoveStart = e;
			//var downX = e.clientX - $(this).offsetLeft;
			//var downY = e.clientY - $(this).offsetTop;
			startLeft = Number($(".menu_first").css("left").substring(0, $(".menu_first").css("left").length-2));
			startTop = Number($(".menu_first").css("top").substring(0, $(".menu_first").css("top").length-2));
			var downX = e.clientX - startLeft;
			var downY = e.clientY - startTop;
			//不在可点区域内，移动
			if(downY < 25 || (downY < 125 && downY > 95) || downX < 8 || downX > 61) {
				/*$(".menu_first").bind("mouseout", function(event) {
					$(".menu_first").unbind("mousemove");
				})*/
				/*$(".menu_first").bind("mouseover", function(event) {
					$(".menu_first").unbind("mousemove");
				})*/
			}
			e.stopPropagation()
		})

		$("body").bind("mousemove", function(event) {
			if(!menuFocus) {
				return;
			}
　　　　　　　event = event || window.event;
　　　　　　　var divX = event.clientX - menuMoveStart.clientX + startLeft;
　　　　　　　var divY = event.clientY - menuMoveStart.clientY + startTop;
			var startLeft2 = Number($(".menu_first").css("left").substring(0, $(".menu_first").css("left").length-2));
			var startTop2 = Number($(".menu_first").css("top").substring(0, $(".menu_first").css("top").length-2));
			//if(0 < (event.clientX - startLeft2) && (event.clientX - startLeft2) < 65 && 0 < (event.clientY - startTop2) && (event.clientY - startTop2) < 240) {
	　　　　　　　$(".menu_first").css("left", divX + 'px');
	　　　　　　　$(".menu_first").css("top", divY + 'px');
			//}
			event.stopPropagation()
			
　　　　})
　　　　$(".menu_first").bind("mouseup", function(e) {
			menuFocus = false;
			menuMoveStart = null;
			//e.stopPropagation()
　　　　})
	}

	/*var waitInterval = setInterval(function() {
		//if($ != undefined) {
			nol.init()
			clearInterval(waitInterval);
		//}
	}, 1000)*/
	nol.initTxt = function() {
		//var txtInterval = setInterval(function() {
			//if($("#indexIframe").contents().find("body").length > 0) {
				html2canvas($("#indexIframe").contents().find("body")[0]).then(function(canvas) {
					var containDiv = document.createElement("div")
					//使菜单不随页面滚动
					containDiv.setAttribute("class", "img_container")
					document.body.setAttribute("class", "img_doc_body")
					containDiv.style.overflowY = "auto";
					document.body.appendChild(containDiv);
					containDiv.append(canvas);
					nol.beforeSave(canvas);
					$("#indexIframe").css("display", "none");
				});
				//$("canvas").css("position", "absolute");
				//$("canvas").css("top", "0px");
				//$("canvas").css("left", "0px");

				//clearInterval(txtInterval)
			//}
		//}, 500)
	}
	nol.init()

	//画方框
	nol.drawBox = function(canvas, pageNum, x, y, w, h, color) {
		nol.beforeSave(canvas);
		var context = canvas.getContext("2d");
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.strokeRect(x, y, w, h);
		//context.save()
		nol.save(canvas, context, pageNum)
	}

	/*//画水平线
	nol.drawHorizon = function(pageNum, x, y, w, color) {
		nol.beforeSave();
		var canvas = $("#" + pageNum + " canvas");
		var context = canvas.getContext("2d");
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.moveTo(x, y)
		context.lineTo(x+w, y)
		context.stroke()
		//context.save()
		nol.save(canvas, context, pageNum)
	}*/

	//画直线
	nol.drawLine = function(canvas, pageNum, x, y, w, h, color) {
		nol.beforeSave(canvas);
		var context = canvas.getContext("2d");
		context.beginPath();
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.moveTo(x, y)
		context.lineTo(x+w, y+h)
		context.stroke()
		//context.save()
		nol.save(canvas, context, pageNum)
	}

	//画文字
	nol.fillTxt = function(canvas, pageNum, txt, x, y, w, h, color) {
		///////高度是否有用
		nol.beforeSave(canvas);
		var context = canvas.getContext("2d");
		/*context.font = 'bold 12px Arial';
		context.textAlign = 'left';
		context.textBaseline = 'top';
		context.fillStyle = color;
		// content.strokeText(txt, x, y);
		context.fillText(txt, x, y, w);     */
		//context.save()
		canvasTextAutoLine(txt, canvas, x, y, w, h, 20, color)
		nol.save(canvas, context, pageNum)
	}

	//总--绘制
	nol.drawEl = function(text) {
		//deal
		if(!nol.containsCanvas) {
			return;
		}
		var bcr = nol.containsCanvas.getBoundingClientRect();
		//计算坐标和宽高
		var finalX = (nol.startPoint.left - bcr.left) * (nol.containsCanvas.width/bcr.width);
		var finalY = (nol.startPoint.top - bcr.top) * (nol.containsCanvas.height/bcr.height);
		var finalW = nol.endPoint.left - nol.startPoint.left;
		var finalH = nol.endPoint.top - nol.startPoint.top;
		//canvas画图为负是否可以
		switch (nol.elType) {
			case 1:
				//直线
				nol.drawLine(nol.containsCanvas, nol.containsPage, finalX, finalY, finalW, finalH, nol.noteColorStyle)
				break;
			case 2:
				//方框
				nol.drawBox(nol.containsCanvas, nol.containsPage, finalX, finalY, finalW, finalH, nol.noteColorStyle)
				break;
			case 3:
				//文字
				if(nol.textFilled) {
					nol.fillTxt(nol.containsCanvas, nol.containsPage, text, finalX, finalY, finalW, finalH, nol.noteColorStyle)
					nol.textFilled = false;
				} else {
					nol.showTextArea(nol.startPoint, nol.endPoint, nol.noteColorStyle)
					nol.textFilled = true;
				}
				break;
			default:
				break;
		}
	}

	//绘制选框
	nol.drawChooseBox = function(e) {
		//width和height为非负
		///////////////top,left,width,height互相颠倒，将产生特殊效果
		if (nol.elType == 1) {
			// 直线
			$(".choose_class").css("transform-origin", "left top")
			$(".choose_class").css("height", "0px")
			$(".choose_class").css("border-top", "1px dashed " + nol.noteColorStyle)
			$(".choose_class").css("width", Math.sqrt(Math.pow(e.clientX - nol.startPoint.left, 2) + Math.pow(e.clientY - nol.startPoint.top, 2)) + 'px')
			$(".choose_class").css("transform", 'rotate(' + getDeg(nol.startPoint.left, nol.startPoint.top, e.clientX, e.clientY, ) +
				// ((e.clientX > nol.startPoint.left) ? 0 : 90) + 
				'deg')
		} else {
			$(".choose_class").css("transform", 'rotate(0deg)')
			if(e.clientX > nol.startPoint.left) {
				$(".choose_class").css("width", e.clientX - nol.startPoint.left + "px");
			} else {
				$(".choose_class").css("left", e.clientX + "px");
				$(".choose_class").css("width", nol.startPoint.left - e.clientX + "px");
			}
			if(e.clientY > nol.startPoint.top) {
				$(".choose_class").css("height", e.clientY - nol.startPoint.top + "px");
			} else {
				$(".choose_class").css("top", e.clientY + "px");
				$(".choose_class").css("height", nol.startPoint.top - e.clientY  + "px");
			}
		}

		//方框--虚线框跟随；直线-- ；文字--
	}

	//撤销
	/*window.undo = function() {
		var canvas = $("#" + doesList[doesList.length-1] + " canvas");
		var context = canvas.getContext("2d");
		context.restore();
		doesList.pop();
	}*/


	//save和restore只是针对变换？测试无效，只能重绘

	//撤销
	nol.undo = function() {
		var aimPage = nol.undoList[nol.undoList.length-1];
		if(documentType == "office") {
			var canvas = $("#indexIframe").contents().find("#viewer canvas")[aimPage];
		} else {
			var canvas = $("canvas")[aimPage];
		}
		var context = canvas.getContext("2d");
		context.clearRect(0,0,canvas.width,canvas.height);

		//此次pre不再判断是否大于-1，因而需保证undo按钮的disabled属性的正确性
		var aimData = nol.contentList[aimPage][nol.nowSteps[aimPage].pre];
		//重做用
		//nol.contentList[aimPage].push(nol.contentList[aimPage][nol.undoList.length-1])
		context.putImageData(aimData, 0, 0)
		//nol.nowSteps[aimPage].step --;
		var tempStep = nol.nowSteps[aimPage].reflex;
		//当前映射指向pre，next指向当前映射，pre指向上一帧？
		nol.nowSteps[aimPage].reflex = nol.nowSteps[aimPage].pre;
		nol.nowSteps[aimPage].next = tempStep;
		nol.nowSteps[aimPage].pre --;

		nol.doesList.push(nol.undoList[nol.undoList.length-1]);
		nol.undoList.pop();

		nol.dealDisable();
		$(".operation_class .redo").removeClass("disabled")
		nol.undoTimes++;
	}

	//重做
	nol.redo = function() {
		var aimPage = nol.doesList[nol.doesList.length-1];
		if(documentType == "office") {
			var canvas = $("#indexIframe").contents().find("#viewer canvas")[aimPage];
		} else {
			var canvas = $("canvas")[aimPage];
		}
		var context = canvas.getContext("2d");
		context.clearRect(0,0,canvas.width,canvas.height);

		//此次next不再判断是否大于-1，因而需保证redo按钮的disabled属性的正确性
		var aimData = nol.contentList[aimPage][nol.nowSteps[aimPage].next];
		context.putImageData(aimData, 0, 0)
		//nol.nowSteps[aimPage].step ++;
		var tempStep = nol.nowSteps[aimPage].reflex;
		nol.nowSteps[aimPage].reflex = nol.nowSteps[aimPage].next;
		nol.nowSteps[aimPage].pre = tempStep;

		nol.undoList.push(nol.doesList[nol.doesList.length-1]);
		nol.doesList.pop();

		nol.dealDisable();
		nol.undoTimes--;
		if(nol.undoTimes > 0) {
			$(".operation_class .redo").removeClass("disabled")
			//nol.nowSteps[aimPage].next ++;???????
			nol.nowSteps[aimPage].next = nol.contentList[aimPage].length - nol.undoTimes;
		} else {
			$(".operation_class .redo").addClass("disabled")
			nol.nowSteps[aimPage].next = 0;
		}
	}

	//清除重做
	nol.clear = function() {
		layer.confirm('全部清除将回退到本次批注载入时的状态，且不可回退，是否确认继续？', {
            btn: ['确定', '取消']
        }, function () {
        	layer.closeAll()
			if(documentType == "office") {
				$.each($("#indexIframe").contents().find("#viewer canvas"), function(index, el) {
					//解决预览缓存加载机制页数变化问题
					if(nol.backContent[index]) {
						el.getContext("2d").putImageData(nol.backContent[index], 0, 0);
					}
				})
			} else {
				if(nol.backContent[0]) {
					$("canvas")[0].getContext("2d").putImageData(nol.backContent[0], 0, 0);
				}
			}
			//强制重置，不可回退
			$(".operation_class .undo").addClass("disabled")
			$(".operation_class .clear").addClass("disabled")
			// $(".operation_class .saveAsImg").addClass("disabled")
			$(".operation_class .redo").addClass("disabled")
			nol.doesList = [];
			nol.undoList = [];
			nol.contentList = [];
			nol.backContent = [];
			nol.nowSteps = [];
			nol.nowSavePage = 0;
        }, function () {
            
        });
	}

	//操作前备份（仅初次）
	nol.beforeSave = function(c) {
		if(nol.backContent.length > 0) {
			return;
		}
		//请确保引入了jQuery
		if(documentType == "office") {
			$.each($("#indexIframe").contents().find("#viewer canvas"), function(index, el) {
				var nowImageData = el.getContext("2d").getImageData(0, 0, el.width, el.height);
				nol.backContent.push(nowImageData);
				nol.contentList.push([nowImageData])
				nol.nowSteps.push({"step":0, "reflex": 0, "pre": 0, "next": 0});
			})
		} else {
			var nowImageData = c.getContext("2d").getImageData(0, 0, c.width, c.height);
			nol.backContent.push(nowImageData);
			nol.contentList.push([nowImageData])
			nol.nowSteps.push({"step":0, "reflex": 0, "pre": 0, "next": 0});
		}
	}

	nol.save = function(ca, co, pn) {
		//好像会对不上
		var imageData = co.getImageData(0, 0, ca.width,ca.height);
		//解决预览缓存加载机制页数变化问题
		if(nol.contentList[pn]) {
			nol.contentList[pn].push(imageData)
			nol.nowSteps[pn].step ++;
			//next节点指向空,pre节点指向前一个映射
			nol.nowSteps[pn].next = 0;
			nol.nowSteps[pn].pre = nol.nowSteps[pn].reflex;
			//映射位置，指向新的链接
			nol.nowSteps[pn].reflex = nol.contentList[pn].length - 1;
		} else {
			nol.backContent.push(imageData);
			nol.contentList.push([imageData])
			nol.nowSteps.push({"step":0, "reflex": 0, "pre": 0, "next": 0});
		}
		nol.doesList.push(pn)
		nol.undoList.push(pn)
		//保存后，重做按钮置灰
		nol.dealDisable();
		$(".operation_class .redo").addClass("disabled")
		nol.undoTimes = 0;

		nol.nowSavePage = pn;
	}

	//根据两个列表的长度，判断撤销与重做是否灰化
	nol.dealDisable = function() {
		if(nol.undoList.length < 1) {
			//撤销置灰
			$(".operation_class .undo").addClass("disabled")
			$(".operation_class .clear").addClass("disabled")
			$(".operation_class .saveAsImg").addClass("disabled")

		} else {
			$(".operation_class .undo").removeClass("disabled")
			$(".operation_class .clear").removeClass("disabled")
			$(".operation_class .saveAsImg").removeClass("disabled")
		}
		/*if(nol.doesList.length < 1) {
			//重做置灰，清空置灰，保存置灰，
			$(".operation_class .redo").addClass("disabled")

		} else {
			if(nol.nowUndo) {
				$(".operation_class .redo").removeClass("disabled")
			}
		}*/
	}

	nol.saveAsImg = function() {
		if(documentType == "office") {
			//将没有渲染的每一页都渲染，避免未渲染的获取不到无法保存
			nol.showCover(0.9);
			nol.initNonePages();
		} else {
			//生成img，保存
			nol.canvasToImg();
			nol.imgUpload();
		}
	}

	nol.showCover = function(opacityNum) {
		$(".cover_class").show();
		if (opacityNum) {
			$(".cover_class").css('opacity', opacityNum)
		}
	}

	nol.hideCover = function() {
		$(".cover_class").hide();
	}

	nol.showChooseBox = function() {
		$(".choose_class").show();
	}

	nol.hideChooseBox = function() {
		$(".choose_class").hide();
	}

	nol.showTextArea = function(startPoint, endPoint, color) {
		var startX = startPoint.left < endPoint.left ? startPoint.left : endPoint.left;
		var startY = startPoint.top < endPoint.top ? startPoint.top : endPoint.top;
		var textWidth = startPoint.left < endPoint.left ? endPoint.left - startPoint.left : startPoint.left - endPoint.left;
		var textHeight = startPoint.top < endPoint.top ? endPoint.top - startPoint.top : startPoint.top - endPoint.top;

		$(".text_class").css("left", startX);
		$(".text_class").css("top", startY);
		$(".text_class textarea").css("width", textWidth);
		$(".text_class textarea").css("height", textHeight);
		$(".text_class").show();
		$(".text_confirm").unbind().bind("click", function() {
			if($(".text_class textarea").val().trim() == "") {
				layer.msg("请输入文字内容")
				//alert("请输入文字内容")
				return;
			}
			////长度大小占位判断，不可拖拽，不可遮住/////////
			nol.drawEl($(".text_class textarea").val());

			nol.hideCover();
			nol.hideTextArea();

			nol.elType = 0;
			nol.containsCanvas = null;
			nol.containsPage = 0;
			nol.startPoint = null;
			nol.endPoint = null;
			$(".text_class textarea").val("");
		});
		$(".text_cancel").unbind().bind("click", function() {
			nol.hideCover();
			nol.hideTextArea();
			nol.textFilled = false;

			nol.elType = 0;
			nol.containsCanvas = null;
			nol.containsPage = 0;
			nol.startPoint = null;
			nol.endPoint = null;
			$(".text_class textarea").val("");
		});
	}

	nol.hideTextArea = function() {
		$(".text_class").hide();
	}

	nol.chooseElement = function(type) {
		nol.showCover(0.5);
		nol.elType = type;

		nol.elStart = true;
		nol.elEnd = false;
	}

	//当前鼠标坐标是否有效区
	nol.pointEffective = function(el) {
		var contains = false;
		if(documentType == "office") {
			$.each($("#indexIframe").contents().find("#viewer canvas"), function(index, e) {
				/*if((getElementLeft(e) < el.clientX) && (getElementTop(e) < el.clientY) && 
					((getElementLeft(e) + e.width) > el.clientX) && ((getElementTop(e) + e.height) > el.clientY)) {*/
				if((e.getBoundingClientRect().left < el.clientX) && (e.getBoundingClientRect().top < el.clientY) && 
					((e.getBoundingClientRect().left + e.width) > el.clientX) && ((e.getBoundingClientRect().top + e.height) > el.clientY)) {
					contains = true;
					//若有，则表示是判断end点，此时需要判断end和start是同一个canvas里；若无，则表示是判断start点;暂不支持跨页批注
					if(nol.containsCanvas) {
						if(nol.containsCanvas != e) {
							contains = false;
						}
					} else {
						nol.containsCanvas = e;
						nol.containsPage = index;
					}
				}
			})
		} else {
			var e = $("canvas")[0]
			if((e.getBoundingClientRect().left < el.clientX) && (e.getBoundingClientRect().top < el.clientY) && 
				((e.getBoundingClientRect().left + e.width) > el.clientX) && ((e.getBoundingClientRect().top + e.height) > el.clientY)) {
				contains = true;
				//若有，则表示是判断end点，此时需要判断end和start是同一个canvas里；若无，则表示是判断start点;暂不支持跨页批注
				if(nol.containsCanvas) {
					if(nol.containsCanvas != e) {
						contains = false;
					}
				} else {
					nol.containsCanvas = e;
					nol.containsPage = 0;
				}
			}
		}
		return contains;
	}

	nol.initNonePages = function() {
		nol.totalPages = $("#indexIframe").contents().find(".page").length;
		nol.renderedPages = $("#indexIframe").contents().find(".page canvas").length - $("#indexIframe").contents().find(".page .loadingIcon").length;
		if(nol.renderedPages < nol.totalPages) {
			/*for(var i=0;i<totalPages;i++) {
				if(!$("#indexIframe").contents().find(".page #page"+(i+1))[0]) {
					//PDFViewerApplication.pdfViewer._setCurrentPageNumber(i)
					nol.initNonePagesSingle
        			var waitPageInterval = setInterval(function() {
        				if($("#indexIframe").contents().find("#pageNumber").className.indexOf("visiblePageIsLoading") < 0) {
        					clearInterval(waitPageInterval);
        					continue;
        				}
        			}, 100)
				}
			}
			$.each($("#indexIframe").contents().find(".page"), function(index, e) {
				if(!$(e).find("canvas")[0]) {

				}
			})*/
			$(".translating_class").show()
			nol.initNonePagesSingle(1)
		} else {
			nol.hideCover();
			//canvas拼接，当前场景每个canvas的长宽均相等
			nol.joinCanvas();
			//生成img，保存
			nol.canvasToImg();
			nol.imgUpload();
		}
	}

	nol.initNonePagesSingle = function(pg) {
		if((!$("#indexIframe").contents().find(".page #page"+pg)[0] || $("#indexIframe").contents().find("#pageContainer" + pg).find('.loadingIcon')[0]) && pg < (nol.totalPages + 1)) {
			$("#indexIframe").contents().find("#pageNumber").val(pg);
			var ev = document.createEvent("HTMLEvents");  
			ev.initEvent("change", false, true);  
			$("#indexIframe").contents().find("#pageNumber")[0].dispatchEvent(ev);
			$(".translating_class b").text(pg)
			var waitPageInterval = setInterval(function() {
				// if($("#indexIframe").contents().find("#pageNumber")[0].className.indexOf("visiblePageIsLoading") < 0) {
				// 实测加载完后并未绘制完
				if($("#indexIframe").contents().find("#page" + pg)[0]
				 && !$("#indexIframe").contents().find("#page" + pg).attr("hidden")
				 // 配合修改的pdf.js的11350行
				 // && $("#indexIframe").contents().find("#page" + pg).attr("finished")
				 && !$("#indexIframe").contents().find("#pageContainer" + pg).find('.loadingIcon')[0]
				) {
					nol.renderedPages = $("#indexIframe").contents().find(".page canvas").length - $("#indexIframe").contents().find(".page .loadingIcon").length
					if(pg < nol.totalPages) {
						nol.initNonePagesSingle(pg+1);
					} else if (nol.renderedPages == nol.totalPages) {
						$(".translating_class").hide()
						nol.hideCover();
						//canvas拼接，当前场景每个canvas的长宽均相等
						nol.joinCanvas();
						//生成img，保存
						nol.canvasToImg();
						nol.imgUpload();
					} else {
						nol.initNonePagesSingle(1)
					}
					clearInterval(waitPageInterval);
				}
			}, 200)
		} else if (nol.renderedPages == nol.totalPages)  {
			$(".translating_class").hide()
			nol.hideCover();
			//canvas拼接，当前场景每个canvas的长宽均相等
			nol.joinCanvas();
			//生成img，保存
			nol.canvasToImg();
			nol.imgUpload();
		} else if(pg < nol.totalPages) {
			nol.initNonePagesSingle(pg+1);
		} else {
			nol.initNonePagesSingle(1)
		}
 	}

	nol.joinCanvas = function() {
		var finalCanvas = document.createElement("canvas");
		finalCanvas.setAttribute("id", "finalCanvas")
		$("body").append(finalCanvas)
		var totalPages = $("#indexIframe").contents().find(".page").length;
		$("#finalCanvas")[0].width = $("#indexIframe").contents().find("#page1")[0].width;
		$("#finalCanvas")[0].height = Number($("#indexIframe").contents().find("#page1")[0].height) * totalPages;
		var finalContext = $("#finalCanvas")[0].getContext("2d");
		var nowTop = 0;
		//var nowLeft = 0;
		for(var i=0;i<totalPages;i++) {
			var canvas = $("#indexIframe").contents().find(".page #page"+(i+1))[0];
			if(canvas) {
				finalContext.putImageData(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height), 0, nowTop);
				nowTop += canvas.height;
			}
		}
	}

	nol.canvasToImg = function() {
		var finalCanvas;
		if(documentType == "office") {
			finalCanvas = $("#finalCanvas")[0]
		} else {
			finalCanvas = $("canvas")[0]
		}
		//nol['finalImageData'] = finalCanvas.getContext("2d").getImageData(0, 0, finalCanvas.width, finalCanvas.height)
		nol['finalImageData'] = finalCanvas.toDataURL( 'image/png', 0.7 )
	}

	nol.imgUpload = function() {
		layer.confirm('同一份附件只保存最后一次提交的批注，是否确认继续提交？', {
            btn: ['确定', '取消']
        }, function () {
        	layer.closeAll()
        	layer.load()
			$.ajax({
	            url: baseRoot + 'assignment/updateAssignmentComments',
	            type: 'POST',
	            dataType: 'json',
	            contentType: 'application/json',
	            data: JSON.stringify({
	            	"attachmentId": nol.attId,
					"comments": nol['finalImageData']
	            }),
	            success: function (data) {
	            	layer.closeAll()
	                if (data.code == "1") {
						layer.alert("保存成功，将在5秒钟后关闭页面")
						// $(".operation_class .saveAsImg").addClass("disabled")
						window.opener.location.reload()
						setTimeout(function(){
							window.close()
						}, 5000)
	                } else {
	                    layer.alert("保存失败")
	                }

	            },
	            error: function(err) {
	            	layer.closeAll()
	            	layer.alert("保存失败")
	            }
	        });
        }, function () {
            
        });
	}

	window.onmousedown = function(e) {
		if(nol.elStart && !nol.elEnd) {
			//区域有效
			if(nol.pointEffective(e)) {
				//记录起点
				nol.startPoint = {
					"left": e.clientX,
					"top": e.clientY
				}

				//定位box选框起点
				$(".choose_class").css("left", e.clientX + "px");
				$(".choose_class").css("top", e.clientY + "px");
			}
		}
		//e.stopPropagation()
	}

	window.onmouseup = function(e) {
		if(nol.elStart && !nol.elEnd) {
			if(nol.pointEffective(e)) {
				//记录终点
				nol.endPoint = {
					"left": e.clientX,
					"top": e.clientY
				}
				nol.elEnd = true;
				nol.elStart = false;

				if(nol.startPoint) {	
					nol.drawEl()
				}

				if(nol.elType == 3 && nol.startPoint) {
					nol.hideChooseBox();
				} else {
					nol.elType = 0;
					nol.containsCanvas = null;
					nol.containsPage = 0;
					nol.hideCover();
					nol.hideChooseBox();
					nol.startPoint = null;
					nol.endPoint = null;
				}
			} else {
				nol.elType = 0;
				nol.containsCanvas = null;
				nol.containsPage = 0;
				nol.hideCover();
				nol.hideChooseBox();
				nol.startPoint = null;
				nol.endPoint = null;
			}
		}
		//e.stopPropagation()
	}

	window.onmousemove = function(e) {
		if(nol.elStart && !nol.elEnd) {
			if(nol.pointEffective(e) && nol.startPoint) {
				nol.showChooseBox()
				nol.drawChooseBox(e)
			}
		}
		//e.stopPropagation()
	}

	//获取元素绝对定位
	function getElementLeft(element){
　　　　var actualLeft = element.offsetLeft;
　　　　var current = element.offsetParent;

　　　　while (current !== null){
　　　　　　actualLeft += current.offsetLeft;
　　　　　　current = current.offsetParent;
　　　　}

　　　　return actualLeft;
　　}

　　function getElementTop(element){
　　　　var actualTop = element.offsetTop;
　　　　var current = element.offsetParent;

　　　　while (current !== null){
　　　　　　actualTop += current.offsetTop;
　　　　　　current = current.offsetParent;
　　　　}

　　　　return actualTop;
　　}

	/*
	自适应绘制文字
	str:要绘制的字符串
	canvas:canvas对象
	initX:绘制字符串起始x坐标
	initY:绘制字符串起始y坐标
	lineHeight:字行高，自己定义个值即可
	*/
	function canvasTextAutoLine (str,canvas,initX,initY,w, h, lineHeight, color) {
	    var ctx = canvas.getContext("2d"); 
	    ctx.font = 'bold 14px Arial';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillStyle = color;
	    var lineWidth = 0;
	    // var canvasWidth = w; 
	    var lastSubStrIndex= 0; 
	    for(let i=0;i<str.length;i++){ 
	        lineWidth+=ctx.measureText(str[i]).width; 
	        // if(lineWidth>w-initX){//减去initX,防止边界出现的问题
	        if(lineWidth>w || str[i] == '\n'){
	            ctx.fillText(str.substring(lastSubStrIndex,i),initX,initY);
	            initY+=lineHeight;
	            lineWidth=0;
	            lastSubStrIndex=i;
	        } 
	        if(i==str.length-1){
	            ctx.fillText(str.substring(lastSubStrIndex,i+1),initX,initY);
	        }
	    }
	  }

	  function getDeg (x1, y1, x2, y2) {
	  	if (x2 >= x1) {
	  		return Math.atan((y2 - y1) / (x2 - x1)) * 180 / Math.PI
	  	} else {
	  		return 180 - Math.atan((y2 - y1) / (x1 - x2)) * 180 / Math.PI
	  	}
	  }
})()