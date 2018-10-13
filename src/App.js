import React, { Component } from 'react'
import './App.css'
import Ueditor from './components/ueditor'

class App extends Component {
  render() {
    const latex = '下面是一段latex格式的字符串，生成的图片<br>$$x = {-b \\pm \\sqrt{b^2-4ac} }.$$'
    return (
      <div className="App">
        <header className="App-header">
          <h1>
            ueditor demo
          </h1>
          <Ueditor
            content={latex}
            onChange={ueContent => null}
            height={300}
          />
        </header>
      </div>
    )
  }
}

export default App
