onmessage = function(event) {

var USE_TRANSFERRABLE = true;
var SIZE = 640 * 480 * 1; // 32MB
var arrayBuffer = null;
var uInt8View = null;
var originalLength = null;

arrayBuffer = new ArrayBuffer(SIZE);
uInt8View = new Uint8Array(arrayBuffer);
originalLength = uInt8View.length;

var pixels = event.data.data;

var k = 0;

for(i=0; i < pixels.length - 8; i+=8) {
   average = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3.0;
   uInt8View[k++] = average;

   average = (pixels[i+4] + pixels[i+5] + pixels[i+6]) / 3.0;
   uInt8View[k++] = average;

 }
//
	// var pixels = event.data.data;

	// var k = 0;

	// var grey = [];

	// for(i = 0; i < pixels.length; i += 4) {
	// 	var brigthness = 0.34 * pixels[i] + 0.5 * pixels[i+1] + 0.16 * pixels[i+2];
	// 	grey[k++] = brigthness;
	// }
 // console.log(uInt8View.buffer);
 // postMessage(grey);
  postMessage(uInt8View.buffer);

}