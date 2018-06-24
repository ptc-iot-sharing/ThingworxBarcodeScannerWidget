// automatically import the css file
import { ThingworxComposerWidget } from './support/widgetRuntimeSupport'

@ThingworxComposerWidget
class QuaggaJsWidget extends TWComposerWidget {

    widgetIconUrl(): string {
        return require('./images/image.svg');
    }

    widgetProperties(): TWWidgetProperties {
        require("./styles/style.css");
        return {
            'name': 'Barcode Quagga Scanner',
            'description': 'Scan barcodes and display them in mashups',
            'category': ['Common'],
            'supportsAutoResize': false,
            'properties': {
                'Width': {
                    'description': 'Total width of the widget',
                    'baseType': 'NUMBER',
                    'defaultValue': 180,
                    'isBindingTarget': false
                },
                'Height': {
                    'description': 'Total height of the widget',
                    'baseType': 'NUMBER',
                    'defaultValue': 30,
                    'isBindingTarget': false
                },
                'Code': {
                    'description': 'The code automatically detected by the scanner',
                    'baseType': 'STRING',
                    'isBindingTarget': false,
                    'isBindingSource': true
                },
                'Mode': {
                    'description': 'Input mode to use: live or image input',
                    'baseType': 'STRING',
                    'defaultValue': 'Live',
                    'selectOptions': [
                        { "text": "Live Video", "value": "Live" },
                        { "text": "File Input", "value": "Image" },
                    ]
                },
                'Barcode-Type': {
                    'description': 'Type of barcode to recognize',
                    'baseType': 'STRING',
                    "defaultValue": "Code_128",
                    'isBindingTarget': true,
                    'selectOptions': [
                        { "text": "Code 128", "value": "Code_128" },
                        { "text": "Code 39", "value": "Code_39" },
                        { "text": "Code 39 VIN", "value": "Code_39_vin" },
                        { "text": "EAN", "value": "Ean" },
                        { "text": "EAN-extended", "value": "Ean_extended" },
                        { "text": "EAN-8", "value": "Ean_8" },
                        { "text": "UPC", "value": "Upc" },
                        { "text": "UPC-E", "value": "Upc_e" },
                        { "text": "Codabar", "value": "Codabar" },
                        { "text": "ITF", "value": "I2of5" },
                        { "text": "Standard 2 of 5", "value": "S2of5" },
                        { "text": "Code 93", "value": "Code_93" }
                    ]
                },
                'Resolution': {
                    'description': 'Camera resolution to use. Depends on the target device. Applies to Live Video ONLY.',
                    'baseType': 'STRING',
                    'defaultValue': 'Re640x480',
                    'selectOptions': [
                        {"text": "320px", "value": "Re320x240"},
                        {"text": "640px", "value": "Re640x480"},
                        {"text": "800px", "value": "Re800x600"},
                        {"text": "1280px", "value": "Re1280x720"},
                        {"text": "1600px", "value": "Re1600x960"},
                        {"text": "1920px", "value": "Re1920x1080"},
                    ]
                }, 
                'Patch-Size': {
                    'description': 'Patch size for detecting the barcode (how big is the barcode compared with the entire image)',
                    'baseType': 'STRING',
                    'defaultValue': 'Medium',
                    'selectOptions': [
                        {"text": "x-small", "value": "X_small"},
                        {"text": "small", "value": "Small"},
                        {"text": "medium", "value": "Medium"},
                        {"text": "large", "value": "Large"},
                        {"text": "x-large", "value": "X_large"},
                    ]
                }, 
                'Frequency': {
                    'description': 'Detection frequency (number of scans per second). Applies to Live Video ONLY.',
                    'baseType': 'INTEGER',
                    'defaultValue': 60
                },
                'CameraFacingMode': {
                    'description': 'Specify camera to be used for the Live Video. Applies to Live Video ONLY. ',
                    'baseType': 'STRING',
                    'defaultValue': 'Environment',
                    'selectOptions': [
                        {"text": "Back-facing", "value": "Environment"},
                        {"text": "Front-facing", "value": "User"},
                    ]
                }, 
                'HalfSample': {
                    'description': 'Work on a half sample (half width, half height)',
                    'baseType': 'BOOLEAN',
                    'defaultValue': true                    
                }, 
                'DrawDetectionIndicator': {
                    'description': 'Enable or disable drawing of additional lines showing detection results. Applies to Live Video ONLY.',
                    'baseType': 'BOOLEAN',
                    'defaultValue': true                    
                }
            }
        };
    };

    widgetServices(): Dictionary<TWWidgetService> {
        return {
        };
    };

    widgetEvents(): Dictionary<TWWidgetEvent> {
        return {
            'CodeDetected': {
                'warnIfNotBound': true,
                'description': 'Fired when a barcode is detected. The code variable is updated with the correct data.'
            },
            'CodeNotDetected': {
                'warnIfNotBound': true,
                'description': 'Fired when detecting a single image, but no code is found.'
            }
        };
    }

    renderHtml(): string {
        return `<div class="widget-content quagga-input-field">
                    <input class="quagga-barcode" type="text">
                    <button type="button" class="quagga-icon-barcode">&nbsp;</button>
                </div>`;
    };

    afterRender(): void {
    }

    beforeDestroy(): void {
    }

}