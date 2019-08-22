import React, { Component } from 'react'
import './App.css'
import Ueditor from './components/ueditor'

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      latex: `下面是一段latex格式的字符串，生成的图片<br>$$x = {-b \\pm \\sqrt{b^2-4ac} }.$$
    
$$\\ce{N2 + 3H2 <=>T[高温、加压][催化剂] 2NH3}$$`
    }
  }
  handleChange = (content) => {
    this.latex = content
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>
            ueditor demo
          </h1>
          <Ueditor
            content={this.state.latex}
            onChange={ueContent => this.handleChange(ueContent)}
            height={300}
          />
        </header>
      </div>
    )
  }
}

export default App
