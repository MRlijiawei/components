/* eslint-disable */
/*-------------------------------------------------------------------------------------------
|     ECOTree.js
|	  author:lijw
\------------------------------------------------------------------------------------------*/

const ECONode = function (id, pid, dsc, type, typeText, wc, isEdt, contentType, gradeId, indicatorText, w, h, c, bc, target, meta) {
    this.id = id
    this.pid = pid
    this.dsc = dsc
    // 类型
    this.type = type
    this.typeText = typeText
    // 权重
    this.wc = wc
    // 编辑
    this.isEdt = isEdt
    this.w = w
    this.h = h
    this.c = c
    this.bc = bc
    this.target = target
    this.meta = meta
    // 20190226 刘戡 新增
    this.contentType = contentType
    this.gradeId = gradeId
    this.indicatorText = indicatorText

    this.siblingIndex = 0
    this.dbIndex = 0

    this.XPosition = 0
    this.YPosition = 0
    this.prelim = 0
    this.modifier = 0
    this.leftNeighbor = null
    this.rightNeighbor = null
    this.nodeParent = null
    this.nodeChildren = []

    this.isCollapsed = false
    this.canCollapse = false

    this.isSelected = false
}

ECONode.prototype._getLevel = function () {
    // if (this.nodeParent.id == -1) {return 0}
    if (this.nodeParent.id == 0) {
        return 0
    } else return this.nodeParent._getLevel() + 1
}

ECONode.prototype._isAncestorCollapsed = function () {
    if (this.nodeParent.isCollapsed) {
        return true
    } else {
        if (this.nodeParent.id == -1) {
            return false
        } else {
            return this.nodeParent._isAncestorCollapsed()
        }
    }
}

ECONode.prototype._setAncestorsExpanded = function () {
    if (this.nodeParent.id == -1) {
        return
    } else {
        this.nodeParent.isCollapsed = false
        return this.nodeParent._setAncestorsExpanded()
    }
}

ECONode.prototype._getChildrenCount = function () {
    if (this.isCollapsed) return 0
    if (this.nodeChildren == null)
        return 0
    else
        return this.nodeChildren.length
}

ECONode.prototype._getLeftSibling = function () {
    if (this.leftNeighbor != null && this.leftNeighbor.nodeParent == this.nodeParent)
        return this.leftNeighbor
    else
        return null
}

ECONode.prototype._getRightSibling = function () {
    if (this.rightNeighbor != null && this.rightNeighbor.nodeParent == this.nodeParent)
        return this.rightNeighbor
    else
        return null
}

ECONode.prototype._getChildAt = function (i) {
    return this.nodeChildren[i]
}

ECONode.prototype._getChildrenCenter = function (tree) {
    // node = this._getFirstChild()
    var node = this._getFirstChild()
    // node1 = this._getLastChild()
    var node1 = this._getLastChild()
    return node.prelim + ((node1.prelim - node.prelim) + tree._getNodeSize(node1)) / 2
}

ECONode.prototype._getFirstChild = function () {
    return this._getChildAt(0)
}

ECONode.prototype._getLastChild = function () {
    return this._getChildAt(this._getChildrenCount() - 1)
}

ECONode.prototype._drawChildrenLinks = function (tree) {
    var s = []
    var xa = 0,
        ya = 0,
        xb = 0,
        yb = 0,
        xc = 0,
        yc = 0,
        xd = 0,
        yd = 0
    var node1 = null

    switch (tree.config.iRootOrientation) {
    case ECOTree.RO_TOP:
        xa = this.XPosition + (this.w / 2)
        ya = this.YPosition + this.h
        break

    case ECOTree.RO_BOTTOM:
        xa = this.XPosition + (this.w / 2)
        ya = this.YPosition
        break

    case ECOTree.RO_RIGHT:
        xa = this.XPosition
        ya = this.YPosition + (this.h / 2)
        break

    case ECOTree.RO_LEFT:
        xa = this.XPosition + this.w
        ya = this.YPosition + (this.h / 2)
        break
    }

    for (var k = 0; k < this.nodeChildren.length; k++) {
        node1 = this.nodeChildren[k]

        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_TOP:
            xd = xc = node1.XPosition + (node1.w / 2)
            yd = node1.YPosition
            xb = xa
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                yb = yc = yd - tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_BOTTOM:
                yb = yc = ya + tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_CENTER:
                yb = yc = ya + (yd - ya) / 2
                break
            }
            break

        case ECOTree.RO_BOTTOM:
            xd = xc = node1.XPosition + (node1.w / 2)
            yd = node1.YPosition + node1.h
            xb = xa
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                yb = yc = yd + tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_BOTTOM:
                yb = yc = ya - tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_CENTER:
                yb = yc = yd + (ya - yd) / 2
                break
            }
            break

        case ECOTree.RO_RIGHT:
            xd = node1.XPosition + node1.w
            yd = yc = node1.YPosition + (node1.h / 2)
            yb = ya
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                xb = xc = xd + tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_BOTTOM:
                xb = xc = xa - tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_CENTER:
                xb = xc = xd + (xa - xd) / 2
                break
            }
            break

        case ECOTree.RO_LEFT:
            xd = node1.XPosition
            yd = yc = node1.YPosition + (node1.h / 2)
            yb = ya
            switch (tree.config.iNodeJustification) {
            case ECOTree.NJ_TOP:
                xb = xc = xd - tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_BOTTOM:
                xb = xc = xa + tree.config.iLevelSeparation / 2
                break
            case ECOTree.NJ_CENTER:
                xb = xc = xa + (xd - xa) / 2
                break
            }
            break
        }


        switch (tree.render) {
        case "CANVAS":
            tree.ctx.save()
            tree.ctx.strokeStyle = tree.config.linkColor
            tree.ctx.scale(tree.config.zoomRatio, tree.config.zoomRatio) // canvas zoom
            tree.ctx.beginPath()
            switch (tree.config.linkType) {
            case "M":
                tree.ctx.moveTo(xa, ya)
                tree.ctx.lineTo(xb, yb)
                tree.ctx.lineTo(xc, yc)
                tree.ctx.lineTo(xd, yd)
                break

            case "B":
                tree.ctx.moveTo(xa, ya)
                tree.ctx.bezierCurveTo(xb, yb, xc, yc, xd, yd)
                break
            }
            tree.ctx.stroke()
            tree.ctx.restore()
            break

        case "VML":
            switch (tree.config.linkType) {
            case "M":
                s.push('<v:polyline points="')
                s.push(xa + ' ' + ya + ' ' + xb + ' ' + yb + ' ' + xc + ' ' + yc + ' ' + xd + ' ' + yd)
                s.push('" strokecolor="' + tree.config.linkColor + '"><v:fill on="false" /></v:polyline>')
                break
            case "B":
                s.push('<v:curve from="')
                s.push(xa + ' ' + ya + '" control1="' + xb + ' ' + yb + '" control2="' + xc + ' ' + yc + '" to="' + xd + ' ' + yd)
                s.push('" strokecolor="' + tree.config.linkColor + '"><v:fill on="false" /></v:curve>')
                break
            }
            break

        }
    }

    return s.join('')
}

const ECOTree = function (obj, elm) {
    this.config = {
        iMaxDepth: 100,
        iLevelSeparation: 40,
        iSiblingSeparation: 20,
        iSubtreeSeparation: 20,
        iRootOrientation: ECOTree.RO_TOP,
        iNodeJustification: ECOTree.NJ_TOP,
        topXAdjustment: 0,
        topYAdjustment: 0,
        // render : "AUTO",
        render: "CANVAS",
        linkType: "M",
        linkColor: "blue",
        nodeColor: "#CCCCFF",
        nodeFill: ECOTree.NF_GRADIENT,
        nodeBorderColor: "blue",
        nodeSelColor: "#FFFFCC",
        levelColors: ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
        levelBorderColors: ["#5555FF", "#8888FF", "#AAAAFF", "#CCCCFF"],
        colorStyle: ECOTree.CS_NODE,
        useTarget: true,
        searchMode: ECOTree.SM_DSC,
        selectMode: ECOTree.SL_MULTIPLE,
        defaultNodeWidth: 200,
        defaultNodeHeight: 50,
        defaultTarget: 'javascript:void(0)',
        expandedImage: '/starmooc/starcm/plugins/ecotree/img/less.gif',
        collapsedImage: '/starmooc/starcm/plugins/ecotree/img/plus.gif',
        // transImage : './img/trans.gif',
        transImage: '',
        zoomRatio: 1,
        canvasWidth: 900,
        canvasHeight: 400,
        textConfig: '权重',
        weightFlag: '%'
    }

    this.version = "1.1"
    this.obj = obj
    // 20181220
    // ECOTree.obj = obj
    this.elm = document.getElementById(elm)
    this.self = this
    this.render = (this.config.render == "AUTO") ? ECOTree._getAutoRenderMode() : this.config.render
    this.ctx = null
    this.canvasoffsetTop = 0
    this.canvasoffsetLeft = 0

    this.maxLevelHeight = []
    this.maxLevelWidth = []
    this.previousLevelNode = []

    this.rootYOffset = 0
    this.rootXOffset = 0

    this.nDatabaseNodes = []
    this.mapIDs = {}

    this.root = new ECONode(-1, null, null, 2, 2)
    this.iSelectedNode = -1
    this.iLastSearch = 0

}

// Constant values

// Tree orientation
ECOTree.RO_TOP = 0
ECOTree.RO_BOTTOM = 1
ECOTree.RO_RIGHT = 2
ECOTree.RO_LEFT = 3

// Level node alignment
ECOTree.NJ_TOP = 0
ECOTree.NJ_CENTER = 1
ECOTree.NJ_BOTTOM = 2

// Node fill type
ECOTree.NF_GRADIENT = 0
ECOTree.NF_FLAT = 1

// Colorizing style
ECOTree.CS_NODE = 0
ECOTree.CS_LEVEL = 1

// Search method: Title, metadata or both
ECOTree.SM_DSC = 0
ECOTree.SM_META = 1
ECOTree.SM_BOTH = 2

// Selection mode: single, multiple, no selection
ECOTree.SL_MULTIPLE = 0
ECOTree.SL_SINGLE = 1
ECOTree.SL_NONE = 2


ECOTree._getAutoRenderMode = function () {
    var r = "VML"
    var is_ie6 = /msie 6\.0/i.test(navigator.userAgent)
    var is_ff = /Firefox|Chrome/i.test(navigator.userAgent)
    var is_ie9 = /msie 9\.0|msie 10\.0/i.test(navigator.userAgent)
    if (is_ff || is_ie9) r = "CANVAS"
    return r
}

// CANVAS functions...
ECOTree._roundedRect = function (ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x, y + radius)
    ctx.lineTo(x, y + height - radius)
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
    ctx.lineTo(x + width - radius, y + height)
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
    ctx.lineTo(x + width, y + radius)
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
    ctx.lineTo(x + radius, y)
    ctx.quadraticCurveTo(x, y, x, y + radius)
    ctx.fill()
    ctx.stroke()
}

// 增加入参，以便保存和刷新点击该节点之前的节点数据
// ECOTree._canvasNodeClickHandler = function (tree,target,nodeid,node,e) {
ECOTree._canvasNodeClickHandler = function (tree, target, nodeid) {
    if (target != nodeid) return
    // 为失去焦点的节点赋值刷新
    var sesid = sessionStorage.getItem("stid")
    var sescont = sessionStorage.getItem("scont")
    var seswet = sessionStorage.getItem("swet")
    if (sesid && (sescont || seswet)) {
        tree.set(sesid, '', sescont, seswet)
        sessionStorage.removeItem("stid")
        sessionStorage.removeItem("scont")
        sessionStorage.removeItem("swet")
    }
    tree.selectNode(nodeid, true)
}

// Layout algorithm
ECOTree._firstWalk = function (tree, node, level) {
    var leftSibling = null

    node.XPosition = 0
    node.YPosition = 0
    node.prelim = 0
    node.modifier = 0
    node.leftNeighbor = null
    node.rightNeighbor = null
    tree._setLevelHeight(node, level)
    tree._setLevelWidth(node, level)
    tree._setNeighbors(node, level)
    if (node._getChildrenCount() == 0 || level == tree.config.iMaxDepth) {
        leftSibling = node._getLeftSibling()
        if (leftSibling != null)
            node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation
        else
            node.prelim = 0
    } else {
        var n = node._getChildrenCount()
        for (var i = 0; i < n; i++) {
            var iChild = node._getChildAt(i)
            ECOTree._firstWalk(tree, iChild, level + 1)
        }

        var midPoint = node._getChildrenCenter(tree)
        midPoint -= tree._getNodeSize(node) / 2
        if (midPoint < 0) midPoint = 0 // 最左边的节点，可能<0，导致出界
        leftSibling = node._getLeftSibling()
        if (leftSibling != null) {
            node.prelim = leftSibling.prelim + tree._getNodeSize(leftSibling) + tree.config.iSiblingSeparation
            // 如果根据左边兄弟节点的位置来推算，大于当前节点计算出的位置，则当前节点需要右移，所以要计算差值
            if (node.prelim > midPoint) {
                node.modifier = node.prelim - midPoint
            } else {
                // 如果小于当前节点计算出的位置，就别动了，否则容易导致最底层的节点，X坐标<0
                node.modifier = 0
            }
            ECOTree._apportion(tree, node, level)
        } else {
            node.prelim = midPoint
        }
    }
}

ECOTree._apportion = function (tree, node, level) {
    var firstChild = node._getFirstChild()
    var firstChildLeftNeighbor = firstChild.leftNeighbor
    var j = 1
    for (var k = tree.config.iMaxDepth - level; firstChild != null && firstChildLeftNeighbor != null && j <= k;) {
        var modifierSumRight = 0
        var modifierSumLeft = 0
        var rightAncestor = firstChild
        var leftAncestor = firstChildLeftNeighbor
        for (var l = 0; l < j; l++) {
            rightAncestor = rightAncestor.nodeParent
            leftAncestor = leftAncestor.nodeParent
            modifierSumRight += rightAncestor.modifier
            modifierSumLeft += leftAncestor.modifier
        }

        var totalGap = (firstChildLeftNeighbor.prelim + modifierSumLeft + tree._getNodeSize(firstChildLeftNeighbor) + tree.config.iSubtreeSeparation) - (firstChild.prelim + modifierSumRight)
        if (totalGap > 0) {
            var subtreeAux = node
            var numSubtrees = 0
            for (; subtreeAux != null && subtreeAux != leftAncestor; subtreeAux = subtreeAux._getLeftSibling())
                numSubtrees++

            if (subtreeAux != null) {
                var subtreeMoveAux = node
                var singleGap = totalGap / numSubtrees
                for (; subtreeMoveAux != leftAncestor; subtreeMoveAux = subtreeMoveAux._getLeftSibling()) {
                    subtreeMoveAux.prelim += totalGap
                    subtreeMoveAux.modifier += totalGap
                    totalGap -= singleGap
                }

            }
        }
        j++
        if (firstChild._getChildrenCount() == 0)
            firstChild = tree._getLeftmost(node, 0, j)
        else
            firstChild = firstChild._getFirstChild()
        if (firstChild != null)
            firstChildLeftNeighbor = firstChild.leftNeighbor
    }
}

ECOTree._secondWalk = function (tree, node, level, X, Y) {
    if (level <= tree.config.iMaxDepth) {
        var xTmp = tree.rootXOffset + node.prelim + X
        var yTmp = tree.rootYOffset + Y
        var maxsizeTmp = 0
        var nodesizeTmp = 0
        var flag = false

        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_TOP:
        case ECOTree.RO_BOTTOM:
            maxsizeTmp = tree.maxLevelHeight[level]
            nodesizeTmp = node.h
            break

        case ECOTree.RO_RIGHT:
        case ECOTree.RO_LEFT:
            maxsizeTmp = tree.maxLevelWidth[level]
            flag = true
            nodesizeTmp = node.w
            break
        }

        switch (tree.config.iNodeJustification) {
        case ECOTree.NJ_TOP:
            node.XPosition = xTmp
            node.YPosition = yTmp
            break

        case ECOTree.NJ_CENTER:
            node.XPosition = xTmp
            node.YPosition = yTmp + (maxsizeTmp - nodesizeTmp) / 2
            break

        case ECOTree.NJ_BOTTOM:
            node.XPosition = xTmp
            node.YPosition = (yTmp + maxsizeTmp) - nodesizeTmp
            break
        }
        if (flag) {
            var swapTmp = node.XPosition
            node.XPosition = node.YPosition
            node.YPosition = swapTmp
        }
        switch (tree.config.iRootOrientation) {
        case ECOTree.RO_BOTTOM:
            node.YPosition = -node.YPosition - nodesizeTmp
            break

        case ECOTree.RO_RIGHT:
            node.XPosition = -node.XPosition - nodesizeTmp
            break
        }
        if (node._getChildrenCount() != 0)
            ECOTree._secondWalk(tree, node._getFirstChild(), level + 1, X + node.modifier, Y + maxsizeTmp + tree.config.iLevelSeparation)
        var rightSibling = node._getRightSibling()
        if (rightSibling != null)
            ECOTree._secondWalk(tree, rightSibling, level, X, Y)
    }
}

ECOTree.prototype._positionTree = function () {
    this.maxLevelHeight = []
    this.maxLevelWidth = []
    this.previousLevelNode = []
    ECOTree._firstWalk(this.self, this.root, 0)

    switch (this.config.iRootOrientation) {
    case ECOTree.RO_TOP:
    case ECOTree.RO_LEFT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition
        break

    case ECOTree.RO_BOTTOM:
    case ECOTree.RO_RIGHT:
        this.rootXOffset = this.config.topXAdjustment + this.root.XPosition
        this.rootYOffset = this.config.topYAdjustment + this.root.YPosition
    }

    ECOTree._secondWalk(this.self, this.root, 0, 0, 0)
}

ECOTree.prototype._setLevelHeight = function (node, level) {
    if (this.maxLevelHeight[level] == null)
        this.maxLevelHeight[level] = 0
    if (this.maxLevelHeight[level] < node.h)
        this.maxLevelHeight[level] = node.h
}

ECOTree.prototype._setLevelWidth = function (node, level) {
    if (this.maxLevelWidth[level] == null)
        this.maxLevelWidth[level] = 0
    if (this.maxLevelWidth[level] < node.w)
        this.maxLevelWidth[level] = node.w
}

ECOTree.prototype._setNeighbors = function (node, level) {
    node.leftNeighbor = this.previousLevelNode[level]
    if (node.leftNeighbor != null)
        node.leftNeighbor.rightNeighbor = node
    this.previousLevelNode[level] = node
}

ECOTree.prototype._getNodeSize = function (node) {
    switch (this.config.iRootOrientation) {
    case ECOTree.RO_TOP:
    case ECOTree.RO_BOTTOM:
        return node.w

    case ECOTree.RO_RIGHT:
    case ECOTree.RO_LEFT:
        return node.h
    }
    return 0
}

ECOTree.prototype._getLeftmost = function (node, level, maxlevel) {
    if (level >= maxlevel) return node
    if (node._getChildrenCount() == 0) return null

    var n = node._getChildrenCount()
    for (var i = 0; i < n; i++) {
        var iChild = node._getChildAt(i)
        var leftmostDescendant = this._getLeftmost(iChild, level + 1, maxlevel)
        if (leftmostDescendant != null)
            return leftmostDescendant
    }

    return null
}

ECOTree.prototype._selectNodeInt = function (dbindex, flagToggle) {
    if (this.config.selectMode == ECOTree.SL_SINGLE) {
        if ((this.iSelectedNode != dbindex) && (this.iSelectedNode != -1)) {
            this.nDatabaseNodes[this.iSelectedNode].isSelected = false
            // 选中一个时把其他置为非edit
            this.nDatabaseNodes[this.iSelectedNode].isEdt = false
        }
        this.iSelectedNode = (this.nDatabaseNodes[dbindex].isSelected && flagToggle) ? -1 : dbindex
    }
    this.nDatabaseNodes[dbindex].isSelected = (flagToggle) ? !this.nDatabaseNodes[dbindex].isSelected : true
}

ECOTree.prototype._collapseAllInt = function (flag) {
    var node = null
    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n]
        if (node.canCollapse) node.isCollapsed = flag
    }
    this.UpdateTree()
}

ECOTree.prototype._selectAllInt = function (flag) {
    var node = null
    for (var k = 0; k < this.nDatabaseNodes.length; k++) {
        node = this.nDatabaseNodes[k]
        node.isSelected = flag
    }
    this.iSelectedNode = -1
    this.UpdateTree()
}

ECOTree.prototype._drawTree = function () {
    var s = []
    var node = null
    var color = ""
    var border = ""

    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n]

        if (node.type && !node.typeText) {
            switch (node.type) {
            case 'subjective_marking':
                node.typeText = '客观打分'
                break;
            case 'objective_evaluation':
                node.typeText = '主观评价'
                break;

            default:
                break;
            }
        }

        switch (this.config.colorStyle) {
        case ECOTree.CS_NODE:
            color = node.c
            border = node.bc
            break
        case ECOTree.CS_LEVEL:
            var iColor = node._getLevel() % this.config.levelColors.length
            color = this.config.levelColors[iColor]
            iColor = node._getLevel() % this.config.levelBorderColors.length
            border = this.config.levelBorderColors[iColor]
            break
        }

        if (!node._isAncestorCollapsed()) {
            switch (this.render) {
            case "CANVAS":
                // Canvas part...
                this.ctx.save()
                this.ctx.scale(this.config.zoomRatio, this.config.zoomRatio) // canvas zoom
                this.ctx.strokeStyle = border
                switch (this.config.nodeFill) {
                case ECOTree.NF_GRADIENT:
                    var lgradient = this.ctx.createLinearGradient(node.XPosition, 0, node.XPosition + node.w, 0)
                    lgradient.addColorStop(0.0, ((node.isSelected) ? this.config.nodeSelColor : color))
                    lgradient.addColorStop(1.0, "#F5FFF5")
                    this.ctx.fillStyle = lgradient
                    break

                case ECOTree.NF_FLAT:
                    this.ctx.fillStyle = ((node.isSelected) ? this.config.nodeSelColor : color)
                    break
                }

                ECOTree._roundedRect(this.ctx, node.XPosition, node.YPosition, node.w + 2, node.h, 5)
                // this.ctx.fillStyle = 'blue'
                // this.ctx.font = 'simsun 14px'
                // this.ctx.fillText("Hello World!",node.XPosition,node.YPosition)
                this.ctx.restore()

                // HTML part...

                // // // 超出隐藏增加，及title,选中
                s.push('<div id="node_' + node.id + '" class="econode" style="z-index:2;font-size:' + 14 * this.config.zoomRatio + 'px;top:' +
                    (node.YPosition * this.config.zoomRatio + this.canvasoffsetTop) + 'px;left:' + (node.XPosition * this.config.zoomRatio + this.canvasoffsetLeft) +
                    'px;width:' + node.w * this.config.zoomRatio + 'px;height:' + node.h * this.config.zoomRatio + 'px"')
                if (this.config.selectMode != ECOTree.SL_NONE)
                    // // s.push('onclick="javascript:ECOTree._canvasNodeClickHandler('+this.obj+',event.target.id,\''+node.id+'\')" ')
                    // s.push('onclick="javascript:ECOTree._canvasNodeClickHandler('+this.obj+',\''+node.id+'\',\''+node.id+'\')" ')
                    s.push('onclick="javascript:t.selectNode(\'' + node.id + '\',' + true + ')" ')
                s.push('>')
                if (node.canCollapse) {
                    // // 优化调整样式
                    s.push('<div style="float:left;margin-top:30px"><a style="" id="c' + node.id + '" href="javascript:' + this.obj + '.collapseNode(\'' + node.id + '\', true)" >')
                    // s.push('<div style="float:left;margin-top:13px"><a style="" id="c' + node.id + '" href="javascript:'+this.self+'.collapseNode(\''+node.id+'\', true)" >')
                    s.push('<img border=0 src="' + ((node.isCollapsed) ? this.config.collapsedImage : this.config.expandedImage) + '" >')
                    s.push('</a></div>')
                    // s.push('<img src="'+this.config.transImage+'" >')
                }
                if (node.target && this.config.useTarget) {
                    s.push('<a id="t' + node.id + '" href="' + node.target + '">')
                    s.push(node.dsc)
                    s.push('</a>')
                } else {
                    // // s.push(node.dsc + node.XPosition)
                    // // /超出隐藏
                    if (node.isEdt) {
                        s.push('<div style="margin-left:10px;display:inline-block"><input style="width:170px" id="node_name_input_'
                            // + node.id + '" value="' + node.dsc + '" onclick="focusInput(event)" onchange="changeContent(this)"/>')-20181220
                            +
                            node.id + '" value="' + node.dsc + '" onclick="t.focusInput(event)" onchange="changeContent(this)"/>')
                        if (node.canCollapse) {
                            s.push('<div id="node_weight_' + node.id + '" class="weight_div_cls">' + this.config.textConfig +
                                '<input style="width:40px" class="node_weight_cls" onclick="t.focusInput(event)" id="node_weight_input_'
                                // + node.id + '" value="' + node.wc + '" disabled="disabled"/>%</div></div>')暂不实现智能计算父节点权重
                                +
                                node.id + '" value="' + node.wc + '" onclick="t.focusInput(event)" onchange="changeWeight(this)"/>' + this.config.weightFlag + '</div></div>')
                        } else {
                            s.push('<div id="node_weight_' + node.id + '" class="weight_div_cls">' + this.config.textConfig +
                                '<input style="width:40px" class="node_weight_cls" id="node_weight_input_' +
                                node.id + '" value="' + node.wc + '" onclick="t.focusInput(event)" onchange="changeWeight(this)"/>' + this.config.weightFlag + '</div></div>')
                        }
                    } else {
                        // s.push('<div style="margin-left:10px;display:inline-block"><div class="over_cls" title="' + node.dsc + '">'+ node.dsc + '</div>')
                        s.push('<div style="margin-left:10px;display:inline-flex;width: 95%;"><textarea class="template_textarea_cls" disabled>' + node.dsc + '</textarea>')
                        s.push('<div class="template_textarea_type_cls">')
                        if (node.typeText == '主观评价') {
                            s.push('<div class="template_type_cls">评价方式：' + node.typeText + '</div>')
                            if (node.contentType === 'choose_class_teacher' || node.contentType === 'choose_class_student') {
                                const _memberType = node.contentType === 'choose_class_teacher' ? '教师' : '学生'
                                s.push('<div class="template_type_cls">作答方式：选择' + _memberType + '</div></div>')
                            } else {
                                s.push('<div class="template_type_cls">作答方式：主观填写</div></div>')
                            }
                        } else if (node.typeText == '主观评等' || node.typeText == '客观评等') {
                            let wc_str = ''
                            if (node.wc != 0) {
                                wc_str = `<div id = "node_weight_${node.id}" class = "template_score_cls" >权重：${Number(node.wc).toFixed(2)} % </div>`
                            }
                            s.push('<div class="template_type_cls">评价方式：' + node.typeText + '</div><div class="template_type_cls">量化等级：' + node.indicatorText + '</div>' + wc_str + '</div>')
                        } else {
                            // 客观打分
                            s.push('<div class="template_type_cls">评价方式：' + node.typeText + '</div><div id="node_weight_' + node.id + '" class="template_score_cls">分值：' + Number(node.wc).toFixed(2) + '分</div></div>')
                        }
                        s.push('</div>')
                    }
                }
                s.push('</div>')
                break

            case "VML":
                s.push('<v:roundrect id="' + node.id + '" strokecolor="' + border + '" arcsize="0.18"    ')
                s.push('style="position:absolute;top:' + node.YPosition + ';left:' + node.XPosition + ';width:' + node.w + ';height:' + node.h + '" ')
                if (this.config.selectMode != ECOTree.SL_NONE)
                    s.push('href="javascript:' + this.obj + '.selectNode(\'' + node.id + '\', true)" ')
                s.push('>')
                s.push('<v:textbox inset="0.5px,0.5px,0.5px,0.5px" ><font face=Verdana size=1>')
                if (node.canCollapse) {
                    s.push('<a href="javascript:' + this.obj + '.collapseNode(\'' + node.id + '\', true)" >')
                    s.push('<img border=0 src="' + ((node.isCollapsed) ? this.config.collapsedImage : this.config.expandedImage) + '" >')
                    s.push('</a>')
                    s.push('<img src="' + this.config.transImage + '" >')
                }
                if (node.target && this.config.useTarget) {
                    s.push('<a href="' + node.target + '">')
                    s.push(node.dsc)
                    s.push('</a>')
                } else {
                    s.push(node.dsc)
                }
                s.push('</font></v:textbox>')
                switch (this.config.nodeFill) {
                case ECOTree.NF_GRADIENT:
                    s.push('<v:fill type=gradient color2="' + ((node.isSelected) ? this.config.nodeSelColor : color) + '" color="#F5FFF5" angle=90 />')
                    break
                case ECOTree.NF_FLAT:
                    s.push('<v:fill type="solid" color="' + ((node.isSelected) ? this.config.nodeSelColor : color) + '" />')
                    break
                }
                s.push('<v:shadow type="single" on="true" opacity="0.7" />')
                s.push('</v:roundrect>')
                break
            }
            if (!node.isCollapsed) s.push(node._drawChildrenLinks(this.self))
        }
    }
    return s.join('')
}



ECOTree.prototype.toString = function () {
    var s = []

    this._positionTree()

    switch (this.render) {
    case "CANVAS":
        // width,height must here.
        s.push('<canvas id="ECOTreecanvas" width=' + this.config.canvasWidth + ' height=' + this.config.canvasHeight + '></canvas>')
        break

    case "HTML":
        s.push('<div class="maindiv">')
        s.push(this._drawTree())
        s.push('</div>')
        break

    case "VML":
        s.push('<v:group coordsize="10000, 10000" coordorigin="0, 0" style="position:absolute;width=10000px;height=10000px" >')
        s.push(this._drawTree())
        s.push('</v:group>')
        break
    }

    return s.join('')
}

//  ECOTree API begins here...

ECOTree.prototype.UpdateTree = function () {
    this.elm.innerHTML = this

    // when vml,it include text node already.
    if (this.render == "CANVAS") {
        var canvas = document.getElementById("ECOTreecanvas")

        // IE getContext fixed.
        if (typeof window.G_vmlCanvasManager != "undefined") {
            canvas = window.G_vmlCanvasManager.initElement(canvas)
        }
        if (canvas && canvas.getContext) {
            this.canvasoffsetLeft = canvas.offsetLeft
            this.canvasoffsetTop = canvas.offsetTop
            this.ctx = canvas.getContext('2d')
            var htmlTxt = this._drawTree()

            if (document.createRange) { //  all browsers, except IE before version 9
                var rangeObj = this.elm.ownerDocument.createRange()
                rangeObj.setStartBefore(this.elm)
                if (rangeObj.createContextualFragment) { //  all browsers, except IE

                    var documentFragment = rangeObj.createContextualFragment(htmlTxt)
                    this.elm.appendChild(documentFragment)
                } else { //  Internet Explorer from version 9
                    this.elm.insertAdjacentHTML("afterBegin", htmlTxt)
                }
            } else { //  Internet Explorer before version 9
                this.elm.insertAdjacentHTML("afterBegin", htmlTxt)
            }
        }
    }
}

ECOTree.prototype.add = function (id, pid, dsc, type, typeText, wc, isEdt, contentType, gradeId, indicatorText, w, h, c, bc, target, meta) {
    var nw = w || this.config.defaultNodeWidth // Width, height, colors, target and metadata defaults...
    var nh = h || this.config.defaultNodeHeight
    var color = c || this.config.nodeColor
    var border = bc || this.config.nodeBorderColor
    var tg = (this.config.useTarget) ? ((typeof target == "undefined") ? (this.config.defaultTarget) : target) : null
    var metadata = (typeof meta != "undefined") ? meta : ""

    var pnode = null // Search for parent node in database
    // if (pid == -1)
    if (pid == 0) {
        pnode = this.root
    } else {
        for (var k = 0; k < this.nDatabaseNodes.length; k++) {
            if (this.nDatabaseNodes[k].id == pid) {
                pnode = this.nDatabaseNodes[k]
                break
            }
        }
    }
    var node = new ECONode(id, pid, dsc, type, typeText, wc, isEdt, contentType, gradeId, indicatorText, nw, nh, color, border, tg, metadata) // New node creation...
    node.nodeParent = pnode
    // Set it's parent
    pnode.canCollapse = true
    // It's obvious that now the parent can collapse
    var i = this.nDatabaseNodes.length
    // Save it in database
    node.dbIndex = this.mapIDs[id] = i
    this.nDatabaseNodes[i] = node
    var h = pnode.nodeChildren.length
    // Add it as child of it's parent
    node.siblingIndex = h
    pnode.nodeChildren[h] = node
}
// // 增加set方法，用于切换时保存，配合缓存
ECOTree.prototype.set = function (id, pid, dsc, type, typeText, wc, isEdt, contentType, gradeId, indicatorText, w, h, c, bc, target, meta) {

    for (var k = 0; k < this.nDatabaseNodes.length; k++) {
        // 新增无id节点
        if (this.nDatabaseNodes[k].id == id || this.nDatabaseNodes[k].pid == id) {
            // 留着做拖拽？
            // this.nDatabaseNodes[k].parent = pid
            if (dsc !== null && undefined !== dsc) {
                this.nDatabaseNodes[k].dsc = dsc
            }
            if (wc !== null && undefined !== wc) {
                this.nDatabaseNodes[k].wc = wc
            }
            this.nDatabaseNodes[k].isEdt = false
            break
        }
    }

}

ECOTree.prototype.searchNodes = function (str) {
    var node = null
    var m = this.config.searchMode
    var sm = (this.config.selectMode == ECOTree.SL_SINGLE)
    if (typeof str == "undefined") return
    if (str == "") return

    var found = false
    var n = (sm) ? this.iLastSearch : 0
    if (n == this.nDatabaseNodes.length) n = this.iLastSeach = 0

    str = str.toLocaleUpperCase()

    for (; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n]
        if (node.dsc.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_DSC) || (m == ECOTree.SM_BOTH))) {
            node._setAncestorsExpanded()
            this._selectNodeInt(node.dbIndex, false)
            found = true
        }
        if (node.meta.toLocaleUpperCase().indexOf(str) != -1 && ((m == ECOTree.SM_META) || (m == ECOTree.SM_BOTH))) {
            node._setAncestorsExpanded()
            this._selectNodeInt(node.dbIndex, false)
            found = true
        }
        if (sm && found) {
            this.iLastSearch = n + 1
            break
        }
    }
    this.UpdateTree()
}

ECOTree.prototype.selectAll = function () {
    if (this.config.selectMode != ECOTree.SL_MULTIPLE) return
    this._selectAllInt(true)
}

ECOTree.prototype.unselectAll = function () {
    this._selectAllInt(false)
}

ECOTree.prototype.collapseAll = function () {
    this._collapseAllInt(true)
}

ECOTree.prototype.expandAll = function () {
    this._collapseAllInt(false)
}

ECOTree.prototype.collapseNode = function (nodeid, upd) {
    var dbindex = this.mapIDs[nodeid]
    this.nDatabaseNodes[dbindex].isCollapsed = !this.nDatabaseNodes[dbindex].isCollapsed
    if (upd) this.UpdateTree()
}

ECOTree.prototype.selectNode = function (nodeid, upd) {
    this._selectNodeInt(this.mapIDs[nodeid], true)
    if (upd) this.UpdateTree()
}

//20181220
ECOTree.prototype.focusInput = function (e) {
    e.stopPropagation()
}

ECOTree.prototype.setNodeTitle = function (nodeid, title, upd) {
    var dbindex = this.mapIDs[nodeid]
    this.nDatabaseNodes[dbindex].dsc = title
    if (upd) this.UpdateTree()
}

ECOTree.prototype.setNodeMetadata = function (nodeid, meta, upd) {
    var dbindex = this.mapIDs[nodeid]
    this.nDatabaseNodes[dbindex].meta = meta
    if (upd) this.UpdateTree()
}

ECOTree.prototype.setNodeTarget = function (nodeid, target, upd) {
    var dbindex = this.mapIDs[nodeid]
    this.nDatabaseNodes[dbindex].target = target
    if (upd) this.UpdateTree()
}

ECOTree.prototype.setNodeColors = function (nodeid, color, border, upd) {
    var dbindex = this.mapIDs[nodeid]
    if (color) this.nDatabaseNodes[dbindex].c = color
    if (border) this.nDatabaseNodes[dbindex].bc = border
    if (upd) this.UpdateTree()
}

ECOTree.prototype.getSelectedNodes = function () {
    var node = null
    var selection = []
    var selnode = null

    for (var n = 0; n < this.nDatabaseNodes.length; n++) {
        node = this.nDatabaseNodes[n]
        if (node.isSelected) {
            selnode = {
                "id": node.id,
                "dsc": node.dsc,
                "meta": node.meta,
                "parent": node.pid,
                // 20181225
                "weight": node.wc,
                "type": node.type,
                "fatherId": node.pid,
                "content": node.dsc,
                evaluationMethod: node.type,
                evaluationMethodText: node.typeText,
                contentType: node.contentType,
                gradeId: node.gradeId,
                indicatorText: node.indicatorText
            }
            selection[selection.length] = selnode
        }
    }
    return selection
}

export default ECOTree
