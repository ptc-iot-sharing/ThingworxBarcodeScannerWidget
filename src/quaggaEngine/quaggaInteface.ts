import * as Quagga from 'quagga';
import { QuaggaJSConfigObject } from '../../typings/quagga';
import 'webrtc-adapter';
export enum InputStreams {
    ImageStream = "ImageStream",
    VideoStream = "VideoStream",
    LiveStream = "LiveStream"
}

export enum CameraFacingMode {
    Environment = "environment",
    User = "user"
}

export enum DecoderReaders {
    Code_128 = "code_128_reader",
    Code_39 = "code_39_reader",
    Code_39_vin = "code_39_vin_reader",
    Ean = "ean_reader",
    Ean_extended = "ean_extended_reader",
    Ean_8 = "ean_8_reader",
    Upc = "upc_reader",
    Upc_e = "upc_e_reader",
    Codabar = "codabar",
    I2of5 = "i2of5_reader",
    S2of5 = "2of5_reader",
    Code_93 = "code_93_reader",
}

export enum PatchSize {
    X_small = "x-small",
    Small = "small",
    Medium = "medium",
    Large = "large",
    X_large = "x-large"
}

export enum Resolution {
    Re320x240 = "320x240",
    Re640x480 = "640x480",
    Re800x600 = "800x600",
    Re1280x720 = "1280x720",
    Re1600x960 = "1600x960",
    Re1920x1080 = "1920x1080",
}
export interface QuaggaReaderOptions {
    /**
     * Where to get the input from
     */
    inputStream: InputStreams;

    /**
     * Resolution to use when grabbing video
     */
    resolution: Resolution;

    /**
     * Specify what camera we want to use
     */
    cameraFacingMode: CameraFacingMode;

    /**
     * The density of the search-grid. 
     */
    patchSize: PatchSize;

    /**
     * Tells the locator-process whether it should operate on an image scaled down (half width/height, quarter pixel-count ) or not.is 
     */
    halfSample: boolean;

    /**
     * Enable or disable drawing of additional lines showing detection results
     */
    drawDetectionIndicator: boolean;

    /**
     * Defines the maximum number of scans per second
     */
    frequency: number;

    /**
     * Type of barcode to scan
     */
    decoder: DecoderReaders;
}

export interface DetectionListener {
    codeDetected(code: string, type: string): void;
    codeNotDetected(): void;
}

export class QuaggaInstance {
    container: string;
    config: QuaggaJSConfigObject;
    drawDetectionIndicator: boolean;
    currentlyDetecting: boolean;

    /**
     * Listeners for detection
     */
    detectionListeners: DetectionListener[] = [];

    private lastResult: string;

    /**
     * Creates a new quagga instance for decoding
     * @param container string selector where to put the input or the canvas
     * @param config quagga configuration object
     */
    constructor(container: string, config: QuaggaReaderOptions) {
        this.container = container;
        this.config = {
            inputStream: {
                type: config.inputStream,
                target: container,
                constraints: {
                    facingMode: config.cameraFacingMode,
                    // extract the height and width from the resolutiin
                    width: parseInt(config.resolution.split("x")[0]),
                    height: parseInt(config.resolution.split("x")[1])
                }
            },
            frequency: config.frequency,
            decoder: {
                readers: [config.decoder]
            },
            locator: {
                halfSample: config.halfSample,
                patchSize: config.patchSize
            }
        };
        this.drawDetectionIndicator = config.drawDetectionIndicator;
        this.currentlyDetecting = false;
    }

    decodeSingleImage(image) {
        let singleConfig = Object.assign({}, this.config);
        singleConfig.src = image;
        singleConfig.locate = true;
        singleConfig.inputStream.type = undefined;
        Quagga.decodeSingle(singleConfig, (result) => {
            if (result.codeResult) {
                for (const listener of this.detectionListeners) {
                    listener.codeDetected(result.codeResult.code, result.codeResult.format);
                }
            } else {
                for (const listener of this.detectionListeners) {
                    listener.codeNotDetected();
                }
            }
        });
    }

    startLiveDetection() {
        this.currentlyDetecting = true;
        // initialize quagga
        Quagga.init(this.config, function (err) {
            if (err) {
                console.log("Quagga initialization error", err);
                return
            }
            console.log("Quagga initialization finished. Ready to start");
            Quagga.start();
        });
        // add the detection listener that forwards the event to the registered listeners
        Quagga.onDetected((result) => {
            var code = result.codeResult.code;

            if (this.lastResult !== code) {
                this.lastResult = code;
                for (const listener of this.detectionListeners) {
                    listener.codeDetected(code, result.codeResult.format);
                }
            }
        });

        Quagga.onProcessed((result) => {
            if (this.drawDetectionIndicator) {
                var drawingCtx = Quagga.canvas.ctx.overlay,
                    drawingCanvas = Quagga.canvas.dom.overlay;

                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                        result.boxes.filter((box) => {
                            return box !== result.box;
                        }).forEach((box) => {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                    }
                }
            }
        });
    }

    stopLiveDetection() {
        if(this.currentlyDetecting) {
            Quagga.stop();
            this.currentlyDetecting = false;
        }
    }

    /**
     * Sets the torch to the specifed value. Will only work on compatible devices
     * @param value New value for the torch
     */
    setTorch(value: boolean) {
        var track = Quagga.CameraAccess.getActiveTrack();
        if (track && typeof track.getCapabilities === 'function') {
            return track.applyConstraints({ advanced: [{ torch: !!value }] });
        }
    }

    /**
     * Sets the zoom to the specifed value. Will only work on compatible devices
     * @param value New value for the zoom
     */
    setZoom(value: number) {
        var track = Quagga.CameraAccess.getActiveTrack();
        if (track && typeof track.getCapabilities === 'function') {
            return track.applyConstraints({ advanced: [{ zoom: value }] });
        }
    }


    /**
     * Adds a new listener that gets called when a new code is detected by quagga
     * @param listener Listener that gets notified whenever a code is detected
     */
    addDetectionListener(listener: DetectionListener) {
        this.detectionListeners.push(listener);
    }

    /**
     * Removes the given listener from the listener list
     * @param listener Listener to remove
     */
    removeDetectionListener(listener: DetectionListener) {
        this.detectionListeners.forEach((item, index) => {
            if (item === listener) this.detectionListeners.splice(index, 1);
        });
    }
}