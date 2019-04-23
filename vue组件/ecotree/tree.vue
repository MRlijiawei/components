<template>
  <!-- <div style="height: 500px;overflow: auto" @click="nodeOperate('')"> -->
  <div @click="nodeOperate('')">
    <div
      v-if="contextShow && nodeSelected && viewType != 'view'"
      class="tree_context_cls"
      :style="treeContextStyle"
    >
      <ul>
        <!-- <li @click="nodeOperate('addRoot')">添加一级指标</li> -->
        <li v-if="nodeSelected" @click="nodeOperate('addNext')">添加下级指标</li>
        <li v-if="nodeSelected" @click="nodeOperate('edit')">编辑</li>
        <li v-if="nodeSelected" @click="nodeOperate('delete')">删除</li>
      </ul>
    </div>
    <div ref="treeDiv" id="treeDiv" @contextmenu="showTreeContext($event)"></div>
    <el-dialog
      :visible.sync="singleContentShow"
      title="评价指标"
      :modal-append-to-body="false"
      :modal="false"
      :close-on-click-modal="false"
      width="400px"
    >
      <!-- 内容 -->
      <el-row>
        <el-col :span="24" class="form_row">
          <label>内容</label>
          <div>
            <el-input clearable placeholder="请输入内容" v-model="singleContent.content" maxlength="100"></el-input>
          </div>
        </el-col>
      </el-row>
      <!-- 评价方式 -->
      <el-row>
        <el-col :span="24" class="form_row">
          <label class>评价方式</label>
          <div class>
            <el-select
              :disabled="fatherId && fatherId !== '0'"
              v-model="singleContent.evaluationMethod"
              placeholder="请选择"
              @change="setUnit()"
            >
              <el-option
                v-for="type in ems"
                :key="type.dicKey"
                :label="type.dicValue"
                :value="type.dicKey"
              ></el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <!-- 量化等级 -->
      <el-row v-if="singleContent.evaluationMethod == 'subjective_grading'">
        <el-col :span="24" class="form_row">
          <label class>量化等级</label>
          <div class>
            <el-select v-model="singleContent.gradeId" placeholder="请选择" @change="setUnit()">
              <el-option
                v-for="type in indicators"
                :key="type.grade.id"
                :label="type.grade.indicatorGradeName"
                :value="type.grade.id"
              ></el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <!-- 评价方式为主管评价时，显示答案填写方式 -->
      <el-row>
        <el-col
          :span="24"
          class="form_row"
          v-if="singleContent.evaluationMethod === 'objective_evaluation'"
        >
          <label class>作答方式</label>
          <div class>
            <el-select v-model="singleContent.contentType" placeholder="请选择" @change="setUnit()">
              <el-option
                v-for="type in cats"
                :key="type.dicKey"
                :label="type.dicValue"
                :value="type.dicKey"
              ></el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <!-- 作答方式为班级教室或班级学生时 -->
      <el-row
        v-if="
          singleContent.evaluationMethod == 'subjective_marking' ||
            (singleContent.evaluationMethod == 'subjective_grading' &&
              templateType !== 'evaluation_advise')
        "
      >
        <el-col :span="24" class="form_row">
          <label>{{ unitType }}</label>
          <div>
            <el-input
              clearable
              placeholder="请输入内容"
              v-model="singleContent.weight"
              type="number"
              maxlength="3"
            ></el-input>
          </div>
          {{ unit }}
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSingleContent()">取 消</el-button>
        <el-button type="primary" @click="submitSingleContent()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import ECOTree from './ECOTree.js'
import plusImg from '@/assets/images/eva/plus.gif'
import lessImg from '@/assets/images/eva/less.gif'
// import { setInterval } from 'timers'
export default {
  data() {
    return {
      t: null,
      treeDepth: 0,
      treeWidth: 0,
      weightReg: /^[0-9]+$/,
      weightOK: true,
      singleContentShow: false,
      singleContent: {
        content: '',
        weight: 0,
        sort: 0,
        fatherId: '',
        templateId: '',
        id: '',
        evaluationMethod: '',
        evaluationMethodText: '',
        gradeId: '', // 等级指标
        indicatorText: '', // 等级指标文字
        contentType: '' // 作答方式
      },
      indicatorMap: {},
      nodeOperateType: '',
      fatherId: '',
      unitType: '',
      unit: '',
      datasList: '',
      dataArr: this.dataAr,
      contextShow: false,
      nodeSelected: false,
      treeContextStyle: '',
      memberMenuShow: false
    }
  },
  computed: {
  },
  /* components: {
    ECOTree
  }, */
  methods: {
    showTreeContext(e) {
      const treePos = this.$refs.treeDiv.getBoundingClientRect()
      this.treeContextStyle = 'left:' + (e.clientX - treePos.left + 20) + 'px;top:' + (e.clientY - treePos.top + 275) + 'px'
      this.contextShow = true
      if (this.t.getSelectedNodes().length === 0) {
        this.nodeSelected = false
      } else {
        this.nodeSelected = true
      }
      e.preventDefault()
      return false
    },
    cancelSingleContent() {
      this.singleContentShow = false
      this.singleContentInit()
    },
    submitSingleContent() {
      const _em = this.singleContent.evaluationMethod
      if (_em === 'subjective_grading' && !this.singleContent.gradeId) {
        this.$message({
          type: 'error',
          message: '请选择量化等级'
        })
        return false
      }
      if (!this.singleContent.content) {
        this.$message({
          type: 'error',
          message: '请输入指标内容'
        })
        return false
      }
      if (this.fatherId && this.fatherId !== '0') {
        const _fatherNode = this.t.getSelectedNodes()[0]
        if (_fatherNode.evaluationMethod !== this.singleContent.evaluationMethod) {
          this.$message({
            type: 'error',
            message: '二级指标的评价方式必须和上级指标相同'
          })
          return false
        }
      }
      if (!this.singleContent.evaluationMethod) {
        this.$message({
          type: 'error',
          message: '请选择评价方式'
        })
        return false
      }
      if ((!this.singleContent.weight || this.singleContent.weight > 100 || this.singleContent.weight <= 0) && this.singleContent.evaluationMethod !== 'objective_evaluation') {
        if (this.singleContent.evaluationMethod === 'subjective_grading') { // 客观评等
          if (this.templateType !== 'evaluation_advise') {
            this.$message({
              type: 'error',
              message: '请输入正确的指标权重'
            })
            return false
          }
        } else {
          this.$message({
            type: 'error',
            message: '请输入正确的分值（0 ~ 100）'
          })
          return false
        }
      }
      this.setUnit()
      this.singleContent.weight = Number(this.singleContent.weight).toFixed(2)
      this.updData(
        this.nodeOperateType,
        this.singleContent.id,
        this.fatherId,
        this.singleContent.content,
        this.singleContent.evaluationMethod,
        this.singleContent.evaluationMethodText,
        Number(this.singleContent.weight / 100).toFixed(4),
        true,
        this.dataArr,
        this.singleContent.contentType,
        this.singleContent.gradeId,
        this.singleContent.indicatorText
      )
      this.singleContentShow = false
      this.singleContentInit()
    },
    getDepth(dataArr) {
      var arr = []
      arr = dataArr
      var depth = 0
      while (arr.length > 0) {
        var temp = []
        for (var m = 0; m < arr.length; m++) {
          temp.push(arr[m])
        }
        arr = []
        for (var i = 0; i < temp.length; i++) {
          if (temp[i].childList) {
            for (var j = 0; j < temp[i].childList.length; j++) {
              arr.push(temp[i].childList[j])
            }
          }
        }
        if (arr.length >= 0) {
          depth++
        }
      }
      return depth
    },
    getLeafCountTree(dataJson) {
      if (!dataJson.childList) {
        return 1
      }
      if (dataJson.childList.length === 0) {
        return 1
      } else {
        var leafCount = 0
        for (var i = 0; i < dataJson.childList.length; i++) {
          leafCount = leafCount + this.getLeafCountTree(dataJson.childList[i])
        }
        return leafCount
      }
    },
    // 对象数组按某属性排序
    orderObjArr(property) {
      return function(obj1, obj2) {
        return obj1[property] - obj2[property]
      }
    },
    transData(arr) {
      this.datasList = arr.filter(e => {
        return e.fatherId === '0'
      })
      this.sortTemplate(this.datasList, arr)
    },
    // 转多维
    sortTemplate(data, datas) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i]['childList']) {
          data[i]['childList'] = []
        }
        for (let j = 0; j < datas.length; j++) {
          if (String(data[i].id) === String(datas[j].fatherId) && data[i]['childList'].length === datas[j].sort - 1) {
            const level = datas.splice(j, 1)[0]
            level['childList'] = []
            data[i].childList.push(level)
            j--
          }
        }
        if (data[i].childList && data[i].childList.length > 0) {
          this.sortTemplate(data[i].childList, datas)
        }
      }
    },
    createTree() {
      let t = null
      t = new ECOTree('t', 'treeDiv')
      this.t = t
      window.t = t
      // this.t = new ECOTree('t', 'treeDiv')
      this.t.config.expandedImage = lessImg
      this.t.config.collapsedImage = plusImg
      // t.config.colorStyle = ECOTree.CS_LEVEL
      this.t.config.nodeFill = ECOTree.NF_FLAT
      this.t.config.useTarget = false
      this.t.config.iRootOrientation = ECOTree.RO_LEFT
      this.t.config.topXAdjustment = 20
      this.t.config.topYAdjustment = -20
      this.t.config.linkType = 'B'
      this.t.config.linkColor = '#555'
      this.t.config.nodeColor = '#f5f5f5'
      // t.config.nodeFill = ECOTree.NF_GRADIENT
      this.t.config.nodeBorderColor = 'black'
      this.t.config.selectMode = ECOTree.SL_SINGLE
      this.t.config.nodeSelColor = '#cedbec'
      // this.t.config.textConfig = this.singleContent.evaluationMethod === 'subjective_grading' ? '权重' : '分数'
      // this.t.config.weightFlag = this.singleContent.evaluationMethod === 'subjective_grading' ? '' : '分'
      this.t.config.defaultNodeHeight = 90
      this.t.config.defaultNodeWidth = 400
      // 动态设置宽高
      if (this.treeDepth > 0 && 240 * this.treeDepth > 900) {
        this.t.config.canvasWidth = 240 * this.treeDepth
      }
      if (this.treeWidth > 0 && 110 * this.treeWidth > 400) {
        this.t.config.canvasHeight = 110 * this.treeWidth
      }
    },
    drawTree() {
      // 如果未排序则组织树结构并排序
      if (this.dataArr.filter(e => {
        return e.fatherId !== '0'
      }).length > 0) {
        this.dataArr.forEach(e => {
          e.weight = e.maxScore / 100
        })
        this.transData(this.dataArr)
        this.datasList = this.dataArr.sort(this.orderObjArr('sort'))
      } else {
        this.dataArr.forEach(e => {
          if (e.weight === 0 && e.maxScore && e.maxScore !== 0) {
            e.weight = e.maxScore / 100
          }
        })
        this.datasList = this.dataArr
      }
      this.t = null
      // countNum = 0;
      this.treeDepth = this.getDepth(this.datasList)
      // 一并计算广度
      var sumTree = {
        'id': '0',
        'childList': this.datasList
      }
      this.treeWidth = this.getLeafCountTree(sumTree)
      const _that = this
      const waitInterval = window.setInterval(function() {
        if (document.getElementById('treeDiv')) {
          _that.createTree()
          _that.initTree(_that.datasList)
          window.clearInterval(waitInterval)
        }
      }, 200)
    },
    initTree(arr) {
      for (var i = 0; i < arr.length; i++) {
        // if (!arr[i].isdelete || arr[i].isdelete === '0') {
        if (arr[i].id) {
          arr[i].tid = arr[i].id
        } else if (!arr[i].tid) {
          // 不加id而统一在绘制时加pid，会导致每次绘制统一节点时id不同
          // arr[i].tid = 'temp' + countNum;
          arr[i].tid = 'temp' + new Date().getTime()
        }
        // 新增多个时，要实现仅最后一个编辑，需要新增变量并递归
        // 暂时不默认编辑
        /* if(!arr[i].isEdt) {
          arr[i].isEdt = false;
        } */
        // 20181225-兼容结构
        if (!arr[i].childList) {
          arr[i].childList = []
        }
        arr[i].isEdt = false
        // 20181226 无父节点的fid改为0
        if (arr[i].fatherId === '0') {
          this.t.add(arr[i].tid, '0', arr[i].content, arr[i].evaluationMethod, arr[i].evaluationMethodText, Number(arr[i].weight * 100).toFixed(2), arr[i].isEdt, arr[i].contentType, arr[i].gradeId, arr[i].indicatorText)
        } else {
          this.t.add(arr[i].tid, arr[i].fatherId, arr[i].content, arr[i].evaluationMethod, arr[i].evaluationMethodText, Number(arr[i].weight * 100).toFixed(2), arr[i].isEdt, arr[i].contentType, arr[i].gradeId, arr[i].indicatorText)
        }
        // countNum ++;
        if (arr[i].childList && arr[i].childList.length > 0) {
          this.initTree(arr[i].childList)
        }
        // }
      }
      this.t.UpdateTree()
    },
    updData(flag, id, pid, content, type, typeText, weight, isEdt, dataList, contentType, gradeId, indicatorText) {
      if (flag === 'delete') {
        for (var i = 0; i < dataList.length; i++) {
          if (dataList[i].id === id || dataList[i].tid === id) {
            // dataList[i].isdelete = '1';
            // 改标志后后台未区分
            dataList.splice(i, 1)
            this.drawTree()
            break
          } else if (dataList[i].childList && dataList[i].childList.length > 0) {
            this.updData(flag, id, pid, content, type, typeText, weight, isEdt, dataList[i].childList, contentType, gradeId, indicatorText)
          }
        }
      } else if (flag === 'update') {
        for (var j = 0; j < dataList.length; j++) {
          // 新增后编辑，没有id的情况，根据上边初始化时拼接的pid判断
          if (dataList[j].id === id || dataList[j].tid === id) {
            dataList[j].content = content
            // 模板类型为问卷调查，评价方式为客观评等时，将权重设置为0
            dataList[j].weight = (type === 'subjective_grading' && this.templateType === 'evaluation_advise') ? 0 : weight
            dataList[j].evaluationMethod = type
            dataList[j].evaluationMethodText = typeText
            dataList[j].contentType = contentType
            dataList[j].typeText = typeText
            dataList[j].gradeId = gradeId
            dataList[j].indicatorText = indicatorText
            this.drawTree()
            break
          } else if (dataList[j].childList && dataList[j].childList.length > 0) {
            this.updData(flag, id, pid, content, type, typeText, weight, isEdt, dataList[j].childList, contentType, gradeId, indicatorText)
          }
        }
      } else if (flag === 'add') {
        // 加根
        if (pid === '0' || pid === null) {
          this.dataArr.push({
            // 生成id
            id: Number(Math.random().toString().substr(3, 10) + Date.now()).toString(36),
            content: content,
            fatherId: '0',
            isdelete: '0',
            weight: weight,
            isEdt: isEdt,
            childList: [],
            canCollapse: false,
            templateOrder: this.dataArr.length + 1,
            evaluationMethod: type,
            evaluationMethodText: typeText,
            contentType: contentType,
            gradeId: gradeId,
            indicatorText: indicatorText
          })
          this.drawTree()
        } else {
          for (var m = 0; m < dataList.length; m++) {
            // 结合画树时生成的tid，以区分给新增的根节点添加子节点场景
            if (dataList[m].id === pid || dataList[m].tid === pid) {
              dataList[m].childList.push({
                // 生成id
                id: Number(Math.random().toString().substr(3, 10) + Date.now()).toString(36),
                content: content,
                fatherId: pid,
                isdelete: '0',
                weight: weight,
                isEdt: isEdt,
                childList: [],
                canCollapse: false,
                templateOrder: dataList[m].childList.length + 1,
                evaluationMethod: type,
                evaluationMethodText: typeText,
                contentType: contentType,
                gradeId: gradeId,
                indicatorText: indicatorText
              })
              this.drawTree()
              break
            } else if (dataList[m].childList && dataList[m].childList.length > 0) {
              this.updData(flag, id, pid, content, type, typeText, weight, isEdt, dataList[m].childList, contentType, gradeId, indicatorText)
            }
          }
        }
      }
      // t.UpdateTree();
    },
    addRoot() {
      // this.updData('add', '', '-1', '', 0, true, this.dataArr)
      this.nodeOperateType = 'add'
      this.fatherId = null
      this.singleContentInit()
      this.singleContentShow = true
    },
    addSame() {
      if (this.t.nDatabaseNodes.length === 0) {
        this.$message({
          type: 'error',
          center: true,
          message: '请先添加一级指标'
        })
        return false
      } else {
        if (this.t.getSelectedNodes().length === 0) {
          this.$message({
            type: 'error',
            center: true,
            message: '请先选择目标指标'
          })
          return false
        } else {
          this.nodeOperateType = 'add'
          this.fatherId = this.t.getSelectedNodes()[0].parent
          this.singleContentInit()
          this.singleContentShow = true
        }
      }
    },
    addNext() {
      if (this.treeDepth > 1 && this.t.getSelectedNodes().length > 0 && this.t.getSelectedNodes()[0].parent !== '0') {
        this.$message({
          type: 'error',
          center: true,
          message: '最多添加二级指标'
        })
        return false
      } else if (this.t.nDatabaseNodes.length === 0) {
        this.$message({
          type: 'error',
          center: true,
          message: '请先添加一级指标'
        })
        return false
      } else {
        if (this.t.getSelectedNodes().length === 0) {
          this.$message({
            type: 'error',
            center: true,
            message: '请先选择目标指标'
          })
          return false
        } else {
          // this.updData('add', '', this.t.getSelectedNodes()[0].id, '', 0, true, this.dataArr)
          const _fatherNode = this.t.getSelectedNodes()[0]
          this.nodeOperateType = 'add'
          this.fatherId = _fatherNode.id
          this.singleContentInit({
            fatherId: _fatherNode.id,
            evaluationMethod: _fatherNode.evaluationMethod,
            evaluationMethodText: _fatherNode.evaluationMethodText
          })

          this.singleContentShow = true
        }
      }
    },
    editLevel() {
      if (this.t.nDatabaseNodes.length === 0) {
        this.$message({
          type: 'error',
          center: true,
          message: '请先添加指标'
        })
        return false
      } else {
        if (this.t.getSelectedNodes().length === 0) {
          this.$message({
            type: 'error',
            center: true,
            message: '请先选择目标指标'
          })
          return false
        } else {
          // this.t.nDatabaseNodes[this.t.mapIDs[this.t.getSelectedNodes()[0].id]].isEdt = true
          // 缓存，用于切换保存3-id/tid/获取选中节点已适配新增节点id=tid
          // sessionStorage.setItem('stid', this.t.getSelectedNodes()[0].id)
          // this.t.UpdateTree()
          this.nodeOperateType = 'update'
          this.singleContent = this.t.getSelectedNodes()[0]
          this.singleContentShow = true
        }
      }
    },
    delLevel() {
      if (this.t.getSelectedNodes().length === 0) {
        this.$message({
          type: 'error',
          center: true,
          message: '请先选择目标指标'
        })
        return false
      } else {
        this.$confirm('节点指标删除后不可撤销，是否确认删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.updData('delete', this.t.getSelectedNodes()[0].id, '', '', '', '', 0, false, this.dataArr, '', '', 0, '')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    nodeOperate(type) {
      this.contextShow = false
      switch (type) {
        case 'addRoot':
          this.addRoot()
          break
        case 'addSame':
          this.addSame()
          break
        case 'addNext':
          this.addNext()
          break
        case 'edit':
          this.editLevel()
          break
        case 'delete':
          this.delLevel()
          break
        case 'refresh':
          this.drawTree()
          break
        case 'empty':
          this.dataArr = []
          this.drawTree()
          break
        default:
          break
      }
    },
    setUnit() {
      this.singleContent.indicatorText = this.indicatorMap[this.singleContent.gradeId]
      this.unitType = this.singleContent.evaluationMethod === 'subjective_grading' ? '权重' : '分值'
      this.unit = this.singleContent.evaluationMethod === 'subjective_grading' ? '%' : '分'
      this.singleContent.evaluationMethodText = this.getEMText(this.singleContent.evaluationMethod)
    },
    getEMText(key) {
      const _arr = this.ems.filter(e => e.dicKey === key)
      return _arr[0].dicValue
    },
    singleContentInit({ content = '',
      weight = 0,
      sort = 0,
      fatherId = '',
      templateId = '',
      id = '',
      evaluationMethod = '',
      evaluationMethodText = '',
      contentType = '',
      gradeId = '',
      indicatorText = '' } = {}) {
      this.singleContent = {
        content: content,
        weight: weight,
        sort: sort,
        fatherId: fatherId,
        templateId: templateId,
        id: id,
        evaluationMethod: evaluationMethod,
        evaluationMethodText: evaluationMethodText,
        contentType: contentType, // 作答方式
        gradeId: gradeId,
        indicatorText: indicatorText
      }
    }
  },
  props: {
    dataAr: Array,
    ems: Array,
    viewType: String,
    cats: Array, // content_add_type 内容填写方式
    indicators: Array, // 评价指标
    templateType: { type: String, required: true }
  },
  watch: {
    dataArr: {
      handler(val, old) {
        // this.drawTree()
      }
    }
    /* 'dataArr': {
      deep: true,
      handler: function() {
        this.drawTree()
      }
    } */
  },
  /* mounted() {
    window['ECOTree'] = this.ECOTree
    console.log(this.ECOTree)
  }, */
  created() {
    this.indicators.forEach((v) => {
      this.indicatorMap[v.grade.id] = v.grade.indicatorGradeName
    })
    if (this.dataArr) {
      this.drawTree()
    }
    // this.drawTree()
  }
}
</script>
<style lang="scss" scoped>
// @import './ECOTree.css';
@mixin max-length($width) {
  max-width: $width;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#treeDiv {
  /* min-width: 300px;
  min-height: 100px;
  max-width: 1000px;
  max-height: 800px;
  overflow: auto; */
  position: relative;
  overflow-x: auto;
  min-height: 400px;
}
.maingroup {
  position: absolute;
  width: 980px;
  height: 570px;
  overflow: scroll;
}

.maindiv {
  position: relative;
  width: 980px;
  height: 570px;
  overflow: scroll;
}

.econode {
  position: absolute;
  text-overflow: clip;
  font-family: Verdana, Geneva, Arial, Helvetica, sans-serif;
  font-size: xx-small;
  padding: 2px;
}

a.ecolink:visited {
  text-decoration: none;
  color: black;
}

a.ecolink:hover {
  text-decoration: underline;
}

.over_cls {
  width: 170px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.form_row {
  display: inline-flex;
  line-height: 40px;
  label {
    margin-right: 20px;
    width: 60px;
  }
}
.tree_context_cls {
  z-index: 1993;
  background-color: #fffafa;
  width: 140px;
  /* height: 141px; */
  height: 106px;
  text-align: center;
  border: 1px solid #038b67;
  position: absolute;
  li {
    border-bottom: 1px solid #009cff;
    color: black;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
  }
  li:hover {
    background-color: #009cff;
  }
}
.text {
  font-size: 14px;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  > span {
    display: inline-block;
    @include max-length(140px);
  }
}
.max-length-160 {
  @include max-length(140px);
}
.tree-member {
  flex: 1;
  padding-right: 20px;
}
/deep/ .el-card__header {
  padding: 10px;
}
/deep/ .el-card__body {
  padding: 0;
  max-height: 250px;
  overflow-y: auto;
}
.tree-member-header {
  display: flex;
  justify-content: space-between;
}
.member-add-button {
  margin-left: auto;
}
</style>
