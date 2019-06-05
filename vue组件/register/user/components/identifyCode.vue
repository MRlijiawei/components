<template>
  <div><input type="button"  @click="createCode"  class="verification" v-model="checkCode"/></div>
</template>

<script>
export default {
  data () {
    return {
      // 配置项：长度、范围
      codeLength: 4,
      codeRandom: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      checkCode: ''
    }
  },
  methods: {
    createCode () {
      let code = ''
      let index
      let codeSlice
      for (let i = 0; i < this.codeLength; i++) {
        // 取得随机数的索引（0~35）
        index = Math.floor(Math.random() * 36)
        // 根据索引取得随机数加到code上
        if (Math.random() * 2 > 1) {
          codeSlice = this.codeRandom[index].toLowerCase()
        } else {
          codeSlice = this.codeRandom[index]
        }
        code += codeSlice
      }
      // 把code值赋给验证码
      this.checkCode = code
    }
  },
  mounted () {
    this.createCode()
  }
}
</script>
<style lang='scss' scoped>
.idtc_input{
        font-family: 'Exo 2', sans-serif;
    border: 1px solid #fff;
    color: #fff;
    outline: none;
    border-radius: 12px;
    letter-spacing: 1px;
    font-size: 17px;
    font-weight: normal;
        background-color: rgba(82, 56, 76, 0.15);
        padding: 5px 0 5px 10px;
    margin-left: 30px;
    height: 30px;
    margin-top: 25px;
    border: 1px solid #e6e6e6;
}
.verification{
    border-radius: 12px;
    width:100%;
    letter-spacing:10px;
    /* margin-left: 50px; */
    height: 40px;
    /* transform: translate(-15px,0); */
    background: linear-gradient(to top right, #a5a5a2 0%, #f5f5f5 55%, #cecdc0 100%);
    cursor: pointer;
}
.captcha{
    height: 50px;
    text-align: justify;
}
</style>
