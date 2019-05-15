import fileService from '@/api/file'

const fileTypes = {
  videoSufs: ['mp4', 'flv', '3gp', 'mvb', 'rmvb'],
  docSufs: ['doc', 'docx', 'wps', 'txt', 'pdf', 'ppt', 'xls', 'xlsx'],
  // mp3?
  imgSufs: ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'ps'],
  audioSufs: ['mp3', 'wav', 'flac', 'aac', 'ape'],
  fileDownload: (id, fileName, fileType) => {
    fileService.downloadFile({
      id: id
    }).then(blob => {
      blob = blob.data
      // Blob()的第一个参数必须为数组，即使只有一个字符串也必须用数组装起来
      const _blob = new Blob([blob], { type: fileType })
      //  window.navigator.msSaveBlob：以本地方式保存文件
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(blob, fileName)
      } else {
        // 创建新的URL表示指定的File对象或者Blob对象
        const URL = window.URL || window.webkitURL
        const objectUrl = URL.createObjectURL(_blob)
        if (fileName) {
          // 创建a标签用于跳转至下载链接
          var a = document.createElement('a')
          // download：指示浏览器下载URL而不是导航到它，也可设置下载文件的名称
          if (typeof a.download === 'undefined') {
            // window.location：获得当前页面的地址 (URL)，并把浏览器重定向到新的页面
            window.location = objectUrl
          } else {
            // href属性指定下载链接
            a.href = objectUrl
            // dowload属性指定文件名
            a.download = fileName
            // 将a标签插入body中
            document.body.appendChild(a)
            // click()事件触发下载
            a.click()
            // 去除a标签，以免影响其他操作
            a.remove()
          }
        } else {
          window.location = objectUrl
        }
        // 将URL释放
        URL.revokeObjectURL(objectUrl)
      }
    })
  }
}

export default fileTypes
