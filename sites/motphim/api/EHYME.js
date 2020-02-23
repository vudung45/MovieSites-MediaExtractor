var _$_416c = ["create", "prototype", "lib", "Base", "mixIn", "init", "hasOwnProperty", "apply", "$super", "extend", "toString", "WordArray", "words", "sigBytes", "length", "stringify", "clamp", "ceil", "call", "clone", "slice", "random", "push", "enc", "Hex", "", "join", "substr", "Latin1", "fromCharCode", "charCodeAt", "Utf8", "Malformed UTF-8 data", "parse", "BufferedBlockAlgorithm", "_data", "_nDataBytes", "string", "concat", "blockSize", "_minBufferSize", "max", "min", "_doProcessBlock", "splice", "Hasher", "cfg", "reset", "_doReset", "_append", "_process", "_doFinalize", "finalize", "HMAC", "algo", "Base64", "_map", "charAt", "_reverseMap", "indexOf", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", "sin", "abs", "TUAMADAM", "_hash", "floor", "_createHelper", "HmacTUAMADAM", "_createHmacHelper", "SHA1", "HmacSHA1", "sqrt", "pow", "SHA256", "HmacSHA256", "Utf16", "Utf16BE", "Utf16LE", "function", "undefined", "buffer", "byteOffset", "byteLength", "RIPEMD160", "HmacRIPEMD160", "_hasher", "_oKey", "_iKey", "update", "EHYME", "hasher", "khoaCai", "itenay", "compute", "EvpKDF", "SHA224", "HmacSHA224", "x64", "Word", "high", "low", "SHA3", "_state", "outputLength", "HmacSHA3", "SHA512", "toX32", "HmacSHA512", "SHA384", "HmacSHA384", "Cipher", "_ETUATE", "_DANGKHA", "_xformMode", "_key", "etulang", "daylaine", "StreamCipher", "mode", "BlockCipherMode", "Etulangor", "Daylaineor", "_cipher", "_imame", "CBC", "_prevBlock", "etulangBlock", "daylaineBlock", "pad", "Pkcs7", "BlockCipher", "imame", "createEtulangor", "createDaylaineor", "_mode", "__creator", "processBlock", "padding", "unpad", "CipherParams", "formatter", "format", "OpenSSL", "ciphertext", "salt", "SerializableCipher", "_parse", "kdf", "PasswordBasedCipher", "imameSize", "execute", "key", "CFB", "ECB", "AnsiX923", "Iso10126", "Iso97971", "ZeroPadding", "OFB", "_keystream", "NoPadding", "AKHAMA", "_nRounds", "_keyPriorReset", "_keySchedule", "_invKeySchedule", "_doCryptBlock", "_lBlock", "_rBlock", "DES", "_subKeys", "_invSubKeys", "TripleDES", "_des1", "_des2", "_des3", "_S", "_i", "_j", "RC4", "RC4Drop", "drop", "CTRGladman", "_counter", "_X", "_C", "_b", "Rabbit", "CTR", "RabbitLegacy", "object", "exports", "amd", "JQMP", "./core", "./sha1", "./hmac"];
function extendCrypto(e) {
    return function() {
            var a = e,
                b = a[_$_416c[2]],
                i = b[_$_416c[3]],
                k = b[_$_416c[11]],
                m = a[_$_416c[54]],
                c = m[_$_416c[69]],
                d = m[_$_416c[53]],
                p = m[_$_416c[89]] = i[_$_416c[9]]({
                    cfg: i[_$_416c[9]]({
                        khoaCai: 4,
                        hasher: c,
                        itenay: 1
                    }),
                    init: function(e) {
                        this[_$_416c[46]] = this[_$_416c[46]][_$_416c[9]](e)
                    },
                    compute: function(e, a) {
                        for (var b = this[_$_416c[46]], i = d[_$_416c[0]](b[_$_416c[90]], e), m = k[_$_416c[0]](), c = k[_$_416c[0]]([1]), p = m[_$_416c[12]], f = c[_$_416c[12]], q = b[_$_416c[91]], D = b[_$_416c[92]]; p[_$_416c[14]] < q;) {
                            var g = i[_$_416c[88]](a)[_$_416c[52]](c);
                            i[_$_416c[47]]();
                            for (var K = g[_$_416c[12]], F = K[_$_416c[14]], j = g, P = 1; P < D; P++) {
                                j = i[_$_416c[52]](j),
                                    i[_$_416c[47]]();
                                for (var J = j[_$_416c[12]], O = 0; O < F; O++) {
                                    K[O] ^= J[O]
                                }
                            };
                            m[_$_416c[38]](g),
                                f[0]++
                        };
                        return m[_$_416c[13]] = 4 * q,
                            m
                    }
                });
            a[_$_416c[89]] = function(e, a, b) {
                return p[_$_416c[0]](b)[_$_416c[93]](e, a)
            }
        }()
}

function wrapModules(e) {
    return e;
}
let a = wrapModules(require("crypto-js/core"), require("crypto-js/sha1"), require("crypto-js/hmac"));
extendCrypto(a);
console.log(a.EHYME);
module.exports = a;