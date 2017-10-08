function CreateGame(canvas, width, height, lines, cols,countdown) {
  this.initData(canvas, width, height, lines, cols,countdown)
  this.CreateArea()
  this.CreateGrid()
  this.drawGrid()
  this.bindCanvasEvent()
  this.bindToggleEvent()
  this.bindAgainEvent()
}
CreateGame.prototype.initData = function (canvas, width, height, lines, cols,countdown) {
  this.vw = window.visualViewport.width / 100
  this.vh = window.visualViewport.height / 100
  this.canvas = canvas
  this.width = width * this.vw
  this.height = height * this.vh
  this.lines = lines
  this.cols = cols
  this.nodeSum = lines*cols
  this.nodeWidth = Math.floor(this.width / this.cols)
  this.nodeHeight = Math.floor(this.height / this.lines * 10) / 10
  this.preNode = undefined;
  this.linePoints = []
  this.countdown = countdown
}
CreateGame.prototype.CreateArea = function () {
  this.canvas.width = this.width
  this.canvas.height = this.height
}
CreateGame.prototype.CreateGrid = function () {
  this.Grid = new Array()
  for (let i = 0; i < this.lines; i++) {
    this.Grid[i] = new Array()
    for (let j = 0; j < this.cols; j++) {
      let num = Math.floor(Math.random() * 15 + 1)
      let src = (i === 0 || i === this.lines - 1 || j === 0 || j === this.cols - 1) ? undefined : `./img/${num}.png`
      this.Grid[i][j] = new CreateNode(this.nodeWidth * j, this.nodeHeight * i, src, this.nodeWidth, this.nodeHeight)
    }
  }
}
CreateGame.prototype.drawGrid = function () {
  this.context = this.canvas.getContext('2d');
  for (let i = 0; i < this.lines; i++) {
    for (let j = 0; j < this.cols; j++) {
      let img = new Image()
      let node = this.Grid[i][j]
      img.src = node.src
      img.onload = () => {
        this.context.drawImage(img, node.x, node.y, node.width, node.height)
      }
    }
  }
}
CreateGame.prototype.bindCanvasEvent = function () {
  this.canvas.addEventListener('click', (e) => {
    let x = e.pageX - this.canvas.offsetLeft
    let y = e.pageY - this.canvas.offsetTop
    let i = Math.floor(y / this.nodeHeight)
    let j = Math.floor(x / this.nodeWidth)
    let node = this.Grid[i][j]
    if (node.src === undefined) return
    if (node.active === true) {
      this.clearRect(node)
      node.active = false
      this.preNode = undefined
    } else {
      this.context.strokeStyle = 'red'
      this.context.strokeRect(node.x, node.y, node.width, node.height)
      if (this.preNode) {
        //判断是否可消除
        this.preNode.active = false
        node.active = false
        if (this.preNode.src === node.src && this.isConnected(node, this.preNode)) {
          node.src = undefined
          this.preNode.src = undefined
          //画线
          this.context.beginPath()
          this.context.moveTo(this.linePoints[0].midX,this.linePoints[0].midY)
          for(let n = 1;n<this.linePoints.length;n++){
            this.context.lineTo(this.linePoints[n].midX,this.linePoints[n].midY)
          }
          this.context.stroke()
          this.countdown.classList.remove('animation')
          setTimeout(()=>{
            for(let clearN = 0; clearN<this.linePoints.length-1;clearN++){
              let startNode = (this.linePoints[clearN].x - this.linePoints[clearN+1].x)>0||(this.linePoints[clearN].y - this.linePoints[clearN+1].y)>0?this.linePoints[clearN+1]:this.linePoints[clearN]
              let endNode = (this.linePoints[clearN].x - this.linePoints[clearN+1].x)>0||(this.linePoints[clearN].y - this.linePoints[clearN+1].y)>0?this.linePoints[clearN]:this.linePoints[clearN+1]
              this.context.clearRect(startNode.x - 1, startNode.y - 1, endNode.x - startNode.x + endNode.width + 2, endNode.y - startNode.y + endNode.height + 2)
            }
            this.linePoints = []
            this.countdown.classList.add('animation')
          },300)
        } else {
          this.clearRect(node)
          this.clearRect(this.preNode)
          this.nodeSum -= 2
          if(this.nodeSum == 0){
            let dialog = document.getElementsByClassName('dialog')[0]
            dialog.children[0].innerText = '通关成功！'
            dialog.style.display = 'block'
          }
        }
        this.preNode = undefined
      } else {
        node.active = true
        this.preNode = node
      }
    }
  })
  this.countdown.addEventListener('animationend',()=>{
    let dialog = document.getElementsByClassName('dialog')[0]
    dialog.style.display = 'block'
  })
}
CreateGame.prototype.isConnected = function (aNode, bNode) {
  if (this.hoverConnected(aNode, bNode)){
    this.linePoints.push(aNode,bNode)
    return true
  } 
  if (this.verticalConnected(aNode, bNode)){
    this.linePoints.push(aNode,bNode)
    return true
  } 
  if (this.angleConnected(aNode, bNode)) return true
  if (this.twoAngleConnected(aNode, bNode)) return true  
  return false
}
CreateGame.prototype.isEmpty = function (node) {
  return node.src === undefined ? true : false
}
CreateGame.prototype.hoverConnected = function (aNode, bNode) {
  if (aNode.y === bNode.y) {
    let minJ = Math.floor(aNode.x / aNode.width) > Math.floor(bNode.x / bNode.width) ? Math.floor(bNode.x / bNode.width) : Math.floor(aNode.x / aNode.width);
    let maxJ = Math.floor(aNode.x / aNode.width) > Math.floor(bNode.x / bNode.width) ? Math.floor(aNode.x / aNode.width) : Math.floor(bNode.x / bNode.width);
    let i = Math.floor(aNode.y / aNode.height)
    for (var n = minJ + 1; n < maxJ; n++) {
      if (this.Grid[i][n].src !== undefined) return false
    }
    return true
  } else {
    return false
  }
}
CreateGame.prototype.verticalConnected = function (aNode, bNode) {
  if (aNode.x === bNode.x) {
    let minI = Math.floor(aNode.y / aNode.height) > Math.floor(bNode.y / bNode.height) ? Math.floor(bNode.y / bNode.height) : Math.floor(aNode.y / aNode.height);
    let maxI = Math.floor(aNode.y / aNode.height) > Math.floor(bNode.y / bNode.height) ? Math.floor(aNode.y / aNode.height) : Math.floor(bNode.y / bNode.height);
    let j = Math.floor(aNode.x / aNode.width)
    for (var n = minI + 1; n < maxI; n++) {
      if (this.Grid[n][j].src !== undefined) return false
    }
    return true
  } else {
    return false
  }
}
CreateGame.prototype.angleConnected = function (aNode, bNode) {
  let point1 = this.Grid[Math.floor(bNode.y / bNode.height)][Math.floor(aNode.x / aNode.width)]
  let point2 = this.Grid[Math.floor(aNode.y / aNode.height)][Math.floor(bNode.x / bNode.width)]
  if (point1.src === undefined&&this.verticalConnected(aNode, point1) && this.hoverConnected(point1, bNode)){
    this.linePoints.push(aNode,point1,bNode)
    return true
  } 
  if (point2.src === undefined&&this.verticalConnected(bNode, point2) && this.hoverConnected(point2, aNode)){
    this.linePoints.push(aNode,point2,bNode)    
    return true
  } 
  return false
}
CreateGame.prototype.twoAngleConnected = function (aNode, bNode) {
  let aI = Math.round(aNode.y / aNode.height),
      aJ = Math.round(aNode.x / aNode.width),
      bI = Math.round(bNode.y / bNode.height),
      bJ = Math.round(bNode.x / bNode.width),
      Arr1 = [],
      Arr2 = []
  for(let n = aI-1;n>=0&&this.Grid[n][aJ].src === undefined;n--){
    Arr1.push(this.Grid[n][aJ])
  }
  for(let n = aI+1;n<this.lines&&this.Grid[n][aJ].src === undefined;n++){
    Arr1.push(this.Grid[n][aJ])
  }
  for(let n = aJ-1;n>=0&&this.Grid[aI][n].src === undefined;n--){
    Arr1.push(this.Grid[aI][n])
  }
  for(let n = aJ+1;n<this.cols&&this.Grid[aI][n].src === undefined;n++){
    Arr1.push(this.Grid[aI][n])
  }
  for(let n = bI-1;n>=0&&this.Grid[n][bJ].src === undefined;n--){
    Arr2.push(this.Grid[n][bJ])
  }
  for(let n = bI+1;n<this.lines&&this.Grid[n][bJ].src === undefined;n++){
    Arr2.push(this.Grid[n][bJ])
  }
  for(let n = bJ-1;n>=0&&this.Grid[bI][n].src === undefined;n--){
    Arr2.push(this.Grid[bI][n])
  }
  for(let n = bJ+1;n<this.cols&&this.Grid[bI][n].src === undefined;n++){
    Arr2.push(this.Grid[bI][n])
  }
  for(let nArr1 = 0;nArr1<Arr1.length;nArr1++){
    if(this.angleConnected(Arr1[nArr1],bNode)){
      this.linePoints.unshift(aNode)
      return true
    } 
  }
  for(let nArr2 = 0;nArr2<Arr2.length;nArr2++){
    if(this.angleConnected(Arr2[nArr2],aNode)){
      this.linePoints.unshift(bNode)
      return true
    } 
  }
  return false
}
CreateGame.prototype.clearRect = function (node) {
  this.context.clearRect(node.x - 1, node.y - 1, 2, node.height + 2)
  this.context.clearRect(node.x - 1, node.y - 1, node.width + 2, 2)
  this.context.clearRect(node.x - 1 + node.width, node.y - 1, 2, node.height + 2)
  this.context.clearRect(node.x - 1, node.y + node.height + -1, node.width + 2, 2)
}
CreateGame.prototype.bindToggleEvent = function(){
  let toggleBtn = document.getElementById('toggle-btn')
  let mask = document.getElementsByClassName('mask')[0]
  toggleBtn.addEventListener('click',()=>{
    toggleBtn.classList.toggle('paused')
    if(toggleBtn.classList.contains('paused')){
      toggleBtn.style.backgroundImage = 'url("./img/bofang.png")'
      this.countdown.style.animationPlayState = 'paused'
      mask.style.display = 'block'
    }else{  
      toggleBtn.style.backgroundImage = 'url("./img/zangting.png")'
      this.countdown.style.animationPlayState = 'running'
      mask.style.display = 'none'      
    }
  })
}
CreateGame.prototype.bindAgainEvent = function(){
  let againBtn = document.getElementsByClassName('again-btn')[0]
  againBtn.addEventListener('click',()=>{
     location.reload()
  })
}
function CreateNode(x, y, src, width, height, active) {
  this.x = x
  this.y = y
  this.src = src
  this.width = width
  this.height = height
  this.active = active || false
  this.midX = x + width/2
  this.midY = y + height/2
}




let canvas = document.getElementById('game-area')
let countdown = document.getElementById('countdown').children[0]
new CreateGame(canvas, 80, 75, 10, 18,countdown)