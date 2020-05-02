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
      // () => this.changeByUe()，必须这样写，否则ue会自动给传一个contentChange的参数
      this.ue.addListener('contentChange', () => this.changeByUe())
      // 初始化数据，把props的内容传给ueditor
      this.changeByProps()
    })
  }

  componentDidUpdate() {
    this.ue.ready(() => {
      this.changeByProps()
    })
  }

  componentWillUnmount() {
    if (this.ue.uid) {
      this.ue.destroy(this.ueId)
    }
  }

  // 修改ue 内容引发的，更新props
  changeByUe = (isContentChangeByProps) => {
    // props引发的ue变化，不需要ue再去change props
    if (isContentChangeByProps) {
      return
    }

    const { content } = this.props
    const ueContent = this.ue.getContent()
    // 不一致时更改props
    if (typeof content === 'string' && content !== ueContent ) {
      this.props.onChange(ueContent)
    }
  }

  // props引发的更新，修改ue的content
  changeByProps = () => {
    const { content } = this.props
    const ueContent = this.ue.getContent()
    if (typeof content === 'string') {
      const latexs = content.match(REGEX)
      if (latexs) {
        // 如果含有latex公式，转换成ueditor识别的base64图片
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
            latexMap.set(latex, `<img class="kfformula" data-latex='${parsedLatex}' src='${img}' />`);
            return null
          })
          const text = content && content.replace(REGEX, (match) => latexMap.get(match))
          // 这里ue和props都需要把latex公式改为图片<img>标签。但是props的更改放到changeByUe里面做
          this.ue.setContent(text || content)
          this.changeByUe()
        })
      } else if (content !== ueContent) {
        // 这里只需要改ue
        this.ue.setContent(content)
        // 这里主动触发一下，因为某些情况下，第一次打开页面的时候，setContent没有触发contentChange。导致bug
        this.changeByUe(true)
      }
    }
  }

  render() {
    return <script id={this.ueId} name="content" type="text/plain" />
  }
}

export default Ueditor
