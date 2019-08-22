// 传递 props，设置编辑器的内容
// 在调用该组件的父组件通过 ref 取得子组件，调用子组件的 getContent 方法，取编辑器的值

import React from 'react'
import PropTypes from 'prop-types'

let ueIndex = 0
const REGEX = /\\\(.*?\\\)|\$\$.*?\$\$|\$[^$].*?[^$]\$|\\\[.*?\\\]/g;
const REGEX2 = /\$[^$].*?[^$]\$/g

class Ueditor extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  }

  static defaultProps = {
    content: '',
    width: 1000,
    height: 320,
  }

  constructor(props) {
    super(props)

    this.ueId = `ueditor${ueIndex}`
    this.ue = null
    this.isContentChangeByProps = false

    ueIndex += 1
  }

  componentDidMount() {
    this.ue = window.UE.getEditor(this.ueId, {
      initialFrameWidth: this.props.width,
      initialFrameHeight: this.props.height,
    })
    this.ue.ready(() => {
      this.initEditor()
      const content = this.ue.getContent()
      if (typeof this.props.content === 'string' && this.props.content !== content) {
        this.isContentChangeByProps = true
        this.latex2Img(this.props.content)
      }
    })
  }

  componentWillUnmount() {
    if (this.ue.uid) {
      this.ue.destroy(this.ueId)
    }
  }

  initEditor() {
    this.ue.addListener('contentChange', () => {
      // 由传入 props 引起的 contentChange，不需要重复通知到父组件
      const uContent = this.ue.getContent()
      if (this.isContentChangeByProps) {
        this.isContentChangeByProps = false
      } else {
        this.props.onChange(uContent)
      }
    })
  }

  // latex公式转换成ueditor识别的base64图片
  latex2Img = content => {
    const latexs = content.match(REGEX)
    if (latexs) {
      const latexMap = new Map()
      window.drawLaTex(content, base64Imgs => {
        base64Imgs.map((img, index) => {
          const latex = latexs[index]
          let parsedLatex = null
          // 如果latex以一个$开头和结束，去掉该$;否则去掉两个$,或\(
          if (REGEX2.test(latex)) {
            parsedLatex = latex.slice(1, -1)
          } else {
            parsedLatex = latex.slice(2, -2)
          }
          latexMap.set(latex, `<img class="kfformula" src='${img}' data-latex='${parsedLatex}' />`)
          return null
        })
        const text = content && content.replace(REGEX, (match) => latexMap.get(match))
        this.ue.setContent(text || content)
      })
    }
    this.ue.setContent(content)
  }

  render() {
    return <script id={this.ueId} name="content" type="text/plain" />
  }
}

export default Ueditor
