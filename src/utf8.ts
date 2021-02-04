// Namespace UTF8

export class Utf8 {
    public static encode(str: string): number[] {
        let len = str.length;
        const result = [];
        let code;
        let i;
        for (i = 0; i < len; i++) {
            code = str.charCodeAt(i);
            if (code <= 0x7f) {
                result.push(code);
            } else if (code <= 0x7ff) {                         // 2 bytes
                result.push(0xc0 | (code >>> 6 & 0x1f),
                    0x80 | (code & 0x3f));
            } else if (code <= 0xd700 || code >= 0xe000) {      // 3 bytes
                result.push(0xe0 | (code >>> 12 & 0x0f),
                    0x80 | (code >>> 6 & 0x3f),
                    0x80 | (code & 0x3f));
            } else {                                            // 4 bytes, surrogate pair
                code = (((code - 0xd800) << 10) | (str.charCodeAt(++i) - 0xdc00)) + 0x10000;
                result.push(0xf0 | (code >>> 18 & 0x07),
                    0x80 | (code >>> 12 & 0x3f),
                    0x80 | (code >>> 6 & 0x3f),
                    0x80 | (code & 0x3f));
            }
        }
        return result;
    }

    public static decode(bytes: number[]): string {
        const len = bytes.length;
        let result = "";
        let code;
        let i;
        for (i = 0; i < len; i++) {
            if (bytes[i] <= 0x7f) {
                result += String.fromCharCode(bytes[i]);
            } else if (bytes[i] >= 0xc0) {                                   // Mutlibytes
                if (bytes[i] < 0xe0) {                                       // 2 bytes
                    code = ((bytes[i++] & 0x1f) << 6) |
                        (bytes[i] & 0x3f);
                } else if (bytes[i] < 0xf0) {                                // 3 bytes
                    code = ((bytes[i++] & 0x0f) << 12) |
                        ((bytes[i++] & 0x3f) << 6) |
                        (bytes[i] & 0x3f);
                } else {                                                     // 4 bytes
                    // turned into two characters in JS as surrogate pair
                    code = (((bytes[i++] & 0x07) << 18) |
                        ((bytes[i++] & 0x3f) << 12) |
                        ((bytes[i++] & 0x3f) << 6) |
                        (bytes[i] & 0x3f)) - 0x10000;
                    // High surrogate
                    result += String.fromCharCode(((code & 0xffc00) >>> 10) + 0xd800);
                    // Low surrogate
                    code = (code & 0x3ff) + 0xdc00;
                }
                result += String.fromCharCode(code);
            } // Otherwise it's an invalid UTF-8, skipped.
        }
        return result;

    }
}
