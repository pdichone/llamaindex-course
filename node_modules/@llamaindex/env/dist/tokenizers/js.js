// Note: js-tiktoken it's 60x slower than the WASM implementation - use it only for unsupported environments
import { getEncoding } from "js-tiktoken";
import { Tokenizers } from "./types.js";
class TokenizerSingleton {
    defaultTokenizer;
    constructor(){
        const encoding = getEncoding("cl100k_base");
        this.defaultTokenizer = {
            encode: (text)=>{
                return new Uint32Array(encoding.encode(text));
            },
            decode: (tokens)=>{
                const numberArray = Array.from(tokens);
                const text = encoding.decode(numberArray);
                const uint8Array = new TextEncoder().encode(text);
                return new TextDecoder().decode(uint8Array);
            }
        };
    }
    tokenizer(encoding) {
        if (encoding && encoding !== Tokenizers.CL100K_BASE) {
            throw new Error(`Tokenizer encoding ${encoding} not yet supported`);
        }
        return this.defaultTokenizer;
    }
}
export const tokenizers = new TokenizerSingleton();
export { Tokenizers };
