import './Editor.css';
import React, { useEffect, useRef, useState } from "react"
import RectEditor from './RectEditor';
import { CHARACTERS, loadFont } from './lib/MeronaFontLoader';
import JSZip from 'jszip';

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MarginatedRectangle extends Rectangle {
  margin: Margin
}

export interface CharacterizedRectangle extends MarginatedRectangle {
  character: string;
}

const defaultMargin: Margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
};

export const isInsideRect = (point: Point, rectangle: Rectangle) => (point.x >= rectangle.x && point.y >= rectangle.y && point.x <= (rectangle.x + rectangle.width) && point.y <= (rectangle.y + rectangle.height));
export const saveBlobToFile = (blob: Blob, filename: string) => {
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  a.remove();
}

export default function Editor() {
  const canvRef = useRef<HTMLCanvasElement>(null);
  const [c, setC] = useState<CanvasRenderingContext2D>();
  requestAnimationFrame(draw);
  useEffect(() => {
    if (canvRef.current !== null) {
      setC(canvRef.current.getContext('2d')!);
    }
  }, []);
  const [savedPoint, setSavedPoint] = useState<Point>({ x: 0, y: 0 });
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [rects, setRects] = useState<CharacterizedRectangle[]>([]);
  const [hoveredRectID, setHoveredRectID] = useState<number>();
  const [selectedRectID, setSelectedRectID] = useState<number>();
  const [currentCharacter, setCurrentCharacter] = useState<string>(CHARACTERS[0]);
  const [backgroundImage, setBackgroundImage] = useState<ImageBitmap>();

  let hoveredRect: CharacterizedRectangle | undefined;
  if (hoveredRectID !== undefined) hoveredRect = rects[hoveredRectID];
  else hoveredRect = undefined;

  let selectedRect: CharacterizedRectangle | undefined;
  if (selectedRectID !== undefined) selectedRect = rects[selectedRectID];
  else selectedRect = undefined;

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const brect = canvRef.current!.getBoundingClientRect();
    setSavedPoint({
      x: e.clientX - brect.left,
      y: e.clientY - brect.top
    });

    if (hoveredRectID !== undefined) setSelectedRectID(hoveredRectID);
    else setIsCreating(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const brect = canvRef.current!.getBoundingClientRect();
    const x = e.clientX - brect.left;
    const y = e.clientY - brect.top;
    setCurrentPoint({ x, y });

    setHoveredRectID(undefined);
    rects.forEach((rect, i) => {
      if (currentCharacter !== rect.character) return;
      if (isInsideRect(currentPoint, rect)) setHoveredRectID(i);
    });
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isCreating) return;
    setIsCreating(false);
    const { x: sx, y: sy } = savedPoint;
    const { x: cx, y: cy } = currentPoint;

    let x = sx;
    let y = sy;

    let width;
    if (cx < x) {
      width = x - cx;
      x -= width;
    }
    else width = cx - x;

    let height;
    if (cy < y) {
      height = y - cy;
      y -= height;
    }
    else height = cy - y;

    if (Math.min(width, height) < 10) {
      setSelectedRectID(undefined);
      return;
    }
    setRects([
      ...rects,
      {
        character: currentCharacter,
        x, y, width, height,
        margin: defaultMargin
      }
    ]);
    setSelectedRectID(rects.length);
  }

  function draw() {
    if (c === undefined) {
      requestAnimationFrame(draw);
      return;
    }
    c.clearRect(0, 0, canvRef.current!.width, canvRef.current!.height);

    // Drawing the underlying image
    if (backgroundImage) c.drawImage(backgroundImage, 0, 0);

    c.strokeStyle = 'gray';
    if (isCreating) {
      const { x: sx, y: sy } = savedPoint;
      const { x: cx, y: cy } = currentPoint;
      c.strokeRect(sx + 0.5, sy + 0.5, cx - sx, cy - sy);
    }

    rects.forEach((rect, i) => {
      const { character, x, y, width, height, margin: { top: mTop, right: mRight, bottom: mBottom, left: mLeft } } = rect;
      c!.save();
      if (hoveredRectID === i) c!.strokeStyle = 'black';           // if the Rectangle hovered
      if (selectedRectID === i) c!.strokeStyle = 'red';            // if the Rectangle selected
      if (currentCharacter !== character) c!.setLineDash([2, 2]);  // if the Rectangle is attributed to the current character
      c!.strokeRect(x + 0.5, y + 0.5, width, height);

      // If the Rectangle is attributed to the current character
      if (currentCharacter === character) {
        c!.save();
        c!.setLineDash([4, 4]);
        c!.strokeRect(x - mLeft + 0.5, y - mTop + 0.5, width + mLeft + mRight, height + mTop + mBottom);
        c!.restore();
      }

      c!.restore();
    });
    requestAnimationFrame(draw);
  }

  function handleRectChange(rectID: number, cr: CharacterizedRectangle) {
    setRects([
      ...rects.slice(0, rectID),
      cr,
      ...rects.slice(rectID + 1)
    ])
  }

  async function loadImageFromFile(file: File | Blob) {
    let image = await createImageBitmap(file);
    canvRef.current!.width = image.width;
    canvRef.current!.height = image.height;
    setBackgroundImage(image);
  }

  function handleImagePick(e: React.FormEvent<HTMLInputElement>) {
    if (e.currentTarget.files === null) return;
    loadImageFromFile(e.currentTarget.files[0]);
  }

  function deleteRect(id: number) {
    let copy = rects;
    copy.splice(id, 1);
    setRects(copy);
    setSelectedRectID(undefined);
  }

  async function saveToFile() {
    if (!backgroundImage) {
      alert('Specify an image!');
      return;
    }
    let umf = new JSZip();
    // Restructuring Rects array for easier use in the Viewer and Renderer
    let restructured: { [key: string]: CharacterizedRectangle[] } = {};
    CHARACTERS.forEach(char => restructured[char] = rects.filter(rect => rect.character === char));
    umf.file('metadata.json', JSON.stringify(restructured));
    let croppingCanvas = document.createElement('canvas');
    croppingCanvas.width = backgroundImage.width;
    croppingCanvas.height = backgroundImage.height;
    let ccc = croppingCanvas.getContext('2d')!;
    ccc.drawImage(backgroundImage, 0, 0);
    umf.file('image.png', croppingCanvas.toDataURL().replace('data:image/png;base64,', ''), { base64: true });
    let archive = await umf.generateAsync({ type: 'blob' })
    saveBlobToFile(archive, 'font.umf');
  }

  function loadFromFile() {
    let input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', (e: any) => {
      loadFont(e.currentTarget.files[0]).then(font => {
        setRects(Object.values(font.metadata).flat() as CharacterizedRectangle[]);
        loadImageFromFile(font.image);
      })
      // let fr = new FileReader();
      // fr.onload = () => {
      //   JSZip.loadAsync(fr.result).then(arc => {
      //     let metadataFile = arc.file('metadata.json');
      //     let imageFile = arc.file('image.png');
      //     if (!metadataFile || !imageFile) {
      //       alert('Corrupt or wrong font file! Can\'t find the metadata file');
      //       return;
      //     }
      //     Promise.all([
      //       metadataFile.async('text'),
      //       imageFile.async('blob')
      //     ]).then(([metadata, image]) => {
      //       setRects(Object.values(JSON.parse(metadata)).flat() as CharacterizedRectangle[]);
      //       loadImageFromFile(image);
      //     });
      //   });
      // };
      // fr.readAsArrayBuffer(e.currentTarget.files[0]);
    });
    input.click();
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginBottom: '10px' }}>
        <button onClick={loadFromFile}>Load font from UMF</button>
        <button onClick={saveToFile}>Save font as UMF</button>
        <label>
          Image:&nbsp;
          <input type="file" onChange={handleImagePick} />
        </label>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ maxWidth: 502, maxHeight: 506, overflow: 'auto' }}>
          <canvas
            ref={canvRef}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            style={{ border: '1px solid gray', height: 'fit-content', margin: 0 }}
            width={500}
            height={500}
          ></canvas>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

          <label>
            Current Character:&nbsp;
            <select
              value={currentCharacter}
              onChange={(e: any) => { setCurrentCharacter(e.target.value); setSelectedRectID(undefined) }}
            >
              {CHARACTERS.map(char => (
                <option key={char} value={char}>{char}</option>
              ))}
            </select>
          </label>

          {selectedRect ? (
            <div style={{marginTop: 10}}>
              Current Selection: {selectedRectID} <button onClick={() => deleteRect(selectedRectID!)}>Delete</button>
              <RectEditor rectangle={selectedRect} onChange={(cr) => handleRectChange(selectedRectID!, cr)} />
            </div>
          ) : (
            <p>No selection.</p>
          )}

        </div>
      </div>

      {/* <RectTable rectangles={rects} /> */}
    </div>
  )
}