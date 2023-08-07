import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="main-div">

    <div class="start-canvas-div">
      <canvas id="start-canvas" height="510" width="360"></canvas>
      <button class="main-start-btn">Begin</button>
    </div>

    <div class="main-canvas-div">
      <canvas id="main-canvas" height="510" width="360"></canvas>
      <div class="button-div">
        <button class="left"><</button>
        <button class="right">></button>
      </div>
      <button class="reset">Continue</button>
      <button class="game-over">Restart</button>
    </div>

  </div>
`
// **** CANVAS SETTINGS **** //
const canvas = document.getElementById("main-canvas")
const ctx = canvas.getContext("2d")
const canvasStart = document.getElementById("start-canvas")
const ctxStart = canvasStart.getContext("2d")
const ballImg = new Image()
ballImg.src = "/assets/ball.png"

// **** GAME = G MAIN SETTINGS **** //
const G = {
  ball: {
    X: 40,
    Y: 400,
    speedX: 5,
    speedY: 5,
    width: 20, 
    height: 20,  
  },
  paddle: {
    X: 100, 
    Y: 40, 
    prevX: 100,
    width: 100, 
    height: 5, 
    color: "purple",
    speed: 10,
    intervalL: undefined,
    intervalR: undefined,
    booleanL: false,
    booleanR: false,
  },
  blocks: {
    firstBlockX: -30,
    firstBlockY: 450,
    newBlockStart: 450, 
    blocksToStart: 24,
    blocksCurrent: {},
    color: "white",
    width: 30, 
    height: 30,
  },
  level: 1,
  multiplyer: 1,
  scoreMultiplyer: 10, 
  hitPaddle: true,
  score: 0,
  lives: 3,
  counter: 0,
  selectors: {
    resetBtn: document.querySelector('.reset'),
    leftBtn: document.querySelector('.left'),
    rightBtn: document.querySelector('.right'),
    restartBtn: document.querySelector('.game-over'),
    beginBtn: document.querySelector('.main-start-btn'),
    startDiv: document.querySelector('.start-canvas-div'),
    mainDiv: document.querySelector('.main-canvas-div'), 
  },     
}

// **** COLLISION TESTER FOR FRONT EDGE OF PADDLE **** //
const testFrontEdge = (ball, paddle) => { 
  return ball.Y <= paddle.Y + paddle.height
  && ball.X + ball.width > paddle.X
  && ball.X < paddle.X + paddle.width
  && ball.Y >= paddle.Y + paddle.height
} 

// **** COLLISION TESTER FOR ALL SIDES OF BLOCKS **** //
let getDistanceEdge = (block, ball, posX, posY) => {
  let vx = (block.X + posX) - (ball.X + G.ball.width / 2)
  let vy = (block.Y + posY) - (ball.Y + G.ball.width / 2)
  return Math.sqrt(vx*vx+vy*vy)
}

// **** MAPS BLOCKS ON START AND WHEN LEVEL CHANGES **** //
const createBlocks = ()=>{
  for(let i = 0; i < G.blocks.blocksToStart; i++){
    G.blocks.firstBlockX += 30
    if(G.blocks.firstBlockX >= canvas.width){
      G.blocks.firstBlockX = 0
      G.blocks.newBlockStart += 30
    }
    G.blocks.blocksCurrent[i] = {
        X: G.blocks.firstBlockX,
        Y: G.blocks.newBlockStart,
        height: G.blocks.height,
        width: G.blocks.width, 
      }
  }
}
window.onload = ()=>createBlocks()


// *********************************BEFORE GAME CANVAS SETTINGS************************************** \\
// ****START GAME LOOP**** //
const firstLoadCanvas = ()=>{
  ctxStart.clearRect(0, 0, canvas.width, canvas.height)
  drawStartBall()
  drawStartPaddle()
  printStartText()
}

// ****CONTROLS START BALL SETTINGS**** //
const drawStartBall = ()=>{
  if (testFrontEdge(G.ball, G.paddle)){
    G.ball.speedY = -G.ball.speedY
  }
  if (G.ball.Y >= (canvas.height - G.ball.width)) {
    G.ball.speedY = -G.ball.speedY
  }
  if (G.ball.X >= (canvas.width - G.ball.height) || G.ball.X <= 0) {    
      G.ball.speedX = -G.ball.speedX
  }
  G.ball.X = G.ball.X - G.ball.speedX
  G.ball.Y = G.ball.Y + G.ball.speedY
  G.paddle.X = G.ball.X - G.paddle.width/2
  ctxStart.drawImage(ballImg, G.ball.X, G.ball.Y, G.ball.width, G.ball.height)
}

// ****CONTROLS START PADDLE SETTINGS**** //
const drawStartPaddle = ()=>{
  if(G.paddle.X <= 10){
    G.paddle.X = 10
  }
  if(G.paddle.X >= canvas.width - G.paddle.width - 10){
    G.paddle.X = canvas.width - G.paddle.width - 10
  }
  ctxStart.fillStyle = 'lightgreen'
  ctxStart.fillRect(G.paddle.X, G.paddle.Y, G.paddle.width, G.paddle.height)
}

// ****BEGIN GAME BTN SETTINGS**** //
G.selectors.beginBtn.addEventListener('click', ()=>{
  G.selectors.startDiv.style.display = 'none'
  G.selectors.mainDiv.style.display = 'block'
  clearInterval(startGameLoop) 
  G.ball.X = G.blocks.firstBlockX - 100
  G.ball.Y = G.blocks.firstBlockY - 100
  mainGameLooop = setInterval(startCanvas, 40)  
})

// ****START CANVAS TEXT SETTINGS**** //
const printStartText = ()=>{
  ctxStart.fillStyle = "orange"
  ctxStart.textAlign = "center"
  ctxStart.font = "bold 20px Comic Sans MS"
  ctxStart.fillText('BREAKOUT', canvas.width/2, 150)
  ctxStart.font = "20px Arial"
  ctxStart.fillText('Controls:', canvas.width/2, 220)
  ctxStart.fillText('Left and Right arrows on keyboard', canvas.width/2, 250)
  ctxStart.fillText('or Left and Right buttons below', canvas.width/2, 280)
  ctxStart.fillText('when game starts', canvas.width/2, 310)
  ctxStart.fillText('Press begin to start', canvas.width/2, 400)
}
// **************************************************************************************************** \\



// *********************************GAME PLAY CANVAS SETTINGS****************************************** \\
// **** MAIN GAME LOOP **** //
const startCanvas = () => {    
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBall()
  drawPaddle()
  drawBlocks()
  changeLevel()
  printLevel()
}

// **** CONTROLS BALL SETINGS **** //
const drawBall = ()=>{
  G.paddle.prevX = G.paddle.X
  if (testFrontEdge(G.ball, G.paddle)){
    G.hitPaddle = true  
    G.multiplyer = 1
    G.scoreMultiplyer = 10 
    G.ball.speedY = -G.ball.speedY

    // if(G.paddle.X > G.paddle.prevX){
    //   G.ball.speedX = -G.ball.speedX
    // }
    // if(G.paddle.X < G.paddle.prevX){
    //   G.ball.speedX = -G.ball.speedX
    // }

  }
  if (G.ball.Y >= (canvas.height - G.ball.width)) {
      G.ball.speedY = -G.ball.speedY
  }
  if (G.ball.X >= (canvas.width - G.ball.height) || G.ball.X <= 0) {    
      G.ball.speedX = -G.ball.speedX
  }
  if(G.ball.Y <= -G.ball.height){
    clearInterval(mainGameLooop)
    if(G.lives < 1){
      G.selectors.resetBtn.style.display = 'none'
      G.selectors.leftBtn.style.display = 'none'
      G.selectors.rightBtn.style.display = 'none'
      G.selectors.restartBtn.style.display = 'block'
      ctx.fillStyle = 'red'
      ctx.fillText('GAME OVER', canvas.width/2, 80)
      return true
    } else {
      G.selectors.resetBtn.style.display = 'block'
      G.selectors.leftBtn.style.display = 'none'
      G.selectors.rightBtn.style.display = 'none'
      ctx.fillStyle = 'red'
      ctx.fillText('BALL OUT', canvas.width/2, 80)
      return true
    }
  }
  G.ball.X = G.ball.X - G.ball.speedX
  G.ball.Y = G.ball.Y + G.ball.speedY
  ctx.drawImage(ballImg, G.ball.X, G.ball.Y, G.ball.width, G.ball.height)
}

// **** CONTROLS PADDLE SETTINGS **** //
const drawPaddle = ()=>{
  if(G.paddle.X <= 10){
    G.paddle.X = 10
  }
  if(G.paddle.X >= canvas.width - G.paddle.width - 10){
    G.paddle.X = canvas.width - G.paddle.width - 10
  }
  if (G.paddle.booleanL === true){
    G.paddle.X -= 10
  }
  if (G.paddle.booleanR === true){
    G.paddle.X += 10
  }
  ctx.fillStyle = G.paddle.color
  ctx.fillRect(G.paddle.X, G.paddle.Y, G.paddle.width, G.paddle.height)
}

// **** CONTROLS BLOCK SETTINGS **** //
const drawBlocks = ()=>{
  ctx.strokeStyle = G.blocks.color
  for(let block in G.blocks.blocksCurrent){
    ctx.strokeRect(
      G.blocks.blocksCurrent[block].X, 
      G.blocks.blocksCurrent[block].Y, 
      G.blocks.blocksCurrent[block].width, 
      G.blocks.blocksCurrent[block].height
    ) 
    if(getDistanceEdge(G.blocks.blocksCurrent[block], G.ball, G.blocks.width / 2, 0) <= 20){ //top
      changeScore()
      G.hitPaddle = false
      G.ball.speedY = -G.ball.speedY
      delete G.blocks.blocksCurrent[block]
    }
    else if(getDistanceEdge(G.blocks.blocksCurrent[block], G.ball, 0, G.blocks.height / 2) <= 20){ //left
      changeScore()
      G.hitPaddle = false
      G.ball.speedX = -G.ball.speedX
      delete G.blocks.blocksCurrent[block]
    }
    else if(getDistanceEdge(G.blocks.blocksCurrent[block], G.ball, G.blocks.width, G.blocks.height / 2) <= 20){ //right
      changeScore()
      G.hitPaddle = false
      G.ball.speedX = -G.ball.speedX
      delete G.blocks.blocksCurrent[block]
    }
    else if(getDistanceEdge(G.blocks.blocksCurrent[block], G.ball, G.blocks.width / 2, G.blocks.height) <= 20){ //bottom
      changeScore()
      G.hitPaddle = false
      G.ball.speedY = -G.ball.speedY
      delete G.blocks.blocksCurrent[block]
    }
  }
}

// **** CONTROLS LEVEL **** //
const changeLevel = ()=>{
  if(Object.keys(G.blocks.blocksCurrent).length <= 0 && G.ball.Y < G.blocks.newBlockStart - 150){
    G.blocks.firstBlockX = -30
    G.blocks.blocksToStart += 12
    G.blocks.firstBlockY -= 30
    if(G.blocks.firstBlockY <= 100){
      G.blocks.firstBlockY = 100
    }
    G.blocks.newBlockStart = G.blocks.firstBlockY
    G.blocks.color = `rgb(
      ${Math.floor(Math.random() * 255) + 100}, 
      ${Math.floor(Math.random() * 255) + 100}, 
      ${Math.floor(Math.random() * 255) + 100}
    )`
    G.paddle.color = `rgb(
      ${Math.floor(Math.random() * 255) + 100}, 
      ${Math.floor(Math.random() * 255) + 100}, 
      ${Math.floor(Math.random() * 255) + 100}
    )`
    G.level++
    createBlocks()
  }
}

// **** CONTROLS TEXT ON CANVAS **** //
const printLevel = ()=>{
  ctx.font = "italic 17px Arial"
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.fillText(`Level: ${G.level}`, 50, 20)
  ctx.fillText(`Score: ${G.score}`, canvas.width/2, 20)
  ctx.fillText(`Lives: ${G.lives}`, 310, 20)
}

// **** SCORE CONTROL **** //
const changeScore = ()=>{
  console.log(G.hitPaddle)
  if(!G.hitPaddle){
    G.scoreMultiplyer += 10
    G.multiplyer++
    G.score += G.scoreMultiplyer
    for(let i = 0; i < 20; i++){
      ctx.fillStyle = `rgb(
        ${Math.floor(Math.random() * 255) + 100}, 
        ${Math.floor(Math.random() * 255) + 100}, 
        ${Math.floor(Math.random() * 255) + 100}
      )`
      ctx.textAlign = 'center'
      ctx.fillText(`x${G.multiplyer}`, G.ball.X, G.ball.Y - 20)
      ctx.textAlign = 'center'
      ctx.fillText(`x${G.multiplyer}`, G.ball.X, G.ball.Y - 20)
    }
  } else {
    G.score += 10
  }
}
// ***************************************************************************************************** \\

// ****CONTROL FOR RESET BTN**** //
G.selectors.resetBtn.addEventListener('click', ()=>{
    G.selectors.resetBtn.style.display = 'none'
    G.selectors.leftBtn.style.display = 'inline'
    G.selectors.rightBtn.style.display = 'inline'
    G.lives--
    G.ball.X = G.blocks.firstBlockX - 100
    G.ball.Y = G.blocks.firstBlockY - 100
    mainGameLooop = setInterval(startCanvas, 40)
})

// ****CONTROL FOR RESTART GAME OVER BTN**** //
G.selectors.restartBtn.addEventListener('click', ()=>{
  window.location.reload()
})

// **** MAIN LOOP VARIABLES **** //
let mainGameLooop = undefined
let startGameLoop = setInterval(firstLoadCanvas, 40)

// **** LISTENERS FOR MOUSE AND TOUCH **** //
document.querySelector('.left').addEventListener('mousedown', ()=>G.paddle.booleanL = true)
document.querySelector('.left').addEventListener('mouseup', ()=>G.paddle.booleanL = false)
document.querySelector('.right').addEventListener('mousedown', ()=>G.paddle.booleanR = true)
document.querySelector('.right').addEventListener('mouseup', ()=>G.paddle.booleanR = false)
document.querySelector('.left').addEventListener('touchstart', ()=>G.paddle.booleanL = true)
document.querySelector('.left').addEventListener('touchend', ()=>G.paddle.booleanL = false)
document.querySelector('.right').addEventListener('touchstart', ()=>G.paddle.booleanR = true)
document.querySelector('.right').addEventListener('touchend', ()=>G.paddle.booleanR = false)

// **** KEYBOAD CONTROL **** //
const handleKeydown = (event)=>{
  const key = event.key;
  if (key === "ArrowLeft") {
    G.paddle.booleanL = true
  } else if (key === "ArrowRight") {
    G.paddle.booleanR = true
  }
}
const handleKeyUp = ()=>{
    G.paddle.booleanL = false
    G.paddle.booleanR = false
}
document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyUp);