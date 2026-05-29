let firstImg = false
let secondImg = false
let descriptors = { desc1: null, desc2: null, desc3: null }

const imageUpload1 = document.getElementById('imageUpload1')
const imageUpload2 = document.getElementById('imageUpload2')
const imageUpload3 = document.getElementById('imageUpload3')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  new Promise(resolve => setTimeout(resolve, 2000))
]).then(start)

function updateResult() {
  const distance1 = faceapi.round(faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2))
  const distance2 = faceapi.round(faceapi.euclideanDistance(descriptors.desc1, descriptors.desc3))
  const text1 = Math.round(100 - (100 * distance1)) + '%'
  const text2 = Math.round(100 - (100 * distance2)) + '%'
  const green = 'rgba(0, 255, 0, 0.25)'
  const red = 'rgba(255, 0, 0, 0.25)'

  document.getElementById('distance1').innerHTML = text1
  document.getElementById('distance2').innerHTML = text2

  const [color1, color2] = distance1 <= distance2 ? [green, red] : [red, green]
  document.getElementById('distance1').style.backgroundColor = color1
  document.getElementById('distance2').style.backgroundColor = color2
}

function drawBoxes(canvas, detections, selectedIndex = -1) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  detections.forEach((det, i) => {
    const { x, y, width, height } = det.detection.box
    const selected = i === selectedIndex
    const color = selected ? '#00ff00' : '#ffffff'

    ctx.strokeStyle = color
    ctx.lineWidth = selected ? 3 : 2
    ctx.strokeRect(x, y, width, height)
  })
}

function setupDropZone(el, onFile) {
  el.addEventListener('dragover', (e) => {
    e.preventDefault()
    el.classList.add('drag-over')
  })
  el.addEventListener('dragleave', (e) => {
    if (!el.contains(e.relatedTarget)) {
      el.classList.remove('drag-over')
    }
  })
  el.addEventListener('drop', (e) => {
    e.preventDefault()
    el.classList.remove('drag-over')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  })
}

async function processImage(image, container, descKey, onComplete) {
  const oldCanvas = container.querySelector('canvas')
  if (oldCanvas) oldCanvas.remove()
  const oldPrompt = container.querySelector('.face-select-prompt')
  if (oldPrompt) oldPrompt.remove()

  const canvas = faceapi.createCanvasFromMedia(image)
  container.append(canvas)
  const displaySize = { width: image.width, height: image.height }
  faceapi.matchDimensions(canvas, displaySize)

  const detections = faceapi.resizeResults(
    await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors(),
    displaySize
  )

  if (detections.length === 0) {
    console.log('No face detected')
    return
  }

  function selectFace(index) {
    drawBoxes(canvas, detections, index)
    descriptors[descKey] = detections[index].descriptor
    onComplete()
  }

  if (detections.length === 1) {
    selectFace(0)
    return
  }

  drawBoxes(canvas, detections)

  const prompt = document.createElement('div')
  prompt.className = 'face-select-prompt'
  prompt.textContent = `${detections.length} faces found — click one to select`
  container.append(prompt)
  canvas.style.cursor = 'crosshair'

  canvas.addEventListener('click', function onClick(e) {
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const index = detections.findIndex(({ detection: { box: b } }) =>
      x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    )
    if (index === -1) return

    canvas.removeEventListener('click', onClick)
    canvas.style.cursor = 'default'
    prompt.remove()

    selectFace(index)
  })
}

async function start() {
  const overlay = document.getElementById('loaded')
  overlay.querySelector('span').textContent = 'PRESS START'
  overlay.classList.add('ready')

  overlay.addEventListener('click', () => {
    overlay.classList.remove('ready')
    document.getElementById('logo-container').classList.add('shrunk')
    overlay.style.opacity = '0'
    overlay.style.visibility = 'hidden'
    setTimeout(() => {
      document.getElementsByTagName('body')[0].className += ' loaded'
    }, 400)
  }, { once: true })

  let image1
  const topside = document.getElementById('topside')

  async function handleImage1(file) {
    if (image1) image1.remove()
    image1 = await faceapi.bufferToImage(file)
    topside.append(image1)
    document.getElementById('box1').className += ' img-loaded'

    await processImage(image1, topside, 'desc1', () => {
      if (!firstImg) {
        firstImg = true
        document.getElementsByTagName('body')[0].className += ' first-loaded'
        setupParent2()
      } else if (descriptors.desc2 && descriptors.desc3) {
        updateResult()
      }
    })
  }

  imageUpload1.addEventListener('change', () => handleImage1(imageUpload1.files[0]))
  setupDropZone(topside, handleImage1)
}

function setupParent2() {
  let image2
  const leftside = document.getElementById('leftside')

  async function handleImage2(file) {
    if (image2) image2.remove()
    image2 = await faceapi.bufferToImage(file)
    leftside.append(image2)
    document.getElementById('box2').className += ' img-loaded'

    await processImage(image2, leftside, 'desc2', () => {
      if (!secondImg) {
        secondImg = true
        document.getElementsByTagName('body')[0].className += ' second-loaded'
        setupParent3()
      } else if (descriptors.desc1 && descriptors.desc3) {
        updateResult()
      }
    })
  }

  imageUpload2.addEventListener('change', () => handleImage2(imageUpload2.files[0]))
  setupDropZone(leftside, handleImage2)
}

function setupParent3() {
  let image3
  const rightside = document.getElementById('rightside')

  async function handleImage3(file) {
    if (image3) image3.remove()
    image3 = await faceapi.bufferToImage(file)
    rightside.append(image3)
    document.getElementById('box3').className += ' img-loaded'

    await processImage(image3, rightside, 'desc3', () => {
      if (descriptors.desc1 && descriptors.desc2) {
        updateResult()
      }
    })
  }

  imageUpload3.addEventListener('change', () => handleImage3(imageUpload3.files[0]))
  setupDropZone(rightside, handleImage3)
}
