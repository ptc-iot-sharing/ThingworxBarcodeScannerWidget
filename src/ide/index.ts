// automatically import the css file
import './ide.css';
import {
    TWWidgetDefinition,
    autoResizable,
    description,
    property,
    defaultValue,
    service,
    event,
    bindingSource,
    bindingTarget,
    selectOptions,
} from 'typescriptwebpacksupport/widgetIDESupport';

import widgetIconUrl from '../images/image.svg';

@description('Scan barcodes and display them in mashups')
@TWWidgetDefinition('Barcode Quagga Scanner', autoResizable)
class QuaggaJsWidget extends TWComposerWidget {
    @property('NUMBER', defaultValue(180))
    width: number;

    @property('NUMBER', defaultValue(30))
    height: number;

    @description('The code automatically detected by the scanner')
    @property('STRING', bindingSource)
    Code: string;

    @description(
        'Enable or disable drawing of additional lines showing detection results. Applies to Live Video ONLY.',
    )
    @property('BOOLEAN', defaultValue(true))
    DrawDetectionIndicator: boolean;

    @description('Work on a half sample (half width, half height)')
    @property('BOOLEAN', defaultValue(true))
    HalfSample: boolean;

    @description('Detection frequency (number of scans per second). Applies to Live Video ONLY.')
    @property('INTEGER', defaultValue(60))
    Frequency: number;

    @description('Specify camera to be used for the Live Video. Applies to Live Video ONLY.')
    @property(
        'STRING',
        defaultValue('Environment'),
        selectOptions([
            { text: 'Back-facing', value: 'Environment' },
            { text: 'Front-facing', value: 'User' },
        ]),
    )
    CameraFacingMode: number;

    @description(
        'Patch size for detecting the barcode (how big is the barcode compared with the entire image)',
    )
    @property(
        'STRING',
        defaultValue('Medium'),
        selectOptions([
            { text: 'x-small', value: 'X_small' },
            { text: 'small', value: 'Small' },
            { text: 'medium', value: 'Medium' },
            { text: 'large', value: 'Large' },
            { text: 'x-large', value: 'X_large' },
        ]),
    )
    PatchSize: string;

    @description(
        'Camera resolution to use. Depends on the target device. Applies to Live Video ONLY.',
    )
    @property(
        'STRING',
        defaultValue('Re640x480'),
        selectOptions([
            { text: '320px', value: 'Re320x240' },
            { text: '640px', value: 'Re640x480' },
            { text: '800px', value: 'Re800x600' },
            { text: '1280px', value: 'Re1280x720' },
            { text: '1600px', value: 'Re1600x960' },
            { text: '1920px', value: 'Re1920x1080' },
        ]),
    )
    Resolution: string;

    @description(
        'Camera resolution to use. Depends on the target device. Applies to Live Video ONLY.',
    )
    @property(
        'STRING',
        bindingTarget,
        defaultValue('Code_128'),
        selectOptions([
            { text: 'Code 128', value: 'Code_128' },
            { text: 'Code 39', value: 'Code_39' },
            { text: 'Code 39 VIN', value: 'Code_39_vin' },
            { text: 'EAN', value: 'Ean' },
            { text: 'EAN-extended', value: 'Ean_extended' },
            { text: 'EAN-8', value: 'Ean_8' },
            { text: 'UPC', value: 'Upc' },
            { text: 'UPC-E', value: 'Upc_e' },
            { text: 'Codabar', value: 'Codabar' },
            { text: 'ITF', value: 'I2of5' },
            { text: 'Standard 2 of 5', value: 'S2of5' },
            { text: 'Code 93', value: 'Code_93' },
        ]),
    )
    BarcodeType: string;

    @property(
        'STRING',
        defaultValue('Live'),
        selectOptions([
            { text: 'Live Video', value: 'Live' },
            { text: 'File Input', value: 'Image' },
        ]),
    )
    Mode: string;

    widgetIconUrl(): string {
        return widgetIconUrl;
    }

    /**
     * Invoked to obtain the HTML structure corresponding to the widget.
     * @return      The HTML structure.
     */
    renderHtml(): string {
        return `<div class="widget-content quagga-input-field">
                    <input class="quagga-barcode" type="text">
                    <button type="button" class="quagga-icon-barcode">&nbsp;</button>
                </div>`;
    }

    @description('Starts a new detection')
    @service
    StartDetection;

    @description(
        'Fired when a barcode is detected. The code variable is updated with the correct data.',
    )
    @event
    CodeDetected;

    @description('Fired when detecting a single image, but no code is found.')
    @event
    CodeNotDetected;

    afterRender(): void {
        // no after-render logic needed
    }

    beforeDestroy(): void {
        // no dispose logic needed at design-time
    }
}
