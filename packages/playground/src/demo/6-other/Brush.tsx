import { useEffect } from 'react'
import { Rect, Stage } from 'rmst-render'
import { calcAllControlPoint } from 'rmst-render'

import { getStroke } from 'perfect-freehand'

const points = [
  [115.89016723632812, 44.60115432739258, 0.5],
  [115.89016723632812, 44.60115432739258, 0.5],
  [116.44508361816406, 44.60115432739258, 0.5],
  [117, 44.60115432739258, 0.5],
  [117.5549087524414, 44.60115432739258, 0.5],
  [118.10982513427734, 44.60115432739258, 0.5],
  [118.66473388671875, 44.60115432739258, 0.5],
  [119.21965026855469, 44.60115432739258, 0.5],
  [119.21965026855469, 45.15606689453125, 0.5],
  [119.77456665039062, 46.26589584350586, 0.5],
  [120.32947540283203, 47.3757209777832, 0.5],
  [120.88439178466797, 48.48554992675781, 0.5],
  [120.88439178466797, 49.040462493896484, 0.5],
  [121.99421691894531, 51.26011276245117, 0.5],
  [122.54913330078125, 51.81502914428711, 0.5],
  [122.54913330078125, 52.36994171142578, 0.5],
  [124.2138671875, 55.69942092895508, 0.5],
  [124.2138671875, 56.25433349609375, 0.5],
  [125.32369995117188, 59.028900146484375, 0.5],
  [125.32369995117188, 59.58381271362305, 0.5],
  [125.87860870361328, 60.13872528076172, 0.5],
  [125.87860870361328, 60.693641662597656, 0.5],
  [126.98843383789062, 63.46820831298828, 0.5],
  [127.54335021972656, 66.79768371582031, 0.5],
  [128.0982666015625, 67.35260009765625, 0.5],
  [128.0982666015625, 67.90751647949219, 0.5],
  [128.0982666015625, 68.4624252319336, 0.5],
  [128.65318298339844, 69.57225036621094, 0.5],
  [128.65318298339844, 70.12716674804688, 0.5],
  [129.76300048828125, 74.01155853271484, 0.5],
  [129.76300048828125, 74.56647491455078, 0.5],
  [130.87283325195312, 77.89595031738281, 0.5],
  [130.87283325195312, 78.45086669921875, 0.5],
  [131.42774963378906, 79.00577545166016, 0.5],
  [131.42774963378906, 79.5606918334961, 0.5],
  [131.98265075683594, 80.67051696777344, 0.5],
  [131.98265075683594, 81.22543334960938, 0.5],
  [132.53756713867188, 81.22543334960938, 0.5],
  [132.53756713867188, 81.78034210205078, 0.5],
  [133.0924835205078, 82.89017486572266, 0.5],
  [133.64739990234375, 84.5549087524414, 0.5],
  [134.2023162841797, 86.77456665039062, 0.5],
  [134.2023162841797, 87.32947540283203, 0.5],
  [134.75721740722656, 87.88439178466797, 0.5],
  [134.75721740722656, 89.54913330078125, 0.5],
  [134.75721740722656, 90.10404205322266, 0.5],
  [135.86705017089844, 90.6589584350586, 0.5],
  [135.86705017089844, 91.2138671875, 0.5],
  [135.86705017089844, 91.76878356933594, 0.5],
  [135.86705017089844, 92.87860870361328, 0.5],
  [136.42196655273438, 93.43352508544922, 0.5],
  [136.42196655273438, 94.54335021972656, 0.5],
  [136.9768829345703, 95.0982666015625, 0.5],
  [136.9768829345703, 96.20809173583984, 0.5],
  [136.9768829345703, 96.76300048828125, 0.5],
  [136.9768829345703, 97.31791687011719, 0.5],
  [137.5317840576172, 98.42774200439453, 0.5],
  [137.5317840576172, 99.53756713867188, 0.5],
  [137.5317840576172, 100.09248352050781, 0.5],
  [137.5317840576172, 100.64739990234375, 0.5],
  [137.5317840576172, 101.7572250366211, 0.5],
  [137.5317840576172, 102.3121337890625, 0.5],
  [138.08670043945312, 102.86705017089844, 0.5],
  [138.08670043945312, 103.42196655273438, 0.5],
  [138.08670043945312, 103.97687530517578, 0.5],
  [138.64161682128906, 105.64161682128906, 0.5],
  [138.64161682128906, 106.7514419555664, 0.5],
  [139.196533203125, 107.30635833740234, 0.5],
  [139.196533203125, 108.41618347167969, 0.5],
  [139.75144958496094, 109.52600860595703, 0.5],
  [139.75144958496094, 110.08092498779297, 0.5],
  [139.75144958496094, 111.19075012207031, 0.5],
  [140.3063507080078, 112.30057525634766, 0.5],
  [140.3063507080078, 112.8554916381836, 0.5],
  [140.86126708984375, 113.410400390625, 0.5],
  [140.86126708984375, 113.96531677246094, 0.5],
  [141.4161834716797, 114.52022552490234, 0.5],
  [141.4161834716797, 115.63005828857422, 0.5],
  [141.4161834716797, 116.18496704101562, 0.5],
  [141.97109985351562, 116.73988342285156, 0.5],
  [142.5260009765625, 117.8497085571289, 0.5],
  [142.5260009765625, 118.40462493896484, 0.5],
  [142.5260009765625, 118.95953369140625, 0.5],
  [143.08091735839844, 120.0693588256836, 0.5],
  [143.08091735839844, 122.28901672363281, 0.5],
  [143.63583374023438, 122.84392547607422, 0.5],
  [143.63583374023438, 123.39884185791016, 0.5],
  [144.1907501220703, 124.5086669921875, 0.5],
  [144.1907501220703, 125.06358337402344, 0.5],
  [144.74566650390625, 126.17340850830078, 0.5],
  [144.74566650390625, 126.72831726074219, 0.5],
  [144.74566650390625, 127.83815002441406, 0.5],
  [145.30056762695312, 128.39306640625, 0.5],
  [145.30056762695312, 130.05780029296875, 0.5],
  [145.85548400878906, 130.6127166748047, 0.5],
  [145.85548400878906, 131.7225341796875, 0.5],
  [145.85548400878906, 132.27745056152344, 0.5],
  [146.410400390625, 133.94219970703125, 0.5],
  [146.410400390625, 134.49710083007812, 0.5],
  [146.96531677246094, 135.05201721191406, 0.5],
  [146.96531677246094, 135.60693359375, 0.5],
  [147.52023315429688, 136.71676635742188, 0.5],
  [147.52023315429688, 137.8265838623047, 0.5],
  [148.07513427734375, 138.38150024414062, 0.5],
  [148.07513427734375, 139.4913330078125, 0.5],
  [148.6300506591797, 140.04623413085938, 0.5],
  [148.6300506591797, 141.15606689453125, 0.5],
  [149.73988342285156, 141.71096801757812, 0.5],
  [149.73988342285156, 142.26589965820312, 0.5],
  [150.2947998046875, 142.82080078125, 0.5],
  [150.2947998046875, 143.375732421875, 0.5],
  [150.84970092773438, 143.93063354492188, 0.5],
  [150.84970092773438, 144.48553466796875, 0.5],
  [150.84970092773438, 145.04046630859375, 0.5],
  [151.4046173095703, 146.7052001953125, 0.5],
  [151.95953369140625, 147.81503295898438, 0.5],
  [152.5144500732422, 148.36993408203125, 0.5],
  [153.06936645507812, 148.92486572265625, 0.5],
  [153.06936645507812, 150.03466796875, 0.5],
  [153.624267578125, 150.589599609375, 0.5],
  [154.17918395996094, 151.14450073242188, 0.5],
  [154.73410034179688, 151.69943237304688, 0.5],
  [154.73410034179688, 153.36415100097656, 0.5],
  [155.2890167236328, 153.9190673828125, 0.5],
  [155.84393310546875, 154.4739990234375, 0.5],
  [155.84393310546875, 155.02890014648438, 0.5],
  [156.39883422851562, 155.58380126953125, 0.5],
  [156.95375061035156, 156.69363403320312, 0.5],
  [158.61849975585938, 159.46820068359375, 0.5],
  [162.5028839111328, 165.572265625, 0.5],
  [163.6127166748047, 167.2369842529297, 0.5],
  [166.94219970703125, 170.56646728515625, 0.5],
  [167.49710083007812, 172.23121643066406, 0.5],
  [168.60693359375, 174.45086669921875, 0.5],
  [169.16184997558594, 175.0057830810547, 0.5],
  [169.71676635742188, 175.56068420410156, 0.5],
  [170.27166748046875, 176.1156005859375, 0.5],
  [170.8265838623047, 176.67051696777344, 0.5],
  [171.38150024414062, 177.22543334960938, 0.5],
  [171.93641662597656, 177.7803497314453, 0.5],
  [171.93641662597656, 178.3352508544922, 0.5],
  [173.04623413085938, 178.89016723632812, 0.5],
  [173.6011505126953, 179.44508361816406, 0.5],
  [174.15606689453125, 179.44508361816406, 0.5],
  [174.7109832763672, 180.55491638183594, 0.5],
  [175.82080078125, 181.1098175048828, 0.5],
  [176.93063354492188, 182.2196502685547, 0.5],
  [177.4855499267578, 182.2196502685547, 0.5],
  [178.0404510498047, 182.77456665039062, 0.5],
  [178.0404510498047, 183.32948303222656, 0.5],
  [179.15028381347656, 184.43930053710938, 0.5],
  [180.26011657714844, 184.9942169189453, 0.5],
  [180.8150177001953, 184.9942169189453, 0.5],
  [181.36993408203125, 185.54913330078125, 0.5],
  [181.9248504638672, 186.1040496826172, 0.5],
  [182.47976684570312, 186.65895080566406, 0.5],
  [183.58958435058594, 187.2138671875, 0.5],
  [184.6994171142578, 187.76878356933594, 0.5],
  [185.8092498779297, 188.32369995117188, 0.5],
  [186.9190673828125, 189.4335174560547, 0.5],
  [187.47398376464844, 189.4335174560547, 0.5],
  [188.5838165283203, 190.54335021972656, 0.5],
  [189.1387176513672, 191.0982666015625, 0.5],
  [189.69363403320312, 191.0982666015625, 0.5],
  [190.803466796875, 192.2080841064453, 0.5],
  [191.35838317871094, 192.2080841064453, 0.5],
  [191.9132843017578, 192.76300048828125, 0.5],
  [192.46820068359375, 192.76300048828125, 0.5],
  [192.46820068359375, 193.3179168701172, 0.5],
  [193.57803344726562, 193.87283325195312, 0.5],
  [194.13294982910156, 193.87283325195312, 0.5],
  [194.68785095214844, 194.427734375, 0.5],
  [195.24276733398438, 194.98265075683594, 0.5],
  [195.7976837158203, 194.98265075683594, 0.5],
  [196.9075164794922, 196.0924835205078, 0.5],
  [198.017333984375, 196.64739990234375, 0.5],
  [198.57225036621094, 197.20230102539062, 0.5],
  [199.12716674804688, 197.20230102539062, 0.5],
  [199.6820831298828, 197.75721740722656, 0.5],
  [200.2369842529297, 197.75721740722656, 0.5],
  [201.3467559814453, 198.3121337890625, 0.5],
  [201.9017333984375, 198.86705017089844, 0.5],
  [204.6762237548828, 199.42196655273438, 0.5],
  [205.23114013671875, 199.42196655273438, 0.5],
  [206.34103393554688, 199.42196655273438, 0.5],
  [206.8959503173828, 199.97686767578125, 0.5],
  [208.00584411621094, 199.97686767578125, 0.5],
  [210.7803497314453, 200.5317840576172, 0.5],
  [212.44500732421875, 200.5317840576172, 0.5],
  [215.21971130371094, 201.08670043945312, 0.5],
  [215.7744903564453, 201.64161682128906, 0.5],
  [216.88438415527344, 201.64161682128906, 0.5],
  [218.5491943359375, 201.64161682128906, 0.5],
  [220.76878356933594, 201.64161682128906, 0.5],
  [222.43359375, 201.64161682128906, 0.5],
  [222.98849487304688, 201.64161682128906, 0.5],
  [223.54327392578125, 201.64161682128906, 0.5],
  [225.2080841064453, 201.64161682128906, 0.5],
  [225.76300048828125, 201.64161682128906, 0.5],
  [226.8727569580078, 201.64161682128906, 0.5],
  [227.42767333984375, 201.64161682128906, 0.5],
  [227.98265075683594, 201.64161682128906, 0.5],
  [228.53756713867188, 201.64161682128906, 0.5],
  [229.0924835205078, 201.64161682128906, 0.5],
  [229.6474609375, 201.64161682128906, 0.5],
  [230.7571563720703, 201.08670043945312, 0.5],
  [231.3121337890625, 201.08670043945312, 0.5],
  [231.86705017089844, 200.5317840576172, 0.5],
  [234.64154052734375, 198.3121337890625, 0.5],
  [235.196533203125, 197.75721740722656, 0.5],
  [236.3063507080078, 197.20230102539062, 0.5],
  [239.08091735839844, 194.427734375, 0.5],
  [240.1907501220703, 193.3179168701172, 0.5],
  [240.7457275390625, 192.76300048828125, 0.5],
  [241.8554229736328, 191.65316772460938, 0.5],
  [242.96531677246094, 189.98843383789062, 0.5],
  [243.52023315429688, 188.87860107421875, 0.5],
  [244.630126953125, 187.76878356933594, 0.5],
  [246.2947998046875, 186.65895080566406, 0.5],
  [246.84970092773438, 186.1040496826172, 0.5],
  [249.62420654296875, 182.77456665039062, 0.5],
  [250.17918395996094, 181.1098175048828, 0.5],
  [252.39891052246094, 178.3352508544922, 0.5],
  [253.5086669921875, 177.22543334960938, 0.5],
  [255.17340087890625, 175.56068420410156, 0.5],
  [257.39306640625, 172.78611755371094, 0.5],
  [260.16754150390625, 168.9017333984375, 0.5],
  [260.72247314453125, 167.2369842529297, 0.5],
  [262.9422607421875, 164.46241760253906, 0.5],
  [263.4971618652344, 163.35260009765625, 0.5],
  [265.7167663574219, 160.57803344726562, 0.5],
  [266.82666015625, 156.69363403320312, 0.5],
  [267.3814392089844, 155.58380126953125, 0.5],
  [269.60113525390625, 152.80923461914062, 0.5],
  [271.26580810546875, 150.589599609375, 0.5],
  [272.3757019042969, 146.7052001953125, 0.5],
  [274.5954284667969, 142.26589965820312, 0.5],
  [275.15020751953125, 140.60116577148438, 0.5],
  [276.8150329589844, 137.27166748046875, 0.5],
  [277.9249267578125, 134.49710083007812, 0.5],
  [279.03460693359375, 132.27745056152344, 0.5],
  [279.589599609375, 130.6127166748047, 0.5],
  [280.1445007324219, 128.39306640625, 0.5],
  [281.25433349609375, 126.17340850830078, 0.5],
  [281.8092956542969, 123.39884185791016, 0.5],
  [282.36407470703125, 121.73410034179688, 0.5],
  [283.4739685058594, 118.95953369140625, 0.5],
  [283.4739685058594, 116.73988342285156, 0.5],
  [284.58380126953125, 115.07514190673828, 0.5],
  [285.1387939453125, 113.96531677246094, 0.5],
  [285.1387939453125, 112.8554916381836, 0.5],
  [285.6936950683594, 110.08092498779297, 0.5],
  [286.24847412109375, 108.41618347167969, 0.5],
  [286.803466796875, 107.86126708984375, 0.5],
  [286.803466796875, 106.196533203125, 0.5],
  [287.3583679199219, 104.53179168701172, 0.5],
  [287.3583679199219, 103.97687530517578, 0.5],
  [287.9132995605469, 102.86705017089844, 0.5],
  [287.9132995605469, 101.7572250366211, 0.5],
  [287.9132995605469, 100.64739990234375, 0.5],
  [287.9132995605469, 100.09248352050781, 0.5],
  [288.46820068359375, 98.98265838623047, 0.5],
  [288.46820068359375, 97.87283325195312, 0.5],
  [288.46820068359375, 97.31791687011719, 0.5],
  [288.46820068359375, 96.76300048828125, 0.5],
  [289.023193359375, 96.20809173583984, 0.5],
  [289.023193359375, 95.6531753540039, 0.5],
  [289.023193359375, 95.0982666015625, 0.5],
  [289.023193359375, 94.54335021972656, 0.5],
  [289.5779724121094, 93.98843383789062, 0.5]
]

function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ''

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ['M', ...stroke[0], 'Q']
  )

  d.push('Z')
  return d.join(' ')
}

const stroke = getStroke(points)
const pathData = getSvgPathFromStroke(stroke)

const Brush = () => {
  useEffect(() => {
    const stage = new Stage({ container: document.querySelector('.canvas-container') })

    const { ctx, canvasElement } = stage

    const path = new Path2D(pathData)
    ctx.fill(path)

    let isDown = false

    let points = []

    canvasElement.addEventListener('mousedown', evt => {
      isDown = true

      points = []
    })

    canvasElement.addEventListener('mousemove', evt => {
      if (!isDown) {
        return
      }
      points.push({ x: evt.offsetX, y: evt.offsetY })

      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)

      ctx.beginPath()

      const allPoints = calcAllControlPoint(points)
      console.log('allControlPoint', allPoints)
      drawQx()
      function drawQx() {
        const [start] = points

        const path2D = new Path2D()
        path2D.moveTo(start.x, start.y)
        allPoints.forEach(item => {
          path2D.bezierCurveTo(item.cp1.x, item.cp1.y, item.cp2.x, item.cp2.y, item.end.x, item.end.y)
        })

        ctx.stroke(path2D)
      }
    })

    canvasElement.addEventListener('mouseup', evt => {
      isDown = false

      console.log(points)
    })

    function calculateDistance(x1, y1, x2, y2) {
      let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      return distance
    }
  }, [])

  return (
    <div>
      <div className="canvas-container"></div>
    </div>
  )
}

export default Brush