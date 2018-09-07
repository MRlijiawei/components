<%@ page language="java" contentType="text/html; charset=UTF-8"
     pageEncoding="utf-8"%>
    <%
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	request.setAttribute("webRoot", basePath);
%>
<!DOCTYPE HTML>
<html  lang="en">
	<head>
		<meta charset="UTF-8">
		<title>资源搜索</title>
		
		<link rel="stylesheet" href="${webRoot}template/searching/plugins/layui/css/layui.css?build-revision=${svn.revision}">
		<script type="text/javascript" charset="utf-8" src="${webRoot}template/searching/plugins/layui/layui.js?build-revision=${svn.revision}"></script>
		<script type="text/javascript" charset="utf-8" src="${webRoot}template/searching/plugins/layui/layui.all.js?build-revision=${svn.revision}"></script>
		<script type="text/javascript" charset="utf-8" src="${webRoot}template/searching/plugins/jquery-3.3.1.min.js?build-revision=${svn.revision}"></script>
		<link rel="stylesheet" href="${webRoot}template/searching/searching.css?build-revision=${svn.revision}">
		<script type="text/javascript" charset="utf-8" src="${webRoot}template/searching/searching.js?build-revision=${svn.revision}"></script>
	</head>
	<body>
		<div class="abv_mid">
			<div class="logo_cls">
				<img src="${webRoot}template/searching/res/search.png">
				<h1>资源搜索</h1>
			</div>
			<div class="searching_cls">
				<div class="totals">
					<span class="knowledgeTotal">知识点总数：<span id="knowledgeNum"></span></span>
					<span class="contentTotal">资源总数：<span id="contentNum"></span></span>
				</div>
				<!-- <div>layui 学科 tab</div> -->
				<div class="layui-tab" lay-filter="test" style="margin: 0px">
				  <ul class="layui-tab-title" style="margin-bottom: -1px;">
				    <li class="layui-this" lay-id="0">全部学科</li>
				    <li lay-id="1">初中语文</li>
				    <li lay-id="2">初中数学</li>
				    <li lay-id="3">初中英语</li>
				    <li lay-id="4">初中物理</li>
				    <li lay-id="5">初中化学</li>
				    <li lay-id="6">思想品德</li>
				  </ul>
				  <div class="layui-tab-content" style="display: none;">
				    <div class="layui-tab-item layui-show">
				      点击该Tab的任一标题，观察地址栏变化，再刷新页面。选项卡将会自动定位到上一次切换的项
				    </div>
				    <div class="layui-tab-item">内容2</div>
				    <div class="layui-tab-item">内容3</div>
				    <div class="layui-tab-item">内容4</div>
				    <div class="layui-tab-item">内容5</div>
				  </div>
				</div>
				<div style="display: inline-flex;">
					<input type="text" name="keyWord" class="layui-input" style="width:1245px">
					<button class="layui-btn layui-btn-normal" style="width: 55px;z-index: 1;" onclick="searchknowledge()">Go!</button>
				</div>
			</div>
			<div class="knowledge_cls">
				<div class="knowledge_content"></div>
				<div id="knowledgePage"></div>
			</div>
			<div class="req_cls">
				<span>当前条件：</span>
				<span id="search_req">全部学科</span>
			</div>
			<div class="res_types" style="display:none">
				<h5>资源类型：</h5>
				<span class="layui-this" data-id="0">全部</span>
				<span data-id="1">课件</span>
				<span data-id="2">文本</span>
				<span data-id="3">视频</span>
				<span data-id="4">试题</span>
				<span data-id="5">试卷</span>
				<span data-id="6">图片</span>
			</div>
			<div class="content_cls">
				<div class="content_inner">
				</div>
				<div id="contentPage"></div>
			</div>
					<table class="layui-hide" id="resourseTable" lay-filter="resTable"></table>
					<script type="text/html" id="typeBar">
  						{{#  if(d.resourceType === '1'){ }}
   							<span style="color: #F581B1;">课件</span>
  						{{#  } else if(d.resourceType === '2'){ }}
   							<span style="color: #F581B1;">文本</span>
  						{{#  } else if(d.resourceType === '3'){ }}
   							<span style="color: #F581B1;">视频</span>
  						{{#  } else if(d.resourceType === '4'){ }}
   							<span style="color: #F581B1;">试题</span>
  						{{#  } else if(d.resourceType === '5'){ }}
   							<span style="color: #F581B1;">试卷</span>
  						{{#  } else if(d.resourceType === '6'){ }}
   							<span style="color: #F581B1;">图片</span>
  						{{#  } }}
					</script>
					<script type="text/html" id="usernameTpl">
  						<a href="/?table-demo-id={{d.id}}" class="layui-table-link" target="_blank">{{ d.username }}</a>
					</script>
					<script type="text/html" id="operationBar">
  						{{#  if(d.resourceType === '4' || d.resourceType === '5'){ }}
   							<span style="color: #F581B1;">查看</span>
  						{{#  } else { }}
   							<span style="color: #F581B1;">查看</span>
							<span style="color: #F581B1;">下载</span>
  						{{#  } }}
					</script>
		</div>
	</body>

</html>