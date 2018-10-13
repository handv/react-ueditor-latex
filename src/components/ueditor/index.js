// 传递 props，设置编辑器的内容
// 在调用该组件的父组件通过 ref 取得子组件，调用子组件的 getContent 方法，取编辑器的值

import React from 'react'
import PropTypes from 'prop-types'

let ueIndex = 0

class Ueditor extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number
  }

  static defaultProps = {
    content: '',
    width: 1000,
    height: 320
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
      initialFrameHeight: this.props.height
    })
    this.ue.ready(() => {
      this.initEditor()
      if (
        typeof this.props.content === 'string' &&
        this.props.content !== this.ue.getContent()
      ) {
        this.isContentChangeByProps = true
        this.latex2Img(this.props.content)
      }
    })
  }

  componentWillReceiveProps(nextProps) {
    this.ue.ready(() => {
      // 后端可能会直接返回个 null 等，引发错误
      // 只有 props 值与当前值不一样时才需要更新
      if (
        typeof nextProps.content === 'string' &&
        nextProps.content !== this.ue.getContent()
      ) {
        // setContent就会重新渲染ueditor
        this.isContentChangeByProps = true
        this.ue.setContent(nextProps.content)
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
      if (this.isContentChangeByProps) {
        this.isContentChangeByProps = false
      } else {
        this.props.onChange(this.ue.getContent())
      }
    })
  }

  // latex公式转换成ueditor识别的base64图片
  latex2Img = content => {
    const latex = content.match(/\\\(.*?\\\)|\$\$.*?\$\$/g)
    if (latex) {
      const latexMap = new Map()
      window.drawLaTex(content, base64Imgs => {
        base64Imgs.map((img, index) => {
          latexMap.set(
            latex[index],
            `<img class="kfformula" src='${img}' data-latex='${latex[
              index
            ].slice(2, -2)}'/>`
          )
          return null
        })
        const text =
          content &&
          content.replace(/\\\(.*?\\\)|\$\$.*?\$\$/g, match =>
            latexMap.get(match)
          )
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
