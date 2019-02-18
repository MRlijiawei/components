<%@ page language="java" import="java.util.*" pageEncoding="utf-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";

%>

<!DOCTYPE>
<html>
  <head>
     <base href="<%=basePath%>"> 
    
    <title>教师批注</title>
    <meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=yes, minimum-scale=1.0, maximum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  </head>
  
  <body >
  <div style="text-align:center;">
   <img style="width:100%;"/>
  </div>
   

<!-- 学习时长统计 -->
<jsp:include page="/WEB-INF/template/student/stuTimeStatistic.jsp" />

  </body>
</html>
<script>
    window.onunload = function () {
        // window.opener.postMessage('close preview', '*');
    }
    $("img")[0].src = window.opener.assignmentNoteContent

	$("body").attr("type", "img");
</script>

<link rel="stylesheet" href="pan/notesOnLine/notesOnLine.css?build-revision=${svn.revision}">
<script src="pan/notesOnLine/notesOnLine.js?build-revision=${svn.revision}"></script>