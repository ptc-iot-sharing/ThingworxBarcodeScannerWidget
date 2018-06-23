
import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'
import { QuaggaInstance, QuaggaReaderOptions, DetectionListener, CameraFacingMode, DecoderReaders, PatchSize, InputStreams, Resolution } from './quaggaEngine/quaggaInteface';

@ThingworxRuntimeWidget
class QuaggaJsWidget extends TWRuntimeWidget implements DetectionListener {
    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }

    @TWProperty("Barcode-Type")
    set barcodeType(value: string) {
        // TODO: needs to be 
    };

    // the quagga interface to use
    public quaggaInstance: QuaggaInstance;

    // the overlay 
    private overlay: HTMLElement;

    renderHtml(): string {
        require("./styles/style.css");
        return `<div class="widget-content quagga-input-field">
                    <input class="quagga-barcode" type="text">
                    <button type="button" class="quagga-icon-barcode">&nbsp;</button>
                    <input type="file" class="quagga-file-capture" capture="">
                </div>`;
    };

    afterRender() {
        let thisWidget = this;
        this.quaggaInstance = new QuaggaInstance(".quagga_overlay__content", this.createConfigFromProperties());
        this.quaggaInstance.addDetectionListener(this);
        thisWidget.jqElement.find(".quagga-file-capture").change((e: any) => {
            if (e.target.files && e.target.files.length) {
                this.quaggaInstance.decodeSingleImage(URL.createObjectURL(e.target.files[0]));
            }
        });
        this.jqElement.find(".quagga-icon-barcode").on("click", () => {
            if (thisWidget.getProperty("Mode") == "Live") {
                thisWidget.createLiveStreamOverlay();
            } else if (thisWidget.getProperty("Mode") == "Image") {
                thisWidget.jqElement.find(".quagga-file-capture").click();
            }
        });
    }

    createLiveStreamOverlay() {
        if (!this.overlay) {
            let content = document.createElement('div');
            let closeButton = document.createElement('div');
            $(closeButton).on('click', () => {
                this.quaggaInstance.stopLiveDetection();
                if (this.overlay) {
                    this.overlay.style.display = "none";
                }
            });
            closeButton.appendChild(document.createTextNode('X'));
            content.className = 'quagga_overlay__content';
            closeButton.className = 'quagga_overlay__close';
            let torchButton = document.createElement('div');
            $(torchButton).on('click', () => {
                this.quaggaInstance.setTorch(true);
            });
            torchButton.appendChild(document.createTextNode('⚡'));
            torchButton.className = 'quagga_overlay__torch';
            this.overlay = document.createElement('div');
            this.overlay.className = 'quagga_overlay';
            this.overlay.appendChild(content);
            content.appendChild(closeButton);
            content.appendChild(torchButton);

            document.body.appendChild(this.overlay);
        }

        this.quaggaInstance.startLiveDetection();
        this.overlay.style.display = "block";
    }

    createConfigFromProperties(): QuaggaReaderOptions {
        return {
            cameraFacingMode: CameraFacingMode[this.getProperty("CameraFacingMode")] as CameraFacingMode,
            decoder: DecoderReaders[this.getProperty("Barcode-Type")] as DecoderReaders,
            drawDetectionIndicator: this.getProperty("DrawDetectionIndicator"),
            halfSample: this.getProperty("HalfSample"),
            frequency: this.getProperty("Frequency"),
            patchSize: PatchSize[this.getProperty("Patch-Size")] as PatchSize,
            inputStream: InputStreams.LiveStream,
            resolution: Resolution[this.getProperty("Resolution")] as Resolution
        }
    }

    updateProperty(info: TWUpdatePropertyInfo): void {
    }

    beforeDestroy?(): void {
        // resetting current widget
    }

    codeDetected(code, type) {
        this.setProperty("Code", code);
        this.jqElement.find(".quagga-barcode").val(code);
        this.jqElement.triggerHandler("CodeDetected");
    }

    codeNotDetected() {
        this.setProperty("Code", "NOT_FOUND");
        this.jqElement.find(".quagga-barcode").val("NOT_FOUND");
        this.jqElement.triggerHandler("CodeNotDetected");
    }
}