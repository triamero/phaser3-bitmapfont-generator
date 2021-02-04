import * as Phaser from "phaser";
import {GenerateEvent} from "./generate.event";

let js2xmlparser = require("js2xmlparser");

export class MainScene extends Phaser.Scene {

    private readonly _chars: Phaser.GameObjects.Text[] = [];

    // noinspection JSUnusedGlobalSymbols
    create() {
        this.game.events.on("generate", this._onGenerateAsync, this);
        this.game.events.emit("generator-ready");
    }

    private async _onGenerateAsync(ev: GenerateEvent): Promise<void> {

        console.log(ev);

        if (!ev.fontSize || !ev.fontFamily || !ev.fontColor || !ev.symbols) {
            return;
        }

        this._chars.forEach(x => x.destroy());
        this._chars.length = 0;
        let allChars = [...ev.symbols];

        let sizes = await this._prepareCanvasAsync(ev.fontFamily, ev.fontSize, ev.fontColor, ev.monospaced, allChars);

        this.game.scale.resize(sizes.canvasWidth, sizes.canvasHeight);

        let xmlString = this._getXmlAsBase64(this._chars, ev.fontFamily, ev.fontSize, sizes.maxHeight);

        await this._emitResultAsync(ev.fontFamily, ev.fontSize, xmlString);
    }

    private async _emitResultAsync(fontFamily: string, fontSize: string, xml: string): Promise<void> {

        let png = await new Promise(resolve => {
            this.game.renderer.snapshot((snapshot: Phaser.Display.Color | HTMLImageElement) => {
                resolve((snapshot as HTMLImageElement).src);
            });
        });

        let result = {
            pngFileName: `${fontFamily}-${fontSize}.png`,
            xmlFileName: `${fontFamily}-${fontSize}.xml`,
            png: png,
            xml: `data:text/xml;charset=utf-8;base64,${xml}`
        };

        this.game.events.emit("result", result);
    }

    private async _prepareCanvasAsync(fontFamily: string, fontSize: string, fontColor: string, monospaced: boolean, chars: string[]): Promise<{ maxHeight: number, canvasWidth: number, canvasHeight: number }> {
        let maxWidths: number[] = [];
        let maxHeights: number[] = [];

        let style = {fontSize: +fontSize, fontFamily: fontFamily, color: fontColor};

        let promises = [];

        for (let i = 0; i < chars.length; i++) {
            promises[i] = new Promise(resolve => {
                // @ts-ignore
                let text = this._chars[i] = this.add.text(0, 0, chars[i], style);
                maxWidths.push(text.displayWidth);
                maxHeights.push(text.displayHeight);
                resolve();
            });
        }

        await Promise.all(promises);

        let maxWidth = Math.max(...maxWidths);
        let maxHeight = Math.max(...maxHeights);

        const gridWidth = 12;

        Phaser.Actions.GridAlign(this._chars, {
            width: gridWidth,
            cellWidth: maxWidth,
            cellHeight: maxHeight + 4,
            position: Phaser.Display.Align.TOP_LEFT,
            x: maxWidth / 2,
            y: maxHeight / 2
        });

        if (monospaced) {
            this._chars.forEach((obj) => {
                obj.x = obj.x + (maxWidth / 2) - (obj.width / 2);
            });
        }

        let widths: number[] = [];
        let heights: number[] = [];

        this._chars.forEach(c => {
            widths.push(c.x + c.width);
            heights.push(c.y + c.height);
        });

        let width = Math.ceil(Math.max(...widths));
        let height = Math.ceil(Math.max(...heights));

        return {
            maxHeight: maxHeight,
            canvasHeight: height,
            canvasWidth: width
        };
    }

    private _toBase64(str: string): string {
        return new Buffer(str).toString("base64");
    }

    private _getXmlAsBase64(chars: Phaser.GameObjects.Text[], fontFamily: string, fontSize: string, maxHeight: number) {
        let charDataArr = chars.map(obj => {
            return {
                "@": {
                    "id": obj.text.charCodeAt(0),
                    "letter": obj.text === " " ? "space" : obj.text,
                    "x": obj.x,
                    "y": obj.y,
                    "width": obj.displayWidth,
                    "height": obj.displayHeight + 4,
                    "xoffset": "0",
                    "yoffset": maxHeight - obj.displayHeight,
                    "xadvance": obj.displayWidth,
                    "page": "0",
                    "chnl": "15"
                }
            }
        });

        let xml = {
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
                    "packed": "0"
                }
            },
            "pages": {
                "page": {
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
        };

        let options = {
            format: {
                doubleQuotes: true,
            },
            declaration: {
                encoding: "UTF-8"
            }
        };

        let xmlString = js2xmlparser.parse("font", xml, options);

        return this._toBase64(xmlString);
    }
}
