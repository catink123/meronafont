import JSZip from "jszip";

export const CHARACTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", ".", ";", " ", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", "[", "]", "=", "+", "-", "_", '"', "'"] as const;
export type FontCharacter = typeof CHARACTERS[number];

export interface FontCharacterVariation {
  character: FontCharacter;
  x: number; y: number;
  width: number; height: number;
  margin: {
    top: number; right: number; bottom: number; left: number;
  }
}

export type FontMetadata = {
  [key in FontCharacter]: FontCharacterVariation[];
};

export interface Font {
  metadata: FontMetadata;
  image: Blob;
}

export async function loadFont(blob: File | Blob): Promise<Font> {
  return new Promise((resolve, reject) => {
    let fr = new FileReader();
    fr.onload = () => {
      JSZip.loadAsync(fr.result).then(arc => {
        let metadataFile = arc.file('metadata.json');
        let imageFile = arc.file('image.png');
        if (!metadataFile || !imageFile) {
          alert('Corrupt or wrong font file! Can\'t find the metadata file');
          return;
        }
        Promise.all([
          metadataFile.async('text'),
          imageFile.async('blob')
        ]).then(([metadata, image]) => {
          resolve({
            metadata: JSON.parse(metadata),
            image
          })
        }).catch(reject);
      });
    };
    fr.onerror = () => reject('file-reader-error');
    fr.readAsArrayBuffer(blob);
  });
}