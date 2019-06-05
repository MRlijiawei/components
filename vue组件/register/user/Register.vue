<template>
  <div class="register-style">
    <div class="register-box">
      <img class="register-logo" src="https://y.gtimg.cn/music/photo_new/T002R300x300M0000034Gnut4OoYpJ.jpg?max_age=2592000">
      <el-tabs v-model="activeName">
        <el-tab-pane name="register">
          <span slot="label"><div style="min-width: 150px;width: 50%"><i class="el-icon-user"></i> 注册</div></span>
        </el-tab-pane>
        <el-tab-pane name="login">
          <span slot="label">
            <div style="min-width: 150px;width: 50%">
              <span style="color: gray;">已有账号？ </span><el-button type="text">立即登录</el-button>
            </div></span>
        </el-tab-pane>
      </el-tabs>
      <el-form :model="registerForm" status-icon :rules="rules" ref="ruleForm">
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" placeholder="用户名（3-20位，中文/数字/字母/下划线及其组合）"></el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="registerForm.phone" placeholder="手机号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" placeholder="密码（6-20位，数字/字母/符号及其组合）" type="password" autocomplete="off" show-password></el-input>
          <el-progress :percentage="pwdLevel" :format="format" :color="levelColor"></el-progress>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input v-model="registerForm.repassword" placeholder="确认密码" type="password" autocomplete="off" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-row>
            <el-col :span="12"><el-input placeholder="字符验证码" v-model="registerForm.identCode"></el-input></el-col>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="8">
              <identifyCode ref="idtC"></identifyCode>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-row>
            <el-col :span="12"><el-input placeholder="短信验证码" v-model="registerForm.msgCode"></el-input></el-col>
            <el-col :span="4">&nbsp;</el-col>
            <el-col :span="8">
              <el-button style="width:100%" type="primary" :disabled="sendDisable" @click="sendMsg">{{sendText}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item style="float:left">
          <el-checkbox v-model="agree">我同意</el-checkbox>
          <el-button type="text">《注册协议》</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%">注&nbsp;&nbsp;册</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog :visible.sync="regPaperShow" :title="'注册协议'">
      <regPaper></regPaper>
    </el-dialog>
  </div>
</template>
<script>
import identifyCode from './components/identifyCode'
import regPaper from './components/regPaper'
import { setInterval, clearInterval } from 'timers'
export default {
  data () {
    var validatePass = (rule, value, callback) => {
      if (!this.pdwReg.test(value)) {
        callback(new Error('请输入 6-20位，数字/字母/符号及其组合 的密码'))
      } else {
        callback()
      }
    }
    var validateRePass = (rule, value, callback) => {
      if (this.registerForm.password !== value) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }
    var validateName = (rule, value, callback) => {
      if (!this.nameReg.test(value)) {
        callback(new Error('请输入 3-20位，中文/数字/字母/下划线及其组合 的用户名'))
      } else {
        callback()
      }
    }
    var validatePhone = (rule, value, callback) => {
      if (!this.phoneReg.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      activeName: 'register',
      registerForm: {
        name: '',
        password: '',
        repassword: '',
        phone: '',
        identCode: '',
        msgCode: ''
      },
      pwdLevel: 0,
      levelColor: '#f56c6c',
      checkCode: '',
      sendDisable: false,
      sendText: '获取验证码',
      timeSpace: 60,
      agree: false,
      regPaperShow: false,
      nameReg: /^[\u4E00-\u9FA5a-zA-Z0-9_]{3,20}$/,
      pdwReg: /^[a-zA-Z0-9`~!@#$^&*()=|{}':;',\\[\].<>\\/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]{6,20}$/,
      phoneReg: /^1[34578]\d{9}$/,
      rules: {
        name: [{
          validator: validateName, trigger: 'blur'
        }],
        password: [{
          validator: validatePass, trigger: 'blur'
        }],
        repassword: [{
          validator: validateRePass, trigger: 'blur'
        }],
        phone: [{
          validator: validatePhone, trigger: 'blur'
        }]
      }
    }
  },
  watch: {
    pwd: {
      handler (val, old) {
        console.log(val)
        this.checkPwdLevel(val)
      }
    }
  },
  methods: {
    format (pct) {
      // 做一个密码非法的标志--1--也可以用form校验
      return pct > 80 ? '密码非常安全' : pct > 60 ? '密码安全' : pct > 40 ? '密码一般' : pct === 0 ? '' : pct === 1 ? '密码不满足要求' : '密码危险'
    },
    checkPwdLevel (val) {
      this.pwdLevel = 0
      if (this.pdwReg.test(val)) {
        // 采用简单的组合方式校验，暂不校验复杂度相似性等
        if (/[a-z]/.test(val)) this.pwdLevel += 25
        if (/[A-Z]/.test(val)) this.pwdLevel += 25
        if (/[0-9]/.test(val)) this.pwdLevel += 25
        if (/[`~!@#$^&*()=|{}':;',\\[\].<>\\/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]/.test(val)) this.pwdLevel += 25
        switch (this.pwdLevel) {
          case 0:
          case 25:
            this.levelColor = 'red'
            break
          case 50:
            this.levelColor = '#e6a23c'
            break
          case 75:
            this.levelColor = '#1989fa'
            break
          case 100:
            this.levelColor = '#5cb87a'
            break
          default:
            this.levelColor = '#e6a23c'
            break
        }
      }
    },
    sendMsg () {
      this.sendDisable = true
      this.timeSpace = 60
      this.sendText = this.timeSpace
      const timeInterval = setInterval(() => {
        this.timeSpace--
        this.sendText = this.timeSpace
        if (this.timeSpace === 0) {
          this.sendDisable = false
          this.sendText = '获取验证码'
          clearInterval(timeInterval)
        }
      }, 1000)
    }
  },
  computed: {
    pwd () {
      return this.registerForm.password
    }
  },
  components: {
    identifyCode,
    regPaper
  }
}
</script>
<style lang="scss" scoped>
.register-style {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  min-width: 400px;
  max-width: 500px;
  height: 70%;
  min-height: 700px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #e3e3e3;
  box-shadow: 1px 1px 2px 2px rgba(0,0,0,0.2);
  background-color: #ffffff;
  .register-box {
    display: block;
    .register-logo {
      height: 100px;
      width: 100px;
      border-radius: 50%;
    }
  }
}
</style>
