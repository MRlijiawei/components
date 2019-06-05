<template>
  <div class="lay-login">
    <div class="lay-login-container">
      <div class="lay-login-header" @click="gotoIndex" style="cursor: pointer" title="返回首页">
          <img class="lay-login-header-logo" :src="appConfig.app_weblogo"/>
          <span class="lay-login-header-title">{{appConfig.app_webname}}</span>
      </div>
      <div class="lay-login-header-desc">{{appConfig.app_webslogan}}</div>
      <el-form class="lay-login-form" :style="getLoginStyle" autoComplete="on" :model="loginForm" :rules="loginRules" ref="loginForm" label-position="left">
        <el-form-item prop="username">
          <span class="input-prefix">
            <svg-icon icon-class="user" />
          </span>
          <el-input name="username" type="text" v-model="loginForm.username" autoComplete="on"  placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="password">
        <span class="input-prefix">
          <svg-icon icon-class="lock" />
        </span>
          <el-input name="password" :type="passwordType" @keyup.enter.native="handleLogin" v-model="loginForm.password" autoComplete="on"  placeholder="密码" />
          <span class="show-pwd" @click="showPwd">
        </span>
        </el-form-item>
        <!--<div class="d-flex p-1 mb-3">-->
          <!--<div class="mr-auto"><el-checkbox v-model="checked"><span class="text-muted">一周内免登录</span></el-checkbox></div>-->
          <!--<div><a :href="appConfig.app_forget_path" class="text-primary" target="_blank">忘记密码？</a></div>-->
        <!--</div>-->

        <el-button type="primary" style="width:100%;margin-bottom:30px;" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>

        <!--<div class="d-flex">-->
          <!--<div class="p-1"><a :href="appConfig.app_register_path" class="text-primary" target="_blank">用户免费注册 </a></div>-->
        <!--</div>-->
      </el-form>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Login',
  data () {
    const validateUsername = (rule, value, callback) => {
      if (value.length < 3) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('请输入正确的密码'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '443536',
        password: '123456'
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      checked: false,
      loading: false,
      showDialog: false
    }
  },
  computed: {
    ...mapGetters([
      'appConfig'
    ]),
    getLoginStyle: function () {
      if (this.$store.getters.isMobile) {
        return { width: '328px' }
      } else {
        return { width: '368px' }
      }
    }
  },
  methods: {
    gotoIndex () {
      this.$router.push({
        name: 'kingdom'
      })
    },
    showPwd () {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    LoginFailed () {
      this.$message({
        message: '您输入的帐号密码有误，请重新输入',
        type: 'warning'
      })
      this.$store.dispatch('LoginOut')
      this.loading = false
    },
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('LoginByUsername', this.loginForm).then(res => {
            this.loading = false
            this.$router.push({ path: '/' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
  .lay-login{
    a{
      text-decoration: none;
    }
    .lay-login-container{
      margin-top: 80px;
    }
    .lay-login-header{
      text-align: center;
      height: 44px;
      line-height: 44px;
      .lay-login-header-logo{
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
      }
      .lay-login-header-title{
        font-size: 33px;
        color: rgba(0,0,0,.85);
      }
    }
    .lay-login-header-desc{
      text-align: center;
      font-size: 14px;
      color: rgba(0,0,0,.45);
      margin-top: 12px;
      margin-bottom: 40px;
    }

    .lay-login-form{
      margin: 0 auto;

      .el-form-item{
        position: relative;
        margin: 0 2px 24px;
        .el-input__inner{
          padding-left: 30px;
        }
        .input-prefix{
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 12px;
          z-index: 1;
          .svg-icon{
            color: rgba(0,0,0,.35);
          }
        }
      }
    }
  }
</style>
