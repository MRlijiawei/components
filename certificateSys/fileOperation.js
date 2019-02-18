$(function () {
	var clientWidth = document.documentElement.clientWidth || document.body.clientWidth; //窗口宽度
	var clientHeight = document.documentElement.clientHeight || document.body.clientHeight; //窗口高度
	var isDown = false;
	var oldPointer = new Pointer();
	var oldPosition = new Position();
	var direction = new Direction();
	var div = $("<div></div>").css({
		background: "#eaf5ff",
		position: "absolute",
		border: "1px dashed #666",
		opacity: "0.7"
	}).appendTo($("#_main_ui_root"));
	//当鼠标按下
	$(document).mousedown(function (e) {
		e = window.event || e; // 兼容IE7
		obj = $(e.srcElement || e.target);

		if ($(obj).is(".list-wrap,.list-wrap *")) {
			e.stopPropagation();
		}

		if ($(obj).is(".files,.files *")) {} else if ($(obj).is("a,a *")) {} else if ($(obj).is(".wrap label,.wrap label *")) {} else if ($(obj).is("#myMenu,#myMenu *")) {} else if ($(obj).is(".modal,.modal *")) {} else if ($(obj).is(".header-search,.header-search *")) {} else if ($(obj).is("#_main_face,#_main_face *")) {} else if ($(obj).is("#view-mode-sort,#view-mode-sort *")) {} else if ($(obj).is("#search_option,#search_option *")) {} else if ($(obj).is(".logo,.logo *")) {} else if ($(obj).is(".myUpfile,.myUpfile *")) {} else if (e.pageX <= 160 && e.pageX >= 152 && e.pageY >= 85 && e.pageY <= $(document).height()) {
			if ($("#_main_nav_aside_box").height() < $(".nav-box").height()) {}
		} else if (e.pageX <= $(document).width() && e.pageX >= $(document).width() - 8 && e.pageY >= 116 && e.pageY <= $(document).height()) {
			if ($("#_main_content").height() < $("#_disk_body").height()) {}
		} else {
			$("#search_option").remove(); //移除下拉框
			//RenamSave();fileSave();  已无用（）
			if (navigator.userAgent.toLowerCase().indexOf('msie') >= 0) {
				e.returnValue = false;
			} else {
				e.preventDefault();
			};
			if (div.dom().setCapture) {
				div.dom().setCapture(true);
			}
			$("#_disk_all_checker").removeClass("checkalled");
			$(".files").children().removeClass("ui-selected");
			$("#myMenu").remove();
			isDown = true;
			oldPointer.x = e.clientX;
			oldPointer.y = e.clientY;
			oldPosition.left = e.clientX,
				oldPosition.top = e.clientY
			div.css({
				left: e.clientX,
				top: e.clientY,
				border: "1px dashed #666",
				display: "block",
				'z-index': '1000'
			});
		}

	});
	div.extend({
		checkC: function () {
			var $this = this;
			$(".files").children().each(function () {
				if ($this.offset().left + $this.width() > $(this).offset().left && $this.offset().left < $(this).offset().left + $(this).width() && $this.offset().top + $this.height() > $(this).offset().top && $this.offset().top < $(this).offset().top + $(this).height()) {
					$(this).addClass("ui-selected");
				} else {
					$(this).removeClass("ui-selected");
				}
			});
		}
	});
	$(document).mousemove(function (e) {
		//if(!isDown) return isDown;
		if (isDown) {
			if (e.clientX > oldPointer.x) {
				direction.horizontal = "Right";
			} else if (e.clientX < oldPointer.x) {
				direction.horizontal = "Left";
			} else {
				direction.horizontal = "";
			}
			if (e.clientY > oldPointer.y) {
				direction.vertical = "Down";
			} else if (e.clientY < oldPointer.y) {
				direction.vertical = "Up";
			} else {
				direction.vertical = "";
			}

			var directionOperation = {
				LeftUp: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: Math.abs(e.clientY - oldPointer.y),
						top: oldPosition.top - Math.abs(e.clientY - oldPointer.y),
						left: oldPosition.left - Math.abs(e.clientX - oldPointer.x)
					});
				},
				LeftDown: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: Math.abs(e.clientY - oldPointer.y),
						left: oldPosition.left - Math.abs(e.clientX - oldPointer.x)
					});
				},
				Down: function () {
					div.css({
						width: 1,
						height: Math.abs(e.clientY - oldPointer.y)
					});
				},
				Up: function () {
					div.css({
						width: 1,
						height: Math.abs(e.clientY - oldPointer.y),
						top: oldPosition.top - Math.abs(e.clientY - oldPointer.y)
					});
				},
				Right: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: 1
					});
				},
				Left: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: 1,
						left: oldPosition.left - Math.abs(e.clientX - oldPointer.x)
					});
				},
				RightDown: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: Math.abs(e.clientY - oldPointer.y)
					});
				},
				RightUp: function () {
					div.css({
						width: Math.abs(e.clientX - oldPointer.x),
						height: Math.abs(e.clientY - oldPointer.y),
						top: oldPosition.top - Math.abs(e.clientY - oldPointer.y)
					});
				}
			}
			if (directionOperation[direction.horizontal + direction.vertical]) {
				directionOperation[direction.horizontal + direction.vertical]();
			}
			div.checkC();
		}
	});
	$(document).mouseup(function () {
		//if(!isDown) return isDown ;  ??解决了文字无法选中的问题
		isDown = false;
		if (div.dom().releaseCapture) {
			div.dom().releaseCapture(true);
		}
		div.width(0).height(0).css({
			'border': '0',
			'display': 'none',
			'z-index': '0'
		});
		Toolshow();
	});
});