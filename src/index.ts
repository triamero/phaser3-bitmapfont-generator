import * as Phaser from "phaser";
import {MainScene} from "./main.scene";

class GeneratorGame extends Phaser.Game {
    constructor() {
        super({
            type: Phaser.CANVAS,
            width: document.getElementById("root").clientWidth,
            height: 500,
            parent: "root",
            render: {
                transparent: true
            },
            audio: {
                noAudio: true
            }
        });

        this.scene.add("main", MainScene, false);
        this.scene.start("main");
    }
}

const defaultSymbols = " !\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя";

const userFontsKey = "bitmapfont-fonts";

const fontKey = "bitmapfont-font";
const sizeKey = "bitmapfont-size";
const colorKey = "bitmapfont-color";
const symbolsKey = "bitmapfont-symbols";
const monospacedKey = "bitmapfont-monospaced";

const showSpinner = function () {
    document.getElementById("lds-wrapper").style.display = "flex";
}

const hideSpinner = function () {
    document.getElementById("lds-wrapper").style.display = "none";
}

window.onload = () => {

    hideSpinner();

    let font = localStorage.getItem(fontKey) || "Arial";
    let size = localStorage.getItem(sizeKey) || "18";
    let color = localStorage.getItem(colorKey) || "#000000";
    let symbols = localStorage.getItem(symbolsKey) || defaultSymbols;
    let monospaced = JSON.parse(localStorage.getItem(monospacedKey)) || true;
    let fonts = JSON.parse(localStorage.getItem(userFontsKey)) || {};

    let ffElement = (document.getElementById("fontFamily") as HTMLSelectElement);
    let fsElement = (document.getElementById("fontSize") as HTMLInputElement);
    let fcElement = (document.getElementById("fontColor") as HTMLSelectElement);
    let sElement = (document.getElementById("symbols") as HTMLTextAreaElement);
    let mElement = (document.getElementById("monospaced") as HTMLInputElement);
    let fontInput = (document.getElementById("fontInput") as HTMLInputElement);

    let appendFont = function (name: string) {
        let style = document.createElement("style");
        let userFont = (JSON.parse(localStorage.getItem(userFontsKey)))[name];

        let innerFontName = userFont[0];
        let fontBase64 = userFont[1];


        let fontName = name.substring(0, name.lastIndexOf("."));
        let extension = name.substring(fontName.length + 1).toLowerCase();
        let fontUrl = `data:font/${extension};charset=utf-8;base64,${fontBase64}`;
        style.innerHTML = `@font-face{font-family: "${innerFontName}";font-weight: 100;font-style: normal;src: url("${fontUrl}");}`;
        document.head.append(style);

        let option = document.createElement("option");
        option.value = innerFontName;
        option.innerHTML = fontName;
        ffElement.append(option);

        let div = document.createElement("div");
        div.style.fontFamily = innerFontName;
        div.style.position = "absolute";
        div.style.visibility = "hidden";
        div.innerHTML = ".";
        document.body.append(div);

        return innerFontName;
    }

    Object.keys(fonts).forEach((key: string) => appendFont(key));

    fontInput.onchange = async function () {
        let me = this as HTMLInputElement;
        if (!me.files || me.files.length === 0) {
            return;
        }

        let f = me.files[0];
        console.log(f.type);

        let fonts = JSON.parse(localStorage.getItem(userFontsKey)) || {};

        if (fonts[f.name]) {
            // do nothing
            return;
        }

        let fileBase64 = await new Promise<string>((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = function (e) {
                resolve(e.target.result as string);
            }
            fileReader.onerror = function (e) {
                reject(e);
            }
            fileReader.readAsDataURL(f);
        });

        let num = Object.keys(fonts).length + 1;
        fonts[f.name] = [`font${num}`, fileBase64.split(",")[1]];
        localStorage.setItem(userFontsKey, JSON.stringify(fonts));

        ffElement.value = appendFont(f.name);
        setTimeout(() => emit(), 50);
    }

    ffElement.value = font;
    fsElement.value = size;
    fcElement.value = color;
    sElement.value = symbols;
    mElement.checked = monospaced;

    let game = new GeneratorGame();

    let emit = () => {

        showSpinner();
        setTimeout(() => {
            game.events.emit("generate", {
                fontFamily: ffElement.value,
                fontSize: fsElement.value,
                fontColor: fcElement.value,
                symbols: sElement.value,
                monospaced: mElement.checked
            });

            localStorage.setItem(fontKey, ffElement.value);
            localStorage.setItem(sizeKey, fsElement.value.toString());
            localStorage.setItem(colorKey, fcElement.value);
            localStorage.setItem(symbolsKey, sElement.value);
            localStorage.setItem(monospacedKey, mElement.checked.toString());
        }, 50);
    };

    ffElement.onchange = emit;
    fsElement.onchange = emit;
    fcElement.onchange = emit;
    sElement.onchange = emit;
    mElement.onchange = emit;

    game.events.on("generator-ready", () => emit());

    game.events.on("result", (result: any) => {
        hideSpinner();
        let png = document.querySelector("#download-png") as HTMLLinkElement;
        let xml = document.querySelector("#download-xml") as HTMLLinkElement;
        (<any>png).download = result.pngFileName;
        (<any>xml).download = result.xmlFileName;
        png.href = result.png;
        xml.href = result.xml;
    });
};

