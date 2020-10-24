import * as Phaser from "phaser";
import {GenerateEvent} from "./generate.event";
let js2xmlparser = require("js2xmlparser");

export class MainScene extends Phaser.Scene {

    private readonly _chars: Phaser.GameObjects.Text[] = [];

    // noinspection JSUnusedGlobalSymbols
    create() {
        this.game.events.on("generate", this._onGenerateAsync, this);
    }

    private async _onGenerateAsync(ev: GenerateEvent): Promise<void> {
        // Generate Font
        const fontFamily = ev.fontFamily;
        const fontSize = parseInt(ev.fontSize);
        const fontColor = ev.fontColor;

        this._chars.forEach(x => x.destroy(true));
        this._chars.length = 0;
        let allChars = [...ev.symbols];

        let maxWidths: number[] = [];
        let maxHeights: number[] = [];

        let style = {fontSize: fontSize, fontFamily: fontFamily, color: fontColor};
        allChars.forEach((c, i) => {
            let text = this._chars[i] = this.add.text(0, 0, c, style);
            maxWidths.push(text.width);
            maxHeights.push(text.height);
        });

        let maxWidth = Math.max(...maxWidths);
        let maxHeight = Math.max(...maxHeights);

        const gridWidth = 12;

        Phaser.Actions.GridAlign(this._chars, {
            width: gridWidth,
            cellWidth: maxWidth,
            cellHeight: maxHeight,
            position: Phaser.Display.Align.TOP_LEFT,
            x: maxWidth / 2,
            y: maxHeight / 2
        });

        if (ev.monospaced) {
            this._chars.forEach((obj) => {
                obj.x = obj.x + (maxWidth / 2) - (obj.width / 2);
            });
        }

        const charDataArr = this._chars.map(obj => {
            return {
                "@": {
                    "id": obj.text.charCodeAt(0),
                    "char": obj.text,
                    "x": obj.x,
                    "y": obj.y,
                    "width": obj.width,
                    "height": obj.height,
                    "xoffset": "0",
                    "yoffset": maxHeight - obj.height,
                    "xadvance": obj.width,
                    "page": "0",
                    "chnl": "15"
                }
            }
        });

        const xmlString = js2xmlparser.parse(
            "font",
            {
                "info": {
                    "@": {
                        "face": fontFamily,
                        "size": fontSize,
                        "bold": "0",
                        "italic": "0",
                        "charset": "",
                        "unicode": "1",
                        "stretchH": "100",
                        "smooth": "0",
                        "aa": "1",
                        "padding": "0,0,0,0",
                        "spacing": "0,0",
                        "outline": "0"
                    }
                },
                "common": {
                    "@": {
                        "lineHeight": maxHeight,
                        "base": maxHeight,
                        "scaleW": "512",
                        "scaleH": "512",
                        "pages": "1",
                        "packed": "0",
                        "alphaChnl": "0",
                        "redChnl": "4",
                        "greenChnl": "4",
                        "blueChnl": "4"
                    }
                },
                "pages": {
                    "pages": {
                        "@": {
                            "id": "0",
                            "file": "font.png",
                        }
                    }
                },
                "chars": {
                    "@": {
                        "count": charDataArr.length
                    },
                    "char": charDataArr
                }
            },
            {
                format: {
                    doubleQuotes: true
                }
            });

        let png = document.querySelector("#download-png") as HTMLLinkElement;
        let xml = document.querySelector("#download-xml") as HTMLLinkElement;

        (<any>png).download = `${fontFamily}-${fontSize}.png`;
        (<any>xml).download = `${fontFamily}-${fontSize}.xml`;

        let widths: number[] = [];
        let heights: number[] = [];

        this._chars.forEach(c => {
            widths.push(c.x + c.width);
            heights.push(c.y + c.height);
        });

        let width = Math.ceil(Math.max(...widths));
        let height = Math.ceil(Math.max(...heights));

        this.game.scale.resize(width, height);

        this.game.renderer.snapshot((snapshot: Phaser.Display.Color | HTMLImageElement) => {
            png.href = (snapshot as HTMLImageElement).src;
        });

        xml.href = `data:text/xml;base64,${btoa(this._toBinary(xmlString))}`;
    }


    private _toBinary(str: string) {
        const codeUnits = new Uint16Array(str.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = str.charCodeAt(i);
        }
        return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
    }
}
