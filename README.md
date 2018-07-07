# Barcode reader widget

This repository contains a Thingworx widget allowing reading of barcodes within the browser. Both file inputs, as well as modern webcam grabbing is supported.
The underlying technology behind this widget is [QuaggaJS](https://serratus.github.io/quaggaJS/).
QuaggaJS is a barcode-scanner entirely written in JavaScript supporting real- time localization and decoding of various types of barcodes such as *EAN*, *CODE 128*, *CODE 39*, *EAN 8*, *UPC-A*, *UPC-C*, *I2of5*, *2of5*, *CODE 93* and *CODABAR*. The library is also capable of using _getUserMedia_ to get direct access to the user’s camera stream. Although the code relies on heavy image-processing even recent smartphones are capable of locating and decoding barcodes in real-time.

## How to use it

By default, this is a non-reposive widget, with a text input that can be customized via CSS and a button. The wodget can also be completely hidden, and the `StartDetection` service can be used to start the detection based on external events.
The widgets offers two functioning modes, driven by the `Mode` widget property. This modes dictate what happens when clicking on the button, or when triggering the `StartDetection` service.

* Live video: a popup is automatically opened and the device camera is used to directly scan for barcodes. The camera input also includes indicators of detected codes and upon succesful detection, the popup is closed, and the input is updated to the barcode detected. The popup also offers controls for the flashlight of the device (if available).
* File input: a file dialog opens allowing the user to select a photo. Depending on the used device, this can use the camera app to take a new photo.

To understand most of the widget properties, either read the description or go to the library [website](https://serratus.github.io/quaggaJS/#configuration).

## Building and publishing

The following commands allow you to build and compile your widget:

* `npm run build`: builds the production version of the widget. Creates a new extension zip file under the `zip` folder. The production version is optimized for sharing and using in production enviroments.
* `npm run upload`: creates a build, and uploads the extension zip to the thingworx server configured in `package.json`. The build is created for developement, with source-maps enabled.
* `npm run watch`: watches the source files, and whenever they change, do a build.