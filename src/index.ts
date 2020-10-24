import * as Phaser from "phaser";
import {MainScene} from "./main.scene";

class GeneratorGame extends Phaser.Game {
    constructor() {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.WEBGL,
            width: document.getElementById("root").clientWidth,
            height: 500,
            parent: "root",
            render: {
                transparent: true
            },
            audio: {
                noAudio: true
            }
        };

        super(config);

        this.scene.add("main", MainScene, true);
    }
}

const defaultSymbols = " !\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";

const fontKey = "bitmapfont-font";
const sizeKey = "bitmapfont-size";
const colorKey = "bitmapfont-color";
const symbolsKey = "bitmapfont-symbols";
const monospacedKey = "bitmapfont-monospaced";
const italicKey = "bitmapfont-italic";
const boldKey = "bitmapfont-bold";

window.onload = () => {

    let font = localStorage.getItem(fontKey) || "Arial";
    let size = localStorage.getItem(sizeKey) || "18";
    let color = localStorage.getItem(colorKey) || "#000000";
    let symbols = localStorage.getItem(symbolsKey) || defaultSymbols;
    let monospaced = JSON.parse(localStorage.getItem(monospacedKey)) || false;
    let italic = JSON.parse(localStorage.getItem(italicKey)) || false;
    let bold = JSON.parse(localStorage.getItem(boldKey)) || false;

    let ffElement = (document.getElementById("fontFamily") as HTMLSelectElement);
    let fsElement = (document.getElementById("fontSize") as HTMLInputElement);
    let fcElement = (document.getElementById("fontColor") as HTMLSelectElement);
    let sElement = (document.getElementById("symbols") as HTMLTextAreaElement);
    let mElement = (document.getElementById("monospaced") as HTMLInputElement);

    ffElement.value = font;
    fsElement.value = size;
    fcElement.value = color;
    sElement.value = symbols;
    mElement.value = monospaced;

    let game = new GeneratorGame();

    let onChange = () => {
        game.events.emit("generate", {
            fontFamily: ffElement.value,
            fontSize: fsElement.value,
            fontColor: fcElement.value,
            symbols: sElement.value,
            monospaced: mElement.checked
        });
    };

    ffElement.onchange = onChange;
    fsElement.onchange = onChange;
    fcElement.onchange = onChange;
    sElement.onchange = onChange;
    mElement.onchange = onChange;

};

