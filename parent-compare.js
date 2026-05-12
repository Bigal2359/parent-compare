let firstImg = false
let secondImg = false
const threshold = 0.3
let descriptors = { desc1: null, desc2: null, desc3: null }
const imageUpload1 = document.getElementById('imageUpload1')
const imageUpload2 = document.getElementById('imageUpload2')
const imageUpload3 = document.getElementById('imageUpload3')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

function updateResult() {
  const distance1 = faceapi.round(
    faceapi.euclideanDistance(descriptors.desc1, descriptors.desc2)
  )
  const distance2 = faceapi.round(
    faceapi.euclideanDistance(descriptors.desc1, descriptors.desc3)
  )
  let text1 = Math.round(100 - (100 * distance1)) + '%'
  let text2 = Math.round(100 - (100 * distance2)) + '%'
  let bgColor1 = 'rgba(0, 255, 0, 0.25)'
  let bgColor2 = 'rgba(255, 0, 0, 0.25)'

  document.getElementById('distance1').innerHTML = text1
  document.getElementById('distance2').innerHTML = text2
  if (distance1 < distance2) {
    document.getElementById('distance1').setAttribute('style', 'background-color: ' + bgColor1 +';')
    document.getElementById('distance2').setAttribute('style', 'background-color: ' + bgColor2 +';')
  } else if (distance1 > distance2) {
    document.getElementById('distance1').setAttribute('style', 'background-color: ' + bgColor2 +';')
    document.getElementById('distance2').setAttribute('style', 'background-color: ' + bgColor1 +';')
  } else if (distance1 === distance2) {
    document.getElementById('distance1').setAttribute('style', 'background-color: ' + bgColor1 +';')
    document.getElementById('distance2').setAttribute('style', 'background-color: ' + bgColor1 +';')
  }
}

async function start() {
  const topside = document.getElementById('topside')
  let image
  let canvas
  document.getElementById('loaded').innerHTML = 'Loaded'
  document.getElementsByTagName('body')[0].className+=' loaded'
  
  imageUpload1.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload1.files[0])
    topside.append(image)
    document.getElementById('box1').className+=' img-loaded'
    canvas = faceapi.createCanvasFromMedia(image)
    topside.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    if (detections === undefined) {
      console.log('No face is detected')
      return
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const box = resizedDetections.detection.box
    const drawBox = new faceapi.draw.DrawBox(box)
    const uri = image.src
    const input = await faceapi.fetchImage(uri)
    drawBox.draw(canvas)
    descriptors[`desc1`] = await faceapi.computeFaceDescriptor(input)

    if( firstImg === false || secondImg === false ) {
      firstImg = true
      document.getElementsByTagName('body')[0].className+=' first-loaded'
      secondImage()
    } else {
      updateResult()
    }
  })
}

function secondImage() {
  const leftside = document.getElementById('leftside')
  let image
  let canvas

  imageUpload2.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload2.files[0])
    leftside.append(image)
    document.getElementById('box2').className+=' img-loaded'
    canvas = faceapi.createCanvasFromMedia(image)
    leftside.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    if (detections === undefined) {
      console.log('No face is detected')
      return
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const box = resizedDetections.detection.box
    const drawBox = new faceapi.draw.DrawBox(box)
    const uri = image.src
    const input = await faceapi.fetchImage(uri)
    drawBox.draw(canvas)
    descriptors[`desc2`] = await faceapi.computeFaceDescriptor(input)
    
    if(secondImg === false ) {
      secondImg = true
      document.getElementsByTagName('body')[0].className+=' second-loaded'
      thirdImage()
    } else {
      updateResult()
    }
  })
}

function thirdImage() {
  const rightside = document.getElementById('rightside')
  let image
  let canvas

  imageUpload3.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload3.files[0])
    rightside.append(image)
    document.getElementById('box3').className+=' img-loaded'
    canvas = faceapi.createCanvasFromMedia(image)
    rightside.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
    if (detections === undefined) {
      console.log('No face is detected')
      return
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const box = resizedDetections.detection.box
    const drawBox = new faceapi.draw.DrawBox(box)
    const uri = image.src
    const input = await faceapi.fetchImage(uri)
    drawBox.draw(canvas)
    descriptors[`desc3`] = await faceapi.computeFaceDescriptor(input)
    updateResult()
  })
}
