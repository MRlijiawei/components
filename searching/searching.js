layui.use(['element', 'table'],  function(){
  var $ = layui.jquery
  ,element = layui.element;
  table = layui.table;
  
  element.on('tab(test)', function(elem){
    location.hash = 'test='+ $(this).attr('lay-id');
	//点击当前不处理
	if(searchCourse == $(this).attr("lay-id")) {
		return;
	} else {
		searchCourse = $(this).attr("lay-id");
		searchCourseName = $(this).text();
		$(".knowledge_content").empty();
		$(".content_inner").empty();
		$("#contentPage").empty();
		$("#search_req").empty().append(searchCourseName);
		$(".totals").hide();
		$(".res_types").hide();
		$("table").hide();
		$(".layui-table-view").hide();
		selKnowledge = "";
		selKnowledgeName = "";
		selResType = "0";
	}
  });
  //Hash地址的定位
  var layid = location.hash.replace(/^#test=/, '');
  element.tabChange('test', layid);
  
  $(document).on("keyup", "input[name='keyWord']", function(e){
	  //回车搜索
	  if(e.keyCode == 13) {
		  searchknowledge();
	  }
  })
 });

//默认全部
var searchCourse = "0";
var searchCourseName = "全部学科";
var contentList = [];
var searchingStr = "";
var knowledgeListAll = [];
var selKnowledge;
var selKnowledgeName;
var selResType = "0";
var table;

function searchknowledge() {
	$.ajax({
		url: "template/searching/res/result.json",
		type: "GET"
		,dataType: "json"
		,contentType: 'application/json'
		,success: function(res) {
			knowledgeListAll = res.knowledges;
			handelknowledge(res.knowledges);
		},
		error: function(res) {
			layer.msg(res.data || "查询失败")
		}
	})
}

function searchContent() {
	$.ajax({
		url: "template/searching/res/result.json",
		type: "GET"
		,dataType: "json"
		,contentType: 'application/json'
		,success: function(res) {
			contentList = res.data;
			handelContent(res.data);
		},
		error: function(res) {
			layer.msg(res.data || "查询失败")
		}
	})
}

function handelknowledge(data) {
	searchingStr = $.trim($("input[name='keyWord']").val());
	var knowledgeList = [];
	$.each(data, function(index, e) {
		if((searchCourse == "0" ||e.course == searchCourse) && roundMatch(e.knowledgeName, searchingStr)) {
			knowledgeList.push(e);
		}
	});
	$(".contentTotal").hide();
	$(".knowledgeTotal").show();
	$("#knowledgeNum").text(knowledgeList.length);
	$(".totals").show();
	initknowledges(knowledgeList);
}

function initknowledges(data) {
	var knowledgeStr = "<div id='knowledgeContent'>";
	$.each(data, function(index, e) {
		if(index % 9 == 0) {
			knowledgeStr += "<div class='knoledge_list'>";
		}
		knowledgeStr  += "<div class='knowledge_single' data-id='"+e.knowledgeId+"'' title='"+e.knowledgeName+"'>"+e.knowledgeName+"</div>";
		if(index % 9 == 8) {
			knowledgeStr += "</div>";
		}
	});
	knowledgeStr += "</div>";
	$(".knowledge_content").empty().append(knowledgeStr);
	$(".knowledge_single").unbind().bind("click", function(){
		if($(this).data("id") == selKnowledge) {
			////
		} else {
			$(".knowledge_single").removeClass("starc-this");
			$(this).addClass("starc-this");
			selKnowledge = $(this).data("id");
			selKnowledgeName = $(this).text();
			selResType = "0";
			setKnowledgeReq();
		}
	});
}

function setKnowledgeReq() {
	$("#search_req").empty().append(searchCourseName+" > "+selKnowledgeName);
	$.each($(".res_types span"), function(index, e){
		e.className = "";
	});
	$(".res_types").find("span")[0].className = "layui-this";
	$(".res_types").show();
	$(".res_types span").unbind().bind("click", function(){
		if($(this).data("id") == selKnowledge) {
			////
		} else {
			selResType = $(this).data("id");
			$(".res_types span").removeClass("layui-this");
			$(this).addClass("layui-this");
			handelContent(contentList);
		}
	});
	
	searchContent();
}

function handelContent(data) {
	var selKnowledgeContentList = getFrom(knowledgeListAll, selKnowledge);
	var aimContentList = [];
	
	for(var i=0;i<selKnowledgeContentList.length;i++) {
		for(var j=0;j<data.length;j++) {
			if(selKnowledgeContentList[i] == data[j].resourceId) {
				aimContentList.push(data[j]);
				break;
			}
		}
	}
	
	$(".contentTotal").show();
	$(".knowledgeTotal").hide();
	$("#contentNum").text(aimContentList.length);
	$(".totals").show();

	initTable(aimContentList);
}

function initTable(aimContentList) {
	$("table").show();
	$(".layui-table-view").show();
	
	table.render({
	    elem: '#resourseTable'
	    //,height: 420
	    //,url: '/demo/table/user/' //数据接口
	    //,title: '用户表'
	    ,page: true //开启分页
	    //,toolbar: 'default' //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
	    ,cellMinWidth: 80
	    //,totalRow: true //开启合计行
	    ,cols: [[ //表头
	      //{type: 'checkbox', fixed: 'left'}
	      //,{field: 'id', title: 'ID', width:80, sort: true, fixed: 'left', totalRowText: '合计：'},
	    	{type:'numbers'},
	      {field: 'resourceName', title: '资源名称', 
	    		//width:'50%', 
		    	  minWidth: 500,
	    		sort: true}
	      ,{field: 'authorName', title: '作者', 
	    	  //width: '20%', 
	    	  minWidth: 120,
	    	  sort: true}
	      ,{field: 'type', title: '类型', 
	    	  //width:'20%', 
	    	  minWidth: 120,
	    	  sort: true}
	      //,{field: 'operation', title: '操作', width: '28%', template: '#operationBar'}
	      //,{fixed: 'right', width: 165, align:'center', toolbar: '#barDemo'}
	    ]]
		,data: checkParam(aimContentList, selResType)
	  });
		//监听行单击事件（单击事件为：rowDouble）
	  table.on('row(resTable)', function(obj){
	    /*var data = obj.data;
	    
	    layer.alert(JSON.stringify(data), {
	      title: '当前行数据：'
	    });*/
		
		window.open(obj.data.url);
	    
	    //标注选中样式
	    obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
	  });
}

function getFrom(arr, id) {
	var aimArr = [];
	for(var i=0;i<arr.length;i++) {
		if(arr[i].knowledgeId == id) {
			aimArr = arr[i].resources;
			break;
		}
	}
	return aimArr;
}

//处理状态
function checkParam(data, type) {
	var aimResList = [];
	$.each(data, function(index, e) {
		if(e.resourceType == "1") {
			e["type"] = "课件";
		} else if(e.resourceType == "2") {
			e["type"] = "文本";
		} else if(e.resourceType == "3") {
			e["type"] = "视频";
		} else if(e.resourceType == "4") {
			e["type"] = "试题";
		} else if(e.resourceType == "5") {
			e["type"] = "试卷";
		} else if(e.resourceType == "6") {
			e["type"] = "图片";
		}
		if(e.resourceType == type && type != "0") {
			aimResList.push(e);
		} else if(type == "0") {
			aimResList.push(e);
		}
	})
	return aimResList;
}

//先全部去空格
//思路一，两个字符串转数组然后判定是否有相同元素
//思路二，两个字符先拼接，然后去重
//判定两个字符串是否模糊匹配
function roundMatch(str1, str2) {
	//若输入空则查全部
	if(str2.length == 0) {
		return true;
	} else {
		//方案1，去除空格匹配
		//方案2，按空格进行多条件匹配，即以空格分割条件，取所有条件都满足的情况
		var arr2 = str2.split(" ");
		if(typeof(str1) == "string") {
			var arr1 = str1.split(" ");
		} else {
			//知识点的keywords列表
			var arr1 = str1;
		}
		return arrMatch(arr1, arr2);
	}

	//去除所有空格
	//str1 = str1.replace(/\s+/g, "");
	//str2 = str2.replace(/\s+/g, "");
}

//判定两个数组中是否匹配，2中每个在1中都有才算
function arrMatch(arr1, arr2) {
	var matchAll = false;
	for(var i=0;i<arr2.length;i++) {
		for(var j=0;j<arr1.length;j++) {
			if(arr1[j].indexOf(arr2[i]) >-1) {
				matchAll = true;
				break;
			}
		}
	}
	return matchAll;
}