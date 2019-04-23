<template>
  <div class="video-kingdom">
    <video
    id="kingdom-video"
    :src="videoObj.filePreseeUrl"
    preload
    controls>
    </video>
    <span class="play-tips" v-if="playFromBegin">您上次播放到{{lastTime}}，点击 <a @click="setCurrentTime(0)" class="play-from-begin">从头播放</a></span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 视频组件
      videoAss: {},
      playFromBegin: false,
      lastTime: '',
      timeStart: 0,
      timeEnd: 0,
      playTime: 0
    }
  },
  props: {
    playObj: Object,
    videoObj: Object
  },
  methods: {
    setCurrentTime(time) {
      this.videoAss.currentTime = time
      this.playFromBegin = false
    },
    videoPlay() {
      console.log('play')
      this.videoAss.play()
      this.timeStart = Number(new Date())
    },
    setPlayFromBegin(bol) {
      this.playFromBegin = bol
    },
    // 播放过程中（用来校验是否每一帧都播放了，暂时没有好的方案）
    onTimeUpdate() {
      // 定时发送保存学时避免数据丢失
      console.log('timeUpdate')
      // 一秒一次？？--看着像一秒3次
      this.playTime++
      if (this.playTime > 360) {
        this.playPause()
        this.playTime = 0
      }
      // 如果视频播放中卡了，当前情况如果自动情况下可以保证学时的准确性，如果是手动点触发下发，可能会有无效时长吧？--实测这里卡顿时不会触发
      // 解决方案：此处将开始时间置为有效，提交时将开始时间置为无效，卡顿加载时（onwaiting）触发一次提交（如果是网络GG了那就没辙了）
      if (this.timeStart === 0) this.timeStart = Number(new Date())
    },
    // 视频暂停
    playPause() {
      console.log('pause')
      if (this.timeStart === 0) return
      this.timeEnd = Number(new Date())
      const studySecond = Math.floor((this.timeEnd - this.timeStart) / 1000)
      // 将学时信息响应
      this.$emit('videoOperate', studySecond, this.videoAss.currentTime)
      // 置0避免卡顿时无效时长
      this.timeStart = 0
    },
    // 校验和设置当前播放时间，及控制从头播放
    checkPlayTime() {
      if (this.playObj && this.playObj.lastTimeSign) {
        // 控制单位--秒
        // const playSecond = Number(this.playObj.lastTimeSign)
        // 暂时模拟
        const playSecond = 63
        if (playSecond && playSecond > 0) {
          this.setCurrentTime(playSecond)
          this.lastTime = this.sToHMS(playSecond)
          this.setPlayFromBegin(true)
          // 5秒后隐藏
          setTimeout(() => {
            this.setPlayFromBegin(false)
          }, 5000)
        }
      } else {
        // 第一次
        this.playObj = {
          contentId: this.videoObj.id,
          // 视频长度？？？？？？？？？？？？？？？？？？？？？？？
          userId: 'string', // 获取用户id？？？？？？？？？？？
          totalDuration: 100,
          learnDuration: 0,
          // 统一使用秒（兼容接口，使用string）
          lastTimeSign: '0',
          effectiveDuration: 0,
          learnRate: 0
        }
      }
    },
    // 秒转时分秒
    sToHMS(playSecond) {
      return this.checkZero(Math.floor(playSecond / 3600)) + ':' +
        this.checkZero(Math.floor(playSecond % 3600 / 60)) + ':' +
        this.checkZero(Math.floor(playSecond % 60))
    },
    // 补0
    checkZero(num) {
      return Number(num) > 9 ? num : '0' + num
    }
  },
  mounted() {
    // id避免冲突?
    this.videoAss = document.getElementById('kingdom-video')
    this.checkPlayTime()
    this.videoPlay()
    // 监听时间更新，计算有效学习时长
    this.videoAss.addEventListener('timeupdate', () => { this.onTimeUpdate() })
    this.videoAss.onpause = () => { this.playPause() }
    this.videoAss.onplay = () => { this.timeStart = Number(new Date()) }
    this.videoAss.onended = () => { this.playPause() }
    // 添加卡顿事件
    this.videoAss.onwaiting = () => { this.playPause() }
    // 页面关闭、刷新
    window.onbeforeunload = (e) => {
      alert('===onbeforeunload===')
      if ((event.clientX > document.body.clientWidth && event.clientY < 0) || event.altKey) {
        alert('你关闭了浏览器')
      } else {
        alert('你正在刷新页面')
      }
      this.playPause()
      // e.returnValue = '确认关闭'
      return '确认关闭'
    }
    /* window.onunload = (e) => {
      alert('===onbeforeunload===')
      if ((event.clientX > document.body.clientWidth && event.clientY < 0) || event.altKey) {
        alert('你关闭了浏览器')
      } else {
        alert('你正在刷新页面')
      }
      this.playPause()
      e.returnValue = '确认关闭'
      return '确认关闭'
    } */
  },
  destroyed() {

  },
  // 两者用一个就行
  beforeDestroy() {
    // 销毁、切换时自动提交
    this.playPause()
  }
}
</script>
<style lang='scss' scoped>
.video-kingdom {
  width: 100%;
  height: 100%;
  video {
    width: 100%;
    height: 100%;
  }
  .play-from-begin {
    cursor: pointer;
    text-decoration-line: none;
    color: #ff8547;
  }
  .play-tips {
    position: relative;
    bottom: 50px;
    left: 37px;
  }
}
</style>
