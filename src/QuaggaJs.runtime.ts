
import { ThingworxRuntimeWidget, TWService, TWProperty } from './support/widgetRuntimeSupport'
import { QuaggaInstance, QuaggaReaderOptions, DetectionListener, CameraFacingMode, DecoderReaders, PatchSize, InputStreams, Resolution } from './quaggaEngine/quaggaInteface';

@ThingworxRuntimeWidget
class QuaggaJsWidget extends TWRuntimeWidget implements DetectionListener {
    serviceInvoked(name: string): void {
        throw new Error("Method not implemented.");
    }
    @TWProperty("Barcode-Type")
    set barcodeType(value: string) {
        // TODO: needs to be done
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
                </div>`;
    };

    showOverlay(cancelCb) {
        if (!this.overlay) {
            let content = document.createElement('div'),
                closeButton = document.createElement('div');

            closeButton.appendChild(document.createTextNode('X'));
            content.className = 'overlay__content';
            closeButton.className = 'overlay__close';
            this.overlay = document.createElement('div');
            this.overlay.className = 'overlay';
            this.overlay.appendChild(content);
            content.appendChild(closeButton);
            closeButton.addEventListener('click', function closeClick() {
                closeButton.removeEventListener('click', closeClick);
                cancelCb();
            });
            document.body.appendChild(this.overlay);
        } else {
            let closeButton = document.querySelector('.overlay__close');
            closeButton.addEventListener('click', function closeClick() {
                closeButton.removeEventListener('click', closeClick);
                cancelCb();
            });
        }
        this.overlay.style.display = "block";
    }

    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.display = "none";
        }
    }

    afterRender() {
        let thisWidget = this;
        let button = this.jqElement.find("button");
        button.on("click", function onClick(e) {
            e.preventDefault();
            button.off("click", onClick);
            thisWidget.activateLiveScanner();
        });
    }

    activateLiveScanner() {
        this.showOverlay(()=> {
            this.quaggaInstance.stopDetection();
            this.hideOverlay();
        });
        this.quaggaInstance = new QuaggaInstance(".overlay__content", this.createConfigFromProperties());
        this.quaggaInstance.addDetectionListener(this);

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
        this.jqElement.find("input").val(code);
        this.jqElement.triggerHandler("CodeDetected");
    }
}