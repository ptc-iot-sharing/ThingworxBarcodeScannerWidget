import {
    TWWidgetDefinition,
    TWEvent,
    event,
    service,
} from 'typescriptwebpacksupport/widgetRuntimeSupport';
import {
    CameraFacingMode,
    DecoderReaders,
    InputStreams,
    PatchSize,
    QuaggaInstance,
    QuaggaReaderOptions,
    Resolution,
} from './quaggaEngine/quaggaInteface';
import './style.css';

enum DetectionModes {
    LIVE = 'Live',
    IMAGE = 'Image',
}

/**
 * The `@TWWidgetDefinition` decorator marks a class as a Thingworx widget. It can only be applied to classes
 * that inherit from the `TWRuntimeWidget` class.
 */
@TWWidgetDefinition
class QuaggaJsWidget extends TWRuntimeWidget {
    @event CodeDetected: TWEvent;
    @event CodeNotDetected: TWEvent;

    // the quagga interface to use
    public quaggaInstance: QuaggaInstance;

    // the overlay
    private overlay: HTMLElement;

    /**
     * Invoked to obtain the HTML structure corresponding to the widget.
     * @return      The HTML structure.
     */
    renderHtml(): string {
        if (this.getProperty('Mode') == DetectionModes.LIVE) {
            return `<div class="widget-content quagga-input-field">
            <input class="quagga-barcode" type="text">
            <button type="button" class="quagga-icon-barcode quagga-start-live">&nbsp;</button>
        </div>`;
        } else {
            return `<div class="widget-content quagga-input-field">
            <input class="quagga-barcode" type="text">
            <label class="quagga-file-capture-label">
                <input type="file"  class="quagga-file-capture" capture="">
            </label>
        </div>`;
        }
    }

    afterRender(): void {
        this.jqElement.find('.quagga-barcode').on('input', (e) => {
            this.setProperty('Code', $(e.target).val());
        });
        this.quaggaInstance = new QuaggaInstance(
            '.quagga_overlay__content',
            this.createConfigFromProperties(),
        );
        this.quaggaInstance.addDetectionListener(this);
        this.jqElement.find('.quagga-file-capture').on('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files && target.files.length) {
                this.quaggaInstance.decodeSingleImage(URL.createObjectURL(target.files[0]));
            }
        });
        this.jqElement.find('.quagga-start-live').on('click', () => {
            this.createLiveStreamOverlay();
        });
    }

    @service StartDetection(): void {
        if (this.getProperty('Mode') == DetectionModes.LIVE) {
            this.createLiveStreamOverlay();
        } else if (this.getProperty('Mode') == DetectionModes.IMAGE) {
            this.jqElement.find('.quagga-file-capture').trigger('click');
        }
    }

    codeDetected(code, type): void {
        this.setProperty('Code', code);
        this.jqElement.find('.quagga-barcode').val(code);
        this.CodeDetected();
        if (this.overlay) {
            this.quaggaInstance.stopLiveDetection();
            this.overlay.style.display = 'none';
        }
    }

    codeNotDetected(): void {
        this.setProperty('Code', 'NOT_FOUND');
        this.jqElement.find('.quagga-barcode').val('NOT_FOUND');
        this.CodeNotDetected();
    }

    createConfigFromProperties(): QuaggaReaderOptions {
        return {
            cameraFacingMode: CameraFacingMode[
                this.getProperty('CameraFacingMode')
            ] as CameraFacingMode,
            decoder: DecoderReaders[this.getProperty('BarcodeType')] as DecoderReaders,
            drawDetectionIndicator: this.getProperty('DrawDetectionIndicator'),
            halfSample: this.getProperty('HalfSample'),
            frequency: this.getProperty('Frequency'),
            patchSize: PatchSize[this.getProperty('PatchSize')] as PatchSize,
            inputStream: InputStreams.LiveStream,
            resolution: Resolution[this.getProperty('Resolution')] as Resolution,
        };
    }

    createLiveStreamOverlay(): void {
        if (!this.overlay) {
            const content = document.createElement('div');
            const closeButton = document.createElement('div');
            $(closeButton).on('click', () => {
                this.quaggaInstance.stopLiveDetection();
                if (this.overlay) {
                    this.overlay.style.display = 'none';
                }
            });
            closeButton.appendChild(document.createTextNode('X'));
            content.className = 'quagga_overlay__content';
            closeButton.className = 'quagga_overlay__close';
            const torchButton = document.createElement('div');
            $(torchButton).on('click', () => {
                if (torchButton.style.borderColor == 'yellow') {
                    this.quaggaInstance.setTorch(false);
                    torchButton.style.borderColor = 'black';
                } else {
                    this.quaggaInstance.setTorch(true);
                    torchButton.style.borderColor = 'yellow';
                }
            });
            torchButton.appendChild(document.createTextNode('T'));
            torchButton.className = 'quagga_overlay__torch';
            this.overlay = document.createElement('div');
            this.overlay.className = 'quagga_overlay';
            this.overlay.appendChild(content);
            content.appendChild(closeButton);
            content.appendChild(torchButton);

            document.body.appendChild(this.overlay);
        }
        $(this.overlay).find('.quagga_overlay__torch')[0].style.borderColor = 'black';
        this.quaggaInstance.startLiveDetection();
        this.overlay.style.display = 'block';
    }

    beforeDestroy?(): void {
        // resetting current widget
        if (this.quaggaInstance) {
            this.quaggaInstance.stopLiveDetection();
        }
        if (this.overlay) {
            this.overlay.remove();
        }
    }
}
