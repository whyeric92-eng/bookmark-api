import Register from './Register'
import Login from './Login'

function App() {
  // 临时把两个表单堆在一起看效果，阶段 3 接 react-router 之后会换成真正的页面切换
  return (
    <>
      <Register />
      <Login />
    </>
  )
}

export default App
